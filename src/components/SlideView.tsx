import type { Slide } from "@/lib/slides";

type Props = {
  slide: Slide;
  /** true のときは親いっぱいに広げる（発表モード）。false のときは 16:9 の枠（詳細のプレビュー）。 */
  fill?: boolean;
};

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
      <div className={`flex h-full flex-col overflow-auto ${fill ? "p-[7cqmin]" : "p-[8.9cqmin]"}`}>
        <SlideContent slide={slide} />
      </div>
    </div>
  );
}

function SlideContent({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "cover":
      return (
        <div className="m-auto text-center">
          <h2 className="break-words text-[14cqmin] font-bold leading-tight">{slide.title}</h2>
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
          <p className="mt-[4.4cqmin] whitespace-pre-wrap break-words text-[6.4cqmin] leading-relaxed">
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
                <li key={index} className="break-words">
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
          <p className="mt-[3.6cqmin] break-words text-[7.1cqmin] text-zinc-600">{slide.title}</p>
        </div>
      );
  }
}

function SlideHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="break-words border-b-[0.7cqmin] border-zinc-900 pb-[2.1cqmin] text-[9.8cqmin] font-bold leading-tight">
      {children}
    </h2>
  );
}
