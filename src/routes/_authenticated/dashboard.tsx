import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { KN_TEXT, useAuthorityLabel, useLang } from "@/lib/i18n";
import { WARDS } from "@/lib/wards";
import { AppShell, StatusPill } from "@/components/app-shell";
import { clockFor, consistencyIssue, daysBetween, LEGAL } from "@/lib/rti-data";
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
      { title: "Complaints & RTIs — Vicharane" },
      { name: "description", content: "Track every civic complaint and RTI application, and its deadline." },
      { property: "og:title", content: "Complaints & RTIs — Vicharane" },
      { property: "og:description", content: "Live day counters for every complaint and RTI you have filed." },
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
  complaint_ref: string | null;
  closure_claimed_date: string | null;
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
  const authorityLabel = useAuthorityLabel();
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
          "id, grievance_text, public_authority, ward_name, status, filed_date, response_due_date, reply_received_date, registration_number, complaint_ref, closure_claimed_date, is_seeded, created_at, stage, complaint_filed_date, escalation_count, transfer_date",
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

  const [seeding, setSeeding] = useState(false);
  const autoSeeded = useRef(false);

  useEffect(() => {
    if (autoSeeded.current) return;
    if (!isLoading && data && !data.apps.some((app) => app.is_seeded)) {
      autoSeeded.current = true;
      setSeeding(true);
      seed({ data: {} })
        .then(() => qc.invalidateQueries({ queryKey: ["applications"] }))
        .finally(() => setSeeding(false));
    }
  }, [isLoading, data, seed, qc]);

  async function loadDemo() {
    setSeeding(true);
    try {
      await seed({ data: { force: true } });
      await qc.invalidateQueries({ queryKey: ["applications"] });
      toast.success(t("demoDataLoaded"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load demo data");
    } finally {
      setSeeding(false);
    }
  }

  const byApp = data?.byApp ?? {};
  const allRows = [...(data?.apps ?? [])].sort(
    (a, b) => clockFor(a, byApp[a.id]).urgency - clockFor(b, byApp[b.id]).urgency,
  );
  const [wardFilter, setWardFilter] = useState<string>("");
  const rows = wardFilter ? allRows.filter((r) => r.ward_name === wardFilter) : allRows;
  const hasDemo = allRows.some((r) => r.is_seeded);
  /** One source of truth per row: either it is inconsistent, or it has a clock. */
  const issueFor = (r: AppRow) => consistencyIssue(r, byApp[r.id]);
  /** Counted only if it is actually being watched: filed, open, and coherent. */
  const liveCount = allRows.filter(
    (r) =>
      r.status !== "draft" &&
      r.status !== "closed" &&
      !issueFor(r) &&
      clockFor(r, byApp[r.id]).tone !== "neutral",
  ).length;

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
            <span lang={lang} className={lang === "kn" ? KN_TEXT : undefined}>
              {t("dashboardRecordSummary")
                .replace("{total}", String(allRows.length))
                .replace(
                  "{recordNoun}",
                  allRows.length === 1 ? t("dashboardRecordSingular") : t("dashboardRecordPlural"),
                )
                .replace("{live}", String(liveCount))}
            </span>
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
          ariaLabel={t("dashboardCityMapAriaLabel")}
        />
        <p lang={lang} className={`mono-stamp absolute bottom-2 left-4 ${lang === "kn" ? KN_TEXT : ""}`}>
          {litCount === 0
            ? t("dashboardNoApplicationsYet")
            : t("dashboardWardsWithLiveFilings")
                .replace("{n}", String(litCount))
                .replace("{noun}", litCount === 1 ? t("dashboardWardSingular") : t("dashboardWardPlural"))}
          {wardFilter
            ? ` · ${t("dashboardFilteredTo").replace("{ward}", wardKnFor(wardFilter) ?? wardFilter)}`
            : ""}
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
              {t("draftFirstRecord")}
            </span>
          </Link>
        </div>
      )}

      {groups.needs.length > 0 && (
        <Group title={t("groupNeedsYou")} count={groups.needs.length} tone="urgent">
          {groups.needs.map((r) => (
            <RecordRow key={r.id} row={r} urgent />
          ))}
        </Group>
      )}

      {groups.waiting.length > 0 && (
        <Group title={t("groupWaiting")} count={groups.waiting.length}>
          {groups.waiting.map((r) => (
            <RecordRow key={r.id} row={r} />
          ))}
        </Group>
      )}

      {groups.done.length > 0 && (
        <Group
          title={t("groupDone")}
          count={groups.done.length}
          collapsible
          open={doneOpen}
          onToggle={() => setDoneOpen((o) => !o)}
          toggleLabel={doneOpen ? t("groupHide") : t("groupShow")}
        >
          {doneOpen ? groups.done.map((r) => <RecordRow key={r.id} row={r} muted />) : null}
        </Group>
      )}


      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
        <p className="text-[11px] text-muted-foreground">{t("legalCalendarDays")}</p>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <button
          onClick={() => void loadDemo()}
          disabled={seeding}
          className="min-h-10 flex-1 border border-foreground bg-foreground px-3 py-2 text-[11px] font-bold uppercase tracking-tight text-background disabled:opacity-50 sm:flex-none"
        >
          <span lang={lang} className={lang === "kn" ? KN_TEXT : undefined}>
            {seeding ? t("demoDataLoading") : t("loadDemoData")}
          </span>
        </button>
        {hasDemo && (
          <button
            onClick={async () => {
              await clear();
              await qc.invalidateQueries({ queryKey: ["applications"] });
              toast.success(t("demoDataCleared"));
            }}
            className="min-h-10 flex-1 border border-border bg-background px-3 py-2 text-[11px] font-bold uppercase tracking-tight text-muted-foreground sm:flex-none"
          >
            <span lang={lang} className={lang === "kn" ? KN_TEXT : undefined}>
              {t("clearDemoData")}
            </span>
          </button>
        )}
        </div>
      </footer>
    </AppShell>
  );
}

