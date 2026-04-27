import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[80vh] items-center">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            404 — Not found
          </div>
          <h1 className="mt-6 max-w-4xl text-balance text-5xl leading-[1.02] tracking-tight md:text-7xl">
            That page is <span className="font-display italic">off the map.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted">
            The page you’re after doesn’t exist. Try the home page or browse our services.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-background"
            >
              Home
            </Link>
            <Link
              href="/services"
              className="inline-flex h-12 items-center gap-2 rounded-full border hairline px-6 font-mono text-[11px] uppercase tracking-[0.18em]"
            >
              Services
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
