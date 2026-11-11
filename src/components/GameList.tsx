"use client";

import Link from "next/link";
import { use, useState } from "react";
import { browser } from "react-dom";
import { loadGames, sortGamesByKana } from "@/lib/storage";

export function GameList() {
  use(browser("ゲームはこの端末の localStorage に保存されています。"));

  const [games] = useState(() => sortGamesByKana(loadGames()));

  if (games.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <p>まだゲームが登録されていません。</p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          「新規作成」からルールを登録すると、ここに表示されます。
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {games.map((game) => (
        <li key={game.id}>
          <Link
            href={`/games/${game.id}`}
            className="block h-full rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <p className="break-words text-lg font-bold">{game.name}</p>
            {(game.players || game.playTime) && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {[game.players, game.playTime].filter(Boolean).join("・")}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
