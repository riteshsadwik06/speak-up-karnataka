import { LEGAL } from "./rti-data";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-5.6-sol";

export type RtiRequest = { text: string; rationale: string };
export type RtiFlag = {
  type: "opinion_seeking" | "exemption_risk" | "too_broad" | "wrong_authority";
  message: string;
  suggestion: string;
};
export type RtiSubject = { label: string; summary: string };
export type RtiDraft = {
  requests: RtiRequest[];
  flags: RtiFlag[];
  subjects: RtiSubject[];
  primary_subject: string;
  suggested_authority: string;
  confidence: "high" | "medium" | "low";
};

/**
 * Ward identity is passed to the model as structured, verbatim data — never as prose
 * for it to recompose. Anything not present here must not appear in a filed document.
 */
export type WardIdentity = {
  name: string;
  nameKn?: string | null;
  /** Plain ward number, e.g. "17". Never a synthesised code such as "C-017". */
  number?: string | null;
  corporation?: string | null;
  zone?: string | null;
  assembly?: string | null;
  oldBbmpWard?: string | null;
};

/** Shared anti-fabrication rule. Appended to every prompt that produces filed text. */
export const NO_FABRICATION_RULE = `Never invent or construct an identifier of any kind - ward numbers, file numbers, reference numbers, zone codes. Use only identifiers supplied to you verbatim. If one has not been supplied, omit it rather than inferring a format.`;

/** Shared anti-placeholder rule. A short complete letter beats one full of blanks. */
export const NO_PLACEHOLDER_RULE = `Never write placeholder text in square brackets or any other form. If a detail is missing, write the letter without it. A shorter, complete letter is always better than one containing blanks for the citizen to fill in.`;

const WARD_TOKENS = {
  name: "[[WARD_NAME]]",
  nameKn: "[[WARD_NAME_KN]]",
  number: "[[WARD_NUMBER]]",
  corporation: "[[CORPORATION]]",
  zone: "[[ZONE]]",
  assembly: "[[ASSEMBLY]]",
  oldBbmpWard: "[[OLD_BBMP_WARD]]",
  line: "[[WARD_LINE]]",
} as const;

/** The only correct written form of ward identity: plain number + full corporation name. */
export function wardLine(ward: WardIdentity | null | undefined): string {
  if (!ward?.name) return "";
  const parts = [ward.number ? `Ward ${ward.number}` : "", ward.corporation ?? ""].filter(Boolean);
  return parts.length ? parts.join(", ") : ward.name;
}

/** Structured ward data plus opaque tokens: the model places tokens, never identity values. */
export function wardPromptBlock(ward: WardIdentity | null | undefined): string {
  if (!ward?.name) return "WARD_IDENTITY_JSON: null\nNo ward has been supplied. Do not name or infer one.";
  return [
    `WARD_IDENTITY_JSON: ${JSON.stringify({
      ward_name: ward.name,
      ward_name_kannada: ward.nameKn ?? null,
      ward_number: ward.number ?? null,
      corporation: ward.corporation ?? null,
      zone: ward.zone ?? null,
      assembly_constituency: ward.assembly ?? null,
      old_bbmp_ward_name: ward.oldBbmpWard ?? null,
    })}`,
    `WARD_PLACEHOLDERS_JSON: ${JSON.stringify(WARD_TOKENS)}`,
    "When ward identity is relevant, put only the matching placeholder in the generated document. Do not copy, rewrite, translate, abbreviate or compose the identity value yourself. Omit placeholders whose structured value is null.",
    "There is no such thing as a lettered ward code. Never write forms like \"C-017\" or \"Ward N-012\". Where a full identification is wanted, use the [[WARD_LINE]] placeholder, which the application renders as \"Ward 17, Bengaluru Central City Corporation\".",
  ].join("\n");
}

/** Replaces only known placeholders with authoritative values after model generation. */
export function interpolateWardIdentity(text: string, ward: WardIdentity | null | undefined): string {
  const values: Record<string, string> = {
    [WARD_TOKENS.name]: ward?.name ?? "",
    [WARD_TOKENS.nameKn]: ward?.nameKn ?? "",
    [WARD_TOKENS.number]: ward?.number ?? "",
    [WARD_TOKENS.corporation]: ward?.corporation ?? "",
    [WARD_TOKENS.zone]: ward?.zone ?? "",
    [WARD_TOKENS.assembly]: ward?.assembly ?? "",
    [WARD_TOKENS.oldBbmpWard]: ward?.oldBbmpWard ?? "",
    [WARD_TOKENS.line]: wardLine(ward),
  };
  let output = text;
  for (const [token, value] of Object.entries(values)) output = output.split(token).join(value);
  return output.replace(/[ \t]{2,}/g, " ").replace(/ ,/g, ",").replace(/,\s*,/g, ",").replace(/\(\s*\)/g, "");
}

/**
 * Post-generation guard: strips ward/zone-code-like tokens the caller never supplied.
 * A fabricated official identifier in a document a citizen files is worse than none.
 */
const IDENTIFIER_PATTERNS: RegExp[] = [
  /\b(?:Ward|ವಾರ್ಡ್)\s*(?:(?:No\.?|Number|#)\s*[:.-]?\s*)?[A-Z]-?\d{1,4}\b/gi,
  /\b(?:Ward|ವಾರ್ಡ್)\s*(?:(?:No\.?|Number|#)\s*[:.-]?\s*)?\d{1,4}\b/gi,
  // Any "letter-hyphen-digits" construction: no department issues these.
  /\(?\b[A-Z]-\d{1,4}\b\)?/g,
];

export function stripUnsuppliedIdentifiers(text: string, supplied: (string | null | undefined)[]): string {
  const allow = supplied
    .filter((s): s is string => Boolean(s && s.trim()))
    .map((s) => s.trim().toLowerCase());
  let out = text;
  for (const re of IDENTIFIER_PATTERNS) {
    out = out.replace(re, (match) => {
      const norm = match.trim().toLowerCase();
      if (allow.some((a) => norm.includes(a))) return match;
      console.warn(`[rti] stripped unsupplied identifier from generated text: "${match}"`);
      return "";
    });
  }
  // Tidy the punctuation the removal leaves behind.
  return out.replace(/[ \t]{2,}/g, " ").replace(/ ,/g, ",").replace(/,\s*,/g, ",").replace(/\(\s*\)/g, "");
}



export const DRAFT_SYSTEM_PROMPT = `You help Indian citizens draft Right to Information (RTI) applications under the RTI Act 2005.

The Act entitles a citizen to information held in records by a public authority — documents, file notings, work orders, tender papers, sanction letters, inspection reports, complaint registers, expenditure statements, correspondence. It does NOT entitle a citizen to explanations, justifications, opinions, reasons for a decision, or answers to hypothetical questions. Section 2(f) defines information as material in recorded form.

Given a citizen's grievance in plain language (English or Kannada), produce document requests that would surface the truth behind that grievance and that a Public Information Officer is legally obliged to answer.

Rules:
- Every request must ask for a record, not an answer. Never begin a request with "why".
- Be specific about time period, location, and document type.
- Prefer "certified copies of...", "a list of...", "the file notings on...", "the total expenditure on...".
- 3 to 6 requests. More than that invites a fee demand and delay.
- Flag any request likely to be refused under Section 8 exemptions — particularly 8(1)(d) commercial confidence, 8(1)(e) fiduciary relationship, 8(1)(j) personal information of third parties — and suggest a narrower reframing.
- Never ask the applicant to state a reason for wanting the information. Section 6(2) explicitly bars a public authority from requiring reasons.
- Write the requests in English even when the grievance is in Kannada.

Karnataka's Rule 14 requires that a single RTI application relate to ONE subject matter. If a request covers more than one, the Public Information Officer may lawfully answer only the first subject and discard the rest. First, identify every distinct civic subject in the grievance - treat things as distinct subjects when they would be held by different departments or in different record sets (road works, street lighting, solid waste, water supply, sewerage, building permissions, property records are all distinct subjects). List them in "subjects". Then draft requests for the SINGLE most substantial subject only, and name it in "primary_subject". Never mix subjects across the numbered requests.
Rule 14 also states an application shall not ordinarily exceed 150 words. Keep the combined text of the numbered requests under 150 words. Be terse and specific; drop filler. Do not sacrifice the time period, the location or the document type to save words - those are what make a request answerable.

${NO_FABRICATION_RULE}
- Ward identity is supplied as structured JSON with placeholders. In document text, use only those placeholders; application code replaces them with authoritative values after generation.


Return ONLY valid JSON, no markdown fences:
{ "requests": [{"text": "...", "rationale": "why this record matters"}], "flags": [{"type": "opinion_seeking|exemption_risk|too_broad|wrong_authority", "message": "...", "suggestion": "..."}], "subjects": [{"label": "short name of the subject, e.g. Road resurfacing", "summary": "one line"}], "primary_subject": "label of the subject the returned requests cover", "suggested_authority": "...", "confidence": "high|medium|low" }`;

export const APPEAL_SYSTEM_PROMPT = `You draft appeals under the Right to Information Act 2005 for applicants in Karnataka, India.

A FIRST APPEAL is under Section 19(1), filed with the First Appellate Authority of the same public authority, within 30 days of the reply or of the date the reply was due. Where no reply was received within 30 days, cite deemed refusal under Section 7(2).
A SECOND APPEAL is under Section 19(3), filed with the Karnataka State Information Commission (${LEGAL.ksicAddress}) within 90 days, and may be filed once 45 days have elapsed with no decision from the First Appellate Authority.

Write a complete, formal, ready-to-send appeal letter in plain text. Include: addressee block, subject line citing the correct section, a short numbered chronology of dates, the grounds of appeal with the correct statutory citations, the relief sought, and a signature block with placeholders in square brackets. Never ask for explanations or reasons — only records. Never state a reason for wanting the information (Section 6(2)).

Return ONLY the letter text. No markdown, no commentary, no code fences.`;

async function callGateway(system: string, user: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this project.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: MODEL,
      input: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (res.status === 429) throw new Error("Too many requests right now — please try again in a minute.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Plans & credits.");
  if (!res.ok) throw new Error(`AI request failed (${res.status}): ${await res.text()}`);

  const json = (await res.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  const text =
    json.output_text ??
    (json.output ?? [])
      .flatMap((o) => o.content ?? [])
      .map((c) => c.text ?? "")
      .join("");
  if (!text.trim()) throw new Error("The AI returned an empty response. Please try again.");
  return text.trim();
}

function parseJson(raw: string): unknown {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("The AI response could not be read. Please try again.");
  }
}

export type FalseClosure = {
  ref: string;
  complaintText: string;
  filedDate: string | null;
  closureDate: string | null;
  whatIsStillWrong: string;
};

export async function draftRequests(input: {
  grievance: string;
  authority: string;
  ward?: WardIdentity | null;
  focusSubject?: string | null;
  falseClosure?: FalseClosure | null;
}): Promise<RtiDraft> {
  const fc = input.falseClosure;
  const user = [
    `Public authority selected by the citizen: ${input.authority}`,
    wardPromptBlock(input.ward),
    "",
    "Grievance in the citizen's own words:",
    input.grievance,
    input.focusSubject ? `\nDraft requests for this subject only: ${input.focusSubject}` : "",
    fc
      ? `\nThis RTI follows a civic complaint that the authority marked RESOLVED without doing the work. Complaint reference: ${fc.ref || "not recorded"}, filed ${fc.filedDate ?? "not recorded"}, marked resolved ${fc.closureDate ?? "not recorded"}. The citizen states the problem persists: ${fc.whatIsStillWrong}. Draft requests that would prove whether any work was actually carried out - the action-taken report, the work order and its date, the name and designation of the officer who closed the complaint, the completion certificate, the site photograph relied on for closure, the measurement book entry, and the expenditure booked against that work. These are the records that cannot exist if the work was not done.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");


  const parsed = parseJson(await callGateway(DRAFT_SYSTEM_PROMPT, user)) as Partial<RtiDraft>;
  const subjects = Array.isArray(parsed.subjects)
    ? parsed.subjects.filter((s) => s && typeof s.label === "string" && s.label.trim())
    : [];
  const supplied = [input.ward?.number, input.ward?.name, input.ward?.corporation, input.ward?.zone, input.ward?.oldBbmpWard];
  return {
    requests: Array.isArray(parsed.requests)
      ? parsed.requests
          .slice(0, 6)
          .map((r) => ({
            ...r,
            text: interpolateWardIdentity(
              stripUnsuppliedIdentifiers(String(r.text ?? ""), supplied),
              input.ward,
            ),
          }))
      : [],
    flags: Array.isArray(parsed.flags) ? parsed.flags : [],
    subjects,
    primary_subject: typeof parsed.primary_subject === "string" ? parsed.primary_subject : "",
    suggested_authority: parsed.suggested_authority ?? input.authority,
    confidence: parsed.confidence ?? "medium",
  };
}

export function assembleApplication(input: {
  authority: string;
  pioName?: string | null;
  pioAddress?: string | null;
  wardName?: string | null;
  requests: RtiRequest[];
  applicantName?: string | null;
  applicantAddress?: string | null;
  applicantPhone?: string | null;
  isBpl?: boolean;
}): string {
  const numbered = input.requests
    .map((r, i) => `${i + 1}. ${r.text}`)
    .join("\n\n");

  return `To,
The Public Information Officer${input.pioName ? `, ${input.pioName}` : ""}
${input.authority}
${input.pioAddress ?? "[PIO office address]"}

Subject: Application for information under Section 6(1) of the Right to Information Act, 2005

Sir/Madam,

Under Section 6(1) of the Right to Information Act, 2005, I request the following information${
    input.wardName ? ` pertaining to ${input.wardName} ward` : ""
  }:

${numbered}

Where a record is voluminous, please provide an inspection date under Section 2(j)(i) instead of copies.

${
  input.isBpl
    ? "I belong to a Below Poverty Line household and am exempt from the application fee under the Karnataka Right to Information Rules. A copy of my BPL card is enclosed."
    : "The prescribed application fee of Rs. 10 is enclosed. I undertake to pay the copying charges of Rs. 2 per A4 page on demand."
}

If any part of this information is held by another public authority, please transfer that part under Section 6(3) within five days and inform me of the transfer.

If any part is refused, please state the specific exemption under Section 8 or 9 relied upon, along with the particulars of the First Appellate Authority under Section 19(1), as required by Section 7(8).

Yours faithfully,

${input.applicantName ?? "[Your full name]"}
${input.applicantAddress ?? "[Your postal address]"}
${input.applicantPhone ? `Phone: ${input.applicantPhone}` : "Phone: [Your phone number]"}
Date: ${new Date().toISOString().slice(0, 10)}`;
}

export async function draftAppeal(input: {
  tier: "first" | "second";
  reason: string;
  authority: string;
  wardName?: string | null;
  grievance: string;
  requests: RtiRequest[];
  filedDate: string | null;
  dueDate: string | null;
  replyDate: string | null;
  replyNotes: string | null;
  firstAppealFiledDate?: string | null;
}): Promise<string> {
  const user = [
    `Appeal tier: ${input.tier === "first" ? "FIRST APPEAL, Section 19(1)" : "SECOND APPEAL, Section 19(3)"}`,
    `Reason for appeal: ${input.reason}`,
    `Public authority: ${input.authority}`,
    input.wardName ? `Ward: ${input.wardName}` : "",
    `Original RTI application filed on: ${input.filedDate ?? "not recorded"}`,
    `Reply was due on: ${input.dueDate ?? "not recorded"}`,
    `Reply received on: ${input.replyDate ?? "no reply received"}`,
    input.replyNotes ? `Notes on the reply: ${input.replyNotes}` : "",
    input.firstAppealFiledDate ? `First appeal was filed on: ${input.firstAppealFiledDate}` : "",
    `Today's date: ${new Date().toISOString().slice(0, 10)}`,
    "",
    "Original grievance:",
    input.grievance,
    "",
    "Information sought in the original application:",
    input.requests.map((r, i) => `${i + 1}. ${r.text}`).join("\n"),
  ]
    .filter(Boolean)
    .join("\n");

  return callGateway(APPEAL_SYSTEM_PROMPT, user);
}

export const REVISE_SYSTEM_PROMPT = `You revise draft Right to Information requests under the RTI Act 2005 for applicants in Karnataka.

You will be given the citizen's original grievance, the current numbered requests, and a revision instruction. Apply the instruction and return the full revised set of requests.

Keep every request that the instruction does not affect, unchanged. Do not renumber gratuitously, do not drop requests the instruction did not ask you to drop, and do not add unrelated requests.

All the original rules still apply: ask for records and never explanations, never begin a request with "why", be specific about time period, location and document type, stay on ONE subject matter under Karnataka's Rule 14, keep the combined text of the requests under 150 words, and never state a reason for wanting the information (Section 6(2)).

If the citizen has supplied new specifics - dates, a street name, a complaint number, a ward - work them into the relevant requests to make them harder to refuse as vague.

${NO_FABRICATION_RULE}


Return ONLY valid JSON, no markdown fences:
{ "requests": [{"text": "...", "rationale": "..."}], "flags": [{"type": "opinion_seeking|exemption_risk|too_broad|wrong_authority", "message": "...", "suggestion": "..."}], "subjects": [{"label": "...", "summary": "..."}], "primary_subject": "...", "suggested_authority": "...", "confidence": "high|medium|low" }`;

export async function reviseRequests(input: {
  grievance: string;
  authority: string;
  ward?: WardIdentity | null;
  subject: string;
  requests: RtiRequest[];
  instruction: string;
}): Promise<RtiDraft> {
  const user = [
    `Public authority: ${input.authority}`,
    wardPromptBlock(input.ward),
    input.subject ? `Subject matter of this application: ${input.subject}` : "",
    "",
    "Original grievance in the citizen's own words:",
    input.grievance,
    "",
    "Current requests:",
    input.requests.map((r, i) => `${i + 1}. ${r.text}`).join("\n"),
    "",
    "Revision instruction:",
    input.instruction,
  ]
    .filter(Boolean)
    .join("\n");

  const parsed = parseJson(await callGateway(REVISE_SYSTEM_PROMPT, user)) as Partial<RtiDraft>;
  const subjects = Array.isArray(parsed.subjects)
    ? parsed.subjects.filter((s) => s && typeof s.label === "string" && s.label.trim())
    : [];
  const supplied = [input.ward?.number, input.ward?.name, input.ward?.corporation, input.ward?.zone, input.ward?.oldBbmpWard];
  return {
    requests: Array.isArray(parsed.requests)
      ? parsed.requests.slice(0, 6).map((r) => ({
          ...r,
          text: interpolateWardIdentity(
            stripUnsuppliedIdentifiers(String(r.text ?? ""), supplied),
            input.ward,
          ),
        }))
      : [],
    flags: Array.isArray(parsed.flags) ? parsed.flags : [],
    subjects,
    primary_subject:
      typeof parsed.primary_subject === "string" && parsed.primary_subject.trim()
        ? parsed.primary_subject
        : input.subject,
    suggested_authority: parsed.suggested_authority ?? input.authority,
    confidence: parsed.confidence ?? "medium",
  };
}

export type ComplaintDraft = {
  complaint: string;
  suggested_channel: string;
  category: string;
  checkable_action: string;
};

export const COMPLAINT_SYSTEM_PROMPT = `You write civic grievance complaints for residents of Bengaluru, for submission to Sahaaya 2.0 (the Greater Bengaluru Authority grievance system) or to BWSSB, BESCOM or another public authority.

A complaint is NOT an RTI application. It asks for action, not records. Write it so that it is specific enough that it cannot be closed as "insufficient information" and specific enough that a later audit can check whether the work was actually done.

Rules:
- State the exact location: street, landmark, ward name and number where known.
- State when the problem began and how long it has persisted.
- State the observable consequence (flooding, injury risk, contamination, outage duration).
- Ask for a specific, checkable action - not "please fix this" but "please desilt the storm water drain along X and confirm with a site photograph".
- Explicitly request the action-taken report and a completion photograph on closure. This is the single most important line: it sets up the evidence trail if the complaint is later closed without work.
- Keep it under 200 words. Plain, factual, unemotional. No threats, no legal citations - this is not the RTI stage.

When asked to write in Kannada, write the complaint in Kannada, in the formal register a citizen uses when writing to a municipal authority.

${NO_FABRICATION_RULE}
- Ward identity is supplied as structured JSON with placeholders. In complaint text, use only those placeholders; application code replaces them with authoritative values after generation. If a value is not supplied, omit its placeholder.


Return ONLY valid JSON, no markdown fences:
{ "complaint": "the complaint text", "suggested_channel": "sahaaya|bwssb|bescom|other", "category": "short issue category", "checkable_action": "the one specific action requested" }`;

export async function draftComplaint(input: {
  grievance: string;
  authority: string;
  ward?: WardIdentity | null;
  /** 'kn' writes the complaint in Kannada. Sahaaya and the helplines accept Kannada. */
  lang?: "en" | "kn";
}): Promise<ComplaintDraft> {
  const user = [
    input.lang === "kn"
      ? "Write the complaint in Kannada, in the formal register a citizen uses when writing to a municipal authority. The JSON keys stay in English; only the value of \"complaint\" is in Kannada."
      : "",
    `Public authority / department: ${input.authority}`,
    wardPromptBlock(input.ward),
    "",
    "The resident's account of the problem:",
    input.grievance,
  ]
    .filter(Boolean)
    .join("\n");

  const parsed = parseJson(await callGateway(COMPLAINT_SYSTEM_PROMPT, user)) as Partial<ComplaintDraft>;
  const supplied = [input.ward?.number, input.ward?.name, input.ward?.corporation, input.ward?.zone, input.ward?.oldBbmpWard];
  return {
    complaint:
      typeof parsed.complaint === "string"
        ? interpolateWardIdentity(
            stripUnsuppliedIdentifiers(parsed.complaint.trim(), supplied),
            input.ward,
          )
        : "",
    suggested_channel:
      typeof parsed.suggested_channel === "string" ? parsed.suggested_channel : "sahaaya",
    category: typeof parsed.category === "string" ? parsed.category : "",
    checkable_action: typeof parsed.checkable_action === "string" ? parsed.checkable_action : "",
  };
}

/* ------------------------------------------------------------------ *
 * Routing pass — "we find who owns it"
 * ------------------------------------------------------------------ */

export type RouteSuggestion = {
  authority_id: string;
  locality: string;
  category: string;
  confidence: "high" | "medium" | "low";
};

export const ROUTE_SYSTEM_PROMPT = `You route a Bengaluru resident's civic grievance to the public authority that owns the problem.

Authority ids you may return, and what each owns:
- bcc / bec / bwc / bnc / bsc: the five Bengaluru city corporations (Central, East, West, North, South). Ward-level roads, footpaths, storm water drains, garbage and solid waste, street lights, parks, stray animals, property tax and khata.
- gba: Greater Bengaluru Authority. Arterial roads, planning, projects spanning corporations.
- bwssb: piped water supply, sewage and underground drainage (NOT storm water drains, which belong to the corporation).
- bescom: electricity supply, transformers, power cuts, billing.
- bmrcl: Namma Metro construction and operations.
- bda: BDA layouts, sites, development schemes.
- other: anything else.

Choose the corporation only when you can tell which one from the locality named. If the resident names a locality but you are not certain of the corporation, still return the locality and set confidence to "low".

Return the locality exactly as the resident wrote it (a neighbourhood, ward or area name). Return an empty string if no locality is named. Never invent an identifier of any kind - no ward numbers, no zone codes. ${NO_FABRICATION_RULE}

Return ONLY valid JSON, no markdown fences:
{ "authority_id": "one of the ids above", "locality": "locality as written, or empty string", "category": "short issue category in English, e.g. Storm water drainage", "confidence": "high|medium|low" }`;

const ROUTE_IDS = new Set([
  "bcc", "bec", "bwc", "bnc", "bsc", "gba", "bwssb", "bescom", "bmrcl", "bda", "other",
]);

/** Best-effort. Never throws — a failed routing pass simply means no suggestion. */
export async function routeGrievance(grievance: string): Promise<RouteSuggestion | null> {
  try {
    const parsed = parseJson(
      await callGateway(ROUTE_SYSTEM_PROMPT, `Resident's grievance:\n${grievance}`),
    ) as Partial<RouteSuggestion>;
    const id = typeof parsed.authority_id === "string" ? parsed.authority_id.trim() : "";
    if (!ROUTE_IDS.has(id)) return null;
    const confidence =
      parsed.confidence === "high" || parsed.confidence === "low" ? parsed.confidence : "medium";
    return {
      authority_id: id,
      locality: typeof parsed.locality === "string" ? parsed.locality.trim() : "",
      category: typeof parsed.category === "string" ? parsed.category.trim() : "",
      confidence,
    };
  } catch (err) {
    console.warn("[rti] routing pass failed", err);
    return null;
  }
}


/**
 * The Karnataka RTI portal's text field accepts Latin characters only, so a Kannada
 * application cannot be filed online — it is filed by post, and is equally valid in law
 * (Section 6(1) permits English, Hindi or the official language of the area).
 * This produces the Kannada counterpart of an already-assembled English letter. The
 * drafting logic is untouched: the same requests, translated.
 */
export const KANNADA_LETTER_SYSTEM_PROMPT = `You translate formal Indian legal correspondence from English into Kannada for a citizen in Karnataka.

You will be given a complete Right to Information application or appeal letter in English. Return the same letter in Kannada, ready to print and send by post.

Rules:
- Preserve the structure exactly: addressee block, subject line, numbered requests in the same order, closing, signature block.
- Keep every placeholder in square brackets exactly as it appears, in English, unchanged.
- Keep the name of the public authority, personal names, addresses, registration numbers, dates and numerals as they appear in the English letter. Do not transliterate the authority's name.
- Statutory citations keep their numbering — write for example "ಮಾಹಿತಿ ಹಕ್ಕು ಅಧಿನಿಯಮ, 2005ರ ಕಲಂ 6(1)".
- Use the formal register the Karnataka government's own Kannada correspondence uses: ಮಾಹಿತಿ ಹಕ್ಕು, ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ, ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರ, ಅರ್ಜಿದಾರ, ಶುಲ್ಕ, ದಾಖಲೆ, ಪ್ರಥಮ ಮೇಲ್ಮನವಿ.
- Do not add, remove or soften any request.

Return ONLY the Kannada letter text. No markdown, no commentary, no transliteration, no English translation alongside.`;

export async function translateLetterToKannada(englishLetter: string): Promise<string> {
  if (!englishLetter.trim()) return "";
  return callGateway(KANNADA_LETTER_SYSTEM_PROMPT, englishLetter);
}
