"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const SEGS = 18;

/**
 * Game-style boot screen: the wordmark, a chunky segmented progress bar
 * that fills with a loading stutter, then the whole panel lifts away.
 */
export default function Intro() {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced) {
      setProgress(100);
      setDone(true);
      return;
    }
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(100, p + 3 + Math.random() * 7); // stutters like a real loader
      setProgress(Math.floor(p));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => setDone(true), 350);
      }
    }, 46);
    return () => clearInterval(id);
  }, [reduced]);

  const filled = Math.round((progress / 100) * SEGS);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: done ? "-100%" : 0 }}
      transition={{ duration: reduced ? 0 : 0.75, ease: [0.76, 0, 0.24, 1] }}
      className="pointer-events-none fixed inset-0 z-[80] flex flex-col items-center justify-center gap-8 bg-cream"
      aria-hidden
    >
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="font-display text-3xl font-bold tracking-tight text-ink"
      >
        Byte<span className="text-accent">Jay.</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex flex-col items-center gap-3"
      >
        {/* segmented bar */}
        <div className="flex gap-[3px] rounded-md border border-ink/20 p-[5px]">
          {Array.from({ length: SEGS }, (_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2 rounded-[2px] transition-colors duration-100 ${
                i < filled ? "bg-accent" : "bg-ink/10"
              }`}
            />
          ))}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/50">
          {progress < 100 ? (
            <>
              loading world… <span className="tabular-nums text-ink/80">{progress}%</span>
            </>
          ) : (
            <span className="text-accent">ready ▶</span>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}
