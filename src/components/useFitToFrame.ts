"use client";

import { useLayoutEffect, type RefObject } from "react";

/** 本文の文字はこれより小さくしない（テーブルに置いたスマホを向かいの席から読める目安）。 */
const MIN_BODY_PX = 18;
/** 大きい画面でも、基準の大きさのこの割合より小さくしない。 */
const MIN_FIT_RATIO = 0.5;
/** SlideView の本文の基準の大きさ（枠の短い辺に対する割合。text-[6.4cqmin] と合わせる）。 */
const BODY_RATIO = 0.064;

type Refs = {
  /** 大きさの基準になる枠（container-type: size の要素） */
  frame: RefObject<HTMLElement | null>;
  /** スクロールする領域。ここに --slide-fit を書き込む */
  scroller: RefObject<HTMLElement | null>;
  /** data-overflow を付ける要素（「続きはスクロール」の表示の切り替えに使う） */
  marker: RefObject<HTMLElement | null>;
};

/**
 * 内容が枠に入りきらないとき、文字を自動で小さくする（--slide-fit を 1 から下げる）。
 * 下限まで小さくしても入らなければ data-overflow="more" を付け、スクロールしてもらう。
 * 再描画を起こさないよう、React の state ではなく DOM を直接書き換える。
 */
export function useFitToFrame(enabled: boolean, contentKey: unknown, refs: Refs) {
  const { frame: frameRef, scroller: scrollerRef, marker: markerRef } = refs;

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const scroller = scrollerRef.current;
    const marker = markerRef.current;
    if (!enabled || !frame || !scroller || !marker) return;

    let needsScroll = false;

    const setFit = (fit: number) => scroller.style.setProperty("--slide-fit", String(fit));
    const fits = () => scroller.scrollHeight <= scroller.clientHeight + 1;

    const updateOverflow = () => {
      if (!needsScroll) {
        marker.dataset.overflow = "none";
        return;
      }
      const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      marker.dataset.overflow = atEnd ? "end" : "more";
    };

    const fit = () => {
      const basePx = Math.min(frame.clientWidth, frame.clientHeight) * BODY_RATIO;
      const minFit = Math.min(1, Math.max(MIN_BODY_PX / basePx, MIN_FIT_RATIO));

      setFit(1);
      if (fits()) {
        needsScroll = false;
      } else {
        setFit(minFit);
        if (!fits()) {
          needsScroll = true;
        } else {
          // 入る中でいちばん大きい縮小率を二分探索で探す
          let lo = minFit; // 入る
          let hi = 1; // 入らない
          for (let i = 0; i < 8; i++) {
            const mid = (lo + hi) / 2;
            setFit(mid);
            if (fits()) lo = mid;
            else hi = mid;
          }
          setFit(lo);
          needsScroll = false;
        }
      }
      updateOverflow();
    };

    scroller.scrollTop = 0;
    fit();

    // 画面の回転や、Safari のアドレスバーの出し入れで枠の大きさが変わったら測り直す
    const observer = new ResizeObserver(() => fit());
    observer.observe(frame);
    // フォントの読み込みで文字の幅が変わることがあるので、読み込み後にも測り直す
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) fit();
    });
    scroller.addEventListener("scroll", updateOverflow, { passive: true });

    return () => {
      cancelled = true;
      observer.disconnect();
      scroller.removeEventListener("scroll", updateOverflow);
    };
  }, [enabled, contentKey, frameRef, scrollerRef, markerRef]);
}
