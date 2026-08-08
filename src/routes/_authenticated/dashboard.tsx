import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusPill } from "@/components/app-shell";
import { clockFor, LEGAL, STATUS_LABEL } from "@/lib/rti-data";
import { clearDemoData, seedDemoData } from "@/lib/rti.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your RTI applications — Vicharane" },
      { name: "description", content: "Track every RTI application and its statutory deadline." },
      { property: "og:title", content: "Your RTI applications — Vicharane" },
      { property: "og:description", content: "Live day counters for every RTI you have filed." },
    ],
  }),
  component: Dashboard,
});

type AppRow = {
  id: string;
  grievance_text: string;
  public_authority: string;
  ward_name: string | null;
  status: string;
  filed_date: string | null;
  response_due_date: string | null;
  reply_received_date: string | null;
  is_seeded: boolean;
  created_at: string;
};

function Dashboard() {
  const qc = useQueryClient();
  const seed = useServerFn(seedDemoData);
  const clear = useServerFn(clearDemoData);

  const { data, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          "id, grievance_text, public_authority, ward_name, status, filed_date, response_due_date, reply_received_date, is_seeded, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      const apps = data as AppRow[];
      const ids = apps.map((a) => a.id);
      let appeals: { application_id: string; tier: string; filed_date: string | null }[] = [];
      if (ids.length) {
        const { data: ap } = await supabase
          .from("appeals")
          .select("application_id, tier, filed_date")
          .in("application_id", ids);
        appeals = ap ?? [];
      }
      const byApp: Record<string, { tier: string; filed_date: string | null }[]> = {};
      for (const a of appeals) {
        (byApp[a.application_id] ??= []).push({ tier: a.tier, filed_date: a.filed_date });
      }
      return { apps, byApp };
    },
  });

  useEffect(() => {
    if (!isLoading && data && data.apps.length === 0) {
      seed().then(() => qc.invalidateQueries({ queryKey: ["applications"] }));
    }
  }, [isLoading, data, seed, qc]);

  const byApp = data?.byApp ?? {};
  const rows = [...(data?.apps ?? [])].sort(
    (a, b) => clockFor(a, byApp[a.id]).urgency - clockFor(b, byApp[b.id]).urgency,
  );
  const hasDemo = rows.some((r) => r.is_seeded);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl">Your applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sorted by urgency. {LEGAL.calendarDays}
          </p>
        </div>
        {hasDemo && (
          <button
            onClick={async () => {
              await clear();
              await qc.invalidateQueries({ queryKey: ["applications"] });
              toast.success("Demo data cleared");
            }}
            className="ml-auto rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
          >
            Clear demo data
          </button>
        )}
      </div>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}

      {!isLoading && rows.length === 0 && (
        <div className="paper-card mt-8 p-8 text-center">
          <p className="font-display text-2xl">Nothing filed yet</p>
          <Link
            to="/new"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
          >
            Draft your first RTI
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {rows.map((row) => {
          const clock = clockFor(row);
          return (
            <Link
              key={row.id}
              to="/applications/$id"
              params={{ id: row.id }}
              className="paper-card block p-4 transition-colors hover:border-accent/50 sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={clock.tone}>{clock.label}</StatusPill>
                <span className="rule-heading">{STATUS_LABEL[row.status] ?? row.status}</span>
                {row.is_seeded && (
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                    Demo data
                  </span>
                )}
              </div>
              <p className="mt-2 line-clamp-2 font-display text-lg leading-snug">
                {row.grievance_text}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {row.public_authority}
                {row.ward_name ? ` · ${row.ward_name} ward` : ""}
                {row.filed_date ? ` · filed ${row.filed_date}` : ""}
                {row.response_due_date ? ` · reply due ${row.response_due_date}` : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
