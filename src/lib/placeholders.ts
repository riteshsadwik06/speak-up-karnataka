/**
 * Bracketed-placeholder detection.
 *
 * A letter that reaches a government portal must never contain "[street name]".
 * Prompts are told not to produce placeholders; this is the detection layer that
 * assumes they will anyway. Client-safe: no server-only imports.
 */

/** Single square brackets only — the ward tokens use [[DOUBLE]] and are internal. */
const PLACEHOLDER_RE = /(?<!\[)\[([^[\]\n]{2,90})\](?!\])/g;

/** Unique placeholder labels, in order of first appearance. */
export function findPlaceholders(text: string | null | undefined): string[] {
  if (!text) return [];
  const out: string[] = [];
  for (const m of text.matchAll(PLACEHOLDER_RE)) {
    const label = (m[1] ?? "").trim();
    if (!label) continue;
    // Skip statutory references a letter legitimately carries, e.g. "[sic]".
    if (/^(sic|\d+)$/i.test(label)) continue;
    if (!out.some((l) => l.toLowerCase() === label.toLowerCase())) out.push(label);
  }
  return out;
}

export function hasPlaceholders(text: string | null | undefined): boolean {
  return findPlaceholders(text).length > 0;
}

/** Plain-language ask built from the placeholder label itself. */
export function placeholderQuestion(label: string): string {
  return label.replace(/\s*\/\s*/g, " or ").replace(/^\w/, (c) => c.toUpperCase());
}

/** Turns answered placeholders into a revision instruction for the existing revise path. */
export function buildFillInstruction(answers: { label: string; value: string }[]): string {
  const supplied = answers
    .filter((a) => a.value.trim())
    .map((a) => `- ${a.label}: ${a.value.trim()}`)
    .join("\n");
  return [
    "Rewrite the text using these details supplied by the citizen:",
    supplied,
    "Remove every square-bracket placeholder. If a detail is still missing, write the sentence without it — never leave a blank for the citizen to fill in.",
  ]
    .filter(Boolean)
    .join("\n");
}
