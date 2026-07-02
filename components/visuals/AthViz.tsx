"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const modes = [
  {
    name: "Focus",
    d: "M20,45 C100,45 180,45 260,45",
  },
  {
    name: "Explore",
    d: "M20,45 C80,45 95,14 150,12 M20,45 C100,45 160,45 260,45 M20,45 C80,45 95,76 150,78",
  },
  {
    name: "Untangle",
    d: "M20,45 C40,8 60,82 80,28 C95,-4 110,88 130,45 C150,12 165,74 185,40 C205,12 232,45 260,45",
  },
];

export default function AthViz() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % modes.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex w-full max-w-[300px] flex-col items-center gap-5">
      <div className="flex gap-2">
        {modes.map((mode, i) => (
          <button
            key={mode.name}
            type="button"
            onClick={() => setActive(i)}
            className="relative rounded-full px-4 py-1.5 text-xs font-medium"
          >
            {i === active && (
              <motion.span
                layoutId="ath-mode"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="absolute inset-0 rounded-full bg-ink"
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-300 ${
                i === active ? "text-cream" : "text-muted"
              }`}
            >
              {mode.name}
            </span>
          </button>
        ))}
      </div>

      <svg viewBox="0 0 280 90" className="w-full" aria-hidden>
        <AnimatePresence mode="wait">
          <motion.path
            key={active}
            d={modes[active].d}
            fill="none"
            stroke="#FF4D24"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <circle cx="20" cy="45" r="4" fill="#1C1917" />
        <circle cx="260" cy="45" r="4" fill="#1C1917" />
      </svg>

      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted">
        one thought · three shapes
      </p>
    </div>
  );
}
