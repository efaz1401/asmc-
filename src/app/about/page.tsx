import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { About } from "@/components/sections/About";
import { Values } from "@/components/sections/Values";
import { Industries } from "@/components/sections/Industries";
import { Contact } from "@/components/sections/Contact";
import { BreadcrumbSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "About ASMC — Leading Manpower Supply Company in Saudi Arabia",
  description:
    "Adel Saad Al-Matar Contracting Est. (ASMC) is a top manpower & equipment supply company based in Al Hofuf, Saudi Arabia. 500+ skilled workers, 60+ projects delivered, 24/7 equipment support across the Kingdom.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="pt-10">
        <header className="mx-auto max-w-[1400px] px-5 pt-24 md:px-10 md:pt-32">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            01 — About
          </div>
          <h1 className="mt-6 max-w-5xl text-balance text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-[120px]">
            We supply the people and machines that build{" "}
            <span className="font-display italic">Saudi Arabia.</span>
          </h1>
        </header>
        <About />
        <Values />
        <Industries />
        <Contact />
      </main>
      <Footer />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />
    </>
  );
}
