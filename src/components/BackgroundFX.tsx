"use client";

import { useEffect } from "react";

/**
 * Slowly drifting, large blurred color blobs sitting behind all page content.
 * The blobs animate continuously; the whole layer's hue rotates with scroll
 * position, so the dominant color of the page shifts as you move down — same
 * vibe as fromanother.love's background.
 */
export function BackgroundFX() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      document.documentElement.style.setProperty("--bg-scroll", String(p));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="bg-fx" aria-hidden="true">
      <div className="bg-fx__blob bg-fx__blob--a" />
      <div className="bg-fx__blob bg-fx__blob--b" />
      <div className="bg-fx__blob bg-fx__blob--c" />
      <div className="bg-fx__blob bg-fx__blob--d" />
      <div className="bg-fx__grain" />
    </div>
  );
}
