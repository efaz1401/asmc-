import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Contact } from "@/components/sections/Contact";
import { BreadcrumbSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Contact ASMC — Manpower Supply Saudi Arabia",
  description:
    "Talk to a manpower & equipment specialist at ASMC. Based in Al Hofuf, serving all of Saudi Arabia. Phone +966 54 955 6517 · contact@asmc.com.sa",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main>
        <header className="mx-auto max-w-[1400px] px-5 pt-32 md:px-10 md:pt-40">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            04 — Contact
          </div>
          <h1 className="mt-6 max-w-6xl text-balance text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-[120px]">
            Tell us about your{" "}
            <span className="font-display italic">project.</span>
          </h1>
          <p className="mt-10 max-w-2xl text-pretty text-lg text-muted md:text-xl">
            Send a brief and we’ll come back within one business day with a crew, equipment list and
            a price.
          </p>
        </header>
        <Contact />
      </main>
      <Footer />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />
    </>
  );
}
