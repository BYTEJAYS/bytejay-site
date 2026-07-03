"use client";

import { motion } from "framer-motion";
import useActiveSection from "@/lib/useActiveSection";
import RollingText from "./RollingText";

const links = [
  { label: "About", hover: "who?", href: "#about" },
  { label: "Projects", hover: "the builds", href: "#projects" },
  { label: "Skills", hover: "the tools", href: "#skills" },
  { label: "Journey", hover: "play it!", href: "/journey" },
  { label: "Album", hover: "the pics", href: "/album" },
];

const SECTION_IDS = ["top", "about", "projects", "skills", "interests", "contact"];

export default function Navbar() {
  const active = useActiveSection(SECTION_IDS);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.9, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-cream/80 p-1.5 shadow-[0_2px_20px_rgba(28,25,23,0.06)] backdrop-blur-md"
      >
        <a
          href="#top"
          className="mr-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent font-display text-[10px] font-bold text-white transition-transform hover:rotate-[-8deg]"
          aria-label="ByteJay — back to top"
        >
          HIM
        </a>
        <div className="hidden items-center sm:flex">
          {links.map((link) => {
            const isActive = link.href === `#${active}`;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`group relative rounded-full px-3 py-1.5 text-sm transition-colors ${
                  isActive ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-ink/[0.06]"
                  />
                )}
                <span className="relative z-10">
                  <RollingText text={link.label} hoverText={link.hover} />
                </span>
              </a>
            );
          })}
        </div>
        <a
          href="#contact"
          className="group rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-ink"
        >
          <RollingText text="Say hi" hoverText="hey! ✌︎" />
        </a>
      </motion.nav>
    </div>
  );
}
