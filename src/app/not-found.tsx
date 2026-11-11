import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

// ルートの not-found は (main) グループの外なので、共通ヘッダーをここで直接置く
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="space-y-4 rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
          <h1 className="text-xl font-bold">ページが見つかりません</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            URL が間違っているか、ページが移動した可能性があります。
          </p>
          <Link href="/" className="inline-block underline">
            一覧に戻る
          </Link>
        </div>
      </main>
    </>
  );
}
