type Props = { className?: string };

export function Logo({ className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="asmcG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4f1ea" />
          <stop offset="100%" stopColor="#8a857a" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="none" stroke="url(#asmcG)" strokeWidth="1.4" />
      <g fill="url(#asmcG)">
        <path d="M22 42 L32 18 L42 42 L37 42 L32 28 L27 42 Z" />
        <circle cx="32" cy="36" r="2.2" fill="#0a0a0a" />
      </g>
      <text
        x="32"
        y="56"
        textAnchor="middle"
        fill="url(#asmcG)"
        style={{ font: "600 7px ui-monospace, monospace", letterSpacing: "0.18em" }}
      >
        ASMC
      </text>
    </svg>
  );
}
