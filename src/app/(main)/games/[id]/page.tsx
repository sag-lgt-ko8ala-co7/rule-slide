import { Suspense } from "react";
import { GameDetail } from "@/components/GameDetail";

export default function GameDetailPage() {
  return (
    <Suspense fallback={<p>読み込み中…</p>}>
      <GameDetail />
    </Suspense>
  );
}
