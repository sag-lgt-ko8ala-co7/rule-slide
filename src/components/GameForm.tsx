"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createGame, updateGame } from "@/lib/storage";
import type { Game, GameInput } from "@/lib/types";
import { RuleItemsEditor } from "./RuleItemsEditor";

// 初期表示用の空のルール項目。レンダー中に乱数IDを作らないよう固定IDにしている
// （追加ボタンで増やす項目はクリック時に crypto.randomUUID() で作る）。
const EMPTY_INPUT: GameInput = {
  name: "",
  nameKana: "",
  players: "",
  playTime: "",
  audience: "",
  overview: "",
  winCondition: "",
  rules: [{ id: "initial-rule", heading: "", body: "" }],
};

type TextField = Exclude<keyof GameInput, "rules">;

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

function toInput(game: Game): GameInput {
  return {
    name: game.name,
    nameKana: game.nameKana,
    players: game.players,
    playTime: game.playTime,
    audience: game.audience,
    overview: game.overview,
    winCondition: game.winCondition,
    rules: game.rules,
  };
}

type Props = {
  /** 指定すると編集モード。省略すると新規作成。 */
  game?: Game;
};

/** ゲームの基本情報とルール項目の入力フォーム（新規作成と編集で共通）。 */
export function GameForm({ game }: Props) {
  const router = useRouter();
  const [value, setValue] = useState<GameInput>(() =>
    game ? toInput(game) : EMPTY_INPUT,
  );
  const [error, setError] = useState<string | null>(null);

  function setField(field: TextField, text: string) {
    setValue((prev) => ({ ...prev, [field]: text }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (value.name.trim() === "") {
      setError("ゲーム名を入力してください。");
      return;
    }
    const input = { ...value, name: value.name.trim() };
    try {
      if (game) {
        updateGame(game.id, input);
        router.push(`/games/${game.id}`);
      } else {
        const created = createGame(input);
        // /new の画面は移動後も隠れて残るため、次に開いたとき空になるよう戻しておく
        setValue(EMPTY_INPUT);
        setError(null);
        router.push(`/games/${created.id}`);
      }
    } catch {
      setError("保存できませんでした。端末の空き容量を確認してください。");
    }
  }

  function textInput(field: TextField, label: string, placeholder?: string) {
    return (
      <label className="block space-y-1">
        <span className="text-sm">{label}</span>
        <input
          type="text"
          value={value[field]}
          onChange={(e) => setField(field, e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      </label>
    );
  }

  function textArea(field: TextField, label: string) {
    return (
      <label className="block space-y-1">
        <span className="text-sm">{label}</span>
        <textarea
          value={value[field]}
          onChange={(e) => setField(field, e.target.value)}
          rows={3}
          className={inputClass}
        />
      </label>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold">基本情報</legend>
        <label className="block space-y-1">
          <span className="text-sm">
            ゲーム名 <span className="text-red-700 dark:text-red-400">（必須）</span>
          </span>
          <input
            type="text"
            value={value.name}
            onChange={(e) => setField("name", e.target.value)}
            required
            className={inputClass}
          />
        </label>
        {textInput("nameKana", "よみがな（一覧の並び順に使います）", "例：しょうぎ")}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {textInput("players", "人数", "例：2〜4人")}
          {textInput("playTime", "時間", "例：30分")}
          {textInput("audience", "対象", "例：8歳以上")}
        </div>
        {textArea("overview", "概要")}
        {textArea("winCondition", "勝利条件")}
      </fieldset>

      <RuleItemsEditor
        rules={value.rules}
        onChange={(rules) => setValue((prev) => ({ ...prev, rules }))}
      />

      {error && (
        <p role="alert" className="text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={game ? `/games/${game.id}` : "/"}
          className="rounded-md border border-zinc-300 px-6 py-2 text-center dark:border-zinc-700"
        >
          キャンセル
        </Link>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-6 py-2 font-bold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          保存
        </button>
      </div>
    </form>
  );
}
