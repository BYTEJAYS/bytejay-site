type Props = {
  text: string;
  hoverText?: string;
  className?: string;
  /** "group" reacts to the nearest `group` parent; "link" to a `group/link` parent. */
  trigger?: "group" | "link";
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
}: Props) {
  const rollOut =
    trigger === "link"
      ? "group-hover/link:-translate-y-[110%]"
      : "group-hover:-translate-y-[110%]";
  const rollIn =
    trigger === "link"
      ? "group-hover/link:translate-y-0"
      : "group-hover:translate-y-0";

  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
      <span
        className={`block [grid-area:1/1] transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${rollOut}`}
      >
        {text}
      </span>
      <span
        aria-hidden
        className={`block translate-y-[110%] [grid-area:1/1] transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${rollIn}`}
      >
        {hoverText ?? text}
      </span>
    </span>
  );
}
