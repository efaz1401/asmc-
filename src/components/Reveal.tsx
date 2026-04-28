"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  threshold?: number;
};

export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
  threshold = 0.15,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.reveal = "in";
            io.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const Tag = as as unknown as React.ComponentType<
    React.HTMLAttributes<HTMLElement> & {
      ref?: React.Ref<HTMLElement>;
      "data-reveal"?: string;
      style?: React.CSSProperties;
    }
  >;

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      data-reveal=""
      className={className}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
