"use client";

import { motion, useReducedMotion } from "framer-motion";
import useActiveSection from "@/lib/useActiveSection";

const SECTION_IDS = ["top", "about", "projects", "skills", "interests", "contact"];

// Where the blob rests for each chapter of the page.
const POSITIONS: Record<string, { x: string; y: string; scale: number }> = {
  top: { x: "24vw", y: "-6vh", scale: 1.15 },
  about: { x: "-28vw", y: "10vh", scale: 0.9 },
  projects: { x: "30vw", y: "16vh", scale: 0.7 },
  skills: { x: "-30vw", y: "4vh", scale: 1 },
  interests: { x: "26vw", y: "12vh", scale: 0.85 },
  contact: { x: "0vw", y: "2vh", scale: 1.3 },
};

const MORPH = [
  "44% 56% 62% 38% / 46% 40% 60% 54%",
  "58% 42% 38% 62% / 52% 62% 38% 48%",
  "38% 62% 55% 45% / 60% 44% 56% 40%",
  "44% 56% 62% 38% / 46% 40% 60% 54%",
];

export default function MorphBlob() {
  const active = useActiveSection(SECTION_IDS);
  const reduced = useReducedMotion();
  const pos = POSITIONS[active] ?? POSITIONS.top;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        animate={{ x: pos.x, y: pos.y, scale: pos.scale }}
        transition={{ type: "spring", stiffness: 40, damping: 26, mass: 1.4 }}
        style={{
          left: "50%",
          top: "38%",
          width: "56vw",
          height: "56vw",
          marginLeft: "-28vw",
          marginTop: "-28vw",
          maxWidth: "820px",
          maxHeight: "820px",
        }}
        className="absolute will-change-transform"
      >
        <motion.div
          animate={
            reduced
              ? undefined
              : { borderRadius: MORPH, rotate: [0, 14, -10, 0] }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          style={{
            borderRadius: MORPH[0],
            background:
              "radial-gradient(circle at 36% 34%, rgba(255,77,36,0.17) 0%, rgba(255,143,92,0.10) 48%, rgba(255,77,36,0) 74%)",
          }}
          className="h-full w-full blur-2xl"
        />
      </motion.div>
    </div>
  );
}
