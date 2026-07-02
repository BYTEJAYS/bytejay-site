import PixelIcon from "./PixelIcon";
import Reveal from "./Reveal";

type Props = {
  eyebrow: string;
  title: string;
  blurb?: string;
};

export default function SectionHeading({ eyebrow, title, blurb }: Props) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <span className="inline-flex items-center gap-3">
          <PixelIcon name="spark" className="h-2.5 w-2.5 text-accent/60" />
          <span className="font-hand text-2xl text-accent">{eyebrow}</span>
          <PixelIcon name="spark" className="h-2.5 w-2.5 text-accent/60" />
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      {blurb && (
        <Reveal delay={0.16}>
          <p className="mt-4 text-ink-soft">{blurb}</p>
        </Reveal>
      )}
    </div>
  );
}
