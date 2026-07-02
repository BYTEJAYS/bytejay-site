import CursorGlow from "@/components/CursorGlow";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import Intro from "@/components/Intro";
import Marquee from "@/components/Marquee";
import MorphBlob from "@/components/MorphBlob";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Hero from "@/components/sections/Hero";
import Interests from "@/components/sections/Interests";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Terminal from "@/components/sections/Terminal";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Intro />
      <ScrollProgress />
      <CursorGlow />
      <CustomCursor />
      <MorphBlob />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Marquee />
        <About />
        <Projects />
        <Skills />
        <Interests />
        <Terminal />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
