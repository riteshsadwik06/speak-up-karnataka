import { Link, useRouter } from "@tanstack/react-router";
import { Wordmark } from "@/components/wordmark";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";
import { OFFICIALS_SOURCE } from "@/lib/officials";

const navBase = "block px-3 py-2 text-sm font-medium transition-colors";
const navIdle = `${navBase} text-muted-foreground hover:bg-secondary hover:text-foreground`;
const navActive = `${navBase} bg-foreground text-background`;


export function AppShell({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  const router = useRouter();


  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8">
      <div className="registry-frame mx-auto flex w-full max-w-6xl flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b border-border bg-background p-6 md:w-60 md:border-b-0 md:border-r">
          <h1>
            <Wordmark size="sm" />
          </h1>
          <p className="rule-heading mt-1.5">Public Records Tracker</p>

          <nav className="mt-8 space-y-1">
            <Link to="/dashboard" className={navIdle} activeProps={{ className: navActive }}>
              Registry
            </Link>
            <Link to="/new" className={navIdle} activeProps={{ className: navActive }}>
              New filing
            </Link>
            <Link to="/map" className={navIdle} activeProps={{ className: navActive }}>
              Ward map
            </Link>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.navigate({ to: "/auth" });
              }}
              className={`${navIdle} w-full text-left`}
            >
              Sign out
            </button>
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
      Officials data from{" "}
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
