import Link from "next/link";

/** 発表モード以外の全画面に出す共通ヘッダー。 */
export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-base font-bold sm:text-lg">
          ルール説明スライド
        </Link>
        <nav className="flex shrink-0 gap-4 text-sm">
          <Link href="/" className="hover:underline">
            一覧
          </Link>
          <Link href="/new" className="hover:underline">
            新規作成
          </Link>
        </nav>
      </div>
    </header>
  );
}
