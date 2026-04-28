import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Contact } from "@/components/sections/Contact";
import { SERVICES } from "@/lib/site";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Services — Manpower Supply, Equipment Rental & Contracting in Saudi Arabia",
  description:
    "ASMC services across the Kingdom of Saudi Arabia: manpower supply, equipment rental, construction, material supply and turnkey contracting — single-source, fully Saudi-compliant.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <Nav />
      <main>
        <header className="mx-auto max-w-[1400px] px-5 pt-32 md:px-10 md:pt-40">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            02 — Services
          </div>
          <h1 className="mt-6 max-w-6xl text-balance text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-[120px]">
            One partner. <span className="font-display italic">Five disciplines.</span>{" "}
            Every project across the Kingdom.
          </h1>
          <p className="mt-10 max-w-2xl text-pretty text-lg text-muted md:text-xl">
            Manpower, equipment, construction, materials and turnkey contracting — bundled or
            standalone, mobilised in 48–72 hours and supervised on site.
          </p>
        </header>

        <section className="mt-20 border-t hairline">
          <div className="mx-auto max-w-[1400px] divide-y divide-[var(--line)] px-5 md:px-10">
            {SERVICES.map((s, i) => (
              <Reveal
                as="div"
                key={s.slug}
                delay={Math.min(i * 60, 240)}
                className="grid items-start gap-8 py-12 md:grid-cols-12 md:py-20"
              >
                <div className="md:col-span-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  {s.number}
                </div>
                <div className="md:col-span-4">
                  <h2 className="text-balance text-3xl tracking-tight md:text-5xl">
                    <Link href={`/services/${s.slug}`} className="hover:text-muted">
                      {s.title.en}
                    </Link>
                  </h2>
                  <Link
                    href={`/services/${s.slug}`}
                    className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border hairline px-4 font-mono text-[11px] uppercase tracking-[0.18em] hover:bg-foreground hover:text-background"
                  >
                    Read more
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
                <div className="md:col-span-7 max-w-2xl text-base text-muted md:text-lg">
                  <p>{s.description.en}</p>
                  <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
                    {s.bullets.map((b) => (
                      <li key={b.en} className="flex items-start gap-3 text-foreground">
                        <span className="mt-2 inline-block size-1 rounded-full bg-foreground" />
                        <span>{b.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
        ]}
      />
    </>
  );
}
