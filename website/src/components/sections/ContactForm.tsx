"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/firebase";

interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  headache: string;
}

const inputStyles =
  "w-full px-4 py-3 rounded-xl border border-border bg-white text-charcoal placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    company: "",
    email: "",
    phone: "",
    headache: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContactForm(formData);
      // Send welcome email (fire-and-forget — don't block form success)
      fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }).catch(() => {});
      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-border/70 shadow-lift p-10 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mb-3">Thanks for reaching out!</h3>
        <p className="text-muted">
          We just sent you an email with next steps, including a link to book
          your free discovery call. Check your inbox!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white rounded-3xl border border-border/70 shadow-lift p-6 md:p-8"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Your name"
            className={inputStyles}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium mb-1.5">
            Company
          </label>
          <input
            id="company"
            name="company"
            required
            placeholder="Your company"
            className={inputStyles}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className={inputStyles}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
            Phone <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(555) 123-4567"
            className={inputStyles}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label htmlFor="headache" className="block text-sm font-medium mb-1.5">
          Describe your headache
        </label>
        <textarea
          id="headache"
          name="headache"
          required
          rows={5}
          placeholder="Tell us about a process that feels slow, repetitive, or frustrating..."
          className={inputStyles + " resize-y"}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="group w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lift transition-all duration-300 hover:-translate-y-0.5"
      >
        {submitting ? "Sending..." : "Start the Conversation"}
        {!submitting && (
          <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        )}
      </button>
    </form>
  );
}
