import type { Metadata } from "next";
import JerryChat from "@/components/jerry/JerryChat";

export const metadata: Metadata = {
  title: "Jerry — ask him about Jay",
  description:
    "Jerry is the AI companion from PRL / CORTEX. Ask him anything about Jay — the projects, the journey, the guitar.",
};

export default function JerryPage() {
  return <JerryChat />;
}
