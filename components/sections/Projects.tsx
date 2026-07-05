"use client";

import dynamic from "next/dynamic";
import SectionHeading from "../SectionHeading";

/* three.js rides in lazily with the book — keep it out of first load */
const ProjectBookTeaser = dynamic(() => import("../ProjectBookTeaser"), { ssr: false });

/* The section IS the book: no cards, no list — one rotating tome.
   Tap it and the cat walks you through every project, page by page. */
export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading
        eyebrow="the good stuff"
        title="Things I'm building"
        blurb="Every project is a page in one book. Open it — the cat will show you around."
      />
      <div className="mt-10 flex justify-center">
        <ProjectBookTeaser size={560} caption="tap the book ✦ the projects live inside" />
      </div>
    </section>
  );
}
