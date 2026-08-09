/**
 * Kannada-first wordmark.
 * variant="mark" — ವಿ (first syllable) over VICHARANE. Header/footer.
 * variant="full" — ವಿಚಾರಣೆ over VICHARANE. Hero and auth page.
 * The Kannada line is always set in the brick red used for overdue states.
 */
import { Link } from "@tanstack/react-router";

type Size = "lg" | "sm";
type Variant = "mark" | "full";

/** Same brick red as the overdue status. */
export const BRAND_RED = "#8c3626";

const KANNADA_SIZE: Record<Size, string> = {
  lg: "text-[2.75rem] sm:text-[3.5rem]",
  sm: "text-[1.375rem]",
};

const LATIN_SIZE: Record<Size, string> = {
  lg: "text-[0.9375rem] sm:text-[1.1rem]",
  sm: "text-[0.5rem]",
};

export function Wordmark({
  size = "sm",
  variant = "mark",
  inline = false,
  link = true,
  className = "",
}: {
  size?: Size;
  variant?: Variant;
  /** Kannada beside Latin on one line, for tight vertical space. */
  inline?: boolean;
  /** Wrap in a link to the landing page. */
  link?: boolean;
  className?: string;
}) {
  const kannada = (
    <span
      lang="kn"
      // Kannada ascenders/descenders overshoot Latin: pin the line box
      // explicitly and step the weight down so it matches optically.
      className={`font-kannada font-medium leading-[1.5] ${KANNADA_SIZE[size]}`}
      style={{ color: BRAND_RED }}
    >
      {variant === "full" ? "ವಿಚಾರಣೆ" : "ವಿ"}
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

  const mark = (
    <span className={`flex ${inline ? "items-baseline" : "flex-col"} ${className}`}>{stack}</span>
  );

  if (!link) return mark;

  return (
    <Link
      to="/"
      aria-label="Vicharane home"
      className="pointer-events-auto inline-block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {mark}
    </Link>
  );
}
