import { Marquee } from "../Marquee";
import { Reveal } from "../Reveal";

const SECTORS_EN = [
  "Construction",
  "Oil & Gas",
  "Industrial",
  "Infrastructure",
  "Power & Utilities",
  "Facilities",
  "Hospitality",
  "Logistics",
  "Retail",
];

const SECTORS_AR = [
  "البناء",
  "النفط والغاز",
  "الصناعة",
  "البنية التحتية",
  "الطاقة والمرافق",
  "إدارة المرافق",
  "الضيافة",
  "اللوجستيات",
  "التجزئة",
];

export function Clients({ lang = "en" }: { lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  return (
    <section id="clients" className="border-t hairline py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>07</span>
          <span className="h-px w-8 bg-line" />
          <span>{isAr ? "موثوق به" : "Trusted across"}</span>
        </Reveal>

        <Reveal as="h2" className="max-w-5xl text-balance text-3xl md:text-5xl">
          {isAr ? (
            <>
              <span className="font-arabic">من المقاولين الرئيسيين إلى </span>
              <span className="font-display italic">المالكين والصناعات</span>{" "}
              <span className="font-arabic">— نحن نسلم.</span>
            </>
          ) : (
            <>
              From main contractors to{" "}
              <span className="font-display italic">owners and operators</span> — we deliver.
            </>
          )}
        </Reveal>

        <div className="mt-12">
          <Marquee
            items={(isAr ? SECTORS_AR : SECTORS_EN).flatMap((s) => [s])}
            className="font-display text-4xl md:text-6xl"
          />
        </div>
      </div>
    </section>
  );
}
