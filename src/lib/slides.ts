// ゲームのデータからスライドを作る（純粋関数）。詳細のプレビューと発表モードで共通に使う。

import type { Game } from "./types";

export type Slide =
  | { kind: "cover"; title: string; facts: { label: string; value: string }[] }
  | { kind: "text"; heading: string; text: string }
  /** heading が null のときは見出しなし（本文だけ）のスライド */
  | { kind: "rule"; heading: string | null; bullets: string[] }
  | { kind: "start"; title: string };

/** 改行で分け、前後の空白を取り、空行を除く。 */
export function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/**
 * 表紙 → どんなゲーム？（概要）→ 勝利条件 → ルール項目（1項目1枚）→ さあ始めよう
 * の順でスライドを作る。空の項目のスライドは作らない（表紙と最後は必ず作る）。
 * 文章中の【 】はそのまま残し、表示するときに強調にする（Highlighted）。
 */
export function buildSlides(game: Game): Slide[] {
  const slides: Slide[] = [];

  const facts = [
    { label: "人数", value: game.players.trim() },
    { label: "時間", value: game.playTime.trim() },
    { label: "対象", value: game.audience.trim() },
  ].filter((fact) => fact.value !== "");
  slides.push({ kind: "cover", title: game.name, facts });

  const overview = game.overview.trim();
  if (overview !== "") {
    slides.push({ kind: "text", heading: "どんなゲーム？", text: overview });
  }

  const winCondition = game.winCondition.trim();
  if (winCondition !== "") {
    slides.push({ kind: "text", heading: "勝利条件", text: winCondition });
  }

  game.rules.forEach((rule) => {
    const heading = rule.heading.trim();
    const bullets = splitLines(rule.body);
    if (heading === "" && bullets.length === 0) return;
    // 見出しが空なら、仮の見出しは付けず本文だけのスライドにする
    slides.push({ kind: "rule", heading: heading || null, bullets });
  });

  slides.push({ kind: "start", title: game.name });

  return slides;
}
