import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  OfficialsCaveat,
  OfficialsCredit,
  OfficialsList,
  OfficialsSkeleton,
  relevantOfficials,
  useWardOfficials,
} from "@/components/officials";
import {
  generateComplaint,
  generateDraft,
  reviseDraft,
  saveApplicantDetails,
  suggestRouting,
} from "@/lib/rti.functions";
import { findPlaceholders } from "@/lib/placeholders";
import { MissingDetails, PlaceholderBlockNote } from "@/components/missing-details";
import { identityWithHistory, wardForLocality, wardKey } from "@/lib/ward-identity";
import type { ComplaintDraft, RtiDraft } from "@/lib/rti.server";
import { toast } from "sonner";
import { useHydrated } from "@/hooks/use-hydrated";
import { clearDraftCache, readDraftCache, writeDraftCache } from "@/lib/draft-cache";
import { KN_TEXT, T, useAuthorityLabel, useAuthorityNote, useChannelLabel, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/new")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { ward?: string | undefined; stage?: "complaint" | undefined } => ({
    ward: typeof search["ward"] === "string" ? search["ward"] : undefined,
    stage: search["stage"] === "complaint" ? "complaint" : undefined,
  }),

  head: () => ({

    meta: [
      { title: "New filing — Vicharane" },
      {
        name: "description",
        content: "Describe a civic grievance and get document requests a PIO must answer.",
      },
      { property: "og:title", content: "New filing — Vicharane" },
      { property: "og:description", content: "Turn a grievance into records you can legally demand." },
    ],
  }),
  component: NewApplication,
});

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25";

const FLAG_LABEL_ID: Record<string, "flagOpinionSeeking" | "flagExemptionRisk" | "flagTooBroad" | "flagWrongAuthority"> = {
  opinion_seeking: "flagOpinionSeeking",
  exemption_risk: "flagExemptionRisk",
  too_broad: "flagTooBroad",
  wrong_authority: "flagWrongAuthority",
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
  /** Kannada counterpart, for postal filing. The portal accepts Latin characters only. */
  bodyKn: string;
  saved: boolean;
  savedId?: string | undefined;
};

type Path = "complaint" | "rti";
type PriorOutcome = "no_response" | "false_closure" | "refused";

function NewApplication() {
  const router = useRouter();
  const { lang, t } = useLang();
  const authorityLabel = useAuthorityLabel();
  const authorityNote = useAuthorityNote();
  const channelLabel = useChannelLabel();
  const knClass = lang === "kn" ? KN_TEXT : "";
  const run = useServerFn(generateDraft);
  const revise = useServerFn(reviseDraft);
  const saveApplicant = useServerFn(saveApplicantDetails);
  /** Answers that belong on the profile are stored before the letter is rebuilt from it. */
  async function persistApplicant(fields: Record<string, string>) {
    if (Object.keys(fields).length === 0) return;
    try {
      await saveApplicant({ data: fields });
    } catch {
      /* the revision still carries the answers; persistence is a convenience */
    }
  }
  const runComplaint = useServerFn(generateComplaint);

  const search = Route.useSearch();
  const [step, setStep] = useState(1);
  const [path, setPath] = useState<Path | null>(search.stage === "complaint" ? "complaint" : null);

  const [prior, setPrior] = useState<PriorOutcome | null>(null);
  const [complaintRef, setComplaintRef] = useState("");
  const [priorFiledDate, setPriorFiledDate] = useState("");
  const [closureDate, setClosureDate] = useState("");
  const [stillWrong, setStillWrong] = useState("");
  const [grievance, setGrievance] = useState("");
  /**
   * Language of the letter that actually gets filed. Defaults to the interface
   * language (header toggle) until the user explicitly overrides it here.
   */
  const [languageOverride, setLanguageOverride] = useState<string | null>(null);
  const language = languageOverride ?? lang;
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

  /** Routing pass — the app proposes the owning authority instead of asking the user cold. */
  const routeFn = useServerFn(suggestRouting);
  const [routing, setRouting] = useState(false);
  const [routeNote, setRouteNote] = useState<{
    authority: string;
    ward: string;
    category: string;
    low: boolean;
    unknownAuthority: boolean;
    unknownLocality: string;
  } | null>(null);
  const [keepCorpChoice, setKeepCorpChoice] = useState(false);




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
  /** Hard guard against a double click firing two inserts before state updates. */
  const savingRef = useRef(false);
  const [dismissedAuthorityHint, setDismissedAuthorityHint] = useState(false);

  /**
   * The wizard is not interactive until React has hydrated. Until then we show
   * a skeleton rather than a form that silently swallows taps and keystrokes.
   */
  const ready = useHydrated();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [restored, setRestored] = useState(false);

  // Restore anything typed before a reload, hydration reset or stray navigation.
  useEffect(() => {
    const cachedGrievance = readDraftCache("new:grievance");
    const cachedStillWrong = readDraftCache("new:stillWrong");
    if (cachedGrievance) {
      setGrievance((prev) => prev || cachedGrievance);
      setRestored(true);
    }
    if (cachedStillWrong) setStillWrong((prev) => prev || cachedStillWrong);
  }, []);

  // Once the form is live, park focus on a neutral landmark — never on a
  // destructive control such as Sign out.
  useEffect(() => {
    if (!ready) return;
    if (document.activeElement && document.activeElement !== document.body) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    writeDraftCache("new:grievance", grievance);
  }, [ready, grievance]);

  useEffect(() => {
    if (!ready) return;
    writeDraftCache("new:stillWrong", stillWrong);
  }, [ready, stillWrong]);

  function clearWizardCache() {
    clearDraftCache("new:grievance", "new:stillWrong");
  }


  const authority =
    authorityId === "other"
      ? otherAuthority
      : (AUTHORITIES.find((a) => a.id === authorityId)?.name ?? "");
  const ward = WARDS.find((w) => w.ward_id === wardId);

  // A new ward or authority is a new contradiction — surface it again.
  useEffect(() => setKeepCorpChoice(false), [wardId, authorityId]);


  /**
   * BUG 2 guard: the selected corporation and the selected ward's corporation must agree.
   * We never block — the resident may have a reason — but the contradiction is always named.
   */
  const CORP_IDS = ["bcc", "bec", "bwc", "bnc", "bsc"];
  const wardCorpAuthority =
    ward && CORP_IDS.includes(authorityId)
      ? AUTHORITIES.find((a) => a.name === ward.corporation)
      : undefined;
  const corpMismatch =
    !!ward && CORP_IDS.includes(authorityId) && wardCorpAuthority?.id !== authorityId
      ? wardCorpAuthority ?? null
      : null;

  /** Routing pass on leaving step 1, then apply the suggestion to step 2. */
  async function continueToStep2() {
    setRouting(true);
    try {
      const result = await routeFn({ data: { grievance, lang } });
      if (result) {
        // "other" is not a routing answer — it means we could not tell. Never
        // silently park the resident on "Other"; say so instead.
        let match =
          result.authority_id === "other"
            ? undefined
            : AUTHORITIES.find((a) => a.id === result.authority_id);
        let wardName = "";
        let localityMissed = false;
        if (result.locality) {
          const hit = await wardForLocality(result.locality);
          if (hit) {
            setWardId(hit.ward_id);
            wardName = lang === "kn" ? (hit.ward_name_kn ?? hit.ward_name) : hit.ward_name;
            // The ward list is authoritative: it decides which corporation owns the ward.
            if (match && CORP_IDS.includes(match.id)) {
              match = AUTHORITIES.find((a) => a.name === hit.corporation) ?? match;
            }
          } else {
            localityMissed = true;
          }
        }
        if (match) setAuthorityId(match.id);
        setRouteNote({
          authority: match?.name ?? "",
          ward: wardName,
          category: result.category,
          low: result.confidence === "low",
          unknownAuthority: !match,
          unknownLocality: localityMissed ? result.locality : "",
        });
      } else {
        setRouteNote({
          authority: "",
          ward: "",
          category: "",
          low: true,
          unknownAuthority: true,
          unknownLocality: "",
        });
      }
    } catch {
      // Routing is best-effort: fall back to the blank selection.
    } finally {
      setRouting(false);
      setKeepCorpChoice(false);
      setStep(2);
    }
  }


  const wardOptions = useMemo(() => {
    // Kannada-aware: NFC, combining marks kept, spacing and "ward"/"ವಾರ್ಡ್" ignored.
    const q = wardKey(wardQuery);
    const pool = q
      ? WARDS.filter((w) =>
          wardKey(`${w.ward_name} ${w.ward_name_kn} ${w.zone_name} ${w.corporation} ${w.ward_id}`).includes(q),
        )
      : WARDS;
    return pool.slice(0, 12);
  }, [wardQuery]);


  const active = drafts.find((d) => d.subject === activeSubject) ?? drafts[0] ?? null;
  const draft = active?.draft ?? null;
  const body = active?.body ?? "";
  const bodyKn = active?.bodyKn ?? "";
  /** Which version of the letter is on screen. Kannada is postal-only. */
  const [letterVersion, setLetterVersion] = useState<"en" | "kn">("en");

  function updateActive(patch: Partial<SubjectDraft>) {
    setDrafts((prev) =>
      prev.map((d) => (d.subject === active?.subject ? { ...d, ...patch } : d)),
    );
  }

  const suggested = draft?.suggested_authority?.trim() ?? "";
  const authorityMismatch =
    !!suggested && !dismissedAuthorityHint && !sameAuthority(authority, suggested);

  const complaintBlanks = useMemo(() => findPlaceholders(complaintText), [complaintText]);
  const letterBlanks = useMemo(
    () => findPlaceholders(active?.body ?? ""),
    [active?.body],
  );

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

  async function generateTheComplaint(extraDetails?: string) {
    setBusy(true);
    try {
      const result = await runComplaint({
        data: {
          grievance: extraDetails
            ? `${grievance}\n\nAdditional details supplied by the resident:\n${extraDetails}`
            : grievance,
          authority,
          ward: await identityWithHistory(ward),
          lang,
        },
      });

      setComplaint(result);
      setComplaintText(result.complaint);
      if (COMPLAINT_CHANNELS.some((c) => c.id === result.suggested_channel))
        setChannelId(result.suggested_channel);
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("couldNotDraftComplaint"));
    } finally {
      setBusy(false);
    }
  }

  async function saveComplaint(markSent: boolean) {
    if (savingRef.current) return;
    savingRef.current = true;
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
          complaint_language: lang,
          complaint_channel: channelId,
          complaint_ref: markSent ? sentRef.trim() || null : null,
          complaint_filed_date: markSent ? sentDate : null,
          status: markSent ? "filed" : "draft",
        })
        .select("id")
        .single();
      if (error) throw error;
      clearWizardCache();
      router.navigate({ to: "/applications/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("couldNotSave"));
      savingRef.current = false;
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
          ward: await identityWithHistory(ward),

          language,
          lang,
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
        bodyKn: result.bodyKn ?? "",
        saved: false,
      };
      setDrafts((prev) => (focusSubject ? [...prev, entry] : [entry]));
      setActiveSubject(subject);
      setLetterVersion(result.bodyKn ? "kn" : "en");
      setInstruction("");
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("couldNotDraftApplication"));
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
          ward: await identityWithHistory(ward),
          subject: active.subject,
          requests: active.draft.requests,
          instruction: text,
          lang,
        },
      });
      updateActive({ draft: result.draft, body: result.body, bodyKn: result.bodyKn ?? "" });
      setInstruction("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("couldNotRevise"));
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
      application_body_kn: entry.bodyKn || null,
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
    if (!active || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("applications")
        .insert(rowFor(active, markFiled, filedDate, userData.user!.id))
        .select("id")
        .single();
      if (error) throw error;
      clearWizardCache();
      if (drafts.length > 1) {
        updateActive({ saved: true, savedId: data.id });
        toast.success(t("savedSubject").replace("{subject}", active.subject));
        savingRef.current = false;
        setSaving(false);
      } else {
        router.navigate({ to: "/applications/$id", params: { id: data.id } });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("couldNotSave"));
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function saveAll() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      // De-duplicate identical unsaved drafts before insert: same subject and
      // same letter body is one record, not two.
      const seen = new Set<string>();
      const unsaved = drafts.filter((d) => {
        if (d.saved) return false;
        const key = `${d.subject}\u0000${d.body}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
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
      clearWizardCache();
      router.navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("couldNotSave"));
      savingRef.current = false;
      setSaving(false);
    }
  }


  const stepLabels =
    path === "complaint"
      ? [t("stepWhatWentWrong"), t("stepWhereToSend"), t("stepYourComplaint")]
      : [t("stepGrievance"), t("stepAuthority"), t("stepRequests"), t("stepFileIt")];

  if (!ready) {
    return (
      <AppShell>
        <h1 className="text-3xl sm:text-4xl">
          <T id={path === "complaint" ? "wizardTitleComplaint" : "wizardTitleRti"} />
        </h1>
        <div
          className="paper-card mt-6 space-y-4 p-5"
          aria-busy="true"
          aria-live="polite"
          data-testid="wizard-skeleton"
        >
          <p className={`text-sm font-medium ${knClass}`}>{t("formPreparing")}</p>
          <p className={`text-xs text-muted-foreground ${knClass}`}>{t("formPreparingHelp")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-md bg-secondary" />
            <div className="h-24 animate-pulse rounded-md bg-secondary" />
          </div>
          <div className="h-40 animate-pulse rounded-md bg-secondary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 ref={headingRef} tabIndex={-1} className="text-3xl outline-none sm:text-4xl">
        <T id={path === "complaint" ? "wizardTitleComplaint" : "wizardTitleRti"} />
      </h1>
      {restored && (
        <p className={`mt-2 text-xs text-muted-foreground ${knClass}`}>{t("restoredFromSession")}</p>
      )}

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
          <SectionLabel>{t("step1HaveYouReported")}</SectionLabel>
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
              <T id="haventReportedYet" as="span" className="block text-sm font-semibold" />
              <T
                id="haventReportedYetHelp"
                as="span"
                className="mt-1 block text-xs text-muted-foreground"
              />
            </button>
            <button
              onClick={() => setPath("rti")}
              className={`rounded-md border p-4 text-left ${
                path === "rti" ? "border-foreground bg-secondary/60" : "border-border"
              }`}
            >
              <T id="alreadyReported" as="span" className="block text-sm font-semibold" />
              <T
                id="alreadyReportedHelp"
                as="span"
                className="mt-1 block text-xs text-muted-foreground"
              />
            </button>
          </div>

          {path === "rti" && (
            <div className="mt-4 rounded-md border border-border p-4">
              <SectionLabel>{t("whatHappened")}</SectionLabel>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["no_response", t("priorNoResponse")],
                    ["false_closure", t("priorFalseClosure")],
                    ["refused", t("priorRefused")],
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
                    {t("complaintRefLabel")}
                    <input
                      value={complaintRef}
                      onChange={(e) => setComplaintRef(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    {t("dateReportedLabel")}
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
                        {t("dateMarkedResolvedLabel")}
                        <input
                          type="date"
                          value={closureDate}
                          onChange={(e) => setClosureDate(e.target.value)}
                          className={`${inputClass} mt-1`}
                        />
                      </label>
                      <label className="text-xs text-muted-foreground sm:col-span-2">
                        {t("whatIsStillWrongLabel")}
                        <textarea
                          value={stillWrong}
                          onChange={(e) => setStillWrong(e.target.value)}
                          rows={2}
                          className={`${inputClass} mt-1 resize-y`}
                        />
                      </label>
                      <p className="text-xs text-muted-foreground sm:col-span-2">
                        {t("falseClosureRecordsNote")}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-5">
            <SectionLabel>{t("whatWentWrongLabel")}</SectionLabel>
            <T id="whatWentWrongHelp" as="p" className="text-sm text-muted-foreground" />
          </div>
          <textarea
            value={grievance}
            onChange={(e) => setGrievance(e.target.value)}
            rows={7}
            maxLength={3000}
            placeholder={t("grievancePlaceholder")}
            className={`${inputClass} mt-4 resize-y`}
          />
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-0">
              <label className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className={knClass}>{t("applicationLanguageLabel")}</span>
                <select
                  value={language}
                  onChange={(e) => setLanguageOverride(e.target.value)}
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                >
                  <option value="en">English</option>
                  <option value="kn">ಕನ್ನಡ</option>
                </select>
              </label>
              <T
                id="applicationLanguageHelp"
                as="p"
                className="mt-1 max-w-xs text-[11px] leading-snug text-muted-foreground"
              />
            </div>

            <button
              disabled={
                routing || grievance.trim().length < 15 || !path || (path === "rti" && !prior)
              }
              onClick={() => void continueToStep2()}
              className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {routing ? t("routingChecking") : t("continueButton")}
            </button>
          </div>
          <p className="mt-4 rounded-md bg-secondary/70 p-3 text-xs text-muted-foreground">
            {t("legalSection62")}
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="paper-card mt-6 space-y-4 p-5">
          <SectionLabel>
            {path === "complaint" ? t("step2WhoseProblem") : t("step2WhoHoldsRecords")}
          </SectionLabel>

          {routeNote && (
            <div className="rounded-md border border-accent/40 bg-accent/8 p-3">
              {routeNote.unknownAuthority ? (
                <p className={`text-sm ${knClass}`}>{t("routingUnknownAuthority")}</p>
              ) : (
                <p className={`text-sm ${knClass}`}>
                  {(routeNote.ward ? t("routingSuggestionWard") : t("routingSuggestionNoWard"))
                    .replace("{authority}", authorityLabel(routeNote.authority))
                    .replace("{ward}", routeNote.ward)
                    .replace("{category}", routeNote.category || t("stepGrievance"))}
                </p>
              )}
              {routeNote.unknownLocality && (
                <p className={`mt-1 text-xs text-muted-foreground ${knClass}`}>
                  {t("routingUnknownWard").replace("{locality}", routeNote.unknownLocality)}
                </p>
              )}
              {routeNote.low && !routeNote.unknownAuthority && (
                <p className={`mt-1 text-xs text-muted-foreground ${knClass}`}>
                  {t("routingLowConfidence")}
                </p>
              )}
            </div>
          )}


          <div className="grid gap-2 sm:grid-cols-2">
            {AUTHORITIES.map((a) => (
              <button
                key={a.id}
                onClick={() => setAuthorityId(a.id)}
                className={`rounded-md border p-3 text-left transition-colors ${
                  authorityId === a.id ? "border-accent bg-accent/8" : "border-border hover:bg-secondary"
                }`}
              >
                <span className={`block text-sm font-medium ${knClass}`}>{authorityLabel(a.name)}</span>
                <span className={`mt-0.5 block text-xs text-muted-foreground ${knClass}`}>
                  {authorityNote(a.id, a.note)}
                </span>
              </button>
            ))}
          </div>

          {authorityId === "other" && (
            <input
              value={otherAuthority}
              onChange={(e) => setOtherAuthority(e.target.value)}
              placeholder={t("otherAuthorityPlaceholder")}
              className={inputClass}
            />
          )}

          <div>
            <SectionLabel>{t("pioNameAddressOptional")}</SectionLabel>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={pioName}
                onChange={(e) => setPioName(e.target.value)}
                placeholder={t("pioNamePlaceholder")}
                className={inputClass}
              />
              <input
                value={pioAddress}
                onChange={(e) => setPioAddress(e.target.value)}
                placeholder={t("pioAddressPlaceholder")}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <SectionLabel>{t("wardOptionalLabel")}</SectionLabel>
            <input
              value={wardQuery}
              onChange={(e) => setWardQuery(e.target.value)}
              placeholder={t("wardSearchPlaceholder")}
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
                    {lang === "kn" && w.ward_name_kn ? (
                      <span lang="kn" className={KN_TEXT}>
                        {w.ward_name_kn}
                      </span>
                    ) : (
                      w.ward_name
                    )}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setMapOpen((v) => !v)}
              className="mt-2 text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {mapOpen ? t("hideTheMap") : t("findItOnMap")}
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
                  {lang === "kn" && ward.ward_name_kn ? (
                    <>
                      <p lang="kn" className={`font-display text-sm font-semibold ${KN_TEXT}`}>
                        {ward.ward_name_kn}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{ward.ward_name}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-display text-sm font-semibold">{ward.ward_name}</p>
                      <p lang="kn" className={`mt-0.5 text-xs text-muted-foreground ${KN_TEXT}`}>
                        {ward.ward_name_kn}
                      </p>
                    </>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {authorityLabel(ward.corporation)} · {ward.zone_name} {t("zoneWord")} · {ward.assembly}
                  </p>
                </div>
                <div className="w-full sm:w-40 sm:shrink-0">
                  <WardInset3D wardId={ward.ward_id} corporation={ward.corporation} height={110} />
                </div>
              </div>
            )}

            {corpMismatch && !keepCorpChoice && (
              <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-3">
                <p className={`text-sm ${knClass}`}>
                  {t("corporationMismatch")
                    .replace("{ward}", lang === "kn" && ward?.ward_name_kn ? ward.ward_name_kn : ward?.ward_name ?? "")
                    .replace("{wardCorp}", authorityLabel(corpMismatch.name))
                    .replace("{selected}", authorityLabel(authority))}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setAuthorityId(corpMismatch.id);
                      setOtherAuthority("");
                      setRouteNote(null);
                    }}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    {t("switchToCorporation").replace("{corp}", authorityLabel(corpMismatch.name))}
                  </button>
                  <button
                    onClick={() => setKeepCorpChoice(true)}
                    className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
                  >
                    {t("keepMyChoice")}
                  </button>
                </div>
              </div>
            )}
          </div>




          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              {t("back")}
            </button>
            <button
              disabled={!authority || busy}
              onClick={() => void (path === "complaint" ? generateTheComplaint() : generate())}
              className="ml-auto rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
            >
              {busy
                ? t("drafting")
                : path === "complaint"
                  ? t("draftMyComplaint")
                  : t("draftMyRequests")}
            </button>
          </div>
        </div>
      )}

      {step === 3 && path === "complaint" && complaint && (
        <div className="mt-6 space-y-5">
          <div className="paper-card p-5">
            <SectionLabel>{t("whereYouAre")}</SectionLabel>
            <div className="mt-2">
              <StageRail current="complaint" />
            </div>
          </div>

          <div className="paper-card p-5">
            <SectionLabel>{t("step3YourComplaint")}</SectionLabel>
            <p className="text-sm text-muted-foreground">
              {complaint.category} · {t("asksForCheckableAction")}: {complaint.checkable_action}
            </p>
            <textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              rows={12}
              className={`${inputClass} mt-3 resize-y font-mono text-xs`}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                disabled={complaintBlanks.length > 0}
                onClick={() => {
                  void navigator.clipboard.writeText(complaintText);
                  toast.success(t("complaintCopied"));
                }}
                className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
              >
                {t("copy")}
              </button>
              <button
                disabled={complaintBlanks.length > 0}
                onClick={() => {
                  const blob = new Blob([complaintText], { type: "text/plain" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "complaint.txt";
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
                className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
              >
                {t("download")}
              </button>
            </div>
            {complaintBlanks.length > 0 ? <PlaceholderBlockNote /> : null}
          </div>

          <MissingDetails
            placeholders={complaintBlanks}
            busy={busy}
            onFill={(instruction, fields) =>
              void persistApplicant(fields).then(() => generateTheComplaint(instruction))
            }
          />

          {ward && <ResponsibleOfficials wardName={ward.ward_name} category={complaint.category} />}



          <div className="paper-card p-5">
            <SectionLabel>{t("whereToSendIt")}</SectionLabel>
            <T id="whereToSendItHelp" as="p" className="text-xs text-muted-foreground" />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {COMPLAINT_CHANNELS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChannelId(c.id)}
                  className={`rounded-md border p-3 text-left ${
                    channelId === c.id ? "border-accent bg-accent/8" : "border-border hover:bg-secondary"
                  }`}
                >
                  <span className={`block text-sm font-medium ${knClass}`}>
                    {channelLabel(c.id, c.name, c.note).name}
                  </span>
                  <span className={`mt-0.5 block text-xs text-muted-foreground ${knClass}`}>
                    {channelLabel(c.id, c.name, c.note).note}
                  </span>
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
            <SectionLabel>{t("markAsFiled")}</SectionLabel>
            <p className="text-xs text-muted-foreground">
              {t("complaintNoDeadlineNote").replace("{days}", String(COMPLAINT_EXPECTATION_DAYS))}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-muted-foreground">
                {t("complaintRefNumberLabel")}
                <input
                  value={sentRef}
                  onChange={(e) => setSentRef(e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className="text-xs text-muted-foreground">
                {t("dateSentLabel")}
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
                {t("back")}
              </button>
              <button
                disabled={saving}
                onClick={() => void saveComplaint(false)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50"
              >
                {t("saveAsDraft")}
              </button>
              <button
                disabled={saving}
                onClick={() => void saveComplaint(true)}
                className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {saving ? t("saving") : t("haveSentStartClock")}
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
              <T id="wrongAuthorityHeading" as="p" className="rule-heading text-destructive" />
              <p className="mt-2 text-sm">
                {t("wrongAuthorityBody")
                  .replace("{authority}", authority ?? "")
                  .replace("{suggested}", suggested ?? "")}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  disabled={busy}
                  onClick={switchToSuggested}
                  className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-60"
                >
                  {busy ? t("redrafting") : t("switchAndRedraft").replace("{suggested}", suggested ?? "")}
                </button>
                <button
                  onClick={() => setDismissedAuthorityHint(true)}
                  className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
                >
                  {t("keepAuthority").replace("{authority}", authority ?? "")}
                </button>
              </div>
            </div>
          )}

          {multiSubject && (
            <div className="paper-card border-warning/60 bg-warning/10 p-5">
              <T id="multiSubjectHeading" as="p" className="rule-heading text-warning-foreground" />
              <p className="mt-2 text-sm">
                {t("multiSubjectBody").replace("{subject}", active.subject)}
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {otherSubjects.map((s) => (
                  <li key={s.label}>
                    <span className="font-medium">{s.label}</span>
                    {s.summary ? (
                      <span className="text-muted-foreground"> — {s.summary}</span>
                    ) : null}
                    {hasDraftFor(s.label) ? (
                      <span className="text-accent"> · {t("draftedTag")}</span>
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
                      {busy ? t("drafting") : t("draftThisToo").replace("{label}", s.label)}
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">

            <div className="paper-card border-destructive/30 p-5">
              <T id="whatYouWroteHeading" as="p" className="rule-heading text-destructive" />
              <p className="mt-3 whitespace-pre-wrap font-display text-lg leading-snug">{grievance}</p>
              <T id="section2fNote" as="p" className="mt-3 text-xs text-muted-foreground" />
            </div>
            <div className="paper-card border-accent/40 p-5">
              <T id="whatWeAskForHeading" as="p" className="rule-heading text-accent" />
              <ol className="mt-3 space-y-3">
                {draft.requests.map((r, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{i + 1}. {r.text}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{r.rationale}</span>
                  </li>
                ))}
              </ol>
              <p className={`mt-3 text-xs ${overWordLimit ? "text-warning" : "text-muted-foreground"}`}>
                {t("wordsOfRule14")
                  .replace("{count}", String(requestWords))
                  .replace("{limit}", String(RULE14_WORD_LIMIT))}
              </p>
              {overWordLimit && (
                <T id="rule14OverLimitNote" as="p" className="mt-1 text-xs text-warning" />
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {t("confidenceLabel").replace("{value}", draft.confidence)}
                {draft.primary_subject
                  ? ` · ${t("subjectLabel").replace("{value}", draft.primary_subject)}`
                  : ""}
                {suggested
                  ? ` · ${t("suggestedAuthorityLabel").replace("{value}", suggested)}`
                  : ""}
              </p>
            </div>
          </div>

          <MissingDetails
            placeholders={letterBlanks}
            busy={revising}
            onFill={(fill, fields) => void persistApplicant(fields).then(() => runRevision(fill))}
          />

          <div className="paper-card p-5">
            <SectionLabel>{t("improveThisDraft")}</SectionLabel>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={3}
              placeholder={t("improveDraftPlaceholder")}
              className={`${inputClass} resize-y`}
            />
            <button
              disabled={revising || !instruction.trim()}
              onClick={() => void runRevision(instruction)}
              className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
            >
              {revising ? t("revising") : t("reviseButton")}
            </button>
          </div>


          {draft.flags.length > 0 ? (
            <div className="paper-card p-5">
              <SectionLabel>{t("preflightCheck")}</SectionLabel>
              <ul className="space-y-3">
                {draft.flags.map((f, i) => (
                  <li key={i} className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
                    <span className="rule-heading block text-warning-foreground">
                      {FLAG_LABEL_ID[f.type] ? t(FLAG_LABEL_ID[f.type]!) : f.type}
                    </span>
                    <span className="mt-1 block">{f.message}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {t("suggestionLabel").replace("{value}", f.suggestion)}
                    </span>
                    <button
                      disabled={revising}
                      onClick={() =>
                        void runRevision(
                          t("addressWordingProblem")
                            .replace("{message}", f.message)
                            .replace("{suggestion}", f.suggestion),
                        )
                      }
                      className="mt-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-60"
                    >
                      {revising ? t("revising") : t("applyThisFix")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <T id="preflightPassed" as="p" className="text-xs text-muted-foreground" />
          )}


          <div className="paper-card p-5">
            <SectionLabel>{t("editBeforeFiling")}</SectionLabel>

            {letterBlanks.length > 0 ? <PlaceholderBlockNote /> : null}
            {bodyKn ? (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("portalLatinOnlyNote")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setLetterVersion("kn")}
                    className={`rounded-md border px-3 py-1.5 text-xs ${letterVersion === "kn" ? "border-accent bg-accent/10" : "border-border hover:bg-secondary"}`}
                  >
                    {t("kannadaPostalOnly")}
                  </button>
                  <button
                    onClick={() => setLetterVersion("en")}
                    className={`rounded-md border px-3 py-1.5 text-xs ${letterVersion === "en" ? "border-accent bg-accent/10" : "border-border hover:bg-secondary"}`}
                  >
                    {t("englishPortal")}
                  </button>
                </div>
              </>
            ) : null}

            <textarea
              value={bodyKn && letterVersion === "kn" ? bodyKn : body}
              onChange={(e) =>
                updateActive(
                  bodyKn && letterVersion === "kn"
                    ? { bodyKn: e.target.value }
                    : { body: e.target.value },
                )
              }
              rows={22}
              className={`${inputClass} mt-3 font-mono text-xs leading-relaxed`}
            />
            {bodyKn ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {letterVersion === "kn" ? t("postThisVersionNote") : t("fileThisVersionNote")}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setStep(2)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                {t("back")}
              </button>
              <button
                disabled={saving}
                onClick={() => save(false)}
                className="ml-auto rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"
              >
                {t("saveAsDraft")}
              </button>
              <button
                disabled={saving}
                onClick={() => save(true)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {t("saveAndMarkFiledToday")}
              </button>
              {drafts.length > 1 && drafts.some((d) => !d.saved) && (
                <button
                  disabled={saving}
                  onClick={() => void saveAll()}
                  className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50 sm:w-auto"
                >
                  {saving ? t("saving") : t("saveAllAsDrafts")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function ResponsibleOfficials({ wardName, category }: { wardName: string; category: string }) {
  const { t } = useLang();
  const { data, loading } = useWardOfficials(wardName);
  const list = useMemo(
    () => relevantOfficials(data?.officials ?? [], category),
    [data, category],
  );

  return (
    <div className="paper-card p-5">
      <SectionLabel>{t("whoIsResponsible")}</SectionLabel>
      <T id="whoIsResponsibleHelp" as="p" className="text-sm text-muted-foreground" />
      {loading ? (
        <OfficialsSkeleton />
      ) : (
        <>
          {data?.oldBbmpWard ? (
            <p className="mt-2 text-xs">
              {t("oldBbmpWardNote")
                .replace("{ward}", wardName)
                .replace("{oldWard}", data.oldBbmpWard)}
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
