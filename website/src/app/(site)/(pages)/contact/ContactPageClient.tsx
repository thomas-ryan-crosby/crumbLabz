"use client";

import { useState } from "react";
import ChatIntakeWidget from "@/components/sections/ChatIntakeWidget";
import ContactForm from "@/components/sections/ContactForm";

export default function ContactPageClient() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="space-y-6">
        <ContactForm />
        <p className="text-center text-xs text-muted">
          Want to chat instead?{" "}
          <button
            onClick={() => setShowForm(false)}
            className="text-accent hover:underline font-medium"
          >
            Talk to our intake assistant
          </button>
        </p>
      </div>
    );
  }

  return (
    <ChatIntakeWidget onFallback={() => setShowForm(true)} />
  );
}
