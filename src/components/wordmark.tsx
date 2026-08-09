/**
 * Kannada-first wordmark: ವಿಚಾರಣೆ stacked over VICHARANE, preceded by the
 * Seal — a stamp impression whose ring is a 30-day dial (one tick per day a
 * PIO has to reply; the twelve o'clock tick is the deadline).
 */
import { Link } from "@tanstack/react-router";

type Size = "lg" | "sm";

const KANNADA_SIZE: Record<Size, string> = {
  lg: "text-[2.75rem] sm:text-[3.5rem]",
  sm: "text-[1.375rem]",
};

const LATIN_SIZE: Record<Size, string> = {
  lg: "text-[0.9375rem] sm:text-[1.1rem]",
  sm: "text-[0.5rem]",
};

const SEAL_PX: Record<Size, number> = { lg: 56, sm: 30 };

/** Same red as the overdue status. */
const DEADLINE_RED = "oklch(0.47 0.17 27)";

const CX = 64;
const CY = 64;
const RING_R = 47;
const TICK_INNER = 37.5;
const TICK_OUTER = 44.6;
const DEADLINE_OUTER = 51.2;
const TICK_COUNT = 30;
const STEP = 12;

function point(angleDeg: number, r: number) {
  const a = (angleDeg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
}

export function Seal({ size = 28, className = "" }: { size?: number; className?: string }) {
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const angle = -90 - (TICK_COUNT - 1) * STEP + i * STEP;
    const isDeadline = i === TICK_COUNT - 1;
    const [x1, y1] = point(angle, TICK_INNER);
    const [x2, y2] = point(angle, isDeadline ? DEADLINE_OUTER : TICK_OUTER);
    return { angle, isDeadline, x1, y1, x2, y2 };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      <g transform={`rotate(-7 ${CX} ${CY})`}>
        <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="currentColor" strokeWidth={3} />
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isDeadline ? DEADLINE_RED : "currentColor"}
            strokeWidth={t.isDeadline ? 3.4 : 1.5}
            strokeLinecap="butt"
          />
        ))}
        <text
          x={CX}
          y={CY}
          lang="kn"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          fontSize={46}
          style={{ fontFamily: "var(--font-kannada)" }}
        >
          ವಿ
        </text>
      </g>
    </svg>
  );
}

export function Wordmark({
  size = "sm",
  inline = false,
  link = false,
  withSeal = true,
  className = "",
}: {
  size?: Size;
  /** Kannada beside Latin on one line, for tight vertical space. */
  inline?: boolean;
  /** Wrap in a link to the landing page. */
  link?: boolean;
  /** Show the seal mark to the left of the lockup. */
  withSeal?: boolean;
  className?: string;
}) {
  const kannada = (
    <span
      lang="kn"
      // Kannada ascenders/descenders overshoot Latin: pin the line box
      // explicitly and step the weight down so it matches optically.
      className={`font-kannada font-medium leading-[1.5] ${KANNADA_SIZE[size]}`}
    >
      ವಿಚಾರಣೆ
    </span>
  );

  const latin = (
    <span
      className={`font-display font-bold uppercase leading-none tracking-[0.22em] text-muted-foreground ${LATIN_SIZE[size]}`}
    >
      Vicharane
    </span>
  );

  const stack = inline ? (
    <span className="flex items-baseline gap-2.5">
      {kannada}
      {latin}
    </span>
  ) : (
    <span className={`flex flex-col ${size === "lg" ? "gap-1" : "gap-0.5"}`}>
      {kannada}
      {latin}
    </span>
  );

  const mark = withSeal ? (
    <span className={`flex items-center ${size === "lg" ? "gap-4" : "gap-2.5"} ${className}`}>
      <Seal size={SEAL_PX[size]} />
      {stack}
    </span>
  ) : (
    <span className={`flex ${inline ? "items-baseline" : "flex-col"} ${className}`}>{stack}</span>
  );

  if (!link) return mark;

  return (
    <Link
      to="/"
      aria-label="Vicharane, home"
      className="pointer-events-auto inline-block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {mark}
    </Link>
  );
}
