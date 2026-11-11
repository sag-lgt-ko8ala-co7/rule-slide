# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

ボードゲームのルール説明スライドを作るツール（"rule-slide"）。The full spec — personas, MVP scope, sitemap, page list, functional/non-functional requirements — is in `docs/design.md` (Japanese). Read it before adding features; check each feature's Phase (MVP / リリース2 / リリース3) and don't build later-phase features unless asked.

The repo is currently the create-next-app scaffold (`src/app/page.tsx` is still the template page); the app itself has not been built yet.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build (also type-checks)
- `npm run lint` — ESLint (flat config: `eslint-config-next` core-web-vitals + typescript)
- `npx tsc --noEmit` — type-check only

No test framework is set up yet. If one is needed, see `node_modules/next/dist/docs/01-app/02-guides/testing/`.

## Stack and config specifics

- Next.js 16.4 (App Router, `src/app/`), React 19.3, TypeScript strict, Tailwind CSS v4. Import alias `@/*` → `src/*`.
- `next.config.ts` enables **`cacheComponents`** and **`partialPrefetching`**. These change rendering/caching/prefetch semantics compared to older Next.js — read `01-app/01-getting-started/08-caching.md` and `01-app/02-guides/adopting-partial-prefetching.md` in `node_modules/next/dist/docs/` before writing route or data code.
- Tailwind is wired through a **Turbopack loader rule** (`@tailwindcss/turbopack` on `*.css`), not PostCSS — there is no `postcss.config`. Theme tokens live in `src/app/globals.css` (`@theme inline`).
- Route prop types use the generated global helpers (e.g. `LayoutProps<"/">` in `src/app/layout.tsx`, and likewise `PageProps<"/games/[id]">`).

## Architecture constraints (from docs/design.md)

- **No backend, no login.** All data is stored in the browser's `localStorage` on the device; hosting is Vercel free tier. Anything reading/writing storage must be a Client Component — account for hydration (server render has no access to `localStorage`; see `01-app/02-guides/single-page-applications.md` and `preventing-flash-before-hydration.md`).
- Planned routes: `/` (game list, sorted 50音順), `/games/[id]` (detail + slide preview), `/games/[id]/present` (fullscreen presentation, no shared header), `/games/[id]/edit`, `/new` (same form component as edit), `/import` (share code — リリース2以降。MVPでは作らない). Every page except present mode has a shared header: MVPでは「一覧」「新規作成」の2つだけ。「共有コードで開く」はリリース2で追加する.
- Slides are generated automatically from the game data (basic info: name, players, time, audience, overview, win condition + an ordered list of rule items).
- Non-functional: must not break at 375px phone width; presentation mode needs text large enough to read from across a table.
- Copyright: never copy text/images from commercial rulebooks. Sample data should use original or traditional/public-domain games.
- Reference prototype: https://claude.ai/artifact/59RsBFkvCHQ9MSJi3Cfwf9

## プロジェクト固有ルール

### このアプリについて
- ボードゲームの説明係が、ルールを入力してスライドにし、初めての人に全画面で説明するためのWebアプリ
- 設計書は docs/design.md。迷ったら設計書に従う

### スコープ
- 作るのは MVP の F-01〜F-06 と、リリース2の F-07（表紙の写真）・F-11（見出しなしのルールスライド）・F-12（【 】のマーカー強調）・F-13（ルール項目の写真）のみ（ゲーム登録、ルール項目、スライド表示、発表モード、保存・編集・削除、一覧）
- 共有コード・検索・ログイン・データベースは作らない（リリース2以降）
- 写真も localStorage に保存する。保存前に縮小・圧縮し、容量（約5MB）を超えたらエラーを出す

### 技術
- Next.js App Router / TypeScript / Tailwind CSS
- データは localStorage のみ。読み書きは src/lib/storage.ts に集約し、クライアントコンポーネントからだけ呼ぶ
- 画面の URL は設計書のページ一覧どおり（/、/new、/games/[id]、/games/[id]/edit、/games/[id]/present）

### UI
- 画面の文言はすべて日本語
- スマホ幅 375px で崩れないこと
- 発表モードは画面いっぱいに表示し、離れた席から読める大きな文字にする

### 進め方
- 実装の前に必ず Plan Mode で計画を出し、承認を待つ
- 1回の計画で扱うのは 1〜2 画面まで
- 変更のたびに npm run lint と npm run build を通してから完了報告する
- サンプルデータは自作ゲームか伝統ゲーム（将棋・オセロ・トランプ等）だけ。市販ゲームの説明書の文章は使わない
- コミットメッセージは日本語で、何をなぜ変えたかを書く
- 1人で開発しているので、ブランチは作らず main に直接コミットする
