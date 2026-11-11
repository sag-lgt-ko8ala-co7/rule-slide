"use client";

import { useState } from "react";
import type { Slide } from "@/lib/slides";
import { SlideView } from "./SlideView";

const buttonClass =
  "rounded-md border border-zinc-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700";

/** スライドを1枚ずつ表示し、「前へ」「次へ」で切り替える。 */
export function SlidePreview({ slides }: { slides: Slide[] }) {
  const [rawIndex, setIndex] = useState(0);
  // 編集で枚数が減っても範囲内に収める
  const index = Math.min(rawIndex, slides.length - 1);
  const isFirst = index === 0;
  const isLast = index === slides.length - 1;

  return (
    <div className="space-y-3">
      <SlideView slide={slides[index]} />
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          disabled={isFirst}
          className={buttonClass}
        >
          ← 前へ
        </button>
        <span className="text-sm tabular-nums" aria-live="polite">
          {index + 1} / {slides.length}
        </span>
        <button
          type="button"
          onClick={() => setIndex(index + 1)}
          disabled={isLast}
          className={buttonClass}
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
