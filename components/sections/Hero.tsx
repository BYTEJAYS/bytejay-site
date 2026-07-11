"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import HeroCanvas from "../HeroCanvas";
import LiveClock from "../LiveClock";
import SaintBernard from "../SaintBernard";
import SpotlightReveal from "../SpotlightReveal";
import MagneticButton from "../MagneticButton";
import RollingText from "../RollingText";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];
// Reveals start as the boot screen lifts (loader hits 100% around ~1.2s).
const BASE = 1.05;
const NAME = "ByteJay".split("");
const TAGLINE =
  "Building intelligent systems where AI, graphs, memory & imagination collide.".split(
    " "
  );
const HIGHLIGHTS = new Set(["AI,", "graphs,", "memory", "imagination"]);
const ROLES = ["AI ENGINEER", "BACKEND BUILDER", "19Y — BUILDING IN PUBLIC"];

const hud = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: BASE + 1.9, ease: EASE },
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [sparks, setSparks] = useState(0);

  const onBurst = useCallback(() => setSparks((s) => s + 1), []);

  // The hero drifts away at its own pace as the story scrolls on.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);

  const inkText = "text-ink";
  const softText = "text-ink-soft";
  const hudText = "text-ink/60";

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-6"
    >
      {/* dotted paper, faded at the edges */}
      <div className="absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_75%_60%_at_50%_40%,black,transparent)]" />
      {/* under the paper: a blueprint, revealed by the cursor's torch */}
      <SpotlightReveal dark={false} />

      {/* the instrument: an interactive drifting graph */}
      <motion.div
        style={{ y: canvasY, opacity: canvasOpacity }}
        className="absolute inset-0"
      >
        <HeroCanvas onBurst={onBurst} />
      </motion.div>

      {/* the resident: a saint bernard on patrol, behind the title */}
      <motion.div
        style={{ y: canvasY, opacity: canvasOpacity }}
        className="pointer-events-none absolute inset-0 z-[5]"
      >
        <SaintBernard />
      </motion.div>

      {/* ── HUD: left — local time ── */}
      <motion.div
        {...hud}
        className={`absolute left-6 top-1/2 hidden -translate-y-1/2 font-mono text-[11px] tracking-[0.08em] transition-colors duration-700 md:block ${hudText}`}
      >
        <p>LOCAL</p>
        <LiveClock className="mt-1 block" />
      </motion.div>

      {/* ── HUD: right — roles ── */}
      <motion.div
        {...hud}
        className={`absolute right-6 top-1/2 hidden -translate-y-1/2 text-right font-mono text-[11px] leading-relaxed tracking-[0.08em] transition-colors duration-700 md:block ${hudText}`}
      >
        {ROLES.map((role) => (
          <p key={role}>{role}</p>
        ))}
      </motion.div>

      {/* ── HUD: bottom-left — spark counter ── */}
      <motion.div
        {...hud}
        className={`absolute bottom-6 left-6 font-mono text-[11px] tracking-[0.08em] transition-colors duration-700 ${hudText}`}
      >
        <p>
          SPARKS{" "}
          <span className="tabular-nums text-accent">
            {String(sparks).padStart(3, "0")}
          </span>
        </p>
        <p className="mt-1 opacity-70">CLICK THE VOID!</p>
      </motion.div>

      {/* ── centre stage ── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <div className="relative">
          <h1
            className={`font-display text-[clamp(3.6rem,13vw,9rem)] font-bold leading-none tracking-tight transition-colors duration-700 ${inkText}`}
          >
            {NAME.map((char, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.75,
                    delay: BASE + 0.35 + i * 0.05,
                    ease: EASE,
                  }}
                >
                  {char}
                </motion.span>
              </span>
            ))}
            <span className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block text-accent"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.75,
                  delay: BASE + 0.35 + NAME.length * 0.05,
                  ease: EASE,
                }}
              >
                .
              </motion.span>
            </span>
          </h1>
          <motion.span
            initial={{ opacity: 0, rotate: -12, y: 8 }}
            animate={{ opacity: 1, rotate: -6, y: 0 }}
            transition={{ duration: 0.6, delay: BASE + 1.15, ease: EASE }}
            className={`absolute -right-2 -top-5 font-hand text-2xl transition-colors duration-700 sm:-right-10 sm:top-0 sm:text-3xl ${softText}`}
          >
            call me Jay ✌︎
          </motion.span>
        </div>

        <p
          className={`mx-auto mt-8 max-w-2xl font-display text-xl leading-relaxed transition-colors duration-700 sm:text-2xl ${softText}`}
        >
          {TAGLINE.map((word, i) => (
            <motion.span
              key={i}
              className={`inline-block ${
                HIGHLIGHTS.has(word)
                  ? `font-medium transition-colors duration-700 ${inkText}`
                  : ""
              }`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: BASE + 0.95 + i * 0.045,
                ease: EASE,
              }}
            >
              {word}&nbsp;
            </motion.span>
          ))}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: BASE + 1.6, ease: EASE }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <MagneticButton
            href="#projects"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-medium text-cream transition-colors duration-500 hover:!bg-accent hover:!text-white"
          >
            <RollingText text="Explore my work" hoverText="let's gooo" />{" "}
            <span aria-hidden>↓</span>
          </MagneticButton>
          <MagneticButton
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-surface/60 px-7 py-3.5 font-medium text-ink backdrop-blur transition-colors duration-500 hover:border-ink"
          >
            <RollingText text="Say hello" hoverText="or wave ✌︎" />
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: BASE + 2.2, duration: 1 }}
        className={`absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 transition-colors duration-700 ${hudText}`}
        aria-hidden
      >
        <span className="font-mono text-[10px] tracking-[0.25em]">SCROLL</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="block h-8 w-px bg-ink/30"
        />
      </motion.div>
    </section>
  );
}
