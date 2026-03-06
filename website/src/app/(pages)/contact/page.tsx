import type { Metadata } from "next";
import ContactForm from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact — CrumbLabz",
  description: "Tell us about a problem your business is facing. CrumbLabz will help design a solution.",
};

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-charcoal text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-white mb-6">Tell Us Your Headache</h1>
          <p className="text-lg text-white/70">
            Describe a process in your business that feels slow, repetitive, or
            frustrating. We&apos;ll help map the problem and build a solution.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
