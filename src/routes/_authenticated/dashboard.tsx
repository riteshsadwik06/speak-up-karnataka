import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { KN_TEXT, useLang } from "@/lib/i18n";
import { AppShell, StatusPill } from "@/components/app-shell";
import { clockFor, daysBetween, LEGAL } from "@/lib/rti-data";
import { clearDemoData, seedDemoData } from "@/lib/rti.functions";
import { WardCity3D } from "@/components/ward-city-3d";
import { NEUTRAL } from "@/lib/ward-3d";
import { toast } from "sonner";

const TONE_COLOR: Record<string, string> = {
  danger: "#8c3626",
  warn: "#8a6220",
  calm: "#2c5c4f",
  neutral: "#6f6a5f",
};



export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "RTI registry — Vicharane" },
      { name: "description", content: "Track every RTI application and its statutory deadline." },
      { property: "og:title", content: "RTI registry — Vicharane" },
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
  registration_number: string | null;
  is_seeded: boolean;
  created_at: string;
  stage: string;
  complaint_filed_date: string | null;
  escalation_count: number;
  transfer_date: string | null;
};

function stamp(date: string | null) {
  return date ? date.replaceAll("-", ".") : "—";
}

function Dashboard() {
  const { lang, t } = useLang();
  const knCell = lang === "kn" ? `${KN_TEXT} normal-case` : "";
  /** Authoritative Kannada ward name from the ward asset — never machine-translated. */
  const wardKnFor = (name: string) =>
    lang === "kn" ? (WARDS.find((w) => w.ward_name === name)?.ward_name_kn ?? null) : null;
  const qc = useQueryClient();
  const seed = useServerFn(seedDemoData);
  const clear = useServerFn(clearDemoData);

  const { data, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          "id, grievance_text, public_authority, ward_name, status, filed_date, response_due_date, reply_received_date, registration_number, is_seeded, created_at, stage, complaint_filed_date, escalation_count, transfer_date",
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
  const allRows = [...(data?.apps ?? [])].sort(
    (a, b) => clockFor(a, byApp[a.id]).urgency - clockFor(b, byApp[b.id]).urgency,
  );
  const [wardFilter, setWardFilter] = useState<string>("");
  const rows = wardFilter ? allRows.filter((r) => r.ward_name === wardFilter) : allRows;
  const hasDemo = allRows.some((r) => r.is_seeded);
  const pending = allRows.filter((r) => r.status !== "draft" && r.status !== "closed").length;

  const RANK: Record<string, number> = { danger: 3, warn: 2, calm: 1, neutral: 0 };
  const wardTone = useMemo(() => {
    const m: Record<string, string> = {};
    for (const r of allRows) {
      if (!r.ward_name) continue;
      const tone = clockFor(r, byApp[r.id]).tone;
      const prev = m[r.ward_name];
      if (!prev || (RANK[tone] ?? 0) > (RANK[prev] ?? 0)) m[r.ward_name] = tone;
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const litCount = Object.keys(wardTone).length;

  return (
    <AppShell bare>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-6">
        <div>
          <h2 lang={lang} className={`font-display text-2xl ${lang === "kn" ? KN_TEXT : ""}`}>
            {t("registryTitle")}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Monitoring {pending} statutory {pending === 1 ? "deadline" : "deadlines"}.
          </p>
        </div>
        <Link
          to="/new"
          className="bg-foreground px-4 py-2 font-display text-sm font-bold text-background transition-transform hover:-translate-y-0.5"
        >
          <span lang={lang} className={lang === "kn" ? KN_TEXT : undefined}>
            {t("newFilingCta")}
          </span>
        </Link>
      </header>

      <section className="relative border-b border-border">
        <WardCity3D
          colorFor={(w) => {
            const tone = wardTone[w.n];
            return tone ? (TONE_COLOR[tone] ?? NEUTRAL) : NEUTRAL;
          }}
          colorKey={`${litCount}:${Object.entries(wardTone).sort().join(",")}`}
          onWardClick={(w) => {
            if (wardTone[w.n]) setWardFilter((cur) => (cur === w.n ? "" : w.n));
          }}

          className="h-[180px] w-full sm:h-[220px]"
        />
        <p className="mono-stamp absolute bottom-2 left-4">
          {litCount === 0
            ? "No applications yet."
            : `${litCount} ${litCount === 1 ? "ward" : "wards"} with live filings`}
          {wardFilter ? ` · filtered to ${wardFilter}` : ""}
        </p>
        {wardFilter && (
          <button
            onClick={() => setWardFilter("")}
            className="absolute bottom-2 right-4 text-[11px] font-bold uppercase tracking-tight underline"
          >
            <span lang={lang} className={lang === "kn" ? KN_TEXT : undefined}>
              {t("clearFilter")}
            </span>
          </button>
        )}
      </section>


      {isLoading && <p className="p-6 text-sm text-muted-foreground">{t("loading")}</p>}

      {!isLoading && rows.length === 0 && (
        <div className="p-10 text-center">
          <p lang={lang} className={`font-display text-xl ${lang === "kn" ? KN_TEXT : ""}`}>{t("nothingFiled")}</p>
          <Link to="/new" className="mt-4 inline-block bg-foreground px-4 py-2 text-sm font-bold text-background">
            <span lang={lang} className={lang === "kn" ? KN_TEXT : undefined}>
              {t("draftFirstRti")}
            </span>
          </Link>
        </div>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-background text-left">
                <th className={`rule-heading p-4 ${knCell}`}>{t("colRefStatus")}</th>
                <th className={`rule-heading p-4 ${knCell}`}>{t("colGrievance")}</th>
                <th className={`rule-heading hidden p-4 sm:table-cell ${knCell}`}>{t("colTimeline")}</th>
                <th className={`rule-heading p-4 text-right ${knCell}`}>{t("colDeadline")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const clock = clockFor(row, byApp[row.id]);
                const day = row.filed_date ? daysBetween(row.filed_date) : 0;
                const pct = Math.min(100, Math.round((day / LEGAL.pioDays) * 100));
                return (
                  <tr key={row.id} className="group transition-colors hover:bg-muted">
                    <td className="p-4 align-top">
                      <div className="mono-stamp mb-1.5">{row.registration_number ?? "———"}</div>
                      <StatusPill tone={clock.tone}>
                        <span lang={lang} className={lang === "kn" ? KN_TEXT : undefined}>
                          {row.status === "draft"
                            ? t("statusNotFiled")
                            : clock.tone === "danger"
                              ? t("statusActionDue")
                              : t("statusInProgress")}
                        </span>
                      </StatusPill>
                    </td>
                    <td className="p-4 align-top">
                      <Link to="/applications/$id" params={{ id: row.id }} className="block">
                        <h3
                          className={`font-display text-sm font-semibold leading-tight group-hover:underline ${row.status === "draft" ? "text-muted-foreground" : ""}`}
                        >
                          {row.grievance_text}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.public_authority}
                          {row.ward_name ? ` • ${wardKnFor(row.ward_name) ?? row.ward_name}` : ""}
                          {row.is_seeded ? " • demo" : ""}
                          {row.stage === "complaint" ? " • complaint" : ""}
                        </p>
                      </Link>
                    </td>
                    <td className="hidden p-4 align-top sm:table-cell">
                      {row.filed_date ? (
                        <div className="flex flex-col gap-1.5">
                          <span className="mono-stamp">{t("filedOn")} {stamp(row.filed_date)}</span>
                          <div className="h-1 w-28 bg-secondary">
                            <div className="h-full bg-foreground" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span lang={lang} className={`text-xs italic text-muted-foreground ${lang === "kn" ? KN_TEXT : ""}`}>{t("awaitingAction")}</span>
                      )}
                    </td>
                    <td className="p-4 text-right align-top">
                      <div
                        className={`font-display text-base font-bold ${row.status === "draft" ? "text-muted-foreground/40" : ""}`}
                      >
                        {`${t("day")} ${row.filed_date ? day : 0}`}
                      </div>
                      <div
                        className={`mt-0.5 text-[10px] font-bold uppercase leading-tight ${clock.tone === "danger" ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        {clock.label}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
        <p className="text-[11px] text-muted-foreground">{LEGAL.calendarDays}</p>
        {hasDemo && (
          <button
            onClick={async () => {
              await clear();
              await qc.invalidateQueries({ queryKey: ["applications"] });
              toast.success("Demo data cleared");
            }}
            className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground underline"
          >
            Clear demo data
          </button>
        )}
      </footer>
    </AppShell>
  );
}

