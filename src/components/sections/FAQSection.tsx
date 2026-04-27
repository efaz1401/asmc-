"use client";

import { useState } from "react";
import { FAQ } from "@/lib/site";
import { Reveal } from "../Reveal";

export function FAQSection({ lang = "en" }: { lang?: "en" | "ar" }) {
  const isAr = lang === "ar";
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t hairline py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>09</span>
          <span className="h-px w-8 bg-line" />
          <span>{isAr ? "أسئلة شائعة" : "Frequently asked"}</span>
        </Reveal>

        <Reveal as="h2" className="max-w-4xl text-balance text-3xl md:text-5xl">
          {isAr ? (
            <>
              <span className="font-arabic">إجابات سريعة عن </span>
              <span className="font-display italic">توريد العمالة</span>{" "}
              <span className="font-arabic">في السعودية.</span>
            </>
          ) : (
            <>
              Straight answers about{" "}
              <span className="font-display italic">manpower supply</span> in Saudi Arabia.
            </>
          )}
        </Reveal>

        <ul className="mt-12 divide-y divide-[var(--line)] border-t border-b hairline">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q.en}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-6 py-7 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="flex items-start gap-5">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xl tracking-tight md:text-2xl">
                      {isAr ? f.q.ar : f.q.en}
                    </span>
                  </span>
                  <span
                    className="mt-2 inline-block text-2xl text-muted transition-transform"
                    style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden text-muted transition-all"
                  style={{ maxHeight: isOpen ? 240 : 0 }}
                >
                  <p className="pb-7 pl-12 pr-10 text-base md:text-lg">
                    {isAr ? f.a.ar : f.a.en}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
