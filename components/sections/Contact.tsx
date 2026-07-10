"use client";

import { useState } from "react";
import { email, socials } from "@/lib/data";
import AriaBackground from "../AriaBackground";
import MagneticButton from "../MagneticButton";
import Reveal from "../Reveal";
import RollingText from "../RollingText";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden px-6 py-32">
      <AriaBackground />
      <div className="absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
      <div className="relative mx-auto max-w-2xl text-center">
        <Reveal>
          <span className="font-hand text-2xl text-accent">say hi</span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
            Let&apos;s build something that doesn&apos;t exist yet.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 text-ink-soft">
            Open to internships, hackathons, collaborations — and conversations
            about anything from graph fraud detection to time travel.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton
              onClick={copyEmail}
              cursorLabel={copied ? "✓" : "copy"}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-medium text-cream transition-colors hover:bg-accent"
            >
              {copied ? "copied ✓" : email}
            </MagneticButton>
            {socials.map((social) => (
              <MagneticButton
                key={social.name}
                href={social.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-surface/70 px-6 py-3.5 font-medium text-ink backdrop-blur transition-colors hover:border-ink"
              >
                <RollingText
                  text={social.name}
                  hoverText={
                    social.name === "GitHub" ? "@BYTEJAYS" : "@_bytejay_"
                  }
                />{" "}
                <span aria-hidden>↗</span>
              </MagneticButton>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.34}>
          <p className="mt-14 font-hand text-2xl text-muted">
            P.S. — in a parallel world, we&apos;ve already shipped something
            together.
          </p>
        </Reveal>
        <Reveal delay={0.42}>
          <p className="mt-3 font-hand text-lg text-muted/70">
            (that&apos;s A.R.I.A behind me — slide your mouse, she rewinds time)
          </p>
        </Reveal>
      </div>
    </section>
  );
}
