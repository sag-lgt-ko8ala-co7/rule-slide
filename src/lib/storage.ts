// ゲームデータの localStorage 読み書きはこのファイルに集約する。
// localStorage はサーバーでは使えないため、クライアントコンポーネントのブラウザ描画時か
// イベントハンドラの中からだけ呼ぶこと。

import { SAMPLE_GAME } from "./sampleGame";
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

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseGames(raw: string | null): Game[] {
  // 一度も保存したことがない（初めて開いた）ときだけサンプルを見せる。
  // 削除などで一度でも保存すると [] などが入るので、それ以降は出ない。
  if (raw === null) return [SAMPLE_GAME];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGame);
  } catch {
    return [];
  }
}

/** 保存済みのゲームをすべて読み込む。読めない・壊れている場合は空配列を返す。 */
export function loadGames(): Game[] {
  return parseGames(readRaw());
}

// ---- 変更の購読（useSyncExternalStore 用） ----
// Cache Components では移動前の画面が隠れたまま残るため、
// 保存・削除のたびに購読している全画面へ知らせて表示を最新にする。

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // 別のタブでの変更も反映する
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

// undefined は「まだ一度も読んでいない」。null（保存データなし）と区別する
let cachedRaw: string | null | undefined = undefined;
let cachedGames: Game[] = [];

/** 保存内容が変わっていなければ前回と同じ配列（同じ参照）を返す。 */
export function getGamesSnapshot(): Game[] {
  const raw = readRaw();
  if (cachedRaw === undefined || raw !== cachedRaw) {
    cachedRaw = raw;
    cachedGames = parseGames(raw);
  }
  return cachedGames;
}

const EMPTY_GAMES: Game[] = [];

/** サーバー用のスナップショット（サーバーでは localStorage を読めないので常に空）。 */
export function getServerGamesSnapshot(): Game[] {
  return EMPTY_GAMES;
}

/** 書き込みに失敗した場合（容量超過など）は例外を投げる。 */
function writeGames(games: Game[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  notify();
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

/** 既存のゲームを入力内容で上書きして返す。イベントハンドラから呼ぶこと。 */
export function updateGame(id: string, input: GameInput): Game {
  const current = getGame(id);
  if (current === undefined) {
    throw new Error(`ゲームが見つかりません: ${id}`);
  }
  const game: Game = {
    ...current,
    ...input,
    id,
    updatedAt: new Date().toISOString(),
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
