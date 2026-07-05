import type { Metadata } from "next";
import AlbumFace from "@/components/album/AlbumFace";

export const metadata: Metadata = {
  title: "Album — ByteJay",
  description:
    "The album as a portrait — move your cursor across the silhouette and the photos show through.",
};

// The previous cursor-trail spill lives on in components/album/AlbumClient.tsx —
// swap the import back to bring it home.
export default function AlbumPage() {
  return <AlbumFace />;
}
