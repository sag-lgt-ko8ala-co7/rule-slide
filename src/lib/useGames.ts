"use client";

import { useSyncExternalStore } from "react";
import { getGamesSnapshot, getServerGamesSnapshot, subscribe } from "./storage";
import type { Game } from "./types";

/** 保存済みのゲーム一覧。保存・削除されると自動で最新になる。 */
export function useGames(): Game[] {
  return useSyncExternalStore(subscribe, getGamesSnapshot, getServerGamesSnapshot);
}

/** 指定した id のゲーム。見つからなければ undefined。 */
export function useGame(id: string): Game | undefined {
  return useGames().find((game) => game.id === id);
}
