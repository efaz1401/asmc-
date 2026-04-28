"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "../Reveal";

export function Hero({ lang = "en" }: { lang?: "en" | "ar" }) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Riyadh",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());
    const tick = () => setTime(fmt());
    const raf = requestAnimationFrame(tick);
    const t = setInterval(tick, 30_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);

  const isAr = lang === "ar";

  return (
    <section className="relative pt-28 md:pt-32" id="hero">
      <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-grid opacity-50" />
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* top meta row */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted md:mb-16">
          <Reveal as="div" className="flex items-center gap-3">
            <span className="inline-block size-1.5 rounded-full bg-emerald-400 blink" />
            <span>
              {isAr ? "متاحون لمشاريع" : "Available for projects"} · 2026
            </span>
          </Reveal>
          <Reveal as="div" delay={120}>
            <span className="hidden sm:inline">
              {isAr ? "الهفوف، الأحساء، السعودية" : "Al Hofuf · Al-Ahsa · KSA"}
            </span>
          </Reveal>
          <Reveal as="div" delay={200}>
            <span aria-label="Local time in Riyadh">AST {time || "—:—"}</span>
          </Reveal>
        </div>

        {/* eyebrow */}
        <Reveal as="div" className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted md:mb-8">
          <span>01</span>
          <span className="h-px w-8 bg-line" />
          <span>{isAr ? "العمالة والمعدات" : "Manpower & Equipment"}</span>
        </Reveal>

        {/* huge headline */}
        <Reveal as="h1" className="text-balance text-[44px] leading-[0.95] tracking-[-0.03em] sm:text-6xl md:text-[120px] lg:text-[148px]">
          {isAr ? (
            <>
              <span className="font-arabic block">حلول العمالة</span>
              <span className="block italic font-display text-muted">والمعدات</span>
              <span className="font-arabic block">للأعمال</span>
              <span className="block italic font-display">في السعودية</span>
            </>
          ) : (
            <>
              <span className="block">Tailored manpower</span>
              <span className="block">
                <em className="font-display italic text-muted">&amp;</em> equipment
              </span>
              <span className="block">
                supply<span className="text-muted">,</span>{" "}
                <em className="font-display italic">across</em>
              </span>
              <span className="block">Saudi Arabia.</span>
            </>
          )}
        </Reveal>

        {/* subline + cta */}
        <div className="mt-10 grid gap-10 md:mt-16 md:grid-cols-12 md:items-end">
          <Reveal as="p" className="md:col-span-7 max-w-2xl text-pretty text-lg text-muted md:text-xl" delay={120}>
            {isAr
              ? "نوفر العمالة الماهرة والمعدات الموثوقة للمشاريع الإنشائية والصناعية والتجارية في جميع أنحاء المملكة. تعبئة سريعة، التزام كامل بنظام العمل، وإدارة موقعية."
              : "We deliver pre-vetted, Saudi-compliant skilled labor and reliable equipment for construction, industrial and commercial projects — mobilised in 48–72 hours, supervised on site, and supported 24/7."}
          </Reveal>
          <Reveal as="div" className="md:col-span-5 flex flex-wrap items-center gap-3" delay={220}>
            <Link
              href={isAr ? "/ar#contact" : "/contact"}
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-foreground px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-transform hover:scale-[1.02]"
            >
              {isAr ? "ابدأ مشروعاً" : "Start a project"}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7h10M8 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href={isAr ? "/ar#services" : "/services"}
              className="inline-flex h-12 items-center gap-2 rounded-full border hairline px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {isAr ? "خدماتنا" : "Our services"}
            </Link>
          </Reveal>
        </div>

        {/* scroll indicator */}
        <div className="mt-20 flex items-end justify-between border-t hairline pt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted md:mt-28">
          <span>{isAr ? "اسحب للأسفل" : "Scroll to explore"}</span>
          <span aria-hidden="true" className="spin-slow inline-block">
            ✺
          </span>
          <span className="hidden md:inline">EN · AR</span>
        </div>
      </div>
    </section>
  );
}
