import type { Slide } from "@/lib/slides";

/**
 * スライド1枚。16:9 の枠に入れ、文字の大きさは枠の幅に対する割合（cqw）で決める。
 * 小さなプレビューでも全画面の発表モードでも同じ見た目になる。
 */
export function SlideView({ slide }: { slide: Slide }) {
  return (
    <div className="@container aspect-video w-full overflow-hidden rounded-lg border border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-zinc-700">
      <div className="flex h-full flex-col overflow-auto p-[5cqw]">
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
          <h2 className="break-words text-[8cqw] font-bold leading-tight">{slide.title}</h2>
          {slide.facts.length > 0 && (
            <dl className="mt-[3cqw] flex flex-wrap justify-center gap-x-[4cqw] gap-y-[1cqw] text-[3.6cqw]">
              {slide.facts.map((fact) => (
                <div key={fact.label} className="flex gap-[1.2cqw]">
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
          <p className="mt-[2.5cqw] whitespace-pre-wrap break-words text-[3.6cqw] leading-relaxed">
            {slide.text}
          </p>
        </>
      );
    case "rule":
      return (
        <>
          <SlideHeading>{slide.heading}</SlideHeading>
          {slide.bullets.length > 0 && (
            <ul className="mt-[2.5cqw] list-disc space-y-[1cqw] pl-[4cqw] text-[3.6cqw] leading-relaxed">
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
          <p className="text-[8cqw] font-bold">さあ始めよう！</p>
          <p className="mt-[2cqw] break-words text-[4cqw] text-zinc-600">{slide.title}</p>
        </div>
      );
  }
}

function SlideHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="break-words border-b-[0.4cqw] border-zinc-900 pb-[1.2cqw] text-[5.5cqw] font-bold leading-tight">
      {children}
    </h2>
  );
}
