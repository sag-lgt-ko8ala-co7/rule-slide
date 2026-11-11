"use client";

import { useRef } from "react";
import type { Slide } from "@/lib/slides";
import { getPhoto } from "@/lib/storage";
import { Highlighted } from "./Highlighted";
import { useFitToFrame } from "./useFitToFrame";

type Props = {
  slide: Slide;
  /** true のときは親いっぱいに広げる（発表モード）。false のときは 16:9 の枠（詳細のプレビュー）。 */
  fill?: boolean;
};

// 発表モードでは右上に「終了」、右下にページ番号が重なる。余白はスクロールする領域の外側に取り、
// スクロールしても文字がボタンやページ番号の下に入り込まないようにする。
// - 縦向き：上下に帯を取る
// - 横向き：高さが足りないので上下の帯はやめ、ボタンのある右側に列を取る
const FILL_PADDING =
  "px-[7cqmin] pt-[max(7cqmin,4.5rem)] pb-[max(7cqmin,3.5rem)] " +
  "landscape:pt-[7cqmin] landscape:pb-[7cqmin] landscape:pr-[6rem]";

/**
 * スライド1枚。文字の大きさは枠の短い辺に対する割合（cqmin）× 縮小率（--slide-fit、既定 1）。
 * 発表モードでは、入りきらないときに縮小率を下げて全文が見えるようにする（useFitToFrame）。
 */
export function SlideView({ slide, fill = false }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  useFitToFrame(fill, slide, { frame: frameRef, scroller: scrollerRef, marker: markerRef });

  const frame = fill
    ? "h-full w-full"
    : "aspect-video w-full rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-700";

  // 写真のデータが見つからないとき（別の端末で作ったなど）は、写真なしと同じ並べ方にする
  const photo = "photoId" in slide && slide.photoId ? getPhoto(slide.photoId) : undefined;

  // 文章の部分。文字を自動で小さくする仕組みは、この中の高さだけを測る
  const textArea = (
    <div
      key={photo ? "text-with-photo" : "text-only"}
      ref={markerRef}
      className="group relative flex min-h-0 min-w-0 flex-1 flex-col"
    >
      <div ref={scrollerRef} className="flex min-h-0 flex-1 flex-col overflow-auto">
        <SlideContent slide={slide} />
      </div>
      {fill && <MoreIndicator />}
    </div>
  );

  return (
    <div
      ref={frameRef}
      className={`${frame} overflow-hidden bg-white text-zinc-900 [container-type:size]`}
    >
      <div className={`flex h-full flex-col ${fill ? FILL_PADDING : "p-[8.9cqmin]"}`}>
        {photo ? (
          // 写真はスクロールする領域の外に置き、割り当てた場所に縦横比を保って収める
          // （並べ方は globals.css の .slide-split。枠の向きで左右／上下を切り替える）
          // key を分けて、写真の有無が変わったら要素を作り直す（同じ div を使い回すと、
          // useFitToFrame が直接付けた data-overflow が古い要素に残るため）
          <div key="with-photo" className="slide-split min-h-0 flex-1" data-layout={slide.kind}>
            {textArea}
            <div className="slide-split-photo">
              {/* data URL の写真なので next/image の最適化は使えない */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt={photoAlt(slide)} className="h-full w-full object-contain" />
            </div>
          </div>
        ) : (
          textArea
        )}
      </div>
    </div>
  );
}

function photoAlt(slide: Slide): string {
  if (slide.kind === "cover") return "表紙の写真";
  if (slide.kind === "rule") return `${slide.heading ?? "ルール"}の写真`;
  return "";
}

/** 下限の大きさでも入りきらず、まだ下に続きがあるときだけ出す。 */
function MoreIndicator() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-12 bg-linear-to-t from-white to-transparent group-data-[overflow=more]:block" />
      <p className="pointer-events-none absolute bottom-0 left-0 hidden rounded-md bg-zinc-900/80 px-3 py-1 text-sm font-bold text-white group-data-[overflow=more]:block">
        ▼ 続きはスクロール
      </p>
    </>
  );
}

function SlideContent({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "cover":
      return (
        <div className="m-auto text-center">
          <h2 className="wrap-anywhere text-[calc(14cqmin*var(--slide-fit,1))] font-bold leading-tight">
            {slide.title}
          </h2>
          {slide.facts.length > 0 && (
            <dl className="mt-[calc(5.3cqmin*var(--slide-fit,1))] flex flex-wrap justify-center gap-x-[calc(7.1cqmin*var(--slide-fit,1))] gap-y-[calc(1.8cqmin*var(--slide-fit,1))] text-[calc(6.4cqmin*var(--slide-fit,1))]">
              {slide.facts.map((fact) => (
                <div key={fact.label} className="flex gap-[calc(2.1cqmin*var(--slide-fit,1))]">
                  <dt className="text-zinc-500">{fact.label}</dt>
                  <dd className="font-bold">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      );
    case "text":
      return (
        <>
          <SlideHeading>{slide.heading}</SlideHeading>
          <p className="mt-[calc(4.4cqmin*var(--slide-fit,1))] whitespace-pre-wrap wrap-anywhere text-[calc(6.4cqmin*var(--slide-fit,1))] leading-relaxed">
            <Highlighted text={slide.text} />
          </p>
        </>
      );
    case "rule":
      return (
        <>
          {slide.heading !== null && <SlideHeading>{slide.heading}</SlideHeading>}
          {slide.bullets.length > 0 && (
            <ul
              className={`${slide.heading !== null ? "mt-[calc(4.4cqmin*var(--slide-fit,1))]" : ""} list-disc space-y-[calc(1.8cqmin*var(--slide-fit,1))] pl-[calc(7.1cqmin*var(--slide-fit,1))] text-[calc(6.4cqmin*var(--slide-fit,1))] leading-relaxed`}
            >
              {slide.bullets.map((bullet, index) => (
                <li key={index} className="wrap-anywhere">
                  <Highlighted text={bullet} />
                </li>
              ))}
            </ul>
          )}
        </>
      );
    case "start":
      return (
        <div className="m-auto text-center">
          <p className="text-[calc(14cqmin*var(--slide-fit,1))] font-bold">さあ始めよう！</p>
          <p className="mt-[calc(3.6cqmin*var(--slide-fit,1))] wrap-anywhere text-[calc(7.1cqmin*var(--slide-fit,1))] text-zinc-600">
            {slide.title}
          </p>
        </div>
      );
  }
}

function SlideHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="wrap-anywhere border-b-[calc(0.7cqmin*var(--slide-fit,1))] border-zinc-900 pb-[calc(2.1cqmin*var(--slide-fit,1))] text-[calc(9.8cqmin*var(--slide-fit,1))] font-bold leading-tight">
      {children}
    </h2>
  );
}
