/** ルール項目（スライド1枚分）。 */
export type RuleItem = {
  id: string;
  /** 見出し（例：手番の流れ） */
  heading: string;
  /** 本文（改行可） */
  body: string;
  /** 写真の id（storage.ts の savePhoto で保存したもの）。写真がなければ null */
  photoId: string | null;
};

/** 登録したゲーム。人数・時間などは F-01 のとおり自由記述のテキスト。 */
export type Game = {
  id: string;
  /** ゲーム名（必須） */
  name: string;
  /** よみがな（任意）。一覧を50音順に並べるのに使う */
  nameKana: string;
  /** 人数（例：2〜4人） */
  players: string;
  /** 時間（例：30分） */
  playTime: string;
  /** 対象（例：8歳以上） */
  audience: string;
  /** 概要 */
  overview: string;
  /** 勝利条件 */
  winCondition: string;
  /** 表紙の写真の id。写真がなければ null */
  coverPhotoId: string | null;
  /** 配列の順番がそのままスライドの順番になる */
  rules: RuleItem[];
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
};

/** フォームで入力する値。 */
export type GameInput = Omit<Game, "id" | "createdAt" | "updatedAt">;
