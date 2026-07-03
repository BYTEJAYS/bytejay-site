"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";

type Mode = "default" | "hover" | "label";

/**
 * HUD-style cursor: a quick accent crosshair plus a lagging ring.
 * Over links/buttons the crosshair spins into an × and the ring
 * tightens into a rounded square; over elements carrying
 * `data-cursor-label` it becomes a labelled accent circle.
 */
export default function CustomCursor({ dark = false }: { dark?: boolean }) {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("default");
  const [label, setLabel] = useState("");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, { stiffness: 900, damping: 55, mass: 0.3 });
  const dotY = useSpring(y, { stiffness: 900, damping: 55, mass: 0.3 });
  const ringX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };

    const resolve = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      const labelEl = target.closest<HTMLElement>("[data-cursor-label]");
      const interactiveEl = target.closest<HTMLElement>("a, button");
      // The label wins unless a distinct interactive element sits inside it
      // (e.g. a link inside a labelled card) — then the generic ring wins.
      if (
        labelEl &&
        (!interactiveEl ||
          interactiveEl === labelEl ||
          !labelEl.contains(interactiveEl))
      ) {
        setMode("label");
        setLabel(labelEl.dataset.cursorLabel ?? "");
      } else if (interactiveEl) {
        setMode("hover");
      } else {
        setMode("default");
      }
    };

    const over = (e: MouseEvent) => resolve(e.target);
    // Labels can change on click (e.g. copy → ✓); re-read after React renders.
    const click = (e: MouseEvent) => {
      const target = e.target;
      setTimeout(() => resolve(target), 80);
    };
    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("click", click);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("click", click);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  if (!enabled) return null;

  const ringSize = mode === "label" ? 86 : mode === "hover" ? 52 : 34;

  return (
    <>
      {/* lagging ring */}
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        className="pointer-events-none fixed left-0 top-0 z-[90] hidden md:block"
      >
        <div className="-translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{
              width: ringSize,
              height: ringSize,
              borderRadius: mode === "hover" ? 12 : 999,
              rotate: mode === "hover" ? 90 : 0,
              backgroundColor:
                mode === "label"
                  ? "rgba(255,77,36,0.95)"
                  : mode === "hover"
                    ? "rgba(255,77,36,0.08)"
                    : "rgba(28,25,23,0)",
              borderColor:
                mode === "label"
                  ? "rgba(28,25,23,0)"
                  : mode === "hover"
                    ? "rgba(255,77,36,0.6)"
                    : dark
                      ? "rgba(251,248,242,0.35)"
                      : "rgba(28,25,23,0.25)",
              opacity: visible ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex items-center justify-center overflow-hidden border"
          >
            <AnimatePresence>
              {mode === "label" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap font-display text-[10px] font-medium uppercase tracking-[0.15em] text-cream"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* quick crosshair */}
      <motion.div
        aria-hidden
        style={{ x: dotX, y: dotY }}
        className="pointer-events-none fixed left-0 top-0 z-[90] hidden md:block"
      >
        <div className="-translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{
              scale: mode === "label" ? 0 : mode === "hover" ? 0.8 : 1,
              rotate: mode === "hover" ? 135 : 0,
              opacity: visible ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="relative h-2.5 w-2.5"
          >
            <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-accent" />
            <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-accent" />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
