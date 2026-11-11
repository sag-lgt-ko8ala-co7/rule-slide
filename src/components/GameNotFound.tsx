import Link from "next/link";

export function GameNotFound() {
  return (
    <div className="space-y-4 rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
      <p>ゲームが見つかりません。</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        削除されたか、別の端末で作られた可能性があります。
      </p>
      <Link href="/" className="inline-block underline">
        一覧に戻る
      </Link>
    </div>
  );
}
