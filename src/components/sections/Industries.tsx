import { INDUSTRIES, REGIONS } from "@/lib/site";
import { Marquee } from "../Marquee";
import { Reveal } from "../Reveal";

export function Industries({ lang = "en" }: { lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  return (
    <section id="industries" className="border-t hairline py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>04</span>
          <span className="h-px w-8 bg-line" />
          <span>{isAr ? "القطاعات والمناطق" : "Industries & regions"}</span>
        </Reveal>

        <Reveal as="h2" className="max-w-5xl text-balance text-3xl leading-tight md:text-5xl lg:text-6xl">
          {isAr ? (
            <>
              <span className="font-arabic">قطاعات وفرق</span>{" "}
              <span className="font-display italic">في كل مكان</span>{" "}
              <span className="font-arabic">في المملكة.</span>
            </>
          ) : (
            <>
              Industries we serve. <span className="font-display italic text-muted">Anywhere</span> in
              the Kingdom.
            </>
          )}
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-lg border hairline md:grid-cols-3">
          {INDUSTRIES.map((s, i) => (
            <Reveal
              key={s.en}
              as="div"
              delay={i * 50}
              className="bg-background p-6 transition-colors hover:bg-foreground hover:text-background md:p-8"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-4 text-xl md:text-2xl">{isAr ? s.ar : s.en}</div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 border-t hairline pt-8">
          <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {isAr ? "نخدم في" : "Serving"}
          </div>
          <Marquee
            items={REGIONS.flatMap((r) => [r])}
            className="font-display text-4xl md:text-6xl"
          />
        </div>
      </div>
    </section>
  );
}
