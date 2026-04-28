"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

type Lang = "en" | "ar";

const LINKS_EN = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/contact", label: "Contact" },
  { href: "/careers", label: "Careers" },
];

const LINKS_AR = [
  { href: "/ar", label: "الرئيسية" },
  { href: "/ar#about", label: "من نحن" },
  { href: "/ar#services", label: "الخدمات" },
  { href: "/ar#industries", label: "القطاعات" },
  { href: "/ar#contact", label: "تواصل" },
];

export function Nav({ lang = "en" }: { lang?: Lang }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = lang === "ar" ? LINKS_AR : LINKS_EN;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? "bg-background/85 backdrop-blur-xl border-b hairline" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-20 md:px-10">
        <Link
          href={lang === "ar" ? "/ar" : "/"}
          className="flex items-center gap-3 text-foreground"
          aria-label="ASMC home"
        >
          <Logo className="h-7 w-7" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
            {lang === "ar" ? "مؤسسة عادل سعد المطر" : "Adel Saad Al-Matar"}
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-7 font-mono text-[11px] uppercase tracking-[0.18em]">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
            <Link
              href="/"
              aria-current={lang === "en" ? "true" : undefined}
              className={lang === "en" ? "text-foreground" : "text-muted hover:text-foreground"}
            >
              EN
            </Link>
            <span className="text-muted">/</span>
            <Link
              href="/ar"
              aria-current={lang === "ar" ? "true" : undefined}
              className={lang === "ar" ? "text-foreground" : "text-muted hover:text-foreground"}
            >
              AR
            </Link>
          </div>
          <Link
            href={lang === "ar" ? "/ar#contact" : "/contact"}
            className="group inline-flex items-center gap-2 rounded-full border hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
          >
            {lang === "ar" ? "تواصل معنا" : "Let’s talk"}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="transition-transform group-hover:translate-x-0.5"
            >
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

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 items-center gap-2 rounded-full border hairline px-4 font-mono text-[11px] uppercase tracking-[0.18em] md:hidden"
        >
          {open ? "Close" : "Menu"}
          <span className="flex flex-col gap-[3px]">
            <span
              className={`h-px w-4 bg-foreground transition-transform ${open ? "translate-y-[2px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-4 bg-foreground transition-transform ${open ? "-translate-y-[2px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </nav>

      {open && (
        <div className="md:hidden">
          <div className="border-t hairline px-5 pb-10 pt-6">
            <ul className="flex flex-col gap-5 text-3xl font-display">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block py-1"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              <Link href="/" onClick={() => setOpen(false)} className={lang === "en" ? "text-foreground" : ""}>
                EN
              </Link>
              <span>/</span>
              <Link href="/ar" onClick={() => setOpen(false)} className={lang === "ar" ? "text-foreground" : ""}>
                AR
              </Link>
            </div>
            <div className="mt-8 grid gap-1 font-mono text-xs text-muted">
              <a href="mailto:contact@asmc.com.sa" className="text-foreground">
                contact@asmc.com.sa
              </a>
              <a href="tel:+966549556517" className="text-foreground">
                +966 54 955 6517
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
