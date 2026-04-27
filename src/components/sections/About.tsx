import { SITE } from "@/lib/site";
import { Reveal } from "../Reveal";

export function About({ lang = "en" }: { lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  return (
    <section id="about" className="relative py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>02</span>
          <span className="h-px w-8 bg-line" />
          <span>{isAr ? "من نحن" : "About"}</span>
        </Reveal>

        <Reveal as="h2" className="max-w-5xl text-balance text-3xl leading-tight md:text-5xl lg:text-6xl">
          {isAr ? (
            <>
              <span className="font-arabic">شركة رائدة في </span>
              <span className="font-display italic">توريد العمالة</span>
              <span className="font-arabic"> والمعدات في المملكة العربية السعودية.</span>
            </>
          ) : (
            <>
              A leading <span className="font-display italic">manpower &amp; equipment</span> company,
              built around skilled people and reliable machines — for the projects that build Saudi
              Arabia.
            </>
          )}
        </Reveal>

        <div className="mt-12 grid gap-12 md:grid-cols-12 md:gap-16">
          <Reveal as="div" className="md:col-span-7 space-y-6 text-lg text-muted md:text-xl" delay={120}>
            <p>
              {isAr
                ? "مؤسسة عادل سعد المطر للمقاولات تقدم مجموعة كاملة من العمالة الماهرة تشمل المهندسين والفنيين والسائقين والسباكين والكهربائيين وتأجير المعدات الموثوقة. نخدم قطاعات البناء والصناعة والتجارة بثقة وموثوقية."
                : "Adel Saad Al-Matar Contracting Est. (ASMC) provides skilled engineers, technicians, drivers, plumbers, electricians and reliable equipment to construction, industrial and commercial sectors across the Kingdom — backed by full Saudi labour-law compliance, on-site supervision and 24/7 equipment support."}
            </p>
            <p className="text-foreground">
              {isAr
                ? "نقيس النجاح بمعايير العميل: التعبئة في الوقت، الامتثال الكامل، السلامة في الموقع، والتقارير الشفافة."
                : "We measure ourselves by client outcomes: on-time mobilisation, full compliance, on-site safety and transparent reporting — every project, every shift."}
            </p>
          </Reveal>

          <div className="md:col-span-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border hairline">
            {SITE.stats.map((s, i) => (
              <Reveal
                key={s.value}
                as="div"
                className="bg-background p-7 md:p-8"
                delay={150 + i * 100}
              >
                <div className="font-display text-5xl tracking-tight md:text-6xl">
                  {s.value}
                </div>
                <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  {isAr ? s.label.ar : s.label.en}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal as="div" className="border-t hairline pt-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              {isAr ? "مهمتنا" : "Our mission"}
            </div>
            <p className="mt-5 text-balance text-2xl md:text-3xl">
              {isAr
                ? "تقديم حلول استثنائية للقوى العاملة وتأجير معدات موثوقة تتجاوز توقعات عملائنا، مع الالتزام بأعلى معايير السلامة والاحترافية."
                : "Deliver exceptional manpower solutions and reliable equipment rental that exceed client expectations — at the highest standards of safety and professionalism."}
            </p>
          </Reveal>
          <Reveal as="div" className="border-t hairline pt-6" delay={150}>
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              {isAr ? "رؤيتنا" : "Our vision"}
            </div>
            <p className="mt-5 text-balance text-2xl md:text-3xl">
              {isAr
                ? "أن نكون الشريك الأكثر ثقة لشركات البناء والصناعة في جميع أنحاء المملكة، نُعرف بكوادرنا الماهرة وحلول معداتنا الموثوقة."
                : "To be the most trusted partner for construction and industrial companies across Saudi Arabia — known for our skilled workforce and reliable equipment solutions."}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
