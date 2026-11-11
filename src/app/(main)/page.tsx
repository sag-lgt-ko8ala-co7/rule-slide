import Link from "next/link";
import { Suspense } from "react";
import { GameList } from "@/components/GameList";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">ゲーム一覧</h1>
        <Link
          href="/new"
          className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 font-bold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          ＋ 新規作成
        </Link>
      </div>
      <Suspense fallback={<p>読み込み中…</p>}>
        <GameList />
      </Suspense>
    </div>
  );
}
