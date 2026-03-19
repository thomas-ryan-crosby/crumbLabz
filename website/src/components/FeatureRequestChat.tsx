"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Feature {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

interface FeatureRequestChatProps {
  /** Called when the agent has produced feature requests and the user confirmed */
  onFeaturesReady: (features: Feature[]) => Promise<void>;
  /** Called when user wants to go back / cancel */
  onCancel: () => void;
  /** Style variant */
  variant?: "admin" | "portal";
}

export default function FeatureRequestChat({
  onFeaturesReady,
  onCancel,
  variant = "portal",
}: FeatureRequestChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAdmin = variant === "admin";
  const accent = isAdmin ? "accent" : "[#e87a2e]";
  const borderColor = isAdmin ? "border-border" : "border-[#e0e0e0]";
  const bgNeutral = isAdmin ? "bg-neutral" : "bg-[#f7f7f5]";
  const textPrimary = isAdmin ? "text-charcoal" : "text-[#2d2d2d]";
  const textMuted = isAdmin ? "text-muted" : "text-[#6b6b6b]";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!sending && !complete) inputRef.current?.focus();
  }, [sending, complete]);

  // Auto-start
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    setSending(true);

    const initMsg: Message = {
      role: "user",
      content: "I'd like to request a feature.",
    };

    fetch("/api/chat/feature-request", {
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
              "What would you like to see added, changed, or improved? Describe the feature or change you have in mind.",
          },
        ]);
      })
      .finally(() => setSending(false));
  }, [initialized]);

  const sendMessage = async () => {
    if (!input.trim() || sending || complete) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/feature-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();

      setMessages([...updated, { role: "assistant", content: data.message }]);

      if (data.featuresComplete && data.features) {
        setComplete(true);
        setSaving(true);
        try {
          await onFeaturesReady(data.features);
        } finally {
          setSaving(false);
        }
      }
    } catch {
      setMessages([
        ...updated,
        { role: "assistant", content: "Sorry, I had a brief hiccup. Could you say that again?" },
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
    <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`${isAdmin ? "bg-charcoal" : "bg-[#2d2d2d]"} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white text-sm font-medium">Feature Request Assistant</span>
        </div>
        <button onClick={onCancel} className="text-white/60 hover:text-white text-xs transition-colors">
          Cancel
        </button>
      </div>

      {/* Messages */}
      <div className={`h-[300px] overflow-y-auto px-4 py-3 space-y-3 ${bgNeutral}/50`}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-xl px-3.5 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? `text-white rounded-br-sm ${isAdmin ? "bg-accent" : "bg-[#e87a2e]"}`
                  : `bg-white rounded-bl-sm ${borderColor} border ${textPrimary}`
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className={`bg-white border ${borderColor} rounded-xl rounded-bl-sm px-4 py-3`}>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input / Complete */}
      {complete ? (
        <div className={`px-4 py-3 border-t ${borderColor} bg-emerald-50 text-center`}>
          <p className="text-sm font-medium text-emerald-700">
            {saving ? "Saving feature requests..." : "Feature requests submitted!"}
          </p>
        </div>
      ) : (
        <div className={`px-3 py-2.5 border-t ${borderColor} bg-white`}>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={sending}
              className={`flex-1 px-3 py-2 rounded-lg border ${borderColor} ${bgNeutral} text-sm ${textPrimary} placeholder:${textMuted}/50 focus:outline-none focus:ring-2 focus:ring-${accent}/50 disabled:opacity-50 transition-colors`}
              style={!isAdmin ? { borderColor: "#e0e0e0" } : undefined}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className={`disabled:opacity-40 text-white p-2 rounded-lg transition-colors shrink-0 ${isAdmin ? "bg-accent hover:bg-accent-hover" : "bg-[#e87a2e] hover:bg-[#d06a1e]"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
