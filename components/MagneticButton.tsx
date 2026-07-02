"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

type Props = {
  href?: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  strength?: number;
  cursorLabel?: string;
};

const spring = { type: "spring", stiffness: 180, damping: 15, mass: 0.4 } as const;

export default function MagneticButton({
  href,
  onClick,
  className = "",
  children,
  strength = 0.25,
  cursorLabel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setOffset({
      x: (e.clientX - rect.left - rect.width / 2) * strength,
      y: (e.clientY - rect.top - rect.height / 2) * strength,
    });
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className="inline-block"
    >
      {href ? (
        <motion.a
          href={href}
          animate={{ x: offset.x, y: offset.y }}
          transition={spring}
          whileTap={{ scale: 0.97 }}
          className={`group ${className}`}
          data-cursor-label={cursorLabel}
        >
          {children}
        </motion.a>
      ) : (
        <motion.button
          type="button"
          onClick={onClick}
          animate={{ x: offset.x, y: offset.y }}
          transition={spring}
          whileTap={{ scale: 0.97 }}
          className={`group ${className}`}
          data-cursor-label={cursorLabel}
        >
          {children}
        </motion.button>
      )}
    </div>
  );
}
