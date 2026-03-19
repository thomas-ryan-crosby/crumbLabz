"use client";

import { useState, useRef, useEffect } from "react";
import { submitContactForm } from "@/lib/firebase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatIntakeWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input after assistant responds
  useEffect(() => {
    if (!sending && !intakeComplete) {
      inputRef.current?.focus();
    }
  }, [sending, intakeComplete]);

  // Auto-start the conversation on mount
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    setSending(true);

    const initMsg: Message = {
      role: "user",
      content: "Hi, I'd like to get in touch with CrumbLabz.",
    };

    fetch("/api/chat/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [initMsg] }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages([{ role: "assistant", content: data.message }]);
      })
      .catch(() => {
        setMessages([
          {
            role: "assistant",
            content:
              "Hey there! Welcome to CrumbLabz. Let's start with the basics — what's your name and company?",
          },
        ]);
      })
      .finally(() => setSending(false));
  }, [initialized]);

  const sendMessage = async () => {
    if (!input.trim() || sending || intakeComplete) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.message },
      ]);

      if (data.intakeComplete && data.intakeData) {
        setIntakeComplete(true);
        // Save to CRM
        try {
          await submitContactForm({
            name: data.intakeData.name || "",
            company: data.intakeData.company || "",
            email: data.intakeData.email || "",
            phone: data.intakeData.phone || "",
            headache: data.intakeData.headache || "",
          });
          // Fire welcome email
          fetch("/api/email/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.intakeData.name,
              email: data.intakeData.email,
              company: data.intakeData.company,
              headache: data.intakeData.headache,
            }),
          }).catch(() => {});
        } catch {
          // Silent fail — the conversation itself is still valuable
        }
      }
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "Sorry, I had a brief hiccup. Could you say that again?",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Chat header */}
      <div className="bg-charcoal px-5 py-3.5 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white text-sm font-medium">
          CrumbLabz Intake Assistant
        </span>
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto px-5 py-4 space-y-4 bg-neutral/50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-br-sm"
                  : "bg-white border border-border text-charcoal rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {intakeComplete ? (
        <div className="px-5 py-4 border-t border-border bg-emerald-50 text-center">
          <p className="text-sm font-medium text-emerald-700">
            You&apos;re all set! Check your inbox for next steps.
          </p>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-border bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-neutral text-sm text-charcoal placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white p-2.5 rounded-lg transition-colors shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
