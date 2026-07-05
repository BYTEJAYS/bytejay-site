"use client";

import dynamic from "next/dynamic";

const ProjectBook = dynamic(() => import("./ProjectBook"), { ssr: false });

export default function ProjectBookClient() {
  return <ProjectBook />;
}
