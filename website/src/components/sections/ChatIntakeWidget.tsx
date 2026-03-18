"use client";

import { useState, useRef, useEffect } from "react";
import { submitContactForm } from "@/lib/firebase";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatIntakeWidget({ onFallback }: { onFallback?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);
  const [started, setStarted] = useState(false);
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
    if (!sending && started && !intakeComplete) {
      inputRef.current?.focus();
    }
  }, [sending, started, intakeComplete]);

  const startChat = async () => {
    setStarted(true);
    setSending(true);

    const userMsg: Message = {
      role: "user",
      content: "Hi, I'm interested in learning about how CrumbLabz can help my business.",
    };

    try {
      const res = await fetch("/api/chat/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMsg] }),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.message }]);
    } catch {
      setMessages([
        {
          role: "assistant",
          content:
            "Hey there! Thanks for visiting CrumbLabz. Tell me — what's a process in your business that feels slow, manual, or just plain frustrating?",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

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
            phone: "",
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

  // Landing state — haven't started chat yet
  if (!started) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-accent"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-charcoal mb-2">
            Chat with our intake assistant
          </h3>
          <p className="text-muted text-sm mb-6 max-w-md mx-auto">
            Tell us what&apos;s slowing your business down. Our AI assistant
            will ask a few quick questions so our team can hit the ground
            running on your discovery call.
          </p>
          <button
            onClick={startChat}
            className="bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-colors"
          >
            Start the Conversation
          </button>
        </div>

        {onFallback && (
          <p className="text-center text-xs text-muted">
            Prefer a form?{" "}
            <button
              onClick={onFallback}
              className="text-accent hover:underline font-medium"
            >
              Use the classic contact form instead
            </button>
          </p>
        )}
      </div>
    );
  }

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
