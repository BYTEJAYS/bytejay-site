import type { Metadata } from "next";
import JourneyWorldClient from "@/components/journey/JourneyWorldClient";

export const metadata: Metadata = {
  title: "The Journey — ByteJay",
  description:
    "An explorable, cinematic WebGL world telling Jay's journey — fly the path, pass the chapters, meet the milestones.",
};

export default function JourneyPage() {
  return <JourneyWorldClient />;
}
