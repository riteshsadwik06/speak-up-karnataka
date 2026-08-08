import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, SectionLabel } from "@/components/app-shell";
import { AUTHORITIES, WARDS, LEGAL, addDays, today } from "@/lib/rti-data";
import { generateDraft } from "@/lib/rti.functions";
import type { RtiDraft } from "@/lib/rti.server";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/new")({
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

function NewApplication() {
  const router = useRouter();
  const run = useServerFn(generateDraft);

  const [step, setStep] = useState(1);
  const [grievance, setGrievance] = useState("");
  const [language, setLanguage] = useState("en");
  const [authorityId, setAuthorityId] = useState("");
  const [otherAuthority, setOtherAuthority] = useState("");
  const [pioName, setPioName] = useState("");
  const [pioAddress, setPioAddress] = useState("");
  const [wardQuery, setWardQuery] = useState("");
  const [wardId, setWardId] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<RtiDraft | null>(null);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const authority =
    authorityId === "other"
      ? otherAuthority
      : (AUTHORITIES.find((a) => a.id === authorityId)?.name ?? "");
  const ward = WARDS.find((w) => w.ward_id === wardId);

  const wardOptions = useMemo(() => {
    const q = wardQuery.trim().toLowerCase();
    const pool = q
      ? WARDS.filter((w) => `${w.ward_name} ${w.corporation} ${w.ward_id}`.toLowerCase().includes(q))
      : WARDS;
    return pool.slice(0, 12);
  }, [wardQuery]);

  async function generate() {
    setBusy(true);
    try {
      const result = await run({
        data: { grievance, authority, ward: ward?.ward_name ?? null, language },
      });
      setDraft(result.draft);
      setBody(result.body);
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not draft the application");
    } finally {
      setBusy(false);
    }
  }

  async function save(markFiled: boolean, filedDate?: string) {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("applications")
        .insert({
          user_id: userData.user!.id,
          grievance_text: grievance,
          language,
          public_authority: authority,
          pio_name: pioName || null,
          pio_address: pioAddress || null,
          ward_id: ward?.ward_id ?? null,
          ward_name: ward?.ward_name ?? null,
          corporation: ward?.corporation ?? null,
          generated_requests: draft?.requests ?? [],
          application_body: body,
          status: markFiled ? "filed" : "draft",
          filed_date: markFiled ? (filedDate ?? today()) : null,
          response_due_date: markFiled ? addDays(filedDate ?? today(), LEGAL.pioDays) : null,
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

  return (
    <AppShell>
      <h1 className="text-3xl sm:text-4xl">New RTI application</h1>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {["Grievance", "Authority", "Requests", "File it"].map((label, i) => (
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
          <SectionLabel>Step 1 · What went wrong?</SectionLabel>
          <p className="text-sm text-muted-foreground">
            Write it plainly, in English or Kannada. Do not try to sound legal — that is our job.
          </p>
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
              disabled={grievance.trim().length < 15}
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
          <SectionLabel>Step 2 · Who holds the records?</SectionLabel>
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
            <div className="mt-3">
              <WardMap
                selectedId={wardId}
                onSelect={setWardId}
                highlightIds={
                  wardQuery.trim() ? wardOptions.map((w) => w.ward_id) : undefined
                }
              />
            </div>
            {ward && (
              <p className="mt-2 text-xs text-muted-foreground">
                {ward.ward_name} · {ward.corporation} · {ward.assembly}
              </p>
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
              onClick={generate}
              className="ml-auto rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
            >
              {busy ? "Drafting…" : "Draft my requests"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && draft && (
        <div className="mt-6 space-y-5">
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
            </div>
          </div>

          {draft.flags.length > 0 && (
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
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Confidence: {draft.confidence} · Suggested authority: {draft.suggested_authority}
              </p>
            </div>
          )}

          <div className="paper-card p-5">
            <SectionLabel>The application — edit anything before you file</SectionLabel>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
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
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
