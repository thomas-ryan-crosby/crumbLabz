"use client";

import { useRef } from "react";

/**
 * Wraps an element so it subtly drifts toward the cursor on hover — a premium
 * micro-interaction for primary CTAs. No-ops when the user prefers reduced
 * motion. Render an inline element (e.g. a Link/button) as the child.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <span
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={className}
      style={{
        display: "inline-block",
        transition: "transform 0.3s var(--ease-out-expo)",
        willChange: "transform",
      }}
    >
      {children}
    </span>
  );
}
