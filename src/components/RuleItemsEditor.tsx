"use client";

import type { RuleItem } from "@/lib/types";

type Props = {
  rules: RuleItem[];
  onChange: (rules: RuleItem[]) => void;
};

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

/** ルール項目（見出し＋本文）の入力・追加・削除。状態は親が持つ。 */
export function RuleItemsEditor({ rules, onChange }: Props) {
  function update(id: string, patch: Partial<Omit<RuleItem, "id">>) {
    onChange(rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  }

  function add() {
    onChange([...rules, { id: crypto.randomUUID(), heading: "", body: "" }]);
  }

  function remove(id: string) {
    onChange(rules.filter((rule) => rule.id !== id));
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-bold">ルール項目</legend>

      {rules.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          ルール項目はまだありません。
        </p>
      )}

      <ol className="space-y-4">
        {rules.map((rule, index) => (
          <li
            key={rule.id}
            className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">項目 {index + 1}</span>
              <button
                type="button"
                onClick={() => remove(rule.id)}
                className="rounded-md px-3 py-1 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
              >
                削除
              </button>
            </div>
            <label className="block space-y-1">
              <span className="text-sm">見出し</span>
              <input
                type="text"
                value={rule.heading}
                onChange={(e) => update(rule.id, { heading: e.target.value })}
                placeholder="例：手番の流れ"
                className={inputClass}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm">本文</span>
              <textarea
                value={rule.body}
                onChange={(e) => update(rule.id, { body: e.target.value })}
                rows={4}
                className={inputClass}
              />
            </label>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={add}
        className="w-full rounded-md border border-dashed border-zinc-400 px-4 py-2 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
      >
        ＋ ルール項目を追加
      </button>
    </fieldset>
  );
}
