import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, SectionLabel } from "@/components/app-shell";
import {
  AUTHORITIES,
  WARDS,
  LEGAL,
  addDays,
  today,
  countWords,
  RULE14_WORD_LIMIT,
  COMPLAINT_CHANNELS,
  COMPLAINT_EXPECTATION_DAYS,
} from "@/lib/rti-data";
import { WardMap } from "@/components/ward-map";
import { WardInset3D } from "@/components/ward-inset-3d";
import { StageRail } from "@/components/stage-rail";
import { generateComplaint, generateDraft, reviseDraft } from "@/lib/rti.functions";
import type { ComplaintDraft, RtiDraft } from "@/lib/rti.server";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/new")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { ward?: string | undefined; stage?: "complaint" | undefined } => ({
    ward: typeof search["ward"] === "string" ? search["ward"] : undefined,
    stage: search["stage"] === "complaint" ? "complaint" : undefined,
  }),

  head: () => ({

    meta: [
      { title: "New RTI application — Vicharane" },
      {
        name: "description",
        content: "Describe a civic grievance and get document requests a PIO must answer.",
      },
      { property: "og:title", content: "New RTI application — Vicharane" },
      { property: "og:description", content: "Turn a grievance into records you can legally demand." },
    ],
  }),
  component: NewApplication,
});

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25";

const FLAG_LABEL: Record<string, string> = {
  opinion_seeking: "Asks for an opinion, not a record",
  exemption_risk: "May be refused under Section 8",
  too_broad: "Too broad — invites a fee demand",
  wrong_authority: "Possibly the wrong public authority",
};

/** Loose authority equality: case-insensitive, trimmed, either containing the other. */
function sameAuthority(a: string, b: string): boolean {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  if (!x || !y) return true;
  return x === y || x.includes(y) || y.includes(x);
}



type SubjectDraft = {
  subject: string;
  draft: RtiDraft;
  body: string;
  saved: boolean;
  savedId?: string | undefined;
};

type Path = "complaint" | "rti";
type PriorOutcome = "no_response" | "false_closure" | "refused";

function NewApplication() {
  const router = useRouter();
  const run = useServerFn(generateDraft);
  const revise = useServerFn(reviseDraft);
  const runComplaint = useServerFn(generateComplaint);

  const search = Route.useSearch();
  const [step, setStep] = useState(search.stage === "complaint" ? 2 : 1);
  const [path, setPath] = useState<Path | null>(search.stage === "complaint" ? "complaint" : null);

  const [prior, setPrior] = useState<PriorOutcome | null>(null);
  const [complaintRef, setComplaintRef] = useState("");
  const [priorFiledDate, setPriorFiledDate] = useState("");
  const [closureDate, setClosureDate] = useState("");
  const [stillWrong, setStillWrong] = useState("");
  const [grievance, setGrievance] = useState("");
  const [language, setLanguage] = useState("en");
  const [authorityId, setAuthorityId] = useState("");
  const [otherAuthority, setOtherAuthority] = useState("");
  const [pioName, setPioName] = useState("");
  const [pioAddress, setPioAddress] = useState("");
  const [wardQuery, setWardQuery] = useState("");
  const preselectedWard = search.ward ?? "";
  const [wardId, setWardId] = useState(
    preselectedWard && WARDS.some((w) => w.ward_id === preselectedWard) ? preselectedWard : "",
  );
  const [mapOpen, setMapOpen] = useState(false);



  const [busy, setBusy] = useState(false);
  const [complaint, setComplaint] = useState<ComplaintDraft | null>(null);
  const [complaintText, setComplaintText] = useState("");
  const [channelId, setChannelId] = useState("sahaaya");
  const [sentRef, setSentRef] = useState("");
  const [sentDate, setSentDate] = useState(today());
  const [drafts, setDrafts] = useState<SubjectDraft[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>("");
  const [instruction, setInstruction] = useState("");
  const [revising, setRevising] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dismissedAuthorityHint, setDismissedAuthorityHint] = useState(false);

  const authority =
    authorityId === "other"
      ? otherAuthority
      : (AUTHORITIES.find((a) => a.id === authorityId)?.name ?? "");
  const ward = WARDS.find((w) => w.ward_id === wardId);

  const wardOptions = useMemo(() => {
    const q = wardQuery.trim().toLowerCase();
    const pool = q
      ? WARDS.filter((w) => `${w.ward_name} ${w.ward_name_kn} ${w.zone_name} ${w.corporation} ${w.ward_id}`.toLowerCase().includes(q))
      : WARDS;
    return pool.slice(0, 12);
  }, [wardQuery]);

  const active = drafts.find((d) => d.subject === activeSubject) ?? drafts[0] ?? null;
  const draft = active?.draft ?? null;
  const body = active?.body ?? "";

  function updateActive(patch: Partial<SubjectDraft>) {
    setDrafts((prev) =>
      prev.map((d) => (d.subject === active?.subject ? { ...d, ...patch } : d)),
    );
  }

  const suggested = draft?.suggested_authority?.trim() ?? "";
  const authorityMismatch =
    !!suggested && !dismissedAuthorityHint && !sameAuthority(authority, suggested);

  const requestWords = draft ? countWords(draft.requests.map((r) => r.text).join(" ")) : 0;
  const overWordLimit = requestWords > RULE14_WORD_LIMIT;
  const otherSubjects = (draft?.subjects ?? []).filter(
    (s) => s.label.trim().toLowerCase() !== (active?.subject ?? "").trim().toLowerCase(),
  );
  const multiSubject = (draft?.subjects.length ?? 0) > 1;

  function hasDraftFor(label: string) {
    return drafts.some((d) => d.subject.trim().toLowerCase() === label.trim().toLowerCase());
  }

  const falseClosure =
    prior === "false_closure"
      ? {
          ref: complaintRef,
          complaintText: grievance,
          filedDate: priorFiledDate || null,
          closureDate: closureDate || null,
          whatIsStillWrong: stillWrong,
        }
      : null;

  async function generateTheComplaint() {
    setBusy(true);
    try {
      const result = await runComplaint({
        data: {
          grievance,
          authority,
          ward: ward?.ward_name ?? null,
          wardNumber: ward?.ward_id ?? null,
        },
      });
      setComplaint(result);
      setComplaintText(result.complaint);
      if (COMPLAINT_CHANNELS.some((c) => c.id === result.suggested_channel))
        setChannelId(result.suggested_channel);
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not draft the complaint");
    } finally {
      setBusy(false);
    }
  }

  async function saveComplaint(markSent: boolean) {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("applications")
        .insert({
          user_id: userData.user!.id,
          stage: "complaint",
          grievance_text: grievance,
          language,
          public_authority: authority,
          ward_id: ward?.ward_id ?? null,
          ward_name: ward?.ward_name ?? null,
          corporation: ward?.corporation ?? null,
          generated_requests: [],
          application_body: "",
          complaint_text: complaintText,
          complaint_channel: channelId,
          complaint_ref: markSent ? sentRef.trim() || null : null,
          complaint_filed_date: markSent ? sentDate : null,
          status: markSent ? "filed" : "draft",
        })
        .select("id")
        .single();
      if (error) throw error;
      router.navigate({ to: "/applications/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  }

  async function generate(overrideAuthority?: string, focusSubject?: string) {
    setBusy(true);
    try {
      const result = await run({
        data: {
          grievance,
          authority: overrideAuthority ?? authority,
          ward: ward?.ward_name ?? null,
          language,
          focusSubject: focusSubject ?? null,
          falseClosure,
        },
      });
      const key =
        focusSubject ??
        result.draft.primary_subject?.trim() ??
        "";
      const subject = key || `Application ${drafts.length + 1}`;
      const entry: SubjectDraft = {
        subject,
        draft: result.draft,
        body: result.body,
        saved: false,
      };
      setDrafts((prev) => (focusSubject ? [...prev, entry] : [entry]));
      setActiveSubject(subject);
      setInstruction("");
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not draft the application");
    } finally {
      setBusy(false);
    }
  }

  function addSubject(label: string) {
    const existing = drafts.find(
      (d) => d.subject.trim().toLowerCase() === label.trim().toLowerCase(),
    );
    if (existing) {
      setActiveSubject(existing.subject);
      return;
    }
    void generate(undefined, label);
  }

  async function runRevision(text: string) {
    if (!active || !text.trim()) return;
    setRevising(true);
    try {
      const result = await revise({
        data: {
          grievance,
          authority,
          ward: ward?.ward_name ?? null,
          subject: active.subject,
          requests: active.draft.requests,
          instruction: text,
        },
      });
      updateActive({ draft: result.draft, body: result.body });
      setInstruction("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not revise the draft");
    } finally {
      setRevising(false);
    }
  }

  function switchToSuggested() {
    const match = AUTHORITIES.find((a) => sameAuthority(a.name, suggested));
    if (match) {
      setAuthorityId(match.id);
      setOtherAuthority("");
    } else {
      setAuthorityId("other");
      setOtherAuthority(suggested);
    }
    setPioName("");
    setPioAddress("");
    setDismissedAuthorityHint(false);
    void generate(match ? match.name : suggested);
  }

  function rowFor(entry: SubjectDraft, markFiled: boolean, filedDate: string | undefined, userId: string) {
    return {
      user_id: userId,
      grievance_text: grievance,
      language,
      public_authority: authority,
      pio_name: pioName || null,
      pio_address: pioAddress || null,
      ward_id: ward?.ward_id ?? null,
      ward_name: ward?.ward_name ?? null,
      corporation: ward?.corporation ?? null,
      generated_requests: entry.draft.requests,
      application_body: entry.body,
      status: markFiled ? "filed" : "draft",
      filed_date: markFiled ? (filedDate ?? today()) : null,
      response_due_date: markFiled ? addDays(filedDate ?? today(), LEGAL.pioDays) : null,
      stage: "rti",
      complaint_ref: complaintRef.trim() || null,
      complaint_filed_date: priorFiledDate || null,
      closure_claimed_date: prior === "false_closure" ? closureDate || null : null,
    };
  }

  async function save(markFiled: boolean, filedDate?: string) {
    if (!active) return;
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("applications")
        .insert(rowFor(active, markFiled, filedDate, userData.user!.id))
        .select("id")
        .single();
      if (error) throw error;
      if (drafts.length > 1) {
        updateActive({ saved: true, savedId: data.id });
        toast.success(`Saved "${active.subject}"`);
        setSaving(false);
      } else {
        router.navigate({ to: "/applications/$id", params: { id: data.id } });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  }

  async function saveAll() {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const unsaved = drafts.filter((d) => !d.saved);
      const results: Record<string, string> = {};
      for (const entry of unsaved) {
        const { data, error } = await supabase
          .from("applications")
          .insert(rowFor(entry, false, undefined, userData.user!.id))
          .select("id")
          .single();
        if (error) throw error;
        results[entry.subject] = data.id;
      }
      setDrafts((prev) =>
        prev.map((d) =>
          results[d.subject] ? { ...d, saved: true, savedId: results[d.subject]! } : d,
        ),
      );
      router.navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  }


  const stepLabels =
    path === "complaint"
      ? ["What went wrong", "Where to send it", "Your complaint"]
      : ["Grievance", "Authority", "Requests", "File it"];

  return (
    <AppShell>
      <h1 className="text-3xl sm:text-4xl">
        {path === "complaint" ? "New civic complaint" : "New RTI application"}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {stepLabels.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-2.5 py-1 ${
              step === i + 1
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground"
            }`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="paper-card mt-6 p-5">
          <SectionLabel>Step 1 · Have you reported this already?</SectionLabel>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => {
                setPath("complaint");
                setPrior(null);
              }}
              className={`rounded-md border p-4 text-left ${
                path === "complaint" ? "border-foreground bg-secondary/60" : "border-border"
              }`}
            >
              <span className="block text-sm font-semibold">I haven't reported this yet</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Start with a civic complaint. It is faster, free, and it creates the paper trail an RTI
                can later test.
              </span>
            </button>
            <button
              onClick={() => setPath("rti")}
              className={`rounded-md border p-4 text-left ${
                path === "rti" ? "border-foreground bg-secondary/60" : "border-border"
              }`}
            >
              <span className="block text-sm font-semibold">I already reported it</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Go straight to an RTI application for the records behind what happened next.
              </span>
            </button>
          </div>

          {path === "rti" && (
            <div className="mt-4 rounded-md border border-border p-4">
              <SectionLabel>What happened?</SectionLabel>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["no_response", "No response yet"],
                    ["false_closure", "They say it's fixed, but it isn't"],
                    ["refused", "They refused or gave a partial answer"],
                  ] as [PriorOutcome, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setPrior(id)}
                    className={`rounded-md border px-3 py-2 text-left text-xs ${
                      prior === id ? "border-foreground bg-secondary/60" : "border-border"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {prior && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs text-muted-foreground">
                    Complaint reference (if any)
                    <input
                      value={complaintRef}
                      onChange={(e) => setComplaintRef(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Date you reported it
                    <input
                      type="date"
                      value={priorFiledDate}
                      onChange={(e) => setPriorFiledDate(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                  {prior === "false_closure" && (
                    <>
                      <label className="text-xs text-muted-foreground">
                        Date they marked it resolved
                        <input
                          type="date"
                          value={closureDate}
                          onChange={(e) => setClosureDate(e.target.value)}
                          className={`${inputClass} mt-1`}
                        />
                      </label>
                      <label className="text-xs text-muted-foreground sm:col-span-2">
                        What is still wrong on the ground?
                        <textarea
                          value={stillWrong}
                          onChange={(e) => setStillWrong(e.target.value)}
                          rows={2}
                          className={`${inputClass} mt-1 resize-y`}
                        />
                      </label>
                      <p className="text-xs text-muted-foreground sm:col-span-2">
                        We will ask for the action-taken report, work order, completion certificate,
                        closure photograph and the expenditure booked — records that cannot exist if the
                        work was never done.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-5">
            <SectionLabel>What went wrong?</SectionLabel>
            <p className="text-sm text-muted-foreground">
              Write it plainly, in English or Kannada. Do not try to sound legal — that is our job.
            </p>
          </div>
          <textarea
            value={grievance}
            onChange={(e) => setGrievance(e.target.value)}
            rows={7}
            maxLength={3000}
            placeholder="e.g. The storm water drain on our lane has been blocked since last monsoon and floods the road every time it rains…"
            className={`${inputClass} mt-4 resize-y`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Language
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs"
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ</option>
              </select>
            </label>
            <button
              disabled={
                grievance.trim().length < 15 || !path || (path === "rti" && !prior)
              }
              onClick={() => setStep(2)}
              className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Continue
            </button>
          </div>
          <p className="mt-4 rounded-md bg-secondary/70 p-3 text-xs text-muted-foreground">
            {LEGAL.section62}
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="paper-card mt-6 space-y-4 p-5">
          <SectionLabel>
            {path === "complaint" ? "Step 2 · Whose problem is this?" : "Step 2 · Who holds the records?"}
          </SectionLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {AUTHORITIES.map((a) => (
              <button
                key={a.id}
                onClick={() => setAuthorityId(a.id)}
                className={`rounded-md border p-3 text-left transition-colors ${
                  authorityId === a.id ? "border-accent bg-accent/8" : "border-border hover:bg-secondary"
                }`}
              >
                <span className="block text-sm font-medium">{a.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{a.note}</span>
              </button>
            ))}
          </div>

          {authorityId === "other" && (
            <input
              value={otherAuthority}
              onChange={(e) => setOtherAuthority(e.target.value)}
              placeholder="Name of the public authority"
              className={inputClass}
            />
          )}

          <div>
            <SectionLabel>PIO name and address (optional — details change often)</SectionLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={pioName}
                onChange={(e) => setPioName(e.target.value)}
                placeholder="PIO name / designation"
                className={inputClass}
              />
              <input
                value={pioAddress}
                onChange={(e) => setPioAddress(e.target.value)}
                placeholder="PIO office address"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <SectionLabel>Ward (optional)</SectionLabel>
            <input
              value={wardQuery}
              onChange={(e) => setWardQuery(e.target.value)}
              placeholder="Search ward, zone or corporation…"
              className={inputClass}
            />
            {wardQuery.trim() && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {wardOptions.slice(0, 24).map((w) => (
                  <button
                    key={w.ward_id}
                    onClick={() => setWardId(w.ward_id === wardId ? "" : w.ward_id)}
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      wardId === w.ward_id
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {w.ward_name}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setMapOpen((v) => !v)}
              className="mt-2 text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {mapOpen ? "Hide the map" : "Find it on the map"}
            </button>
            {mapOpen && (
              <div className="mt-2">
                <WardMap
                  selectedId={wardId}
                  onSelect={(id) => {
                    setWardId(id);
                    if (id) setMapOpen(false);
                  }}
                  highlightIds={wardQuery.trim() ? wardOptions.map((w) => w.ward_id) : undefined}
                />
              </div>
            )}

            {ward && (
              <div className="mt-3 flex flex-col gap-3 border border-border p-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold">{ward.ward_name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{ward.ward_name_kn}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {ward.corporation} · {ward.zone_name} zone · {ward.assembly}
                  </p>
                </div>
                <div className="w-full sm:w-40 sm:shrink-0">
                  <WardInset3D wardId={ward.ward_id} corporation={ward.corporation} height={110} />
                </div>
              </div>
            )}
          </div>



          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              Back
            </button>
            <button
              disabled={!authority || busy}
              onClick={() => void (path === "complaint" ? generateTheComplaint() : generate())}
              className="ml-auto rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
            >
              {busy
                ? "Drafting…"
                : path === "complaint"
                  ? "Draft my complaint"
                  : "Draft my requests"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && path === "complaint" && complaint && (
        <div className="mt-6 space-y-5">
          <div className="paper-card p-5">
            <SectionLabel>Where you are</SectionLabel>
            <div className="mt-2">
              <StageRail current="complaint" />
            </div>
          </div>

          <div className="paper-card p-5">
            <SectionLabel>Step 3 · Your complaint</SectionLabel>
            <p className="text-sm text-muted-foreground">
              {complaint.category} · asks for one checkable action: {complaint.checkable_action}
            </p>
            <textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              rows={12}
              className={`${inputClass} mt-3 resize-y font-mono text-xs`}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(complaintText);
                  toast.success("Complaint copied");
                }}
                className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
              >
                Copy
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([complaintText], { type: "text/plain" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "complaint.txt";
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
                className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
              >
                Download
              </button>
            </div>
          </div>

          <div className="paper-card p-5">
            <SectionLabel>Where to send it</SectionLabel>
            <p className="text-xs text-muted-foreground">
              A starting point — confirm the channel before you send, and tell us where it actually went.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {COMPLAINT_CHANNELS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChannelId(c.id)}
                  className={`rounded-md border p-3 text-left ${
                    channelId === c.id ? "border-accent bg-accent/8" : "border-border hover:bg-secondary"
                  }`}
                >
                  <span className="block text-sm font-medium">{c.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{c.note}</span>
                  {"phone" in c && c.phone ? (
                    <span className="mt-1 block font-mono text-[11px]">{c.phone}</span>
                  ) : null}
                  {"url" in c && c.url ? (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 block text-[11px] underline"
                    >
                      {c.url}
                    </a>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <div className="paper-card p-5">
            <SectionLabel>Mark as filed</SectionLabel>
            <p className="text-xs text-muted-foreground">
              Complaints have no statutory deadline. We track {COMPLAINT_EXPECTATION_DAYS} days as a
              service expectation only.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-muted-foreground">
                Complaint reference number
                <input
                  value={sentRef}
                  onChange={(e) => setSentRef(e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className="text-xs text-muted-foreground">
                Date sent
                <input
                  type="date"
                  value={sentDate}
                  onChange={(e) => setSentDate(e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setStep(2)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                Back
              </button>
              <button
                disabled={saving}
                onClick={() => void saveComplaint(false)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
              >
                Save as draft
              </button>
              <button
                disabled={saving}
                onClick={() => void saveComplaint(true)}
                className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {saving ? "Saving…" : "I have sent it — start the clock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && path !== "complaint" && draft && active && (
        <div className="mt-6 space-y-5">
          {drafts.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {drafts.map((d) => (
                <button
                  key={d.subject}
                  onClick={() => setActiveSubject(d.subject)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    d.subject === active.subject
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {d.subject}
                  {d.saved ? " ✓" : ""}
                </button>
              ))}
            </div>
          )}
          {authorityMismatch && (
            <div className="paper-card border-destructive bg-destructive/10 p-5">
              <p className="rule-heading text-destructive">This may be the wrong public authority</p>
              <p className="mt-2 text-sm">
                You selected {authority}. Based on your grievance, these records are likely held by{" "}
                {suggested}. Filing with the wrong authority means it must be transferred under
                Section 6(3), which adds at least 5 days and restarts the 30-day clock.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  disabled={busy}
                  onClick={switchToSuggested}
                  className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-60"
                >
                  {busy ? "Redrafting…" : `Switch to ${suggested} and redraft`}
                </button>
                <button
                  onClick={() => setDismissedAuthorityHint(true)}
                  className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
                >
                  Keep {authority}
                </button>
              </div>
            </div>
          )}

          {multiSubject && (
            <div className="paper-card border-warning/60 bg-warning/10 p-5">
              <p className="rule-heading text-warning-foreground">This covers more than one subject</p>
              <p className="mt-2 text-sm">
                Karnataka's Rule 14 requires one subject per application. If you file all of these
                together, the PIO may answer only the first and tell you to file separately for the
                rest. This draft covers {active.subject}.
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {otherSubjects.map((s) => (
                  <li key={s.label}>
                    <span className="font-medium">{s.label}</span>
                    {s.summary ? (
                      <span className="text-muted-foreground"> — {s.summary}</span>
                    ) : null}
                    {hasDraftFor(s.label) ? (
                      <span className="text-accent"> · drafted</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-col gap-2">
                {otherSubjects
                  .filter((s) => !hasDraftFor(s.label))
                  .map((s) => (
                    <button
                      key={s.label}
                      disabled={busy}
                      onClick={() => addSubject(s.label)}
                      className="rounded-md border border-border bg-background px-4 py-2 text-left text-sm hover:bg-secondary disabled:opacity-60"
                    >
                      {busy ? "Drafting…" : `Draft this too — ${s.label}`}
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">

            <div className="paper-card border-destructive/30 p-5">
              <p className="rule-heading text-destructive">What you wrote — a PIO can refuse this</p>
              <p className="mt-3 whitespace-pre-wrap font-display text-lg leading-snug">{grievance}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                A grievance asks for action or an explanation. Section 2(f) only entitles you to
                material held in recorded form.
              </p>
            </div>
            <div className="paper-card border-accent/40 p-5">
              <p className="rule-heading text-accent">
                What we ask for — records the authority must produce
              </p>
              <ol className="mt-3 space-y-3">
                {draft.requests.map((r, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{i + 1}. {r.text}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{r.rationale}</span>
                  </li>
                ))}
              </ol>
              <p className={`mt-3 text-xs ${overWordLimit ? "text-warning" : "text-muted-foreground"}`}>
                {requestWords} / {RULE14_WORD_LIMIT} words (Karnataka Rule 14)
              </p>
              {overWordLimit && (
                <p className="mt-1 text-xs text-warning">
                  Rule 14 says an application shall not ORDINARILY exceed 150 words, so this is not
                  automatically invalid - but a PIO may push back. Consider trimming, or add a line
                  explaining why the extra length is necessary.
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Confidence: {draft.confidence}
                {draft.primary_subject ? ` · Subject: ${draft.primary_subject}` : ""}
                {suggested ? ` · Suggested authority: ${suggested}` : ""}
              </p>
            </div>
          </div>

          <div className="paper-card p-5">
            <SectionLabel>Improve this draft</SectionLabel>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={3}
              placeholder="Add anything that would make these harder to refuse - dates, the exact stretch of road, a complaint number you already have..."
              className={`${inputClass} resize-y`}
            />
            <button
              disabled={revising || !instruction.trim()}
              onClick={() => void runRevision(instruction)}
              className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
            >
              {revising ? "Revising…" : "Revise"}
            </button>
          </div>


          {draft.flags.length > 0 ? (
            <div className="paper-card p-5">
              <SectionLabel>Pre-flight check</SectionLabel>
              <ul className="space-y-3">
                {draft.flags.map((f, i) => (
                  <li key={i} className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
                    <span className="rule-heading block text-warning-foreground">
                      {FLAG_LABEL[f.type] ?? f.type}
                    </span>
                    <span className="mt-1 block">{f.message}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Suggestion: {f.suggestion}
                    </span>
                    <button
                      disabled={revising}
                      onClick={() =>
                        void runRevision(
                          `Address this problem with request wording: ${f.message} Suggested fix: ${f.suggestion}`,
                        )
                      }
                      className="mt-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-60"
                    >
                      {revising ? "Revising…" : "Apply this"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Pre-flight check passed - no opinion-seeking phrasing or obvious Section 8 exemption risk
              detected.
            </p>
          )}


          <div className="paper-card p-5">
            <SectionLabel>The application — edit anything before you file</SectionLabel>
            <textarea
              value={body}
              onChange={(e) => updateActive({ body: e.target.value })}
              rows={22}
              className={`${inputClass} font-mono text-xs leading-relaxed`}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setStep(2)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                Back
              </button>
              <button
                disabled={saving}
                onClick={() => save(false)}
                className="ml-auto rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                Save as draft
              </button>
              <button
                disabled={saving}
                onClick={() => save(true)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                Save & mark filed today
              </button>
              {drafts.length > 1 && drafts.some((d) => !d.saved) && (
                <button
                  disabled={saving}
                  onClick={() => void saveAll()}
                  className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50 sm:w-auto"
                >
                  {saving ? "Saving…" : "Save all as drafts"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
