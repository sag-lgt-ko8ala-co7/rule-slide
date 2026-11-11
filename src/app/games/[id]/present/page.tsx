import type { Metadata } from "next";
import { Suspense } from "react";
import { Presenter } from "@/components/Presenter";

export const metadata: Metadata = {
  title: "発表モード | ルール説明スライド",
};

export default function PresentPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex h-dvh items-center justify-center bg-white text-2xl text-zinc-900">
          読み込み中…
        </div>
      }
    >
      <Presenter />
    </Suspense>
  );
}
