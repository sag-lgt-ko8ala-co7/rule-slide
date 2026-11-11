"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { use, useMemo } from "react";
import { browser } from "react-dom";
import { buildSlides } from "@/lib/slides";
import { deleteGame } from "@/lib/storage";
import { useGame } from "@/lib/useGames";
import type { Game } from "@/lib/types";
import { GameNotFound } from "./GameNotFound";
import { SlidePreview } from "./SlidePreview";

export function GameDetail() {
  use(browser("ゲームはこの端末の localStorage に保存されています。"));
  const { id } = useParams<{ id: string }>();
  const game = useGame(id);

  if (game === undefined) return <GameNotFound />;
  return <GameDetailContent game={game} />;
}

const buttonBase = "rounded-md px-4 py-2 text-center font-bold";

function GameDetailContent({ game }: { game: Game }) {
  const router = useRouter();
  const slides = useMemo(() => buildSlides(game), [game]);

  function handleDelete() {
    const ok = window.confirm(`「${game.name}」を削除しますか？この操作は元に戻せません。`);
    if (!ok) return;
    // 「戻る」で削除したゲームの画面に戻らないよう replace で移動する
    router.replace("/");
    deleteGame(game.id);
  }

  return (
    <div className="space-y-6">
      <h1 className="break-words text-2xl font-bold">{game.name}</h1>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/games/${game.id}/present`}
          className={`${buttonBase} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300`}
        >
          発表モード
        </Link>
        <Link
          href={`/games/${game.id}/edit`}
          className={`${buttonBase} border border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900`}
        >
          編集
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className={`${buttonBase} text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950`}
        >
          削除
        </button>
      </div>

      <SlidePreview key={game.id} slides={slides} />
    </div>
  );
}
