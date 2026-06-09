import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import ProblemSection from "@/components/sections/ProblemSection";
import HowItWorksSummary from "@/components/sections/HowItWorksSummary";
import FeaturedWork from "@/components/sections/FeaturedWork";
import ValueSection from "@/components/sections/ValueSection";
import SocialProof from "@/components/sections/SocialProof";
import CTASection from "@/components/sections/CTASection";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

export default function HomePage() {
  return (
    <ScrollRevealProvider>
      <Hero />
      <TrustBar />
      <ProblemSection />
      <HowItWorksSummary />
      <FeaturedWork />
      <ValueSection />
      <SocialProof />
      <CTASection />
    </ScrollRevealProvider>
  );
}
