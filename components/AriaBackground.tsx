"use client";

import { useEffect, useRef, useState } from "react";

const SCRUB_SENSITIVITY = 0.8;

/**
 * A.R.I.A — ambient video background for the "say hi" section.
 * Desaturated and washed with cream so it prints into the page rather
 * than sitting on it; horizontal mouse movement scrubs the footage.
 */
export default function AriaBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Horizontal mouse movement scrubs the video; onSeeked queues the next
  // seek so the pipeline never floods.
  useEffect(() => {
    if (!inView) return;
    const video = videoRef.current;
    if (!video) return;

    let prevX: number | null = null;
    let targetTime = 0;
    let seeking = false;

    const seekTo = (t: number) => {
      seeking = true;
      video.currentTime = t;
    };
    const onSeeked = () => {
      seeking = false;
      if (Math.abs(targetTime - video.currentTime) > 0.01) seekTo(targetTime);
    };
    const onMove = (e: MouseEvent) => {
      if (!video.duration) return;
      if (prevX === null) {
        prevX = e.clientX;
        targetTime = video.currentTime;
        return;
      }
      const delta = e.clientX - prevX;
      prevX = e.clientX;
      targetTime = Math.min(
        video.duration,
        Math.max(0, targetTime + (delta / window.innerWidth) * SCRUB_SENSITIVITY * video.duration)
      );
      if (!seeking) seekTo(targetTime);
    };

    video.addEventListener("seeked", onSeeked);
    window.addEventListener("mousemove", onMove);
    return () => {
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("mousemove", onMove);
    };
  }, [inView]);

  return (
    <div ref={wrapRef} className="absolute inset-0 bg-cream" aria-hidden>
      {/* multiply prints A.R.I.A's dark tones into the paper while the
          footage's light backdrop dissolves into the cream */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover opacity-90 grayscale brightness-[1.18] contrast-[1.25] mix-blend-multiply [object-position:70%_35%]"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-transparent to-cream" />
    </div>
  );
}
