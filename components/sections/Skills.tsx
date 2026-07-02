"use client";

import { motion, type Variants } from "framer-motion";
import { skillGroups } from "@/lib/data";
import SectionHeading from "../SectionHeading";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const chip: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

export default function Skills() {
  return (
    <section id="skills" className="border-y border-line bg-surface/60 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="the toolkit"
          title="What I work with"
          blurb="A stack chosen for building real systems fast — and learning what breaks."
        />
        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <p className="font-hand text-2xl text-accent">{group.label}</p>
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="mt-4 flex flex-wrap gap-2.5"
              >
                {group.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    variants={chip}
                    whileHover={{ scale: 1.06, rotate: -1.5 }}
                    className="cursor-default rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-soft transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-cream"
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
