import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Industries } from "@/components/sections/Industries";
import { Values } from "@/components/sections/Values";
import { Clients } from "@/components/sections/Clients";
import { Contact } from "@/components/sections/Contact";
import { FAQSection } from "@/components/sections/FAQSection";
import { FAQSchema } from "@/components/StructuredData";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title:
    "Manpower Supply Company in Saudi Arabia · ASMC — Skilled Labor & Equipment Rental",
  description:
    "ASMC (Adel Saad Al-Matar Contracting Est.) is a top manpower supply company in Saudi Arabia, providing skilled engineers, technicians, drivers, plumbers, electricians and 24/7 equipment rental — across Riyadh, Jeddah, Dammam, Al Hofuf and the entire Kingdom.",
  alternates: {
    canonical: "/",
    languages: { "en-SA": "/", "ar-SA": "/ar", "x-default": "/" },
  },
  openGraph: {
    title: "Manpower Supply Company in Saudi Arabia · ASMC",
    description: SITE.description.en,
    url: SITE.url,
  },
};

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Services />
        <Industries />
        <Values />
        <Clients />
        <FAQSection />
        <Contact />
      </main>
      <Footer />
      <FAQSchema />
    </>
  );
}
