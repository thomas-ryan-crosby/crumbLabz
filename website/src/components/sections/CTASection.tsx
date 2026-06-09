"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/firebase";

export default function CTASection() {
  const [formData, setFormData] = useState({ name: "", email: "", headache: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactForm({
        name: formData.name,
        email: formData.email,
        company: "",
        phone: "",
        headache: formData.headache,
      });
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyles =
    "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors";

  return (
    <section className="grain relative overflow-hidden bg-mesh-warm text-white py-24 md:py-32">
      <div className="relative z-[2] max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <div className="animate-in">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
              Get Started
            </p>
            <h2 className="text-white mb-6 text-balance">
              Start with{" "}
              <span className="text-gradient-warm">one problem</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-6">
              Tell us about a process in your business that feels slow,
              repetitive, or frustrating. We&apos;ll map it out and show you
              what a solution looks like.
            </p>
            <p className="text-white/40 text-sm">
              No commitment. No sales pitch. Just a conversation about
              how we can help.
            </p>
          </div>

          {/* Right form */}
          <div className="animate-in animate-in-delay-2">
            {submitted ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center backdrop-blur">
                <h3 className="text-white text-2xl mb-3">Thanks for reaching out!</h3>
                <p className="text-white/60">
                  We&apos;ll be in touch soon to discuss your problem.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur"
              >
                <div>
                  <input
                    name="name"
                    required
                    placeholder="Your name"
                    className={inputStyles}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email address"
                    className={inputStyles}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <textarea
                    name="headache"
                    required
                    rows={4}
                    placeholder="Describe your headache..."
                    className={inputStyles + " resize-y"}
                    onChange={handleChange}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-semibold px-8 py-4 rounded-xl text-base shadow-lift transition-all duration-300 hover:-translate-y-0.5"
                >
                  {submitting ? "Sending..." : "Start the Conversation"}
                  {!submitting && (
                    <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
