"use client";

import { motion } from "framer-motion";
import { interests } from "@/lib/data";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

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
              className="flex h-full flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-6 text-center shadow-[0_2px_16px_rgba(28,25,23,0.03)]"
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
