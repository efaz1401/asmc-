import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Contact } from "@/components/sections/Contact";
import { BreadcrumbSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Careers at ASMC — Build the Kingdom with Us",
  description:
    "Engineers, technicians, drivers, plumbers, electricians and skilled labour — apply to join Adel Saad Al-Matar Contracting Est. and work on top construction and industrial projects across Saudi Arabia.",
  alternates: { canonical: "/careers" },
};

const ROLES = [
  "Site Engineer (Civil / Mechanical / Electrical)",
  "MEP Technician",
  "HVAC Technician",
  "Heavy-Equipment Operator",
  "Crane / Forklift Operator",
  "Electrician",
  "Plumber",
  "Welder (3G / 6G)",
  "Scaffolder",
  "Mason / Carpenter",
  "Driver (Light / Heavy / Trailer)",
  "Site Supervisor",
  "Safety Officer (NEBOSH / IOSH)",
  "QA / QC Inspector",
  "Storekeeper",
];

export default function CareersPage() {
  return (
    <>
      <Nav />
      <main>
        <header className="mx-auto max-w-[1400px] px-5 pt-32 md:px-10 md:pt-40">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            05 — Careers
          </div>
          <h1 className="mt-6 max-w-6xl text-balance text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-[120px]">
            Build the Kingdom <span className="font-display italic">with us.</span>
          </h1>
          <p className="mt-10 max-w-2xl text-pretty text-lg text-muted md:text-xl">
            We hire engineers, technicians and skilled trades on permanent and project-based
            contracts. Iqama, medical and insurance handled in full.
          </p>
        </header>

        <section className="mx-auto max-w-[1400px] border-t hairline px-5 py-16 md:px-10 md:py-24">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Roles we hire
          </div>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border hairline md:grid-cols-3">
            {ROLES.map((r, i) => (
              <li key={r} className="bg-background p-6 md:p-7">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-3 text-lg md:text-xl">{r}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-[1400px] border-t hairline px-5 py-16 md:px-10 md:py-24">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                How to apply
              </div>
              <h2 className="mt-5 text-balance text-3xl md:text-5xl">
                Send your CV — we read every one.
              </h2>
            </div>
            <div className="md:col-span-7 text-muted text-lg">
              <p>
                Email your CV with a short note about your experience and current location to{" "}
                <a className="text-foreground" href="mailto:contact@asmc.com.sa?subject=Application">
                  contact@asmc.com.sa
                </a>
                . Shortlisted candidates are contacted within 7 days.
              </p>
              <p className="mt-4">
                You can also reach us via{" "}
                <Link href="/contact" className="text-foreground">
                  the contact form
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <Contact />
      </main>
      <Footer />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Careers", href: "/careers" },
        ]}
      />
    </>
  );
}
