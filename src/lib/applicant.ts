/**
 * Applicant identity used in filed letters.
 *
 * Client-safe: no server-only imports. Both the letter generators and the
 * missing-details panel read from here so a blank asked for on screen maps to
 * the profile column that will stop it being asked again.
 */

export type ProfileField = "full_name" | "address" | "phone" | "email";

export type Applicant = {
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

/** The one deliberate placeholder: an RTI application without a name is not valid. */
export const NAME_PLACEHOLDER = "Your full name";

/**
 * Which profile column a bracketed label is asking for, if any.
 * Deliberately conservative — an unmatched label falls back to the revise loop.
 */
export function applicantFieldFor(label: string): ProfileField | null {
  const l = label.toLowerCase();
  // The appellate authority's own address is not the applicant's.
  if (/office|authority|department|pio|faa|appellate|pin\s*code|pincode/.test(l)) return null;
  if (/name/.test(l)) return "full_name";
  if (/e-?mail/.test(l)) return "email";
  if (/mobile|phone|contact number|telephone/.test(l)) return "phone";
  if (/address|residence|postal/.test(l)) return "address";
  return null;
}

/** Signature block: real values only, empty fields omitted, never a bracket. */
export function applicantSignature(a: Applicant, opts?: { requireName?: boolean }): string {
  const name = (a.name ?? "").trim();
  const lines = [
    name || (opts?.requireName ? `[${NAME_PLACEHOLDER}]` : ""),
    (a.address ?? "").trim(),
    (a.phone ?? "").trim() ? `Phone: ${(a.phone ?? "").trim()}` : "",
    (a.email ?? "").trim() ? `Email: ${(a.email ?? "").trim()}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}
