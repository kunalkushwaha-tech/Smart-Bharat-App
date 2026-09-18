"use client";

import { useEffect, useState } from "react";
import { requestAIChat } from "../lib/aiChat";

type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

export default function FloatingAIChat() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Jai Hind! Ask me about cyber safety, complaints, or citizen services." },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const sendMessage = async () => {
    const query = input.trim();
    if (!query || loading) return;

    setInput("");
    setMessages((previous) => [...previous, { role: "user", text: query }]);
    setLoading(true);

    try {
      const { response, data } = await requestAIChat(query);
      const reply = typeof data.reply === "string" ? data.reply.trim() : "";
      setMessages((previous) => [
        ...previous,
        { role: "bot", text: response.ok && reply ? reply : `Sorry, ${data.error ?? "AI service failed."}` },
      ]);
    } catch (error: unknown) {
      const message =
        error instanceof TypeError
          ? "Unable to reach the AI service. Please check that the app server is running."
          : error instanceof Error
            ? error.message
            : "Unable to reach AI service";
      setMessages((previous) => [...previous, { role: "bot", text: `Sorry, ${message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-[100] sm:bottom-6 sm:right-6">
      {open ? (
        <section
          aria-label="AI Companion chat"
          className="mb-3 flex h-[min(32rem,calc(100vh-8rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0A1424] text-[#ECF2FA] shadow-2xl shadow-black/40"
        >
          <header className="flex items-center justify-between border-b border-white/10 bg-[#122A4D] px-4 py-3">
            <div>
              <h2 className="font-bold">AI Companion</h2>
              <p className="text-xs text-[#C8D5EA]">Cyber safety and civic guidance</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-2 py-1 text-lg leading-none hover:bg-white/10"
              aria-label="Close AI chat"
            >
              ×
            </button>
          </header>

          <div className="flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[90%] whitespace-pre-line rounded-xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-[#FF9933] text-white"
                    : "bg-[#122A4D] text-[#ECF2FA]"
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading ? <p className="text-xs text-[#C8D5EA]">Thinking...</p> : null}
          </div>

          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question..."
              aria-label="Message AI Companion"
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-[#050B14] px-3 py-2 text-sm text-[#ECF2FA] outline-none focus:border-[#FF9933]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-[#FF9933] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#FF9933] bg-[#122A4D] text-2xl text-[#ECF2FA] shadow-xl shadow-black/30 transition hover:scale-105 hover:bg-[#1b3b68]"
        aria-label={open ? "Minimize AI chat" : "Open AI Companion chat"}
        aria-expanded={open}
      >
        🤖
      </button>
    </div>
  );
}
