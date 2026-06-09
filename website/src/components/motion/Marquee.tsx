/**
 * Seamless infinite marquee of short labels — a lightweight, on-trend motion
 * accent (used for capabilities / tech). Pure CSS; pauses for reduced motion.
 */
export default function Marquee({ items }: { items: string[] }) {
  const Row = ({ aria }: { aria?: boolean }) => (
    <div
      className="flex shrink-0 items-center gap-10 pr-10"
      aria-hidden={aria ? undefined : true}
    >
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-3 whitespace-nowrap text-sm font-semibold uppercase tracking-wider text-muted"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee-mask relative overflow-hidden py-6">
      <div className="marquee-track flex w-max">
        <Row aria />
        <Row />
      </div>
    </div>
  );
}
