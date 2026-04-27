import { VALUES, PROCESS } from "@/lib/site";
import { Reveal } from "../Reveal";

export function Values({ lang = "en" }: { lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  return (
    <section className="border-t hairline py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>05</span>
          <span className="h-px w-8 bg-line" />
          <span>{isAr ? "لماذا نحن" : "Why us"}</span>
        </Reveal>

        <Reveal as="h2" className="max-w-5xl text-balance text-3xl leading-tight md:text-5xl lg:text-6xl">
          {isAr ? (
            <>
              <span className="font-display italic">المبادئ </span>
              <span className="font-arabic">التي تقود كل مشروع.</span>
            </>
          ) : (
            <>
              The <span className="font-display italic">principles</span> that drive every project.
            </>
          )}
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden border hairline rounded-lg md:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal
              key={v.n}
              as="div"
              delay={i * 80}
              className="bg-background p-7 md:p-10"
            >
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                <span>{v.n}</span>
                <span className="h-px w-8 bg-line" />
              </div>
              <h3 className="mt-5 text-2xl md:text-3xl">
                {isAr ? v.title.ar : v.title.en}
              </h3>
              <p className="mt-3 text-muted">{isAr ? v.body.ar : v.body.en}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-24 mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>06</span>
          <span className="h-px w-8 bg-line" />
          <span>{isAr ? "كيف نعمل" : "How we work"}</span>
        </Reveal>
        <Reveal as="h2" className="max-w-5xl text-balance text-3xl leading-tight md:text-5xl lg:text-6xl">
          {isAr ? (
            <>
              <span className="font-arabic">من الفكرة إلى التسليم — </span>
              <span className="font-display italic">في أربع خطوات.</span>
            </>
          ) : (
            <>
              Brief to mobilisation —{" "}
              <span className="font-display italic">in four moves.</span>
            </>
          )}
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border hairline md:grid-cols-4">
          {PROCESS.map((p, i) => (
            <Reveal key={p.n} as="div" delay={i * 80} className="bg-background p-7 md:p-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {p.n}
              </div>
              <h3 className="mt-5 text-2xl">{isAr ? p.title.ar : p.title.en}</h3>
              <p className="mt-3 text-sm text-muted">{isAr ? p.body.ar : p.body.en}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
