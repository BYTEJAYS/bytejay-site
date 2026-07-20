"use client";

import { motion } from "framer-motion";
import { interests } from "@/lib/data";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

/* each card gets its own soft aurora tint, matching the spiral's glass */
const HUES = ["139,123,216", "95,212,196", "255,138,101", "229,139,168", "123,184,232", "245,201,123"];

export default function Interests() {
  return (
    <section id="interests" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading
        eyebrow="off the clock"
        title="Fuel for the curiosity"
        blurb="The stuff that keeps my brain interesting between commits."
      />
      <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {interests.map((interest, i) => (
          <Reveal key={interest.name} delay={i * 0.05}>
            <motion.div
              whileHover={{ y: -5, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex h-full flex-col items-center gap-3 rounded-2xl p-6 text-center backdrop-blur-md"
              style={{
                border: `1px solid rgba(${HUES[i % HUES.length]},0.28)`,
                background: `radial-gradient(120% 120% at 20% 110%, rgba(${HUES[i % HUES.length]},0.16), transparent 60%), radial-gradient(110% 100% at 90% -10%, rgba(255,255,255,0.05), transparent 55%), rgba(20,20,26,0.55)`,
                boxShadow: `0 2px 22px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12), 0 6px 30px rgba(${HUES[i % HUES.length]},0.1)`,
              }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-3xl">
                {interest.icon === "♞" ? (
                  <span className="text-4xl leading-none text-ink">♞</span>
                ) : (
                  interest.icon
                )}
              </span>
              <p className="font-display text-sm font-semibold">{interest.name}</p>
              <p className="font-hand text-lg leading-tight text-muted">
                {interest.quip}
              </p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
