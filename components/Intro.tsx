"use client";

import { motion } from "framer-motion";

/**
 * One-time intro curtain: the wordmark appears on an ink panel,
 * then the whole panel lifts to reveal the site. Plays once on load.
 */
export default function Intro() {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{ duration: 0.75, delay: 1.0, ease: [0.76, 0, 0.24, 1] }}
      className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-ink"
      aria-hidden
    >
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="font-display text-3xl font-bold tracking-tight text-cream"
      >
        Byte<span className="text-accent">Jay.</span>
      </motion.p>
    </motion.div>
  );
}
