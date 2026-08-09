/**
 * Missing-details panel.
 *
 * When a generated letter still contains square-bracket placeholders, we do not
 * present it as finished. The citizen answers each blank here and the draft is
 * regenerated through the existing revise path.
 */
import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { buildFillInstruction, placeholderQuestion } from "@/lib/placeholders";
import { applicantFieldFor, type ProfileField } from "@/lib/applicant";

export function MissingDetails({
  placeholders,
  busy,
  onFill,
}: {
  placeholders: string[];
  busy: boolean;
  /** `fields` carries answers that belong on the profile, so they are never asked twice. */
  onFill: (instruction: string, fields: Partial<Record<ProfileField, string>>) => void;
}) {
  const { t } = useLang();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (placeholders.length === 0) return null;

  const anyAnswer = placeholders.some((p) => (answers[p] ?? "").trim());

  return (
    <div className="paper-card border-warning/50 bg-warning/8 p-5">
      <span className="rule-heading block text-warning-foreground">{t("missingDetailsTitle")}</span>
      <p className="mt-1 text-xs text-muted-foreground">{t("missingDetailsHelp")}</p>
      <div className="mt-3 space-y-3">
        {placeholders.map((p) => (
          <label key={p} className="block">
            <span className="block text-xs font-medium">{placeholderQuestion(p)}</span>
            <input
              value={answers[p] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [p]: e.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        ))}
      </div>
      <button
        disabled={busy || !anyAnswer}
        onClick={() => {
          const fields: Partial<Record<ProfileField, string>> = {};
          for (const label of placeholders) {
            const value = (answers[label] ?? "").trim();
            const field = applicantFieldFor(label);
            if (value && field) fields[field] = value;
          }
          onFill(
            buildFillInstruction(placeholders.map((label) => ({ label, value: answers[label] ?? "" }))),
            fields,
          );
        }}
        className="mt-3 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
      >
        {busy ? t("missingDetailsWorking") : t("missingDetailsSubmit")}
      </button>
    </div>
  );
}


/** Shown next to a disabled Copy/Download pair. */
export function PlaceholderBlockNote() {
  const { t } = useLang();
  return <p className="mt-2 text-xs text-warning-foreground">{t("placeholderBlockNote")}</p>;
}
