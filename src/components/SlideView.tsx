import type { Slide } from "@/lib/slides";

type Props = {
  slide: Slide;
  /** true のときは親いっぱいに広げる（発表モード）。false のときは 16:9 の枠（詳細のプレビュー）。 */
  fill?: boolean;
};

// 発表モードでは右上に「終了」、右下にページ番号が重なるので、
// 上下は少なくともその高さだけ空ける。余白はスクロールする領域の外側に取るので、
// 長い本文をスクロールしても、ボタンやページ番号の下に文字が入り込まない。
const FILL_PADDING = "px-[7cqmin] pt-[max(7cqmin,4.5rem)] pb-[max(7cqmin,3.5rem)]";

/**
 * スライド1枚。文字の大きさは枠の短い辺に対する割合（cqmin）で決める。
 * 16:9 のプレビューでも、縦向きスマホの全画面でも、枠に合った大きさになる。
 */
export function SlideView({ slide, fill = false }: Props) {
  const frame = fill
    ? "h-full w-full"
    : "aspect-video w-full rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-700";
  return (
    <div className={`${frame} overflow-hidden bg-white text-zinc-900 [container-type:size]`}>
      <div className={`flex h-full flex-col ${fill ? FILL_PADDING : "p-[8.9cqmin]"}`}>
        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          <SlideContent slide={slide} />
        </div>
      </div>
    </div>
  );
}

function SlideContent({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "cover":
      return (
        <div className="m-auto text-center">
          <h2 className="wrap-anywhere text-[14cqmin] font-bold leading-tight">{slide.title}</h2>
          {slide.facts.length > 0 && (
            <dl className="mt-[5.3cqmin] flex flex-wrap justify-center gap-x-[7.1cqmin] gap-y-[1.8cqmin] text-[6.4cqmin]">
              {slide.facts.map((fact) => (
                <div key={fact.label} className="flex gap-[2.1cqmin]">
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
          <p className="mt-[4.4cqmin] whitespace-pre-wrap wrap-anywhere text-[6.4cqmin] leading-relaxed">
            {slide.text}
          </p>
        </>
      );
    case "rule":
      return (
        <>
          <SlideHeading>{slide.heading}</SlideHeading>
          {slide.bullets.length > 0 && (
            <ul className="mt-[4.4cqmin] list-disc space-y-[1.8cqmin] pl-[7.1cqmin] text-[6.4cqmin] leading-relaxed">
              {slide.bullets.map((bullet, index) => (
                <li key={index} className="wrap-anywhere">
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </>
      );
    case "start":
      return (
        <div className="m-auto text-center">
          <p className="text-[14cqmin] font-bold">さあ始めよう！</p>
          <p className="mt-[3.6cqmin] wrap-anywhere text-[7.1cqmin] text-zinc-600">{slide.title}</p>
        </div>
      );
  }
}

function SlideHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="wrap-anywhere border-b-[0.7cqmin] border-zinc-900 pb-[2.1cqmin] text-[9.8cqmin] font-bold leading-tight">
      {children}
    </h2>
  );
}
