import type { Metadata } from "next";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import PageHero from "@/components/sections/PageHero";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact — CrumbLabz",
  description: "Tell us about a problem your business is facing. CrumbLabz will help design a solution.",
};

export default function ContactPage() {
  return (
    <ScrollRevealProvider>
      <PageHero
        eyebrow="Let's Talk"
        title={<>Tell Us Your <span className="text-gradient-warm">Headache</span></>}
        subtitle="Describe a process in your business that feels slow, repetitive, or frustrating. We'll map the problem and show you what a solution looks like."
      />

      {/* Form */}
      <section className="py-24 md:py-32 bg-cream">
        <div className="max-w-2xl mx-auto px-6 animate-in">
          <ContactPageClient />
        </div>
      </section>
    </ScrollRevealProvider>
  );
}
