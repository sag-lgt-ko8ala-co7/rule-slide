// ゲームデータの localStorage 読み書きはこのファイルに集約する。
// localStorage はサーバーでは使えないため、クライアントコンポーネントのブラウザ描画時か
// イベントハンドラの中からだけ呼ぶこと。

import { SAMPLE_GAME } from "./sampleGame";
import type { Game, GameInput, RuleItem } from "./types";

const STORAGE_KEY = "rule-slide:games:v1";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

/** 写真の id。前の版のデータには項目がないので、なければ null にする。 */
function toPhotoId(value: unknown): string | null {
  return isString(value) && value !== "" ? value : null;
}

/** 保存データを RuleItem に直す。形が合わなければ null。 */
function toRuleItem(value: unknown): RuleItem | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (!(isString(v.id) && isString(v.heading) && isString(v.body))) return null;
  return { id: v.id, heading: v.heading, body: v.body, photoId: toPhotoId(v.photoId) };
}

/** 保存データを Game に直す。形が合わなければ null。 */
function toGame(value: unknown): Game | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (
    !(
      isString(v.id) &&
      isString(v.name) &&
      isString(v.nameKana) &&
      isString(v.players) &&
      isString(v.playTime) &&
      isString(v.audience) &&
      isString(v.overview) &&
      isString(v.winCondition) &&
      Array.isArray(v.rules) &&
      isString(v.createdAt) &&
      isString(v.updatedAt)
    )
  ) {
    return null;
  }
  const rules = v.rules.map(toRuleItem);
  if (rules.some((rule) => rule === null)) return null;
  return {
    id: v.id,
    name: v.name,
    nameKana: v.nameKana,
    players: v.players,
    playTime: v.playTime,
    audience: v.audience,
    overview: v.overview,
    winCondition: v.winCondition,
    coverPhotoId: toPhotoId(v.coverPhotoId),
    rules: rules as RuleItem[],
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
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
    return parsed.map(toGame).filter((game): game is Game => game !== null);
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
  } catch (error) {
    if (isQuotaError(error)) throw new StorageFullError();
    throw error;
  }
  removeUnusedPhotos(games);
  usageCache = null;
  notify();
}

// ---- 写真 ----
// 写真はゲームのデータとは別のキーに 1 枚ずつ保存し、ゲーム側は id だけを持つ。
// （ゲームのデータは表示のたびに読み直すので、数MB の写真を混ぜると重くなるため）
// 写真は一度保存したら中身を変えない。差し替えるときは新しい id で保存する。

const PHOTO_PREFIX = "rule-slide:photo:v1:";
/** localStorage の容量の目安（文字数）。ブラウザによって違うので「約」で表示する。 */
export const STORAGE_LIMIT = 5_000_000;

/** 容量がいっぱいで保存できなかったときのエラー。 */
export class StorageFullError extends Error {
  constructor() {
    super("保存できる容量がいっぱいです");
    this.name = "StorageFullError";
  }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
}

const photoCache = new Map<string, string>();

/** 写真（data URL）を保存して id を返す。容量を超えたら StorageFullError を投げる。 */
export function savePhoto(dataUrl: string): string {
  const id = crypto.randomUUID();
  try {
    localStorage.setItem(PHOTO_PREFIX + id, dataUrl);
  } catch (error) {
    if (isQuotaError(error)) throw new StorageFullError();
    throw error;
  }
  photoCache.set(id, dataUrl);
  usageCache = null;
  notify(); // 保存容量の表示を更新する
  return id;
}

/** 写真の data URL。見つからなければ undefined（別の端末で作ったデータなど）。 */
export function getPhoto(id: string): string | undefined {
  const cached = photoCache.get(id);
  if (cached !== undefined) return cached;
  try {
    const dataUrl = localStorage.getItem(PHOTO_PREFIX + id);
    if (dataUrl === null) return undefined;
    photoCache.set(id, dataUrl);
    return dataUrl;
  } catch {
    return undefined;
  }
}

/** どのゲームからも使われていない写真を消す（ゲームの削除・写真の差し替え・保存しなかった写真）。 */
function removeUnusedPhotos(games: Game[]): void {
  const used = new Set<string>();
  for (const game of games) {
    if (game.coverPhotoId) used.add(game.coverPhotoId);
    for (const rule of game.rules) if (rule.photoId) used.add(rule.photoId);
  }
  const unused: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PHOTO_PREFIX) && !used.has(key.slice(PHOTO_PREFIX.length))) {
      unused.push(key);
    }
  }
  for (const key of unused) {
    localStorage.removeItem(key);
    photoCache.delete(key.slice(PHOTO_PREFIX.length));
  }
}

// 使用量の計算は全キーを読むので、書き込むまで結果を覚えておく
let usageCache: number | null = null;

/**
 * このアプリが localStorage に保存している量（文字数）。useSyncExternalStore の getSnapshot 用。
 * 写真は base64 なので、文字数がほぼバイト数になる。
 */
export function getStorageUsage(): number {
  if (usageCache !== null) return usageCache;
  let used = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("rule-slide:")) used += key.length + (localStorage.getItem(key)?.length ?? 0);
    }
  } catch {
    return 0;
  }
  usageCache = used;
  return used;
}

/** サーバーでは使用量が分からないので null（表示しない）。 */
export function getServerStorageUsage(): null {
  return null;
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
