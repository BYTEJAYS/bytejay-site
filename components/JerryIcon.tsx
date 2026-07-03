"use client";

import { motion } from "framer-motion";

/*
 * Jerry — the PRL companion, as a tiny pixel brain.
 * Two lobes, a central fissure, and a few synapses that
 * never quite stop firing.
 */
const ROWS = [
  "00111011100",
  "01111011110",
  "11111011111",
  "11011011011",
  "11111011111",
  "01111011110",
  "00111011100",
  "00001010000",
] as const;

/** "x-y" pixels rendered in accent and pulsing like firing synapses */
const SYNAPSES: Record<string, number> = {
  "2-2": 0,
  "8-1": 0.6,
  "3-5": 1.2,
  "7-4": 1.8,
};

type Props = { className?: string };

export default function JerryIcon({ className = "" }: Props) {
  const w = ROWS[0].length;
  const h = ROWS.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden
      className={className}
    >
      {ROWS.flatMap((row, y) =>
        row.split("").map((cell, x) => {
          if (cell !== "1") return null;
          const delay = SYNAPSES[`${x}-${y}`];
          if (delay !== undefined) {
            return (
              <motion.rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width="1"
                height="1"
                className="fill-accent"
                animate={{ opacity: [1, 0.15, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, delay }}
              />
            );
          }
          return (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
          );
        })
      )}
    </svg>
  );
}
