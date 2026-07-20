"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/*
 * Route transitions: a two-layer curtain wipe in the site's sunset palette.
 * Clicking any internal link sweeps a dark panel then the sunset gradient up
 * over the screen, swaps the route underneath, and the curtain continues up
 * and away — one uninterrupted motion instead of a hard cut.
 */

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
/* dreamscape curtain: aurora blobs floating in deep dusk glass */
const AURORA =
  "radial-gradient(62% 84% at 18% 86%, rgba(139,123,216,0.8), transparent 66%)," +
  "radial-gradient(56% 72% at 86% 12%, rgba(229,139,168,0.62), transparent 66%)," +
  "radial-gradient(74% 92% at 62% 52%, rgba(95,212,196,0.34), transparent 72%)," +
  "radial-gradient(50% 60% at 40% 20%, rgba(203,126,87,0.4), transparent 70%)," +
  "linear-gradient(165deg, #14131F 0%, #221623 50%, #241A1E 100%)";

const LABELS: Record<string, string> = {
  "/": "home",
  "/journey": "the journey",
  "/hackathons": "the badges",
  "/album": "the album",
  "/projects": "the project book",
};

type Phase = "idle" | "covering" | "revealing";

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const pendingHref = useRef<string | null>(null);
  const coveredPath = useRef<string | null>(null);
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;

  /* intercept internal route links — externals, hashes, downloads,
     modified clicks and the current page all pass through untouched */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (
        !href.startsWith("/") ||
        href.startsWith("//") ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }
      const [path] = href.split("#");
      if (path === pathname || phaseRef.current !== "idle") {
        if (path === pathname) return; // same page — let hash/glide handle it
        e.preventDefault();
        return;
      }
      e.preventDefault();
      pendingHref.current = href;
      coveredPath.current = pathname;
      setLabel(LABELS[path] ?? path.replace("/", "").replace(/-/g, " "));
      setPhase("covering");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  /* the route swapped under the closed curtain — lift it */
  useEffect(() => {
    if (phase === "covering" && coveredPath.current !== null && pathname !== coveredPath.current) {
      window.scrollTo(0, 0);
      const t = setTimeout(() => setPhase("revealing"), 240);
      return () => clearTimeout(t);
    }
  }, [pathname, phase]);

  const active = phase !== "idle";

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[85] ${active ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* dream veil: the page melts into blur before the curtain arrives */}
      <motion.div
        initial={false}
        animate={{ opacity: phase === "covering" ? 1 : 0 }}
        transition={{
          duration: phase === "covering" ? 0.5 : 0.9,
          ease: "easeOut",
          delay: phase === "revealing" ? 0.25 : 0,
        }}
        className="absolute inset-0 bg-[#0a0a0a]/40 backdrop-blur-2xl"
        style={{ visibility: active ? "visible" : "hidden" }}
      />
      {/* soft dark lead panel */}
      <motion.div
        initial={false}
        animate={
          phase === "covering"
            ? { y: "0%" }
            : phase === "revealing"
              ? { y: "-115%" }
              : { y: "115%" }
        }
        transition={
          phase === "idle"
            ? { duration: 0 }
            : { duration: phase === "covering" ? 0.85 : 0.95, ease: EASE, delay: phase === "revealing" ? 0.1 : 0 }
        }
        className="absolute inset-x-0 top-0 h-[130vh] bg-[#0B0A12]/90"
        style={{ borderRadius: "0 0 50% 50% / 0 0 9vh 9vh" }}
      />
      {/* aurora curtain */}
      <motion.div
        initial={false}
        animate={
          phase === "covering"
            ? { y: "0%", scale: 1 }
            : phase === "revealing"
              ? { y: "-115%", scale: 1.04 }
              : { y: "115%", scale: 1 }
        }
        transition={
          phase === "idle"
            ? { duration: 0 }
            : { duration: phase === "covering" ? 0.95 : 1.05, ease: EASE, delay: phase === "covering" ? 0.09 : 0 }
        }
        onAnimationComplete={() => {
          if (phaseRef.current === "covering" && pendingHref.current) {
            router.push(pendingHref.current);
            pendingHref.current = null;
          } else if (phaseRef.current === "revealing") {
            setPhase("idle");
          }
        }}
        className="absolute inset-x-0 top-0 flex h-[130vh] items-center justify-center"
        style={{
          background: AURORA,
          borderRadius: "0 0 50% 50% / 0 0 9vh 9vh",
        }}
      >
        <motion.div
          animate={{
            opacity: phase === "covering" ? 1 : 0,
            y: phase === "covering" ? 0 : 14,
            scale: phase === "covering" ? 1 : 0.96,
          }}
          transition={{ duration: 0.5, delay: phase === "covering" ? 0.42 : 0, ease: EASE }}
          className="-mt-[30vh] text-center"
        >
          <p className="font-display text-3xl font-bold tracking-tight text-white [text-shadow:0_0_34px_rgba(229,139,168,0.55),0_2px_18px_rgba(0,0,0,0.4)]">
            Byte<span className="text-[#FF4D24]">Jay</span>.
          </p>
          <p className="mt-2 font-mono text-[10px] lowercase tracking-[0.34em] text-white/85">
            {label}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
