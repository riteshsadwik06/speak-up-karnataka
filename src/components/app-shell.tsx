import { Link, useRouter } from "@tanstack/react-router";
import { Wordmark } from "@/components/wordmark";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, type ReactNode } from "react";
import { OFFICIALS_SOURCE } from "@/lib/officials";
import { LangToggle, useLang, T } from "@/lib/i18n";

const navBase = "block px-3 py-2 text-sm font-medium leading-[1.6] transition-colors";
const navIdle = `${navBase} text-muted-foreground hover:bg-secondary hover:text-foreground`;
const navActive = `${navBase} bg-foreground text-background`;

/**
 * Sign out is destructive and sits in the sidebar, so it must never be reached
 * by a stray Enter: it takes two deliberate activations, and it is last in the
 * sidebar tab order.
 */
function SignOutButton() {
  const router = useRouter();
  const { t } = useLang();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <button
      type="button"
      autoFocus={false}
      onBlur={() => setArmed(false)}
      onClick={async () => {
        if (!armed) {
          setArmed(true);
          return;
        }
        await supabase.auth.signOut();
        router.navigate({ to: "/auth" });
      }}
      className={`${navIdle} w-full text-left ${armed ? "border border-foreground text-foreground" : ""}`}
    >
      {armed ? t("navSignOutConfirm") : t("navSignOut")}
    </button>
  );
}

export function AppShell({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  const { t } = useLang();




  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8">
      <div className="registry-frame mx-auto flex w-full max-w-6xl flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b border-border bg-background p-6 md:w-60 md:border-b-0 md:border-r">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1>
                <Wordmark size="sm" />
              </h1>
              <p className="rule-heading mt-1.5">{t("tagline")}</p>
            </div>
            <LangToggle />
          </div>

          <nav className="mt-8 space-y-1">
            <Link to="/dashboard" className={navIdle} activeProps={{ className: navActive }}>
              {t("navRegistry")}
            </Link>
            <Link to="/new" className={navIdle} activeProps={{ className: navActive }}>
              {t("navNewFiling")}
            </Link>
            <Link to="/map" className={navIdle} activeProps={{ className: navActive }}>
              {t("navWardMap")}
            </Link>

            <SignOutButton />

          </nav>
        </aside>

        <main className={`min-w-0 flex-1 ${bare ? "" : "p-6"}`}>{children}</main>
      </div>
      <DataCredit className="mx-auto mt-3 w-full max-w-6xl" />
    </div>

  );
}

export function StatusPill({ tone, children }: { tone: string; children: ReactNode }) {
  const tones: Record<string, string> = {
    calm: "border border-foreground text-foreground",
    warn: "border border-foreground text-foreground",
    danger: "border border-foreground bg-foreground text-background",
    neutral: "border border-dashed border-muted-foreground text-muted-foreground",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tones[tone] ?? tones["neutral"]}`}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="rule-heading mb-2">{children}</p>;
}

export function DataCredit({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] text-muted-foreground ${className}`}>
      <T id="officialsDataCredit" as="span" />{" "}
      <a
        href={OFFICIALS_SOURCE}
        target="_blank"
        rel="noreferrer noopener"
        className="underline underline-offset-2"
      >
        Bengawalk City Officials
      </a>
      , CC BY 4.0
    </p>
  );
}
