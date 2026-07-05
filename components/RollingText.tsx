type Props = {
  text: string;
  hoverText?: string;
  className?: string;
  /** "group" reacts to the nearest `group` parent; "link" to a `group/link` parent. */
  trigger?: "group" | "link";
  /** Size to the visible label only — a wider hoverText overlays it instead of
      reserving width (keeps rows of labels evenly spaced, e.g. the navbar). */
  fit?: boolean;
};

/**
 * Heartbeat-style text roll: on hover the label rolls up and out while an
 * alternate label rolls in from below. Requires a `group` (or `group/link`)
 * class on the hoverable ancestor.
 */
export default function RollingText({
  text,
  hoverText,
  className = "",
  trigger = "group",
  fit = false,
}: Props) {
  const rollOut =
    trigger === "link"
      ? "group-hover/link:-translate-y-[110%]"
      : "group-hover:-translate-y-[110%]";
  const rollIn =
    trigger === "link"
      ? "group-hover/link:translate-y-0"
      : "group-hover:translate-y-0";
  const ease = "transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]";

  if (fit) {
    // width comes from the visible label alone; the hover label rides in
    // over it, centered, clipped vertically but free to overflow sideways
    return (
      <span className={`relative inline-block overflow-y-clip align-bottom ${className}`}>
        <span className={`block whitespace-nowrap ${ease} ${rollOut}`}>{text}</span>
        <span
          aria-hidden
          className={`absolute left-1/2 top-0 block w-max -translate-x-1/2 translate-y-[110%] whitespace-nowrap ${ease} ${rollIn}`}
        >
          {hoverText ?? text}
        </span>
      </span>
    );
  }

  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
      <span className={`block [grid-area:1/1] ${ease} ${rollOut}`}>{text}</span>
      <span
        aria-hidden
        className={`block translate-y-[110%] [grid-area:1/1] ${ease} ${rollIn}`}
      >
        {hoverText ?? text}
      </span>
    </span>
  );
}
