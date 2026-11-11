// ゲームデータの localStorage 読み書きはこのファイルに集約する。
// localStorage はサーバーでは使えないため、クライアントコンポーネントのブラウザ描画時か
// イベントハンドラの中からだけ呼ぶこと。

import type { Game, GameInput, RuleItem } from "./types";

const STORAGE_KEY = "rule-slide:games:v1";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isRuleItem(value: unknown): value is RuleItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return isString(v.id) && isString(v.heading) && isString(v.body);
}

function isGame(value: unknown): value is Game {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isString(v.id) &&
    isString(v.name) &&
    isString(v.nameKana) &&
    isString(v.players) &&
    isString(v.playTime) &&
    isString(v.audience) &&
    isString(v.overview) &&
    isString(v.winCondition) &&
    Array.isArray(v.rules) &&
    v.rules.every(isRuleItem) &&
    isString(v.createdAt) &&
    isString(v.updatedAt)
  );
}

/** 保存済みのゲームをすべて読み込む。読めない・壊れている場合は空配列を返す。 */
export function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGame);
  } catch {
    return [];
  }
}

/** 書き込みに失敗した場合（容量超過など）は例外を投げる。 */
function writeGames(games: Game[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function getGame(id: string): Game | undefined {
  return loadGames().find((game) => game.id === id);
}

/** 同じ id があれば置き換え、なければ追加する。 */
export function saveGame(game: Game): void {
  const games = loadGames();
  const index = games.findIndex((g) => g.id === game.id);
  if (index === -1) {
    games.push(game);
  } else {
    games[index] = game;
  }
  writeGames(games);
}

/** 新しいゲームを保存して返す。id と日時を作るのでイベントハンドラから呼ぶこと。 */
export function createGame(input: GameInput): Game {
  const now = new Date().toISOString();
  const game: Game = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  saveGame(game);
  return game;
}

export function deleteGame(id: string): void {
  writeGames(loadGames().filter((game) => game.id !== id));
}

/** よみがな（なければゲーム名）で50音順に並べた新しい配列を返す。 */
export function sortGamesByKana(games: Game[]): Game[] {
  const key = (game: Game) => (game.nameKana.trim() || game.name).trim();
  return [...games].sort((a, b) => key(a).localeCompare(key(b), "ja"));
}
