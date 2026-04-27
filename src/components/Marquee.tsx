type Props = {
  items: readonly string[];
  className?: string;
  separator?: string;
};

export function Marquee({ items, className = "", separator = "✺" }: Props) {
  const row = (
    <div className="flex shrink-0 items-center gap-12 pr-12 whitespace-nowrap">
      {items.map((it, i) => (
        <span key={`${it}-${i}`} className="flex items-center gap-12">
          <span>{it}</span>
          <span className="text-muted">{separator}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={`overflow-hidden ${className}`}
      aria-label={items.join(", ")}
    >
      <div className="marquee flex w-max">
        {row}
        {row}
      </div>
    </div>
  );
}
