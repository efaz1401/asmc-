import Link from "next/link";
import { SITE } from "@/lib/site";
import { Logo } from "./Logo";

const QUICK = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

const SERVICES = [
  { href: "/services/manpower-supply", label: "Manpower Supply" },
  { href: "/services/equipment-rental", label: "Equipment Rental" },
  { href: "/services/construction", label: "Construction" },
  { href: "/services/material-supply", label: "Material Supply" },
  { href: "/services/contracting", label: "Contracting" },
];

export function Footer({ lang = "en" }: { lang?: "en" | "ar" }) {
  return (
    <footer className="relative border-t hairline">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Logo className="h-9 w-9" />
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  Adel Saad Al-Matar Contracting Est.
                </div>
                <div className="font-arabic text-sm text-foreground">
                  مؤسسة عادل سعد المطر للمقاولات
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-balance text-sm text-muted">
              {lang === "ar"
                ? SITE.description.ar
                : "A leading manpower supply company in Saudi Arabia. Trusted by construction, industrial and commercial sectors across the Kingdom."}
            </p>
            <div className="mt-8 grid gap-1 font-mono text-xs text-muted">
              <span>C.R: {SITE.contact.cr}</span>
              <span>{SITE.contact.address.en}</span>
              <a className="text-foreground" href={`mailto:${SITE.contact.email}`}>
                {SITE.contact.email}
              </a>
              {SITE.contact.phones.map((p, i) => (
                <a key={p} className="text-foreground" href={`tel:${SITE.contact.phonesIntl[i]}`}>
                  {p}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Quick links
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {QUICK.map((q) => (
                <li key={q.href}>
                  <Link href={q.href} className="hover:text-muted">
                    {q.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Services
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {SERVICES.map((q) => (
                <li key={q.href}>
                  <Link href={q.href} className="hover:text-muted">
                    {q.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Hours
            </div>
            <ul className="mt-5 space-y-2 text-sm text-muted">
              <li>{SITE.contact.hours.weekdays}</li>
              <li>{SITE.contact.hours.saturday}</li>
              <li>{SITE.contact.hours.friday}</li>
            </ul>
            <div className="mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              Follow
            </div>
            <ul className="mt-5 flex gap-4 text-sm">
              <li>
                <a href={SITE.social.facebook} className="hover:text-muted">
                  Facebook
                </a>
              </li>
              <li>
                <a href={SITE.social.linkedin} className="hover:text-muted">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={SITE.social.instagram} className="hover:text-muted">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t hairline pt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Adel Saad Al-Matar Contracting Est.</span>
          <span>asmc.com.sa · Manpower & Equipment · KSA</span>
          <span>
            <Link href="/" className="hover:text-foreground">
              EN
            </Link>{" "}
            ·{" "}
            <Link href="/ar" className="hover:text-foreground">
              AR
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
