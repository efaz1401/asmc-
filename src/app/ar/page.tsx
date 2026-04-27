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

export default function ArHome() {
  return (
    <>
      <Nav lang="ar" />
      <main>
        <Hero lang="ar" />
        <About lang="ar" />
        <Services lang="ar" />
        <Industries lang="ar" />
        <Values lang="ar" />
        <Clients lang="ar" />
        <FAQSection lang="ar" />
        <Contact lang="ar" />
      </main>
      <Footer lang="ar" />
    </>
  );
}
