import type { Metadata } from "next";
import { Suspense } from "react";
import { GameEditor } from "@/components/GameEditor";

export const metadata: Metadata = {
  title: "編集 | ルール説明スライド",
};

export default function EditGamePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">編集</h1>
      <Suspense fallback={<p>読み込み中…</p>}>
        <GameEditor />
      </Suspense>
    </div>
  );
}
