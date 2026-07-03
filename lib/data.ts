export type Project = {
  id: string;
  index: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
  viz: "graph" | "glass" | "cortex" | "ath" | "backend";
};

export const projects: Project[] = [
  {
    id: "tgie",
    index: "01",
    name: "TGIE",
    tagline: "Transaction Graph Intelligence Engine",
    description:
      "A fraud-detection and fund-flow tracking engine for banks. TGIE turns raw transactions into a living graph — surfacing mule accounts, circular flows, layering chains, fan-in / fan-out bursts, and dormant accounts that suddenly wake up.",
    tags: ["Python", "FastAPI", "Graph analytics", "WebSockets", "React"],
    viz: "graph",
  },
  {
    id: "lumen",
    index: "02",
    name: "Lumen Glass",
    tagline: "Software-defined holographic glass storage",
    description:
      "A simulator inspired by 5D optical storage: data written into virtual glass as voxel planes, with compression, error correction and authenticity checks — plus GlassOS, a visual studio for watching your bytes crystallise.",
    tags: ["Python", "Compression", "Error correction", "Simulation UI"],
    viz: "glass",
  },
  {
    id: "cortex",
    index: "03",
    name: "PRL / CORTEX",
    tagline: "A personal reality layer & legacy engine",
    description:
      "What if a lifetime was queryable? CORTEX captures memories, journals, wisdom and life patterns into an interactive digital brain — part archive, part biopic, part time machine for your own story.",
    tags: ["AI/ML", "Memory systems", "Timelines", "Product design"],
    viz: "cortex",
  },
  {
    id: "ath",
    index: "04",
    name: "ATH",
    tagline: "Augmented thinking helper",
    description:
      "A concept interface for thinking better, not just working faster. ATH reduces cognitive overload with AI-guided modes — focus, explore, untangle — that reshape how a problem is presented to your brain.",
    tags: ["AI UX", "Cognitive modes", "Prompt engineering", "Concept"],
    viz: "ath",
  },
  {
    id: "backend",
    index: "05",
    name: "Café Simulation & Backend Lab",
    tagline: "Where the fundamentals get built",
    description:
      "A running series of backend builds: an async café simulation with orders flowing through virtual kitchens, hotel & café management APIs, WebSocket experiments and architecture practice — my training ground for real systems.",
    tags: ["FastAPI", "AsyncIO", "SQLite", "REST", "Architecture"],
    viz: "backend",
  },
];

export const skillGroups = [
  {
    label: "backend & systems",
    skills: [
      "Python",
      "FastAPI",
      "AsyncIO",
      "WebSockets",
      "SQLite",
      "REST APIs",
      "Backend architecture",
    ],
  },
  {
    label: "frontend & motion",
    skills: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Three.js / R3F"],
  },
  {
    label: "ai & thinking",
    skills: [
      "AI/ML concepts",
      "Graph analytics",
      "Prompt engineering",
      "Product ideation",
    ],
  },
];

export const interests = [
  { icon: "♞", name: "Chess", quip: "long thinks, occasional brilliancies" },
  { icon: "🎸", name: "Guitar & Vocals", quip: "riffs and choruses between compile times" },
  { icon: "📚", name: "Books", quip: "sci-fi, physics & big ideas" },
  { icon: "💻", name: "Coding", quip: "yes, this also counts as fun" },
];

export const email = "codes404z@gmail.com";

/**
 * Where Jerry (the PRL companion) takes visitors.
 * Defaults to the built-in /jerry chat; NEXT_PUBLIC_PRL_URL overrides
 * it if the full PRL app gets its own deployment later.
 */
export const prlUrl = process.env.NEXT_PUBLIC_PRL_URL || "/jerry";

export const socials = [
  { name: "GitHub", href: "https://github.com/BYTEJAYS" },
  { name: "Instagram", href: "https://www.instagram.com/_bytejay_" },
];
