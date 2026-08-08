import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  today,
  toPortalSafe,
  WARDS,
  type StageRailId,
} from "@/lib/rti-data";
import { StageRail } from "@/components/stage-rail";
import { generateAppealDraft, generateDraft } from "@/lib/rti.functions";
import { toast } from "sonner";

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
  filed_date: string | null;
  due_date: string | null;
  created_at: string;
  registration_number: string | null;
  portal_ground: string | null;
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25";

function Detail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const makeAppeal = useServerFn(generateAppealDraft);
  const makeDraft = useServerFn(generateDraft);
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
  const [showClosure, setShowClosure] = useState(false);
  const [closureDate, setClosureDate] = useState(today());
  const [stillWrong, setStillWrong] = useState("");
  const [sentRef, setSentRef] = useState("");



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
        <p className="text-sm text-muted-foreground">Loading…</p>
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
  const portalSafeBody = toPortalSafe(app.application_body);
  const overLimit = portalSafeBody.length > PORTAL_MAX_CHARS;
  const wardZone = WARDS.find((w) => w.ward_id === app.ward_id)?.zone_name ?? null;
  const kind = portalAuthorityKind(app.public_authority);
  const autoZone = kind === "bbmp" ? portalZoneForGbaZone(wardZone) : null;
  const savedPortal = app.portal_authority as string | null;
  const portalOptions =
    kind === "bwssb" ? [...PORTAL_AUTHORITIES.bwssbUnits] : [...PORTAL_AUTHORITIES.bbmpZones];
  const portalValue = savedPortal ?? autoZone ?? "";


  async function draftAppeal(tier: "first" | "second", reason: string, portalGround?: string) {
    setBusy(true);
    try {
      await makeAppeal({ data: { applicationId: id, tier, reason, portalGround } });
      await qc.invalidateQueries({ queryKey: ["application", id] });
      toast.success(`${tier === "first" ? "First" : "Second"} appeal drafted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not draft the appeal");
    } finally {
      setBusy(false);
    }
  }

  async function escalate() {
    await patch({ escalation_count: (app.escalation_count ?? 0) + 1 });
    toast.success("Escalation recorded");
  }

  async function promoteToRti() {
    if (stillWrong.trim().length < 10) {
      toast.error("Say what is still wrong on the ground — the RTI is built from it.");
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
      });
      toast.success("RTI drafted against the closure");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not draft the RTI");
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
        ← All applications
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusPill tone={clock.tone}>{clock.label}</StatusPill>
        {clock.tone !== "danger" && (
          <span className="rule-heading">{STATUS_LABEL[app.status] ?? app.status}</span>
        )}
        {app.is_seeded && (
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
            Demo data
          </span>
        )}
      </div>

      <h1 className="mt-2 text-2xl leading-snug sm:text-3xl">{app.grievance_text}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {app.public_authority}
        {app.ward_name ? ` · ${app.ward_name} ward` : ""}
      </p>

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
              <SectionLabel>The complaint</SectionLabel>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {app.complaint_text}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(app.complaint_text ?? "");
                  toast.success("Copied");
                }}
                className="mt-3 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
              >
                Copy
              </button>
            </div>

            <div className="paper-card p-5">
              <SectionLabel>What happened next?</SectionLabel>
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  disabled={busy}
                  onClick={() => void escalate()}
                  className="rounded-md border border-border px-3 py-2 text-xs hover:bg-secondary disabled:opacity-50"
                >
                  Still nothing — escalate
                </button>
                <button
                  disabled={busy}
                  onClick={() => setShowClosure((v) => !v)}
                  className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs hover:bg-destructive/10 disabled:opacity-50"
                >
                  They marked it resolved but it isn't
                </button>
                <button
                  disabled={busy}
                  onClick={() => void patch({ status: "closed" })}
                  className="rounded-md border border-border px-3 py-2 text-xs hover:bg-secondary disabled:opacity-50"
                >
                  They fixed it
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{COMPLAINT_ESCALATION_NOTE}</p>
              {(app.escalation_count ?? 0) > 0 && (
                <p className="mt-1 text-xs">
                  Escalated {app.escalation_count} time{app.escalation_count === 1 ? "" : "s"}.
                </p>
              )}

              {showClosure && (
                <div className="mt-4 space-y-3 rounded-md border border-border p-3">
                  <label className="block text-xs text-muted-foreground">
                    Date they marked it resolved
                    <input
                      type="date"
                      value={closureDate}
                      onChange={(e) => setClosureDate(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    What is still wrong on the ground?
                    <textarea
                      value={stillWrong}
                      onChange={(e) => setStillWrong(e.target.value)}
                      rows={3}
                      className={`${inputClass} mt-1 resize-y`}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    The RTI will ask for the action-taken report, the work order, the closing officer's
                    name, the completion certificate, the closure photograph, the measurement book entry
                    and the expenditure booked. None of these exist if the work was not done.
                  </p>
                  <button
                    disabled={busy}
                    onClick={() => void promoteToRti()}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {busy ? "Drafting…" : "Draft the RTI against this closure"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="paper-card p-5">
              <SectionLabel>Where it went</SectionLabel>
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
                <p className="text-xs text-muted-foreground">Channel not recorded.</p>
              )}
            </div>

            <div className="paper-card p-5">
              <SectionLabel>Timeline</SectionLabel>
              <dl className="space-y-1.5 text-sm">
                <TimelineRow label="Complaint reference" value={app.complaint_ref ?? "—"} />
                <TimelineRow label="Sent on" value={app.complaint_filed_date ?? "not sent yet"} />
                <TimelineRow
                  label="Service expectation"
                  value={`${COMPLAINT_EXPECTATION_DAYS} days — not a statutory deadline`}
                />
                <TimelineRow
                  label="Marked resolved"
                  value={app.closure_claimed_date ?? "—"}
                />
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">{COMPLAINT_NOT_STATUTORY}</p>

            </div>

            {!app.complaint_filed_date && (
              <div className="paper-card p-5">
                <SectionLabel>Mark as sent</SectionLabel>
                <div className="space-y-2">
                  <input
                    value={sentRef}
                    onChange={(e) => setSentRef(e.target.value)}
                    placeholder="Complaint reference number"
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
                    Start the clock
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
            <SectionLabel>Information requested</SectionLabel>
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
              <SectionLabel>The application</SectionLabel>
              <div className="mb-2 ml-auto flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(app.application_body);
                    toast.success("Copied");
                  }}
                  className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(portalSafeBody);
                    toast.success("Portal-safe text copied");
                  }}
                  className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  Copy portal-safe
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([app.application_body], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `rti-application-${id.slice(0, 8)}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  Download
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-md bg-secondary/60 p-4 font-mono text-xs leading-relaxed">
              {app.application_body}
            </pre>
            <p className={`mt-2 font-mono text-xs ${overLimit ? "text-warning" : "text-muted-foreground"}`}>
              {portalSafeBody.length.toLocaleString()} / {PORTAL_MAX_CHARS.toLocaleString()} characters
              (portal limit)
            </p>
            {overLimit && (
              <p className="mt-1 text-xs text-warning">
                Over the portal limit - upload the full text as a PDF in the Supporting Document field
                instead (PDF only, max 5MB).
              </p>
            )}
          </div>


          {data.appeals.map((ap) => (
            <div key={ap.id} className="paper-card border-accent/40 p-5">
              <SectionLabel>
                {ap.tier === "first" ? "First appeal — Section 19(1)" : "Second appeal — Section 19(3)"}
              </SectionLabel>
              <p className="text-xs text-muted-foreground">
                Grounds: {ap.grounds}
                {ap.filed_date ? ` · filed ${ap.filed_date}` : " · not filed yet"}
                {ap.tier === "first"
                  ? ap.due_date
                    ? ` · FAA decision due ${ap.due_date}`
                    : ""
                  : " · No statutory disposal deadline for second appeals."}
              </p>
              {ap.tier === "first" && appealGroundLabel(ap.portal_ground) && (
                <p className="mt-1 text-xs font-medium">
                  Portal ground to select: {appealGroundLabel(ap.portal_ground)}
                </p>
              )}
              {ap.registration_number && (
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Registration number: {ap.registration_number}
                </p>
              )}
              <pre className="mt-3 whitespace-pre-wrap rounded-md bg-secondary/60 p-4 font-mono text-xs leading-relaxed">
                {ap.body}
              </pre>
              {!ap.filed_date && (
                <div className="mt-3">
                  <label className="rule-heading block">Portal registration number (optional)</label>
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
                    toast.success("Copied");
                  }}
                  className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(toPortalSafe(ap.body));
                    toast.success("Portal-safe text copied");
                  }}
                  className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                >
                  Copy portal-safe
                </button>
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
                      toast.success("Marked as filed");
                    }}
                    className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
                  >
                    Mark appeal filed today
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="paper-card p-5">
            <SectionLabel>Timeline</SectionLabel>
            <ul className="space-y-2 text-sm">
              <TimelineRow label="Created" value={String(app.created_at).slice(0, 10)} />
              <TimelineRow label="Filed" value={app.filed_date ?? "—"} />
              {app.registration_number && (
                <>
                  <TimelineRow label="Registration number" value={app.registration_number} />
                  <li className="text-xs">
                    <a
                      href={PORTAL_LINKS.onlineRequestStatus}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-4"
                    >
                      Check status on the portal
                    </a>
                  </li>
                </>
              )}
              {app.transfer_date && (
                <TimelineRow label="Transferred (Section 6(3))" value={app.transfer_date} />
              )}
              {app.transferred_to && (
                <TimelineRow label="Transferred to" value={app.transferred_to} />
              )}
              {app.transfer_registration_number && (
                <TimelineRow
                  label="New registration number"
                  value={app.transfer_registration_number}
                />
              )}
              <TimelineRow
                label={
                  app.transfer_date ? "Reply due (transfer + 30 days)" : "Reply due (filed + 30 days)"
                }
                value={app.response_due_date ?? "—"}
              />
              <TimelineRow label="Reply received" value={app.reply_received_date ?? "—"} />
              {firstAppeal && (
                <TimelineRow label="First appeal filed" value={firstAppeal.filed_date ?? "drafted"} />
              )}
              {secondAppeal && (
                <TimelineRow label="Second appeal filed" value={secondAppeal.filed_date ?? "drafted"} />
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
              <SectionLabel>On the portal, select this</SectionLabel>
              <p className="text-sm text-muted-foreground">
                Bengaluru was reorganised into the Greater Bengaluru Authority and five city
                corporations, but the RTI portal still lists the old BBMP zones. Select the zone
                below, not your GBA corporation.
              </p>

              {kind === "bescom" ? (
                <PortalString value={PORTAL_AUTHORITIES.bescom} />
              ) : kind === "bbmp" && autoZone && !savedPortal ? (
                <>
                  <PortalString value={autoZone} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Matched from your ward's zone ({wardZone}). Confirm it looks right.
                  </p>
                  <button
                    onClick={() => patch({ portal_authority: autoZone })}
                    className="mt-2 w-full rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                  >
                    Confirm and save
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
                    <option value="">Select the exact portal entry…</option>
                    {portalOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {kind === "bbmp" && wardZone && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Your ward's GBA zone is {wardZone}. The portal has no verified equivalent, so
                      pick the closest old BBMP zone yourself.
                    </p>
                  )}
                  {kind === "bwssb" && (
                    <p className="mt-2 text-xs text-warning">
                      BWSSB is split by function and area on the portal. Picking the wrong unit means
                      a Section 6(3) transfer, which costs at least 5 days and restarts the 30-day
                      clock.
                    </p>
                  )}
                  <button
                    disabled={!(portalChoice || portalValue)}
                    onClick={() => patch({ portal_authority: portalChoice || portalValue })}
                    className="mt-2 w-full rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
                  >
                    Save this selection
                  </button>
                </>
              )}
            </div>
          )}



          {app.status === "draft" && (
            <div className="paper-card p-5">
              <SectionLabel>Filing instructions</SectionLabel>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="rule-heading">Online (recommended)</p>
                  <p className="mt-1">
                    File at {LEGAL.portal}. No account is needed. The portal takes your email, mobile
                    number and a captcha, then verifies by OTP.
                  </p>
                  <p className="mt-2 flex flex-col gap-1">
                    <a
                      href={PORTAL_LINKS.submitRequest}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent underline underline-offset-4"
                    >
                      File on the Karnataka RTI portal
                    </a>
                    <a
                      href={PORTAL_LINKS.userManual}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline underline-offset-4"
                    >
                      Official user manual (PDF)
                    </a>
                  </p>

                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {LEGAL.onlinePaymentModes.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs">{LEGAL.onlinePaymentNote}</p>
                </div>

                <div>
                  <p className="rule-heading">By post</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {LEGAL.postalPaymentModes.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs">
                    Send by speed post with acknowledgement due, and keep the receipt - it is your proof
                    of the filing date.
                  </p>
                </div>

                <ul className="space-y-2 border-t border-border pt-3">
                  <li>{LEGAL.fee}</li>
                  <li>
                    BPL applicants pay nothing. The portal validates the BPL card number directly; if you
                    do not have a BPL card, an income certificate can be uploaded instead.
                  </li>
                  <li>{LEGAL.copyCharges}</li>
                  <li>
                    Supporting documents must be a single PDF, maximum 5MB, with a filename containing
                    only letters, numbers, dots, underscores and hyphens.
                  </li>
                  <li>{LEGAL.portalCaveat}</li>
                  <li>The PIO may demand an additional fee; that is paid through a link on the status page.</li>
                  <li>
                    The PIO must reply within {LEGAL.pioDays} days ({LEGAL.lifeLibertyHours} hours where
                    life or liberty is concerned). {LEGAL.calendarDays}
                  </li>
                  <li>{LEGAL.section62}</li>
                  <li>{LEGAL.rule14}</li>
                  <li>{SPLIT_ADVISORY}</li>
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <label className="rule-heading block">Date you filed it</label>
                <input
                  type="date"
                  value={filedDate}
                  onChange={(e) => setFiledDate(e.target.value)}
                  className={inputClass}
                />
                <label className="rule-heading block">Portal registration number (optional)</label>
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
                  Mark as filed
                </button>
              </div>
            </div>
          )}

          {app.status === "filed" && (
            <div className="paper-card p-5">
              <SectionLabel>Was it transferred?</SectionLabel>
              <p className="text-sm text-muted-foreground">
                Under Section 6(3) a misdirected application must be transferred within 5 days, and the
                30-day clock runs afresh from the new authority's receipt. The portal issues a new
                registration number on transfer.
              </p>
              <div className="mt-3 space-y-2">
                <label className="rule-heading block">Transfer date</label>
                <input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className={inputClass}
                />
                <label className="rule-heading block">Transferred to</label>
                <input
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="Name of the new public authority"
                  className={inputClass}
                />
                <label className="rule-heading block">New registration number (optional)</label>
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
                  Save transfer and reset the clock
                </button>
              </div>
            </div>
          )}


          {(app.status === "filed" || app.status === "overdue") && (
            <div className="paper-card p-5">
              <SectionLabel>Record the reply</SectionLabel>
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
                placeholder="What did they send? What is missing?"
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
                Save reply
              </button>
            </div>
          )}

          {overdue && !firstAppeal && (
            <div className="paper-card border-destructive/40 p-5">
              <SectionLabel>Deemed refusal — Section 7(2)</SectionLabel>
              <p className="text-sm text-muted-foreground">
                No reply within {LEGAL.pioDays} days is a deemed refusal. You have{" "}
                {LEGAL.firstAppealWindowDays} days from the due date to file a first appeal with the
                First Appellate Authority of the same public authority.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Portal ground to select: {appealGroundLabel("no_response")}
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
                {busy ? "Drafting…" : "Draft first appeal"}
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
              <SectionLabel>Reply incomplete or refused?</SectionLabel>
              <p className="text-sm text-muted-foreground">
                A first appeal must be filed within {LEGAL.firstAppealWindowDays} days of the reply.
              </p>
              <div className="mt-3 space-y-2">
                <button
                  disabled={busy}
                  onClick={() =>
                    draftAppeal(
                      "first",
                      `Incomplete reply. ${replyNotes || app.reply_notes || "Several points were not answered and no exemption was cited, contrary to Section 7(8)."}`,
                      "incomplete",
                    )
                  }
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  Draft first appeal — incomplete reply
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    draftAppeal(
                      "first",
                      `Refusal of information. ${replyNotes || app.reply_notes || "The PIO refused the information."}`,
                      "refused",
                    )
                  }
                  className="w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-60"
                >
                  Draft first appeal — refusal
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    draftAppeal(
                      "first",
                      `Unreasonable fee demanded. ${replyNotes || app.reply_notes || "The PIO demanded an excessive additional fee."}`,
                      "excess_fee",
                    )
                  }
                  className="w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-60"
                >
                  Draft first appeal — unreasonable fee
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
              <SectionLabel>Second appeal — Section 19(3)</SectionLabel>
              <p className="text-sm text-muted-foreground">
                The First Appellate Authority must decide within {LEGAL.faaDecisionDays} days,
                extendable to {LEGAL.faaMaxDays} with recorded reasons. A second appeal lies to the{" "}
                {LEGAL.ksicAddress}, within {LEGAL.secondAppealWindowDays} days, and may be filed once{" "}
                {LEGAL.secondAppealAfterDays} days have elapsed with no decision.
              </p>
              {firstAppeal.filed_date && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {faaSilentDays} days since the first appeal was filed.
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
                  ? "Second appeal drafted"
                  : secondAvailable
                    ? busy
                      ? "Drafting…"
                      : "Draft second appeal"
                    : `Available after ${LEGAL.secondAppealAfterDays} days`}
              </button>
            </div>
          )}

          <div className="paper-card p-5">
            <SectionLabel>If you have missed a window</SectionLabel>
            <p className="text-sm text-muted-foreground">{LEGAL.section18}</p>
            <p className="mt-2 text-xs text-muted-foreground">{LEGAL.ksicAddress}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </li>
  );
}

function PortalString({ value }: { value: string }) {
  return (
    <div className="mt-3 flex flex-wrap items-start gap-2 rounded-md bg-secondary/60 p-3">
      <span className="min-w-0 flex-1 break-words font-mono text-xs">{value}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast.success("Copied");
        }}
        className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-secondary"
      >
        Copy
      </button>
    </div>
  );
}
