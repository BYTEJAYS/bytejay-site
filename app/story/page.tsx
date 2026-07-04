import type { Metadata } from "next";
import SparkStoryClient from "@/components/story/SparkStoryClient";

export const metadata: Metadata = {
  title: "Spark — a small story from the Isle of Jay",
  description:
    "A short 3D interactive storybook — page transitions, light, and small spatial scenes. Tap through.",
};

export default function StoryPage() {
  return <SparkStoryClient />;
}
