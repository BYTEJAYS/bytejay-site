"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

const SIZE = 420;

export default function CursorGlow() {
  const x = useMotionValue(-SIZE);
  const y = useMotionValue(-SIZE);
  const sx = useSpring(x, { stiffness: 55, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 55, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX - SIZE / 2);
      y.set(e.clientY - SIZE / 2);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      style={{
        x: sx,
        y: sy,
        width: SIZE,
        height: SIZE,
        background:
          "radial-gradient(circle, rgba(255,77,36,0.07) 0%, rgba(255,77,36,0.03) 40%, transparent 65%)",
      }}
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden rounded-full mix-blend-multiply md:block"
    />
  );
}
