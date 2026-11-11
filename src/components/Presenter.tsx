"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  use,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import { browser } from "react-dom";
import { buildSlides } from "@/lib/slides";
import { useGame } from "@/lib/useGames";
import type { Game } from "@/lib/types";
import { GameNotFound } from "./GameNotFound";
import { SlideView } from "./SlideView";

export function Presenter() {
  use(browser("ゲームはこの端末の localStorage に保存されています。"));
  const { id } = useParams<{ id: string }>();
  const game = useGame(id);

  if (game === undefined) {
    return (
      <div className="mx-auto max-w-3xl p-4">
        <GameNotFound />
      </div>
    );
  }
  return <PresenterContent key={game.id} game={game} />;
}

function PresenterContent({ game }: { game: Game }) {
  const router = useRouter();
  const slides = useMemo(() => buildSlides(game), [game]);
  const [rawIndex, setIndex] = useState(0);
  // 編集で枚数が減っても範囲内に収める
  const index = Math.min(rawIndex, slides.length - 1);
  const detailHref = `/games/${game.id}`;

  function next() {
    setIndex(Math.min(index + 1, slides.length - 1));
  }
  function prev() {
    setIndex(Math.max(index - 1, 0));
  }

  // この画面は移動後も隠れて残るため、隠れるときに1枚目へ戻す
  useLayoutEffect(() => {
    return () => setIndex(0);
  }, []);

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    switch (event.key) {
      case "ArrowRight":
      case " ":
        event.preventDefault();
        next();
        break;
      case "ArrowLeft":
        event.preventDefault();
        prev();
        break;
      case "Escape":
        // 詳細で「戻る」を押しても発表モードに戻らないよう replace にする
        router.replace(detailHref);
        break;
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleTap(event: MouseEvent<HTMLDivElement>) {
    if (event.clientX < window.innerWidth / 2) {
      prev();
    } else {
      next();
    }
  }

  return (
    <div className="fixed inset-0 h-dvh overflow-hidden bg-white text-zinc-900">
      <div
        onClick={handleTap}
        className="h-full w-full touch-manipulation select-none"
      >
        <SlideView fill slide={slides[index]} />
      </div>

      <Link
        href={detailHref}
        replace
        className="fixed right-3 top-3 rounded-md bg-zinc-900/80 px-4 py-2 font-bold text-white hover:bg-zinc-900"
      >
        終了
      </Link>

      <p
        aria-live="polite"
        className="pointer-events-none fixed bottom-3 right-3 rounded-md bg-zinc-900/10 px-3 py-1 text-lg font-bold tabular-nums text-zinc-700"
      >
        {index + 1} / {slides.length}
      </p>
    </div>
  );
}
