# ByteJay — Portfolio

Personal portfolio of Jay (ByteJay) — a 19-year-old aspiring AI engineer.
Cream-paper minimal design, animated project metaphors, zero cyberpunk.

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion**.
No Three.js — the hero uses a lightweight hand-rolled `<canvas>` graph so it stays fast everywhere.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## Where to customize

| What                            | Where                                        |
| ------------------------------- | -------------------------------------------- |
| Projects, skills, interests, timeline, email, socials | `lib/data.ts` (one file, all content) |
| Colors (cream / ink / accent)   | `tailwind.config.ts`                         |
| Fonts                           | `app/layout.tsx` (next/font)                 |
| Micro-animation keyframes       | `app/globals.css`                            |
| SEO title / description         | `app/layout.tsx` metadata                    |

## Structure

```
app/
  layout.tsx        fonts, metadata, body shell
  page.tsx          section order
  globals.css       Tailwind + custom keyframes (voxel, sheen, twinkle, marquee)
components/
  Navbar.tsx        floating pill nav
  ScrollProgress.tsx / CursorGlow.tsx
  MagneticButton.tsx / Reveal.tsx / SectionHeading.tsx
  HeroCanvas.tsx    drifting graph-node particle field
  Marquee.tsx / Footer.tsx / ProjectCard.tsx
  sections/         Hero, About, Projects, Skills, Interests, Timeline, Contact
  visuals/          one animated SVG metaphor per project
lib/
  data.ts           all site content
```

## Notes

- Email and social links in `lib/data.ts` are placeholders — swap in real ones.
- Animations respect `prefers-reduced-motion`.
- The cursor glow and magnetic buttons disable themselves on touch devices.
