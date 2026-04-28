import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Contact } from "@/components/sections/Contact";
import { SERVICES, REGIONS } from "@/lib/site";
import { BreadcrumbSchema, ServiceSchema } from "@/components/StructuredData";
import { Reveal } from "@/components/Reveal";

type Params = { slug: string };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: `${s.title.en} in Saudi Arabia · ASMC`,
    description: s.description.en,
    keywords: [...s.keywords, ...["Saudi Arabia", "KSA", "Riyadh", "Jeddah", "Dammam", "Al Hofuf"]],
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: {
      title: `${s.title.en} in Saudi Arabia · ASMC`,
      description: s.description.en,
      url: `/services/${s.slug}`,
    },
  };
}

export default async function ServiceDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) notFound();

  const others = SERVICES.filter((x) => x.slug !== s.slug);

  return (
    <>
      <Nav />
      <main>
        <header className="mx-auto max-w-[1400px] px-5 pt-32 md:px-10 md:pt-40">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted hover:text-foreground"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M11 6H1M5 2L1 6l4 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            All services
          </Link>
          <div className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {s.number} — {s.title.en}
          </div>
          <h1 className="mt-4 max-w-6xl text-balance text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-[112px]">
            {s.title.en} <span className="font-display italic text-muted">in Saudi Arabia.</span>
          </h1>
          <p className="mt-10 max-w-2xl text-pretty text-lg text-muted md:text-xl">
            {s.description.en}
          </p>
        </header>

        <section className="mx-auto mt-20 max-w-[1400px] border-t hairline px-5 py-16 md:px-10 md:py-24">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                What’s included
              </div>
              <h2 className="mt-5 text-balance text-3xl md:text-5xl">
                Everything you need —{" "}
                <span className="font-display italic">in one contract.</span>
              </h2>
            </div>
            <ul className="md:col-span-7 grid gap-px overflow-hidden rounded-lg border hairline sm:grid-cols-2">
              {s.bullets.map((b, i) => (
                <Reveal
                  key={b.en}
                  as="li"
                  delay={i * 60}
                  className="bg-background p-6 md:p-7"
                >
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-3 text-lg md:text-xl">{b.en}</div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] border-t hairline px-5 py-16 md:px-10 md:py-24">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Where we deliver
          </div>
          <h2 className="mt-5 max-w-4xl text-balance text-3xl md:text-5xl">
            {s.title.en} across the Kingdom — from Riyadh to{" "}
            <span className="font-display italic">NEOM</span>.
          </h2>
          <ul className="mt-10 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
            {REGIONS.map((r) => (
              <li
                key={r}
                className="rounded-full border hairline px-4 py-2 text-muted"
              >
                {r}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-[1400px] border-t hairline px-5 py-16 md:px-10 md:py-24">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            More services
          </div>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border hairline md:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/services/${o.slug}`}
                  className="block bg-background p-7 transition-colors hover:bg-foreground hover:text-background md:p-10"
                >
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    {o.number}
                  </div>
                  <div className="mt-3 text-2xl md:text-3xl">{o.title.en}</div>
                  <div className="mt-3 max-w-md text-sm opacity-80">{o.short.en}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Contact />
      </main>
      <Footer />
      <ServiceSchema slug={s.slug} />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
          { name: s.title.en, href: `/services/${s.slug}` },
        ]}
      />
    </>
  );
}
