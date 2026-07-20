"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { email } from "@/lib/data";

type Line = { kind: "cmd" | "out"; text: string };

const SESSION: Line[] = [
  { kind: "cmd", text: "whoami" },
  { kind: "out", text: "jay — 19 · aspiring AI engineer · building in public" },
  { kind: "cmd", text: "ls ~/projects" },
  { kind: "out", text: "tgie/   lumen-glass/   cortex/   ath/   cafe-sim/" },
  { kind: "cmd", text: "cat status.txt" },
  { kind: "out", text: "STATUS    : [LIVE] shipping" },
  { kind: "out", text: "LOCATION  : between backend & the multiverse" },
  { kind: "out", text: "UPTIME    : building since 2024" },
  { kind: "out", text: "OPEN_TO   : internships · hackathons · wild ideas" },
  { kind: "cmd", text: "./say_hi.sh" },
  { kind: "out", text: `→ ${email}` },
];

const TYPE_MS = 34;
const CMD_PAUSE = 420;
const OUT_PAUSE = 110;

function Prompt() {
  return (
    <span className="select-none">
      <span className="text-accent">jay@bytejay</span>
      <span className="text-ink/40">:~$&nbsp;</span>
    </span>
  );
}

/** Colorize output: [BADGES] in accent, "KEY :" labels dimmed. */
function OutLine({ text }: { text: string }) {
  if (text.startsWith("→")) {
    return (
      <span>
        <span className="text-ink/40">→&nbsp;</span>
        <a
          href={`mailto:${email}`}
          className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
        >
          {email}
        </a>
      </span>
    );
  }
  const badge = text.match(/^(\w+\s*)( *: )(\[\w+\] )?(.*)$/);
  if (badge) {
    return (
      <span>
        <span className="text-ink/45">{badge[1]}</span>
        <span className="text-ink/30">{badge[2]}</span>
        {badge[3] && <span className="font-bold text-accent">{badge[3]}</span>}
        <span className="text-ink/85">{badge[4]}</span>
      </span>
    );
  }
  return <span className="text-ink/85">{text}</span>;
}

export default function Terminal() {
  const [step, setStep] = useState(0); // lines fully shown
  const [chars, setChars] = useState(0); // typed chars of current cmd
  const [started, setStarted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(SESSION.length);
      return;
    }
    const line = SESSION[step];
    if (!line) return;
    if (line.kind === "cmd") {
      if (chars < line.text.length) {
        timer.current = setTimeout(() => setChars((c) => c + 1), TYPE_MS);
      } else {
        timer.current = setTimeout(() => {
          setStep((s) => s + 1);
          setChars(0);
        }, CMD_PAUSE);
      }
    } else {
      timer.current = setTimeout(() => setStep((s) => s + 1), OUT_PAUSE);
    }
    return () => clearTimeout(timer.current);
  }, [started, step, chars]);

  const done = step >= SESSION.length;

  return (
    <motion.section
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true, margin: "-25%" }}
      className="mx-auto max-w-3xl px-6 pb-8 pt-24"
    >
      <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
        <span className="text-accent">$</span> for the ones who read terminals
      </p>

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[#101010] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        {/* title bar */}
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F5C542]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3FB950]/70" />
          </div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-ink/35">
            bytejay — zsh — 80×24
          </p>
          <span className="w-10" />
        </div>

        {/* session */}
        <div className="min-h-[340px] p-5 font-mono text-[12.5px] leading-[1.9] sm:p-6 sm:text-sm">
          {SESSION.slice(0, step).map((line, i) =>
            line.kind === "cmd" ? (
              <p key={i}>
                <Prompt />
                <span className="text-ink">{line.text}</span>
              </p>
            ) : (
              <p key={i} className="pl-1">
                <OutLine text={line.text} />
              </p>
            )
          )}

          {/* line being typed */}
          {!done && SESSION[step]?.kind === "cmd" && (
            <p>
              <Prompt />
              <span className="text-ink">{SESSION[step].text.slice(0, chars)}</span>
              <span className="blink -mb-0.5 inline-block h-4 w-[7px] bg-ink/80" />
            </p>
          )}

          {/* resting prompt */}
          {done && (
            <p>
              <Prompt />
              <span className="blink -mb-0.5 inline-block h-4 w-[7px] bg-ink/80" />
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
