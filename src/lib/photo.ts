// 写真を localStorage に入る大きさまで縮小・圧縮する（ブラウザ専用。イベントハンドラから呼ぶ）。

/** 長辺の最大ピクセル数 */
const MAX_EDGE = 1280;
/** これ以上は小さくしない長辺 */
const MIN_EDGE = 640;
/** data URL の文字数の上限（約220KB の JPEG）。約5MB に 15〜20 枚入る大きさ */
const MAX_DATA_URL_LENGTH = 300_000;
/** 縮小する前に断るファイルの大きさ */
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const QUALITIES = [0.82, 0.72, 0.62, 0.52];

/** 利用者に見せるメッセージを持つエラー。 */
export class PhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoError";
  }
}

function isHeic(file: File): boolean {
  return /^image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

/** 画像を読み込む。スマホ写真の向き（EXIF）は読み込み時に反映される。 */
async function decode(file: File): Promise<Decoded> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  } catch {
    // createImageBitmap で読めない形式でも、<img> なら読めるブラウザがある（Safari の HEIC など）
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    throw new PhotoError(
      isHeic(file)
        ? "このブラウザでは HEIC 形式の写真を読み込めません。iPhone の Safari で選ぶか、JPEG にしてから選んでください。"
        : "この写真は読み込めませんでした。JPEG・PNG・HEIC などの写真を選んでください。",
    );
  }
}

function toJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new PhotoError("写真を変換できませんでした。"))),
      "image/jpeg",
      quality,
    );
  });
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new PhotoError("写真を変換できませんでした。"));
    reader.readAsDataURL(blob);
  });
}

/** JPEG の data URL にしたときの文字数（"data:image/jpeg;base64," + base64） */
function dataUrlLength(blob: Blob): number {
  return 23 + Math.ceil(blob.size / 3) * 4;
}

/**
 * 写真を長辺 1280px 以下に縮小し、data URL が約 300,000 文字以下になるまで JPEG で圧縮する。
 * 読み込めない形式や大きすぎるファイルは PhotoError を投げる。
 */
export async function compressPhoto(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new PhotoError("写真のファイルが大きすぎます（50MB まで）。");
  }
  const image = await decode(file);
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new PhotoError("写真を変換できませんでした。");

    let edge = Math.min(MAX_EDGE, Math.max(image.width, image.height));
    let smallest: Blob | null = null;
    for (;;) {
      const scale = edge / Math.max(image.width, image.height);
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      // 透明な部分が JPEG で黒くならないよう白で塗ってから描く
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image.source, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITIES) {
        const blob = await toJpegBlob(canvas, quality);
        if (dataUrlLength(blob) <= MAX_DATA_URL_LENGTH) return await toDataUrl(blob);
        smallest = blob;
      }
      if (edge <= MIN_EDGE) break;
      edge = Math.max(MIN_EDGE, Math.round(edge * 0.8));
    }
    // ここまで小さくしても上限を超える写真はほぼないが、念のため一番小さいものを使う
    return await toDataUrl(smallest!);
  } finally {
    image.release();
  }
}
