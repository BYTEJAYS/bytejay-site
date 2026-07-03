import type { Metadata } from "next";
import HackathonsClient from "@/components/hackathons/HackathonsClient";

export const metadata: Metadata = {
  title: "Hackathons — ByteJay",
  description:
    "Jay's hackathon badge collection — real ID cards in 3D on an endless plane. Drag to explore, click a badge to spin it.",
};

export default function HackathonsPage() {
  return <HackathonsClient />;
}
