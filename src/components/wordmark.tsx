/**
 * Kannada-first wordmark: ವಿಚಾರಣೆ stacked over VICHARANE.
 * No punctuation between the two lines — the pattern used on Namma Metro
 * and GBA signage. Latin stays in <title> tags; branding lives here.
 */
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Size = "lg" | "sm";

const KANNADA_SIZE: Record<Size, string> = {
  lg: "text-[2.75rem] sm:text-[3.5rem]",
  sm: "text-[1.375rem]",
};

const LATIN_SIZE: Record<Size, string> = {
  lg: "text-[0.9375rem] sm:text-[1.1rem]",
  sm: "text-[0.5rem]",
};

/** Signed-in users go to their registry; everyone else to the landing page. */
function useHomeTarget() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return signedIn ? "/dashboard" : "/";
}


export function Wordmark({
  size = "sm",
  inline = false,
  link = false,
  className = "",
}: {
  size?: Size;
  /** Kannada beside Latin on one line, for tight vertical space. */
  inline?: boolean;
  /** Wrap in a link home (registry when signed in, landing otherwise). */
  link?: boolean;
  className?: string;
}) {
  const to = useHomeTarget();

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

  const mark = inline ? (
    <span className={`flex items-baseline gap-2.5 ${className}`}>
      {kannada}
      {latin}
    </span>
  ) : (
    <span className={`flex flex-col ${size === "lg" ? "gap-1" : "gap-0.5"} ${className}`}>
      {kannada}
      {latin}
    </span>
  );

  if (!link) return mark;

  return (
    <Link to={to} aria-label="Vicharane home" className="pointer-events-auto inline-block">
      {mark}
    </Link>
  );
}

