import { parseHighlight } from "@/lib/highlight";

/** 入力欄の下に出す、マーカー強調の使い方。 */
export const HIGHLIGHT_HINT = "【 】で囲んだ部分は黄色のマーカーで強調されます（例：【2枚以上】）";

/** 入力欄の下の説明文のスタイル。 */
export const HINT_CLASS = "text-xs text-zinc-600 dark:text-zinc-400";

/** 【 】で囲んだ部分を黄色のマーカーで強調して表示する（【 】は表示しない）。 */
export function Highlighted({ text }: { text: string }) {
  return (
    <>
      {parseHighlight(text).map((segment, index) =>
        segment.marked ? (
          <mark
            key={index}
            // <mark> の既定の黄色い背景色を消し、文字の下側だけに蛍光ペンのような黄色を敷く
            className="bg-transparent bg-[linear-gradient(transparent_40%,#fde047_40%)] box-decoration-clone text-inherit"
          >
            {segment.text}
          </mark>
        ) : (
          segment.text
        ),
      )}
    </>
  );
}
