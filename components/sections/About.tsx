"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// yutaabe's reveal curve: translateY(22px) → 0, cubic-bezier(.16,1,.3,1)
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.88, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <FadeUp>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        — {children}
      </p>
    </FadeUp>
  );
}

function NameLine({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay, ease: EASE_OUT }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** yutaabe scroll hint: a rail with a bar endlessly sweeping down it. */
function ScrollHint() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        Scroll
      </span>
      <span className="relative block h-12 w-px overflow-hidden bg-ink/10">
        <span className="sweep-bar absolute inset-x-0 h-full bg-accent" />
      </span>
    </div>
  );
}

function Star({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`spin-star inline-block shrink-0 text-accent ${className}`}
    >
      ✦
    </span>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  // Ghost wordmark drifts up slowly while the section scrolls past.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [90, -90]);

  // The outlined band slides with scroll, not on a timer.
  const { scrollYProgress: bandProgress } = useScroll({
    target: bandRef,
    offset: ["start end", "end start"],
  });
  const bandX = useTransform(bandProgress, [0, 1], ["4%", "-32%"]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-x-clip py-28"
    >
      {/* ── ghost wordmark behind everything ── */}
      <motion.span
        style={{ y: ghostY }}
        aria-hidden
        className="ghost-stroke pointer-events-none absolute -right-[6vw] top-10 select-none font-display text-[24vw] font-bold leading-none tracking-tight"
      >
        BYTE
        <br />
        JAY
      </motion.span>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ── about hero: tag + name + since ── */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-12">
          <div>
            <FadeUp>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                <span className="text-accent">/ </span>
                Aspiring AI engineer — backend, graphs, experiments
              </p>
            </FadeUp>
            <h2 className="mt-6 font-display text-[clamp(3.2rem,9vw,7rem)] font-bold leading-[0.95] tracking-tight">
              <NameLine delay={0.05}>JAY —</NameLine>
              <NameLine delay={0.16}>
                <em className="italic text-accent">BYTEJAY</em>
              </NameLine>
            </h2>
          </div>
          <FadeUp delay={0.25} className="pb-2 text-right">
            <p className="font-display text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
              2024
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Building since
            </p>
          </FadeUp>
        </div>
        <FadeUp delay={0.4} className="mt-12">
          <ScrollHint />
        </FadeUp>

        {/* ── introduction ── */}
        <div className="mt-24">
          <SectionLabel>Introduction</SectionLabel>
          <div className="mt-8 grid gap-10 md:grid-cols-[1.4fr_1fr]">
            <FadeUp delay={0.1}>
              <p className="font-display text-3xl font-medium leading-snug tracking-tight sm:text-4xl">
                A 19-year-old builder fueled by{" "}
                <strong className="font-semibold text-accent">graphs</strong>,{" "}
                <strong className="font-semibold text-accent">backends</strong>{" "}
                & <strong className="font-semibold text-accent">what-ifs</strong>
                .
              </p>
            </FadeUp>
            <FadeUp delay={0.22}>
              <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
                <p>
                  College student, aspiring AI engineer. Most of my time goes
                  into systems that feel slightly too ambitious:
                  fraud-detection graph engines, holographic storage
                  simulators, digital memory brains.
                </p>
                <p>
                  My favourite question is{" "}
                  <em className="font-medium not-italic text-ink">
                    “what if?”
                  </em>{" "}
                  — what if banks could see money move like a living graph?
                  What if a lifetime of memories was queryable? What if
                  software helped you think, not just work?
                </p>
                <p>
                  Off the clock: somewhere between a chessboard, a guitar, a
                  Rubik&apos;s cube, and a book about the origins of the
                  universe.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>

      {/* ── scroll-driven outlined band ── */}
      <div ref={bandRef} className="relative mt-24 overflow-hidden py-4">
        <motion.p
          style={{ x: bandX }}
          aria-hidden
          className="flex w-max items-center gap-8 whitespace-nowrap font-display text-[clamp(3rem,7vw,5.5rem)] font-bold tracking-tight"
        >
          {["AI ENGINEER", "BACKEND BUILDER", "GRAPH THINKER", "EXPERIMENT ADDICT"].map(
            (phrase, i) => (
              <span key={phrase} className="flex items-center gap-8">
                <span className={i % 2 === 0 ? "ghost-stroke" : "text-ink/80"}>
                  {phrase}
                </span>
                <Star className="text-[0.5em]" />
              </span>
            )
          )}
        </motion.p>
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, rotate: -8, y: 16 }}
          whileInView={{ opacity: 1, rotate: -3, y: 0 }}
          whileHover={{ rotate: 0, scale: 1.04 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 inline-block rounded-xl border border-[#F0E3A0] bg-[#FDF3C7] px-5 py-3 shadow-sm"
        >
          <p className="font-hand text-xl text-ink">
            big ideas &gt; safe ideas ✦
          </p>
        </motion.div>
      </div>

      {/* ── giant marquee closer, rolling into the dark playground ── */}
      <div className="mt-24 overflow-hidden border-y border-line bg-surface/60 py-5">
        <div className="flex w-max animate-marquee items-center">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              <span className="font-display text-[clamp(2.6rem,6vw,4.5rem)] font-bold tracking-tight">
                LET&apos;S BUILD SOMETHING
              </span>
              <Star className="mx-8 text-[2rem]" />
              <span className="ghost-stroke font-display text-[clamp(2.6rem,6vw,4.5rem)] font-bold tracking-tight">
                THAT DOESN&apos;T EXIST YET
              </span>
              <Star className="mx-8 text-[2rem]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
