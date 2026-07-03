"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import JerryIcon from "../JerryIcon";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "*boot chime* Hi! I'm Jerry — Jay's companion from PRL / CORTEX. I know his whole story: the code, the hackathons, the guitar, the chess. Ask me anything about him ✦",
};

const STARTERS = [
  "who is Jay?",
  "what is PRL / CORTEX?",
  "what's he building right now?",
  "tell me about the IDEA 2.0 hackathon",
];

export default function JerryChat() {
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/jerry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // greeting is local flavour — the brain only needs the real turns
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content:
            typeof data?.reply === "string"
              ? data.reply
              : "*bzzt* …something glitched. Ask me again?",
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: "*bzzt* …lost the connection. Try once more?" },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const showStarters = msgs.length === 1;

  return (
    <main className="flex min-h-[100dvh] flex-col bg-cream">
      {/* header */}
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-5 py-4">
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-accent"
          >
            ← bytejay
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="font-display text-sm font-bold leading-none tracking-tight">
                Jerry
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                PRL / CORTEX companion
              </p>
            </div>
            <div className="relative">
              <JerryIcon className="h-9 w-9 text-ink" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* messages */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-5 py-8">
        <AnimatePresence initial={false}>
          {msgs.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              className={m.role === "user" ? "self-end" : "self-start"}
            >
              {m.role === "assistant" && (
                <p className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                  <JerryIcon className="h-3 w-3 text-ink/60" /> jerry
                </p>
              )}
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-sm leading-relaxed text-cream sm:max-w-[70%]"
                    : "max-w-[85%] rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-2.5 text-sm leading-relaxed text-ink shadow-[0_2px_10px_rgba(28,25,23,0.05)] sm:max-w-[70%]"
                }
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {busy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="self-start"
          >
            <p className="mb-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              <JerryIcon className="h-3 w-3 text-ink/60" /> jerry
            </p>
            <div className="flex gap-1.5 rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3.5">
              {[0, 0.15, 0.3].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1, repeat: Infinity, delay: d }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {showStarters && (
          <div className="mt-2 flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 font-mono text-[11px] text-ink-soft transition-colors hover:border-accent hover:text-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* composer */}
      <div className="sticky bottom-0 border-t border-line bg-cream/90 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ask Jerry about Jay…"
            maxLength={500}
            autoFocus
            className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-full bg-accent px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:brightness-110 disabled:opacity-40"
          >
            send
          </button>
        </form>
        <p className="pb-3 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
          jerry knows jay — powered by open models on groq
        </p>
      </div>
    </main>
  );
}
