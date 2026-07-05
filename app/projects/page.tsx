import type { Metadata } from "next";
import ProjectBookClient from "@/components/story/ProjectBookClient";

export const metadata: Metadata = {
  title: "The Project Book — a guided tour of the shelf",
  description:
    "Every project as a page in a 3D storybook — tap through, the cat will show you around.",
};

export default function ProjectsPage() {
  return <ProjectBookClient />;
}
