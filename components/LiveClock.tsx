"use client";

import { useEffect, useState } from "react";

/** Local time with a blinking colon, yutaabe "tempo" style. */
export default function LiveClock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const hh = now ? pad(now.getHours()) : "--";
  const mm = now ? pad(now.getMinutes()) : "--";
  const ss = now ? pad(now.getSeconds()) : "--";

  return (
    <span className={`tabular-nums ${className}`}>
      {hh}
      <span className="blink">:</span>
      {mm}
      <span className="blink">:</span>
      {ss}
    </span>
  );
}
