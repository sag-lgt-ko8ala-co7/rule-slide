"use client";

import { useParams } from "next/navigation";
import { use } from "react";
import { browser } from "react-dom";
import { useGame } from "@/lib/useGames";
import { GameForm } from "./GameForm";
import { GameNotFound } from "./GameNotFound";

export function GameEditor() {
  use(browser("ゲームはこの端末の localStorage に保存されています。"));
  const { id } = useParams<{ id: string }>();
  const game = useGame(id);

  if (game === undefined) return <GameNotFound />;
  // 保存などでデータが変わったら、フォームを最新の値で作り直す
  return <GameForm key={`${game.id}:${game.updatedAt}`} game={game} />;
}
