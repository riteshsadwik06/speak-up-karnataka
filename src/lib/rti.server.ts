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
  ward?: string | null;
  focusSubject?: string | null;
  falseClosure?: FalseClosure | null;
}): Promise<RtiDraft> {
  const fc = input.falseClosure;
  const user = [
    `Public authority selected by the citizen: ${input.authority}`,
    input.ward ? `Ward: ${input.ward}, Bengaluru, Karnataka` : "Location: Bengaluru, Karnataka",
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
  return {
    requests: Array.isArray(parsed.requests) ? parsed.requests.slice(0, 6) : [],
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

Return ONLY valid JSON, no markdown fences:
{ "requests": [{"text": "...", "rationale": "..."}], "flags": [{"type": "opinion_seeking|exemption_risk|too_broad|wrong_authority", "message": "...", "suggestion": "..."}], "subjects": [{"label": "...", "summary": "..."}], "primary_subject": "...", "suggested_authority": "...", "confidence": "high|medium|low" }`;

export async function reviseRequests(input: {
  grievance: string;
  authority: string;
  ward?: string | null;
  subject: string;
  requests: RtiRequest[];
  instruction: string;
}): Promise<RtiDraft> {
  const user = [
    `Public authority: ${input.authority}`,
    input.ward ? `Ward: ${input.ward}, Bengaluru, Karnataka` : "Location: Bengaluru, Karnataka",
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
  return {
    requests: Array.isArray(parsed.requests) ? parsed.requests.slice(0, 6) : [],
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

Return ONLY valid JSON, no markdown fences:
{ "complaint": "the complaint text", "suggested_channel": "sahaaya|bwssb|bescom|other", "category": "short issue category", "checkable_action": "the one specific action requested" }`;

export async function draftComplaint(input: {
  grievance: string;
  authority: string;
  ward?: string | null;
  wardNumber?: string | null;
}): Promise<ComplaintDraft> {
  const user = [
    `Public authority / department: ${input.authority}`,
    input.ward
      ? `Ward: ${input.ward}${input.wardNumber ? ` (ward number ${input.wardNumber})` : ""}, Bengaluru, Karnataka`
      : "Location: Bengaluru, Karnataka",
    "",
    "The resident's account of the problem:",
    input.grievance,
  ]
    .filter(Boolean)
    .join("\n");

  const parsed = parseJson(await callGateway(COMPLAINT_SYSTEM_PROMPT, user)) as Partial<ComplaintDraft>;
  return {
    complaint: typeof parsed.complaint === "string" ? parsed.complaint.trim() : "",
    suggested_channel:
      typeof parsed.suggested_channel === "string" ? parsed.suggested_channel : "sahaaya",
    category: typeof parsed.category === "string" ? parsed.category : "",
    checkable_action: typeof parsed.checkable_action === "string" ? parsed.checkable_action : "",
  };
}
