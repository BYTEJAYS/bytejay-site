"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/data";
import PixelIcon from "./PixelIcon";
import RollingText from "./RollingText";
import AthViz from "./visuals/AthViz";
import BackendViz from "./visuals/BackendViz";
import CortexViz from "./visuals/CortexViz";
import GlassViz from "./visuals/GlassViz";
import GraphViz from "./visuals/GraphViz";

const vizMap = {
  graph: <GraphViz />,
  glass: <GlassViz />,
  cortex: <CortexViz />,
  ath: <AthViz />,
  backend: <BackendViz />,
};

export default function ProjectCard({
  project,
  flip,
}: {
  project: Project;
  flip: boolean;
}) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 250, damping: 22 }}
      className="group grid overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_2px_24px_rgba(28,25,23,0.04)] transition-shadow duration-500 hover:shadow-[0_12px_44px_rgba(28,25,23,0.09)] md:grid-cols-2"
    >
      <div
        data-cursor-label="alive ✦"
        className={`relative flex min-h-[260px] items-center justify-center border-b border-line bg-cream/70 p-8 md:border-b-0 ${
          flip ? "md:order-2 md:border-l" : "md:border-r"
        }`}
      >
        <div className="absolute inset-0 bg-dots opacity-40" />
        {/* pixel viewfinder brackets, like a game screen recording */}
        <PixelIcon name="corner" className="absolute left-3 top-3 h-3.5 w-3.5 text-ink/20 transition-colors duration-300 group-hover:text-accent/60" />
        <PixelIcon name="corner" className="absolute right-3 top-3 h-3.5 w-3.5 rotate-90 text-ink/20 transition-colors duration-300 group-hover:text-accent/60" />
        <PixelIcon name="corner" className="absolute bottom-3 right-3 h-3.5 w-3.5 rotate-180 text-ink/20 transition-colors duration-300 group-hover:text-accent/60" />
        <PixelIcon name="corner" className="absolute bottom-3 left-3 h-3.5 w-3.5 -rotate-90 text-ink/20 transition-colors duration-300 group-hover:text-accent/60" />
        <div className="relative">{vizMap[project.viz]}</div>
      </div>

      <div className={`p-8 sm:p-10 ${flip ? "md:order-1" : ""}`}>
        <span className="font-display text-sm font-medium text-accent">
          {project.index}
        </span>
        <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          {project.name}
        </h3>
        <p className="mt-1 font-hand text-2xl text-ink-soft">{project.tagline}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {project.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line bg-cream px-3 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-7 flex items-center gap-5 text-sm font-medium">
          <a
            href="https://github.com/BYTEJAYS"
            target="_blank"
            rel="noreferrer"
            className="group/link inline-flex items-center gap-1.5 text-ink transition-colors hover:text-accent"
          >
            <RollingText text="GitHub" hoverText="@BYTEJAYS" trigger="link" />
            <span
              aria-hidden
              className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
            >
              ↗
            </span>
          </a>
          <span className="text-muted">Case study — soon</span>
        </div>
      </div>
    </motion.article>
  );
}
