"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/lib/types";

interface ChatPanelProps {
  onClose: () => void;
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(
    () => `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      const json = await res.json();

      if (json.error) {
        setError(json.error);
        if (json.details) {
          setError(`${json.error}\n${json.details}`);
        }
      } else {
        const reply =
          json.data?.reply ||
          json.data?.message ||
          json.data?.content ||
          JSON.stringify(json.data);

        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      setError("Failed to send message. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-1">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-accent-purple"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25v-8.5zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H1.75z" />
          </svg>
          <span className="text-sm font-medium text-text-primary">
            Ask Docs Agent
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">
              Ask anything about your documentation.
            </p>
            <p className="text-text-muted text-xs mt-1">
              The agent searches your knowledge base to answer.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-accent-blue text-white"
                  : "bg-surface-2 text-text-primary border border-border-default"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[10px] mt-1 ${
                  msg.role === "user"
                    ? "text-blue-200"
                    : "text-text-muted"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-2 border border-border-default rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-text-muted rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="w-2 h-2 bg-text-muted rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-accent-red/50 rounded-lg px-3 py-2 text-sm text-accent-red">
            {error}
          </div>
        )}

        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border-default">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your docs..."
            rows={1}
            className="flex-1 bg-surface-2 border border-border-default rounded-md px-3 py-2 text-sm text-text-primary placeholder-text-muted resize-none outline-none focus:border-accent-blue transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`px-3 rounded-md transition-colors ${
              input.trim() && !loading
                ? "bg-accent-blue text-white hover:opacity-90"
                : "bg-surface-3 text-text-muted cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M.989 1.012a.75.75 0 0 1 .823.162l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 0 1-1.258-.757L3.3 8.251H1.25a.75.75 0 0 1 0-1.5h2.05L.554 1.77A.75.75 0 0 1 .989 1.01z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
