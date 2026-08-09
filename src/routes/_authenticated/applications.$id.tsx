import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, SectionLabel, StatusPill } from "@/components/app-shell";
import {
  addDays,
  appealGroundLabel,
  clockFor,
  complaintChannel,
  COMPLAINT_ESCALATION_NOTE,
  COMPLAINT_EXPECTATION_DAYS,
  COMPLAINT_NOT_STATUTORY,

  daysBetween,
  LEGAL,
  PORTAL_AUTHORITIES,
  portalAuthorityKind,
  PORTAL_LINKS,
  portalZoneForGbaZone,
  PORTAL_MAX_CHARS,
  SPLIT_ADVISORY,
  STATUS_LABEL,
  STATUS_LABEL_KN,
  today,
  toPortalSafe,
  WARDS,
  type StageRailId,
} from "@/lib/rti-data";
import { StageRail } from "@/components/stage-rail";
import { WardInset3D } from "@/components/ward-inset-3d";
import {
  OfficialsCaveat,
  OfficialsCredit,
  OfficialsList,
  OfficialsSkeleton,
  relevantOfficials,
  useWardOfficials,
} from "@/components/officials";
import { generateAppealDraft, generateDraft } from "@/lib/rti.functions";
import { toast } from "sonner";
import { KN_TEXT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/applications/$id")({
  head: () => ({
    meta: [
      { title: "RTI application — Vicharane" },
      { name: "description", content: "The full application, its timeline, and your next legal step." },
      { property: "og:title", content: "RTI application — Vicharane" },
      { property: "og:description", content: "Track the statutory clock and draft appeals on time." },
    ],
  }),
  component: Detail,
});

type Appeal = {
  id: string;
  tier: string;
  grounds: string;
  body: string;
  body_kn: string | null;
  filed_date: string | null;
  due_date: string | null;
  created_at: string;
  registration_number: string | null;
  portal_ground: string | null;
};

const ONLINE_PAYMENT_IDS = ["paymentModeNetbanking", "paymentModeCard", "paymentModeUpi"] as const;
const POSTAL_PAYMENT_IDS = ["paymentModeIpo", "paymentModeDd", "paymentModeStamp"] as const;

const APPEAL_GROUND_IDS: Record<
  string,
  "appealGroundRefused" | "appealGroundNoResponse" | "appealGroundExcessFee" | "appealGroundIncomplete" | "appealGroundOther"
> = {
  refused: "appealGroundRefused",
  no_response: "appealGroundNoResponse",
  excess_fee: "appealGroundExcessFee",
  incomplete: "appealGroundIncomplete",
  other: "appealGroundOther",
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25";

function Detail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const makeAppeal = useServerFn(generateAppealDraft);
  const makeDraft = useServerFn(generateDraft);
  const { lang, t } = useLang();
  const [busy, setBusy] = useState(false);
  const [filedDate, setFiledDate] = useState(today());
  const [regNumber, setRegNumber] = useState("");
  const [replyDate, setReplyDate] = useState(today());
  const [replyNotes, setReplyNotes] = useState("");
  const [transferDate, setTransferDate] = useState(today());
  const [transferTo, setTransferTo] = useState("");
  const [transferReg, setTransferReg] = useState("");
  const [appealReg, setAppealReg] = useState<Record<string, string>>({});
  const [portalChoice, setPortalChoice] = useState("");
  /** Which version of a letter is on screen. Kannada is postal-only. */
  const [letterVersion, setLetterVersion] = useState<"en" | "kn">(lang === "kn" ? "kn" : "en");
  const [showClosure, setShowClosure] = useState(false);
  const [closureDate, setClosureDate] = useState(today());
  const [stillWrong, setStillWrong] = useState("");
  const [sentRef, setSentRef] = useState("");
  const groundLabel = (g: string | null) => {
    const key = g ? APPEAL_GROUND_IDS[g] : undefined;
    return key ? t(key) : (appealGroundLabel(g) ?? "");
  };



  const { data, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const [app, appeals] = await Promise.all([
        supabase.from("applications").select("*").eq("id", id).single(),
        supabase.from("appeals").select("*").eq("application_id", id).order("created_at"),
      ]);
      if (app.error) throw app.error;
      return { app: app.data, appeals: (appeals.data ?? []) as Appeal[] };
    },
  });

  async function patch(values: Partial<{
    status: string;
    stage: string;
    filed_date: string | null;
    response_due_date: string | null;
    reply_received_date: string | null;
    reply_notes: string | null;
    registration_number: string | null;
    transferred_to: string | null;
    transfer_date: string | null;
    transfer_registration_number: string | null;
    portal_authority: string | null;
    complaint_ref: string | null;
    complaint_filed_date: string | null;
    closure_claimed_date: string | null;
    escalation_count: number;
    generated_requests: { text: string; rationale: string }[];
    application_body: string;
    application_body_kn: string | null;
  }>) {
    const { error } = await supabase.from("applications").update(values).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["application", id] });
    await qc.invalidateQueries({ queryKey: ["applications"] });
  }

  if (isLoading || !data) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </AppShell>
    );
  }

  const app = data.app;
  const clock = clockFor(app, data.appeals);
  const requests = (app.generated_requests as { text: string; rationale: string }[]) ?? [];
  const firstAppeal = data.appeals.find((a) => a.tier === "first");
  const secondAppeal = data.appeals.find((a) => a.tier === "second");
  const clockStart = app.transfer_date ?? app.filed_date;
  const overdue = clockStart ? daysBetween(clockStart) > LEGAL.pioDays : false;
  const faaSilentDays = firstAppeal?.filed_date ? daysBetween(firstAppeal.filed_date) : 0;
  const secondAvailable = !!firstAppeal && faaSilentDays >= LEGAL.secondAppealAfterDays && !secondAppeal;
  // Portal-safe text is ALWAYS derived from the English body. toPortalSafe strips
  // non-Latin characters, so running it over the Kannada version would empty it.
  const portalSafeBody = toPortalSafe(app.application_body);
  const bodyKn = (app.application_body_kn as string | null) ?? "";
  const showKn = !!bodyKn && letterVersion === "kn";
  const overLimit = portalSafeBody.length > PORTAL_MAX_CHARS;
  const wardRecord = WARDS.find((w) => w.ward_id === app.ward_id);
  const wardZone = wardRecord?.zone_name ?? null;
  const wardKn = lang === "kn" ? (wardRecord?.ward_name_kn ?? null) : null;
  const kind = portalAuthorityKind(app.public_authority);
  const autoZone = kind === "bbmp" ? portalZoneForGbaZone(wardZone) : null;
  const savedPortal = app.portal_authority as string | null;
  const portalOptions =
    kind === "bwssb" ? [...PORTAL_AUTHORITIES.bwssbUnits] : [...PORTAL_AUTHORITIES.bbmpZones];
  const portalValue = savedPortal ?? autoZone ?? "";


  async function draftAppeal(tier: "first" | "second", reason: string, portalGround?: string) {
    setBusy(true);
    try {
      await makeAppeal({ data: { applicationId: id, tier, reason, portalGround, lang } });
      await qc.invalidateQueries({ queryKey: ["application", id] });
      toast.success(
        `${tier === "first" ? t("firstAppeal") : t("secondAppeal")} ${t("draftedSuffix")}`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("couldNotDraftAppeal"));
    } finally {
      setBusy(false);
    }
  }

  async function escalate() {
    await patch({ escalation_count: (app.escalation_count ?? 0) + 1 });
    toast.success(t("escalationRecordedToast"));
  }

  async function promoteToRti() {
    if (stillWrong.trim().length < 10) {
      toast.error(t("stillWrongTooShortError"));
      return;
    }
    setBusy(true);
    try {
      const result = await makeDraft({
        data: {
          grievance: app.grievance_text,
          authority: app.public_authority,
          ward: app.ward_name,
          language: app.language,
          lang,
          falseClosure: {
            ref: app.complaint_ref ?? "",
            complaintText: app.complaint_text ?? app.grievance_text,
            filedDate: app.complaint_filed_date,
            closureDate: closureDate || null,
            whatIsStillWrong: stillWrong,
          },
        },
      });
      await patch({
        stage: "rti",
        status: "draft",
        closure_claimed_date: closureDate || null,
        generated_requests: result.draft.requests,
        application_body: result.body,
        application_body_kn: result.bodyKn ?? null,
      });
      toast.success(t("rtiDraftedToast"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("couldNotDraftRtiError"));
    } finally {
      setBusy(false);
    }
  }

  const currentStage: StageRailId =
    app.stage === "complaint"
      ? (app.escalation_count ?? 0) > 0
        ? "escalation"
        : "complaint"
      : secondAppeal
        ? "second_appeal"
        : firstAppeal
          ? "first_appeal"
          : "rti";

  const railCompleted: StageRailId[] =
    app.stage === "complaint" ? [] : app.complaint_ref || app.complaint_filed_date ? ["complaint"] : [];

  const header = (
    <>
      <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
        {t("allApplications")}
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill tone={clock.tone}>
          <span lang={lang} className={lang === "kn" ? KN_TEXT : undefined}>
            {lang === "kn" ? clock.labelKn : clock.label}
          </span>
        </StatusPill>
        {clock.tone !== "danger" && (
          <span lang={lang} className={`rule-heading ${lang === "kn" ? KN_TEXT : ""}`}>
            {(lang === "kn" ? STATUS_LABEL_KN[app.status] : STATUS_LABEL[app.status]) ??
              STATUS_LABEL[app.status] ??
              app.status}
          </span>
        )}
        {app.is_seeded && (
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
            {t("demoDataBadge")}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-snug sm:text-3xl">{app.grievance_text}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {app.public_authority}
            {app.ward_name ? ` · ${wardKn ?? app.ward_name} ${t("wardSuffix")}` : ""}
          </p>
          {wardKn ? (
            <p className="text-xs text-muted-foreground/70">{app.ward_name}</p>
          ) : null}
        </div>
        {app.ward_id && (
          <div className="hidden w-36 shrink-0 sm:block">
            <WardInset3D
              wardId={app.ward_id}
              corporation={WARDS.find((w) => w.ward_id === app.ward_id)?.corporation ?? ""}
              height={100}
            />
          </div>
        )}
      </div>

      <div className="mt-4">
        <StageRail current={currentStage} completed={railCompleted} />
      </div>
    </>
  );

  if (app.stage === "complaint") {
    const channel = complaintChannel(app.complaint_channel);
    return (
      <AppShell>
        {header}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5">
            <div className="paper-card p-5">
              <SectionLabel>{t("sectionComplaint")}</SectionLabel>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {app.complaint_text}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(app.complaint_text ?? "");
                  toast.success(t("copied"));
                }}
                className="mt-3 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
              >
                {t("copy")}
              </button>
            </div>

            {app.ward_name ? (
              <ResponsibleOfficials
                wardName={app.ward_name}
                category={app.grievance_text ?? ""}
              />
            ) : null}

            <div className="paper-card p-5">
              <SectionLabel>{t("sectionWhatNext")}</SectionLabel>
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  disabled={busy}
                  onClick={() => void escalate()}
                  className="rounded-md border border-border px-3 py-2 text-xs hover:bg-secondary disabled:opacity-50"
                >
                  {t("btnEscalate")}
                </button>
                <button
                  disabled={busy}
                  onClick={() => setShowClosure((v) => !v)}
                  className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs hover:bg-destructive/10 disabled:opacity-50"
                >
                  {t("btnFalseClosure")}
                </button>
                <button
                  disabled={busy}
                  onClick={() => void patch({ status: "closed" })}
                  className="rounded-md border border-border px-3 py-2 text-xs hover:bg-secondary disabled:opacity-50"
                >
                  {t("btnFixed")}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{COMPLAINT_ESCALATION_NOTE}</p>
              {(app.escalation_count ?? 0) > 0 && (
                <p className="mt-1 text-xs">
                  {t("escalatedPrefix")} {app.escalation_count}{" "}
                  {app.escalation_count === 1 ? t("escalatedTimeSingular") : t("escalatedTimePlural")}
                </p>
              )}

              {showClosure && (
                <div className="mt-4 space-y-3 rounded-md border border-border p-3">
                  <label className="block text-xs text-muted-foreground">
                    {t("closureDateLabel")}
                    <input
                      type="date"
                      value={closureDate}
                      onChange={(e) => setClosureDate(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    {t("stillWrongLabel")}
                    <textarea
                      value={stillWrong}
                      onChange={(e) => setStillWrong(e.target.value)}
                      rows={3}
                      className={`${inputClass} mt-1 resize-y`}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">{t("rtiFromClosureExplanation")}</p>
                  <button
                    disabled={busy}
                    onClick={() => void promoteToRti()}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {busy ? t("draftingEllipsis") : t("btnDraftRtiClosure")}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="paper-card p-5">
              <SectionLabel>{t("sectionWhereItWent")}</SectionLabel>
              {channel ? (
                <>
                  <p className="text-sm font-medium">{channel.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{channel.note}</p>
                  {"phone" in channel && channel.phone ? (
                    <p className="mt-1 font-mono text-xs">{channel.phone}</p>
                  ) : null}
                  {"url" in channel && channel.url ? (
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-xs underline"
                    >
                      {channel.url}
                    </a>
                  ) : null}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">{t("channelNotRecorded")}</p>
              )}
            </div>

            <div className="paper-card p-5">
              <SectionLabel>{t("sectionTimeline")}</SectionLabel>
              <dl className="space-y-1.5 text-sm">
                <TimelineRow label={t("complaintReferenceLabel")} value={app.complaint_ref ?? "—"} />
                <TimelineRow
                  label={t("sentOnLabel")}
                  value={app.complaint_filed_date ?? t("notSentYet")}
                />
                <TimelineRow
                  label={t("serviceExpectationLabel")}
                  value={`${COMPLAINT_EXPECTATION_DAYS} ${t("serviceExpectationDaysSuffix")}`}
                />
                <TimelineRow label={t("markedResolvedLabel")} value={app.closure_claimed_date ?? "—"} />
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">{COMPLAINT_NOT_STATUTORY}</p>

            </div>

            {!app.complaint_filed_date && (
              <div className="paper-card p-5">
                <SectionLabel>{t("sectionMarkAsSent")}</SectionLabel>
                <div className="space-y-2">
                  <input
                    value={sentRef}
                    onChange={(e) => setSentRef(e.target.value)}
                    placeholder={t("placeholderComplaintRef")}
                    className={inputClass}
                  />
                  <input
                    type="date"
                    value={filedDate}
                    onChange={(e) => setFiledDate(e.target.value)}
                    className={inputClass}
                  />
                  <button
                    onClick={() =>
                      void patch({
                        status: "filed",
                        complaint_ref: sentRef.trim() || null,
                        complaint_filed_date: filedDate,
                      })
                    }
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    {t("btnStartClock")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {header}



      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <div className="paper-card p-5">
            <SectionLabel>{t("informationRequested")}</SectionLabel>
            <ol className="space-y-3">
              {requests.map((r, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">
                    {i + 1}. {r.text}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">{r.rationale}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="paper-card p-5">
            <div className="flex flex-wrap items-center gap-3">
              <SectionLabel>{t("theApplication")}</SectionLabel>
              <div className="mb-2 ml-auto flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(app.application_body);
                    toast.success(t("copied"));
                  }}
                  className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  {t("copy")}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(portalSafeBody);
                    toast.success(t("toastPortalSafeCopied"));
                  }}
                  className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  {t("copyPortalSafe")}
                </button>
                {bodyKn ? (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(bodyKn);
                      toast.success(t("toastKannadaCopied"));
                    }}
                    className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                  >
                    {t("copyKannadaButton")}
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    const blob = new Blob([app.application_body], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `rti-application-${id.slice(0, 8)}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  {t("download")}
                </button>
              </div>
            </div>

            {bodyKn ? (
              <>
                <p className="mb-3 text-xs text-muted-foreground">
                  {t("portalLatinOnlyNoticeApplication")}
                </p>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setLetterVersion("kn")}
                    className={`rounded-md border px-3 py-1.5 text-xs ${showKn ? "border-accent bg-accent/10" : "border-border hover:bg-secondary"}`}
                  >
                    {t("letterKannadaPostalOnly")}
                  </button>
                  <button
                    onClick={() => setLetterVersion("en")}
                    className={`rounded-md border px-3 py-1.5 text-xs ${!showKn ? "border-accent bg-accent/10" : "border-border hover:bg-secondary"}`}
                  >
                    {t("letterEnglishPortal")}
                  </button>
                </div>
              </>
            ) : null}

            <pre className="whitespace-pre-wrap rounded-md bg-secondary/60 p-4 font-mono text-xs leading-relaxed">
              {showKn ? bodyKn : app.application_body}
            </pre>
            {bodyKn ? (
              showKn ? (
                <div className="mt-3 rounded-md border border-border p-3 text-xs">
                  <p className="rule-heading">{t("howToFileVersionHeading")}</p>
                  <ol className="mt-1 list-decimal space-y-1 pl-4 text-muted-foreground">
                    <li>{t("fileKnStep1")}</li>
                    <li>{t("fileKnStep2")}</li>
                    <li>{t("fileKnStep3")}</li>
                    <li>{t("fileKnStep4")}</li>
                  </ol>
                </div>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">{t("fileEnUsePortalNotice")}</p>
              )
            ) : null}
            <p className={`mt-2 font-mono text-xs ${overLimit ? "text-warning" : "text-muted-foreground"}`}>
              {t("charactersOfLimit")
                .replace("{count}", portalSafeBody.length.toLocaleString())
                .replace("{limit}", PORTAL_MAX_CHARS.toLocaleString())}
            </p>
            {overLimit && (
              <p className="mt-1 text-xs text-warning">{t("overLimitWarning")}</p>
            )}
          </div>


          {data.appeals.map((ap) => (
            <div key={ap.id} className="paper-card border-accent/40 p-5">
              <SectionLabel>
                <span lang={lang} className={lang === "kn" ? `${KN_TEXT} normal-case` : undefined}>
                  {ap.tier === "first" ? t("firstAppeal") : t("secondAppeal")}
                </span>{" "}
                — {ap.tier === "first" ? t("sectionNumberFirst") : t("sectionNumberSecond")}
              </SectionLabel>
              <p className="text-xs text-muted-foreground">
                {t("groundsLabel")}: {ap.grounds}
                {ap.filed_date
                  ? ` · ${t("filedOnMiddot")} ${ap.filed_date}`
                  : ` · ${t("notFiledYetMiddot")}`}
                {ap.tier === "first"
                  ? ap.due_date
                    ? ` · ${t("faaDecisionDueMiddot")} ${ap.due_date}`
                    : ""
                  : ` · ${t("noStatutoryDisposalSecond")}`}
              </p>
              {ap.tier === "first" && appealGroundLabel(ap.portal_ground) && (
                <p className="mt-1 text-xs font-medium">
                  {t("portalGroundToSelectLabel")}: {groundLabel(ap.portal_ground)}
                </p>
              )}
              {ap.registration_number && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {t("registrationNumber")}: {ap.registration_number}
                </p>
              )}
              {ap.body_kn ? (
                <>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t("portalLatinOnlyNoticeAppeal")}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => setLetterVersion("kn")}
                      className={`rounded-md border px-3 py-1.5 text-xs ${letterVersion === "kn" ? "border-accent bg-accent/10" : "border-border hover:bg-secondary"}`}
                    >
                      {t("letterKannadaPostalOnly")}
                    </button>
                    <button
                      onClick={() => setLetterVersion("en")}
                      className={`rounded-md border px-3 py-1.5 text-xs ${letterVersion === "en" ? "border-accent bg-accent/10" : "border-border hover:bg-secondary"}`}
                    >
                      {t("letterEnglishPortal")}
                    </button>
                  </div>
                </>
              ) : null}
              <pre className="mt-3 whitespace-pre-wrap rounded-md bg-secondary/60 p-4 font-mono text-xs leading-relaxed">
                {ap.body_kn && letterVersion === "kn" ? ap.body_kn : ap.body}
              </pre>
              {ap.body_kn && letterVersion === "kn" ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("postThisVersionNote")}
                </p>
              ) : null}
              {!ap.filed_date && (
                <div className="mt-3">
                  <label className="rule-heading block">{t("portalRegNumberOptionalLabel")}</label>
                  <input
                    value={appealReg[ap.id] ?? ""}
                    onChange={(e) => setAppealReg((s) => ({ ...s, [ap.id]: e.target.value }))}
                    placeholder="RTIPM/A/2026/60025"
                    className={inputClass}
                  />
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ap.body);
                    toast.success(t("copied"));
                  }}
                  className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  {t("copy")}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(toPortalSafe(ap.body));
                    toast.success(t("toastPortalSafeCopied"));
                  }}
                  className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  {t("copyPortalSafe")}
                </button>
                {ap.body_kn ? (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(ap.body_kn!);
                      toast.success(t("toastKannadaCopied"));
                    }}
                    className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                  >
                    {t("copyKannadaButton")}
                  </button>
                ) : null}
                {!ap.filed_date && (
                  <button
                    onClick={async () => {
                      const { error } = await supabase
                        .from("appeals")
                        .update({
                          filed_date: today(),
                          due_date: ap.tier === "first" ? addDays(today(), 45) : null,
                          registration_number: appealReg[ap.id]?.trim() || null,
                        })
                        .eq("id", ap.id);
                      if (error) {
                        toast.error(error.message);
                        return;
                      }
                      await patch({
                        status: ap.tier === "first" ? "first_appeal_filed" : "second_appeal_filed",
                      });
                      toast.success(t("toastMarkedFiled"));
                    }}
                    className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
                  >
                    {t("btnMarkAppealFiled")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="paper-card p-5">
            <SectionLabel>{t("sectionTimeline")}</SectionLabel>
            <ul className="space-y-2 text-sm">
              <TimelineRow label={t("timelineCreated")} value={String(app.created_at).slice(0, 10)} />
              <TimelineRow label={t("filedOn")} value={app.filed_date ?? "—"} />
              {app.registration_number && (
                <>
                  <TimelineRow label={t("registrationNumber")} value={app.registration_number} />
                  <li className="text-xs">
                    <a
                      href={PORTAL_LINKS.onlineRequestStatus}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-4"
                    >
                      {t("checkStatusPortalLink")}
                    </a>
                  </li>
                </>
              )}
              {app.transfer_date && (
                <TimelineRow label={t("timelineTransferred")} value={app.transfer_date} />
              )}
              {app.transferred_to && (
                <TimelineRow label={t("timelineTransferredTo")} value={app.transferred_to} />
              )}
              {app.transfer_registration_number && (
                <TimelineRow
                  label={t("timelineNewRegNumber")}
                  value={app.transfer_registration_number}
                />
              )}
              <TimelineRow
                label={
                  app.transfer_date ? t("replyDueTransfer") : t("replyDueFiled")
                }
                value={app.response_due_date ?? "—"}
              />
              <TimelineRow label={t("timelineReplyReceived")} value={app.reply_received_date ?? "—"} />
              {firstAppeal && (
                <TimelineRow
                  label={`${t("firstAppeal")} ${t("filedSuffix")}`}
                  value={firstAppeal.filed_date ?? t("draftedValue")}
                />
              )}
              {secondAppeal && (
                <TimelineRow
                  label={`${t("secondAppeal")} ${t("filedSuffix")}`}
                  value={secondAppeal.filed_date ?? t("draftedValue")}
                />
              )}
            </ul>

            {app.reply_notes && (
              <p className="mt-3 rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
                {app.reply_notes}
              </p>
            )}
          </div>

          {kind !== "none" && (
            <div className="paper-card p-5">
              <SectionLabel>{t("sectionPortalSelect")}</SectionLabel>
              <p className="text-sm text-muted-foreground">{t("gbaReorgNotice")}</p>

              {kind === "bescom" ? (
                <PortalString value={PORTAL_AUTHORITIES.bescom} />
              ) : kind === "bbmp" && autoZone && !savedPortal ? (
                <>
                  <PortalString value={autoZone} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("matchedFromWardZonePrefix")} ({wardZone}). {t("confirmLooksRight")}
                  </p>
                  <button
                    onClick={() => patch({ portal_authority: autoZone })}
                    className="mt-2 w-full rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                  >
                    {t("btnConfirmSave")}
                  </button>
                </>
              ) : (
                <>
                  {savedPortal && <PortalString value={savedPortal} />}
                  <select
                    value={portalChoice || portalValue}
                    onChange={(e) => setPortalChoice(e.target.value)}
                    className={`${inputClass} mt-3`}
                  >
                    <option value="">{t("selectExactPortalEntry")}</option>
                    {portalOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {kind === "bbmp" && wardZone && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("wardZoneNoEquivalentPrefix")} {wardZone}. {t("wardZoneNoEquivalentSuffix")}
                    </p>
                  )}
                  {kind === "bwssb" && (
                    <p className="mt-2 text-xs text-warning">{t("bwssbSplitWarning")}</p>
                  )}
                  <button
                    disabled={!(portalChoice || portalValue)}
                    onClick={() => patch({ portal_authority: portalChoice || portalValue })}
                    className="mt-2 w-full rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
                  >
                    {t("btnSaveSelection")}
                  </button>
                </>
              )}
            </div>
          )}



          {app.status === "draft" && (
            <div className="paper-card p-5">
              <SectionLabel>{t("sectionFilingInstructions")}</SectionLabel>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="rule-heading">{t("onlineRecommended")}</p>
                  <p className="mt-1">{t("onlineFileAtNotice").replace("{portal}", LEGAL.portal)}</p>
                  <p className="mt-2 flex flex-col gap-1">
                    <a
                      href={PORTAL_LINKS.submitRequest}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent underline underline-offset-4"
                    >
                      {t("linkFileOnPortal")}
                    </a>
                    <a
                      href={PORTAL_LINKS.userManual}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline underline-offset-4"
                    >
                      {t("linkUserManual")}
                    </a>
                  </p>

                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {ONLINE_PAYMENT_IDS.map((mid) => (
                      <li key={mid}>{t(mid)}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs">{t("legalOnlinePaymentNote")}</p>
                </div>

                <div>
                  <p className="rule-heading">{t("byPostHeading")}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {POSTAL_PAYMENT_IDS.map((mid) => (
                      <li key={mid}>{t(mid)}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs">{t("postalSendNotice")}</p>
                </div>

                <ul className="space-y-2 border-t border-border pt-3">
                  <li>{t("legalFee")}</li>
                  <li>{t("bplApplicantsNotice")}</li>
                  <li>{t("legalCopyCharges")}</li>
                  <li>{t("supportingDocsNotice")}</li>
                  <li>{t("legalPortalCaveat")}</li>
                  <li>{t("additionalFeeNotice")}</li>
                  <li>
                    {t("pioReplyWithinNotice")
                      .replace("{days}", String(LEGAL.pioDays))
                      .replace("{hours}", String(LEGAL.lifeLibertyHours))}{" "}
                    {t("legalCalendarDays")}
                  </li>
                  <li>{t("legalSection62")}</li>
                  <li>{t("legalRule14")}</li>
                  <li>{t("splitAdvisory")}</li>
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <label className="rule-heading block">{t("dateFiledLabel")}</label>
                <input
                  type="date"
                  value={filedDate}
                  onChange={(e) => setFiledDate(e.target.value)}
                  className={inputClass}
                />
                <label className="rule-heading block">{t("portalRegNumberOptionalLabel")}</label>
                <input
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="RTIPM/R/2026/60208"
                  className={inputClass}
                />
                <button
                  onClick={() =>
                    patch({
                      status: "filed",
                      filed_date: filedDate,
                      response_due_date: addDays(filedDate, LEGAL.pioDays),
                      registration_number: regNumber.trim() || null,
                    })
                  }
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {t("btnMarkFiled")}
                </button>
              </div>
            </div>
          )}

          {app.status === "filed" && (
            <div className="paper-card p-5">
              <SectionLabel>{t("sectionTransferred")}</SectionLabel>
              <p className="text-sm text-muted-foreground">{t("section63Notice")}</p>
              <div className="mt-3 space-y-2">
                <label className="rule-heading block">{t("transferDateLabel")}</label>
                <input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className={inputClass}
                />
                <label className="rule-heading block">{t("transferredToLabel")}</label>
                <input
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder={t("placeholderNewAuthority")}
                  className={inputClass}
                />
                <label className="rule-heading block">{t("newRegNumberOptionalLabel")}</label>
                <input
                  value={transferReg}
                  onChange={(e) => setTransferReg(e.target.value)}
                  placeholder="RTIPM/R/2026/60311"
                  className={inputClass}
                />
                <button
                  onClick={() =>
                    patch({
                      transfer_date: transferDate,
                      transferred_to: transferTo.trim() || null,
                      transfer_registration_number: transferReg.trim() || null,
                      response_due_date: addDays(transferDate, LEGAL.pioDays),
                    })
                  }
                  className="w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
                >
                  {t("btnSaveTransfer")}
                </button>
              </div>
            </div>
          )}


          {(app.status === "filed" || app.status === "overdue") && (
            <div className="paper-card p-5">
              <SectionLabel>{t("sectionRecordReply")}</SectionLabel>
              <input
                type="date"
                value={replyDate}
                onChange={(e) => setReplyDate(e.target.value)}
                className={inputClass}
              />
              <textarea
                value={replyNotes}
                onChange={(e) => setReplyNotes(e.target.value)}
                rows={3}
                placeholder={t("placeholderReplyNotes")}
                className={`${inputClass} mt-2`}
              />
              <button
                onClick={() =>
                  patch({
                    status: "replied",
                    reply_received_date: replyDate,
                    reply_notes: replyNotes,
                  })
                }
                className="mt-2 w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                {t("btnSaveReply")}
              </button>
            </div>
          )}

          {overdue && !firstAppeal && (
            <div className="paper-card border-destructive/40 p-5">
              <SectionLabel>{t("sectionDeemedRefusal")}</SectionLabel>
              <p className="text-sm text-muted-foreground">
                {t("deemedRefusalNotice")
                  .replace("{days}", String(LEGAL.pioDays))
                  .replace("{window}", String(LEGAL.firstAppealWindowDays))}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("portalGroundToSelectLabel")}: {groundLabel("no_response")}
              </p>
              <button
                disabled={busy}
                onClick={() =>
                  draftAppeal(
                    "first",
                    "No reply received within 30 days — deemed refusal under Section 7(2).",
                    "no_response",
                  )
                }
                className="mt-3 w-full rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-60"
              >
                {busy ? t("draftingEllipsis") : t("btnDraftFirstAppeal")}
              </button>
              <a
                href={PORTAL_LINKS.submitFirstAppeal}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-xs text-accent underline underline-offset-4"
              >
                File the first appeal on the portal
              </a>
            </div>
          )}

          {app.status === "replied" && !firstAppeal && (
            <div className="paper-card border-warning/50 p-5">
              <SectionLabel>{t("sectionReplyIncomplete")}</SectionLabel>
              <p className="text-sm text-muted-foreground">
                {t("firstAppealMustFileNotice").replace(
                  "{window}",
                  String(LEGAL.firstAppealWindowDays),
                )}
              </p>
              <div className="mt-3 space-y-2">
                <button
                  disabled={busy}
                  onClick={() =>
                    draftAppeal(
                      "first",
                      `${t("incompleteReplyPrefix")} ${replyNotes || app.reply_notes || t("incompleteReplyDefault")}`,
                      "incomplete",
                    )
                  }
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  {t("btnDraftIncomplete")}
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    draftAppeal(
                      "first",
                      `${t("refusalPrefix")} ${replyNotes || app.reply_notes || t("refusalDefault")}`,
                      "refused",
                    )
                  }
                  className="w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-60"
                >
                  {t("btnDraftRefusal")}
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    draftAppeal(
                      "first",
                      `${t("excessFeePrefix")} ${replyNotes || app.reply_notes || t("excessFeeDefault")}`,
                      "excess_fee",
                    )
                  }
                  className="w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-60"
                >
                  {t("btnDraftExcessFee")}
                </button>
              </div>
              <a
                href={PORTAL_LINKS.submitFirstAppeal}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-xs text-accent underline underline-offset-4"
              >
                File the first appeal on the portal
              </a>

            </div>
          )}

          {firstAppeal && (
            <div className="paper-card p-5">
              <SectionLabel>{t("sectionSecondAppealHeading")}</SectionLabel>
              <p className="text-sm text-muted-foreground">
                {t("secondAppealNotice")
                  .replace("{decisionDays}", String(LEGAL.faaDecisionDays))
                  .replace("{maxDays}", String(LEGAL.faaMaxDays))
                  .replace("{ksic}", LEGAL.ksicAddress)
                  .replace("{windowDays}", String(LEGAL.secondAppealWindowDays))
                  .replace("{afterDays}", String(LEGAL.secondAppealAfterDays))}
              </p>
              {firstAppeal.filed_date && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("daysSinceFirstAppeal").replace("{days}", String(faaSilentDays))}
                </p>
              )}
              <button
                disabled={!secondAvailable || busy}
                onClick={() =>
                  draftAppeal(
                    "second",
                    `No decision from the First Appellate Authority within ${LEGAL.faaMaxDays} days of the first appeal filed on ${firstAppeal.filed_date}.`,
                  )
                }
                className="mt-3 w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-40"
              >
                {secondAppeal
                  ? t("secondAppealDraftedLabel")
                  : secondAvailable
                    ? busy
                      ? t("draftingEllipsis")
                      : t("btnDraftSecondAppeal")
                    : t("availableAfterDays").replace(
                        "{days}",
                        String(LEGAL.secondAppealAfterDays),
                      )}
              </button>
            </div>
          )}

          <div className="paper-card p-5">
            <SectionLabel>{t("sectionMissedWindow")}</SectionLabel>
            <p className="text-sm text-muted-foreground">{t("legalSection18")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("legalKsicAddress")}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-1.5 last:border-0">
      <span className="min-w-0 text-xs leading-[1.65] text-muted-foreground">{label}</span>
      <span className="shrink-0 font-mono text-xs">{value}</span>
    </li>
  );
}

function PortalString({ value }: { value: string }) {
  const { t } = useLang();
  return (
    <div className="mt-3 flex flex-wrap items-start gap-2 rounded-md bg-secondary/60 p-3">
      <span className="min-w-0 flex-1 break-words font-mono text-xs">{value}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast.success(t("copied"));
        }}
        className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-secondary"
      >
        {t("copy")}
      </button>
    </div>
  );
}

function ResponsibleOfficials({ wardName, category }: { wardName: string; category: string }) {
  const { t } = useLang();
  const { data, loading } = useWardOfficials(wardName);
  const list = useMemo(() => relevantOfficials(data?.officials ?? [], category), [data, category]);

  return (
    <div className="paper-card p-5">
      <SectionLabel>{t("whoIsResponsible")}</SectionLabel>
      <p className="text-sm text-muted-foreground">{t("whoIsResponsibleNotice")}</p>
      {loading ? (
        <OfficialsSkeleton />
      ) : (
        <>
          {data?.oldBbmpWard ? (
            <p className="mt-2 text-xs">
              {t("oldBbmpWardPrefix")} <strong>{data.oldBbmpWard}</strong> {t("oldBbmpWardSuffix")}
            </p>
          ) : null}
          <OfficialsList officials={list} />
          <OfficialsCaveat />
          <OfficialsCredit />
        </>
      )}
    </div>
  );
}
