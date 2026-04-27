import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Industries } from "@/components/sections/Industries";
import { Contact } from "@/components/sections/Contact";
import { BreadcrumbSchema } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Industries We Serve in Saudi Arabia · ASMC",
  description:
    "ASMC supplies skilled manpower and equipment to construction, oil & gas, industrial, infrastructure, power, facilities, hospitality, logistics and retail sectors across the Kingdom of Saudi Arabia.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <>
      <Nav />
      <main>
        <header className="mx-auto max-w-[1400px] px-5 pt-32 md:px-10 md:pt-40">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            03 — Industries
          </div>
          <h1 className="mt-6 max-w-6xl text-balance text-5xl leading-[1.02] tracking-tight md:text-7xl lg:text-[120px]">
            Crews and machines for every{" "}
            <span className="font-display italic">sector</span> across the Kingdom.
          </h1>
        </header>
        <Industries />
        <Contact />
      </main>
      <Footer />
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Industries", href: "/industries" },
        ]}
      />
    </>
  );
}
