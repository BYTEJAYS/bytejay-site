import type { Metadata } from "next";
import { Caveat, Inter, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ByteJay — Jay · AI engineer in the making",
  description:
    "Portfolio of Jay (ByteJay), a 19-year-old aspiring AI engineer building intelligent systems where AI, graphs, memory and imagination collide.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${space.variable} ${inter.variable} ${caveat.variable} ${mono.variable}`}
    >
      <body className="bg-cream font-body text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
