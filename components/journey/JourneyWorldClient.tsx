"use client";

import dynamic from "next/dynamic";

const JourneyWorld = dynamic(() => import("./JourneyWorld"), { ssr: false });

export default function JourneyWorldClient() {
  return <JourneyWorld />;
}
