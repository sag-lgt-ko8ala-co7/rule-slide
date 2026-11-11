// 初めて開いたとき（保存データがまったくないとき）に見せるサンプル。
// 架空の手札ゲームで、文章はすべて自作（市販ゲームの説明書は使っていない）。

import type { Game } from "./types";

const CREATED_AT = "2026-11-11T00:00:00.000Z";

export const SAMPLE_GAME: Game = {
  id: "sample-houseki-atsume",
  name: "宝石あつめ",
  nameKana: "ほうせきあつめ",
  players: "2〜4人",
  playTime: "約15分",
  audience: "8歳以上",
  overview:
    "赤・青・緑・黄の宝石カードを場から拾い、同じ色をそろえて並べて点数にする手札ゲーム。",
  winCondition: "山札がなくなってゲームが終わったとき、点数がいちばん多い人の勝ち。",
  rules: [
    {
      id: "sample-rule-setup",
      heading: "準備",
      body: [
        "宝石カードは4色×数字1〜5が2枚ずつ、全部で40枚",
        "よく混ぜて1人に3枚ずつ配る",
        "残りは裏向きにして山札にする",
        "山札から4枚めくり、表向きで場に並べる",
      ].join("\n"),
    },
    {
      id: "sample-rule-turn",
      heading: "手番の流れ",
      body: [
        "「拾う」か「並べる」のどちらか1つを行う",
        "拾う：場のカードを1枚取って手札に加える",
        "並べる：同じ色のカードを2枚以上、手札から自分の前に出す",
        "最後に、場が4枚になるまで山札から補充する",
      ].join("\n"),
    },
    {
      id: "sample-rule-hand",
      heading: "手札の上限",
      body: ["手札は5枚まで", "6枚になったら、1枚を選んで場に捨てる"].join("\n"),
    },
    {
      id: "sample-rule-score",
      heading: "点数の数え方",
      body: [
        "自分の前に並べたカードの数字を合計する",
        "同じ色を4枚以上まとめて並べたら、1回ごとに＋5点",
      ].join("\n"),
    },
    {
      id: "sample-rule-end",
      heading: "ゲームの終わり",
      body: [
        "場の補充で山札がなくなったら、その手番でゲーム終了",
        "手札に残ったカードは1枚につき−1点",
      ].join("\n"),
    },
  ],
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
};
