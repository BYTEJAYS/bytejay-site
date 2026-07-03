import type { Metadata } from "next";
import AlbumClient from "@/components/album/AlbumClient";

export const metadata: Metadata = {
  title: "Album — ByteJay",
  description:
    "A cursor-driven photo album — move the mouse and frames from Jay's world spill across the page.",
};

export default function AlbumPage() {
  return <AlbumClient />;
}
