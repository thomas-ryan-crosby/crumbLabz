"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

export default function ScrollRevealProvider({ children }: { children: React.ReactNode }) {
  useScrollReveal();
  return <>{children}</>;
}
