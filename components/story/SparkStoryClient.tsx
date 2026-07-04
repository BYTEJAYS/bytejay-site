"use client";

import dynamic from "next/dynamic";

const SparkStory = dynamic(() => import("./SparkStory"), { ssr: false });

export default function SparkStoryClient() {
  return <SparkStory />;
}
