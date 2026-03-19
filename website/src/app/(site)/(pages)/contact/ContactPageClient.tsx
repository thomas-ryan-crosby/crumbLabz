"use client";

import { useState } from "react";
import ChatIntakeWidget from "@/components/sections/ChatIntakeWidget";
import ContactForm from "@/components/sections/ContactForm";

type Mode = null | "chat" | "form";

export default function ContactPageClient() {
  const [mode, setMode] = useState<Mode>(null);

  if (mode === "form") {
    return (
      <div className="space-y-6">
        <ContactForm />
        <p className="text-center text-xs text-muted">
          <button
            onClick={() => setMode(null)}
            className="text-accent hover:underline font-medium"
          >
            &larr; Back to options
          </button>
        </p>
      </div>
    );
  }

  if (mode === "chat") {
    return (
      <div className="space-y-6">
        <ChatIntakeWidget />
        <p className="text-center text-xs text-muted">
          <button
            onClick={() => setMode(null)}
            className="text-accent hover:underline font-medium"
          >
            &larr; Back to options
          </button>
        </p>
      </div>
    );
  }

  // Selection screen
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <button
        onClick={() => setMode("chat")}
        className="group bg-white rounded-xl border border-border p-8 text-left hover:border-accent hover:shadow-md transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-charcoal mb-1.5">Chat with our assistant</h3>
        <p className="text-sm text-muted leading-relaxed">
          Have a quick conversation with our AI intake assistant. It&apos;ll gather your info and understand your problem so we&apos;re ready for your discovery call.
        </p>
        <p className="text-sm text-accent font-medium mt-4 group-hover:underline">Start chatting &rarr;</p>
      </button>

      <button
        onClick={() => setMode("form")}
        className="group bg-white rounded-xl border border-border p-8 text-left hover:border-accent hover:shadow-md transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-charcoal mb-1.5">Fill out a form</h3>
        <p className="text-sm text-muted leading-relaxed">
          Prefer to write it out? Submit your info and describe your headache. We&apos;ll follow up within 24 hours.
        </p>
        <p className="text-sm text-accent font-medium mt-4 group-hover:underline">Open form &rarr;</p>
      </button>
    </div>
  );
}
