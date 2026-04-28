import Link from "next/link";
import { SERVICES } from "@/lib/site";
import { Reveal } from "../Reveal";

export function Services({ lang = "en" }: { lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  return (
    <section id="services" className="relative border-t hairline py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>03</span>
          <span className="h-px w-8 bg-line" />
          <span>{isAr ? "ما نقوم به" : "What we do"}</span>
        </Reveal>

        <Reveal as="h2" className="max-w-5xl text-balance text-3xl leading-tight md:text-5xl lg:text-6xl">
          {isAr ? (
            <>
              <span className="font-arabic">خدمات شاملة</span>{" "}
              <span className="font-display italic">لمشاريعك</span>{" "}
              <span className="font-arabic">من العمالة إلى المعدات والمقاولات.</span>
            </>
          ) : (
            <>
              Comprehensive <span className="font-display italic">solutions</span> — from skilled
              crews to certified machines and turnkey contracting.
            </>
          )}
        </Reveal>

        <div className="mt-16 divide-y divide-[var(--line)] border-t border-b hairline">
          {SERVICES.map((s, idx) => (
            <Reveal
              as="div"
              key={s.slug}
              delay={Math.min(idx * 80, 320)}
              className="group relative grid items-start gap-6 py-8 md:grid-cols-12 md:gap-10 md:py-12"
            >
              <div className="md:col-span-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {s.number}
              </div>
              <div className="md:col-span-4">
                <h3 className="text-balance text-3xl tracking-tight md:text-4xl">
                  <Link
                    href={`/services/${s.slug}`}
                    className="transition-colors group-hover:text-muted"
                  >
                    {isAr ? s.title.ar : s.title.en}
                  </Link>
                </h3>
              </div>
              <div className="md:col-span-5 max-w-xl text-base text-muted md:text-lg">
                {isAr ? s.short.ar : s.short.en}
              </div>
              <div className="md:col-span-2 flex items-center md:justify-end">
                <Link
                  href={`/services/${s.slug}`}
                  className="inline-flex h-10 items-center gap-2 rounded-full border hairline px-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
                  aria-label={`Read more about ${s.title.en}`}
                >
                  {isAr ? "تفاصيل" : "Read"}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M1 6h10M7 2l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
