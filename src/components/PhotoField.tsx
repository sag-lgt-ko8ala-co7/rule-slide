"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { compressPhoto, PhotoError } from "@/lib/photo";
import { getPhoto, savePhoto, StorageFullError } from "@/lib/storage";
import { HINT_CLASS } from "./Highlighted";

type Props = {
  label: string;
  photoId: string | null;
  onChange: (photoId: string | null) => void;
};

const buttonClass =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900";

/**
 * 写真を1枚選ぶ・変える・削除する入力欄。
 * 選んだ時点で縮小・圧縮して保存し（容量オーバーをその場で知らせるため）、id を親に渡す。
 * 削除や差し替えで使われなくなった写真は、ゲームを保存したときに storage.ts が消す。
 */
export function PhotoField({ label, photoId, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hintId = useId();
  // フォームは localStorage を読めるブラウザでだけ写真を持つ（新規作成の初期値は null）
  const photo = photoId ? getPhoto(photoId) : undefined;

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // 同じ写真を選び直しても change が起きるようにする
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await compressPhoto(file);
      onChange(savePhoto(dataUrl));
    } catch (e) {
      if (e instanceof StorageFullError) {
        setError("保存できる容量がいっぱいです。ほかの写真やゲームを削除するか、別の写真を選んでください。");
      } else if (e instanceof PhotoError) {
        setError(e.message);
      } else {
        setError("この写真は読み込めませんでした。JPEG・PNG・HEIC などの写真を選んでください。");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm">{label}</span>
      {photo && (
        // data URL の写真なので next/image の最適化は使えない
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt={`${label}（選んだ写真）`}
          className="max-h-40 max-w-full rounded-md border border-zinc-200 object-contain dark:border-zinc-700"
        />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-describedby={hintId}
          className={buttonClass}
        >
          {photo ? "写真を変える" : "写真を選ぶ"}
        </button>
        {photoId && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              onChange(null);
            }}
            disabled={busy}
            className={`${buttonClass} text-red-700 dark:text-red-400`}
          >
            写真を削除
          </button>
        )}
        {busy && (
          <span role="status" className="text-sm">
            写真を縮小しています…
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        onChange={handleFile}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
      <span id={hintId} className={`block ${HINT_CLASS}`}>
        写真は自動で小さくして、この端末に保存します
      </span>
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
