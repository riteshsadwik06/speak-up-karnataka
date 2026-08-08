import { Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="font-display text-2xl leading-none">
            Vicharane
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link
              to="/dashboard"
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              Dashboard
            </Link>
            <Link
              to="/new"
              className="rounded-md bg-accent px-3 py-1.5 font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              New RTI
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.navigate({ to: "/auth" });
              }}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: string; children: ReactNode }) {
  const tones: Record<string, string> = {
    calm: "bg-secondary text-secondary-foreground",
    warn: "bg-warning/20 text-warning-foreground border border-warning/40",
    danger: "bg-destructive/12 text-destructive border border-destructive/30",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone] ?? tones["neutral"]}`}
    >
      {children}
    </span>
  );

}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="rule-heading mb-2">{children}</p>;
}
