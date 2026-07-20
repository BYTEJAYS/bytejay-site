import CursorGlow from "@/components/CursorGlow";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import Intro from "@/components/Intro";
import MorphBlob from "@/components/MorphBlob";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import Contact from "@/components/sections/Contact";
import Hero from "@/components/sections/Hero";
import Interests from "@/components/sections/Interests";
import Skills from "@/components/sections/Skills";
import SpiralProjects from "@/components/sections/SpiralProjects";
import Terminal from "@/components/sections/Terminal";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Intro />
      <ScrollProgress />
      <CursorGlow />
      <CustomCursor dark />
      <MorphBlob />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <SpiralProjects />
        <Skills />
        <Interests />
        <Terminal />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
