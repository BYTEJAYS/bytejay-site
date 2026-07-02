import { projects } from "@/lib/data";
import ProjectCard from "../ProjectCard";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading
        eyebrow="the good stuff"
        title="Things I'm building"
        blurb="Ambitious is the point. Each of these started as a “what if?” and refused to stay hypothetical."
      />
      <div className="mt-16 flex flex-col gap-8">
        {projects.map((project, i) => (
          <Reveal key={project.id} delay={0.05}>
            <ProjectCard project={project} flip={i % 2 === 1} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
