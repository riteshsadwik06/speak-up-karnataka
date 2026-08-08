import { addDays } from "./rti-data";

type SeedApp = {
  grievance_text: string;
  language: string;
  public_authority: string;
  ward_name: string;
  corporation: string;
  generated_requests: { text: string; rationale: string }[];
  application_body: string;
  status: string;
  filed_offset: number;
  reply_offset?: number;
  reply_notes?: string;
  first_appeal_offset?: number;
};

function body(authority: string, ward: string, reqs: { text: string }[]) {
  return `To,
The Public Information Officer
${authority}
[PIO office address]

Subject: Application for information under Section 6(1) of the Right to Information Act, 2005

Sir/Madam,

Under Section 6(1) of the Right to Information Act, 2005, I request the following information pertaining to ${ward} ward:

${reqs.map((r, i) => `${i + 1}. ${r.text}`).join("\n\n")}

The prescribed application fee of ₹10 is enclosed. I undertake to pay the copying charges of ₹2 per A4 page on demand.

If any part is refused, please state the specific exemption under Section 8 or 9 relied upon, along with the particulars of the First Appellate Authority under Section 19(1), as required by Section 7(8).

Yours faithfully,

[Your full name]
[Your postal address]`;
}

const SEEDS: SeedApp[] = [
  {
    grievance_text:
      "The storm water drain behind our lane has been blocked for months and floods the road every time it rains. Nobody comes to clear it.",
    language: "en",
    public_authority: "Bengaluru East City Corporation",
    ward_name: "Bellandur",
    corporation: "Bengaluru East City Corporation",
    generated_requests: [
      {
        text: "Provide certified copies of all complaints registered regarding storm water drain blockage in Bellandur ward between 1 January 2025 and the date of this application, along with the action-taken report on each.",
        rationale: "Establishes that the authority was on notice and what it recorded doing.",
      },
      {
        text: "Provide a list of desilting works carried out on storm water drains in Bellandur ward during the financial years 2024-25 and 2025-26, with dates, contractor names and work order numbers.",
        rationale: "Work orders reveal whether the desilting was ever executed or only sanctioned.",
      },
      {
        text: "Provide the total expenditure incurred on storm water drain maintenance in Bellandur ward in the financial years 2024-25 and 2025-26, with supporting bills and measurement book entries.",
        rationale: "Expenditure records against unexecuted work is the clearest evidence of a gap.",
      },
      {
        text: "Provide certified copies of the file notings on the drain maintenance file for Bellandur ward for the period 1 April 2025 onwards.",
        rationale: "File notings show internal reasoning and where the file stalled.",
      },
    ],
    application_body: "",
    status: "filed",
    filed_offset: -3,
  },
  {
    grievance_text:
      "Street lights on our main road have not worked for over a year. Complaints on the helpline go nowhere.",
    language: "en",
    public_authority: "Bengaluru West City Corporation",
    ward_name: "Vijayanagar",
    corporation: "Bengaluru West City Corporation",
    generated_requests: [
      {
        text: "Provide a list of street light repair and replacement works sanctioned in Vijayanagar ward between 1 April 2024 and the date of this application, with work order numbers and sanctioned amounts.",
        rationale: "Shows what was sanctioned against what exists on the ground.",
      },
      {
        text: "Provide certified copies of the street light complaint register entries for Vijayanagar ward for the period 1 April 2024 onwards.",
        rationale: "The register is the record of the complaints the helpline claims not to have.",
      },
      {
        text: "Provide the completion certificates and inspection reports for street light maintenance contracts in Vijayanagar ward for the financial year 2024-25.",
        rationale: "Completion certificates for work not done are directly actionable.",
      },
    ],
    application_body: "",
    status: "filed",
    filed_offset: -28,
  },
  {
    grievance_text:
      "Our road was supposedly resurfaced last year but it was potholed again within two months. Where did the money go?",
    language: "en",
    public_authority: "Bengaluru South City Corporation",
    ward_name: "HSR Layout",
    corporation: "Bengaluru South City Corporation",
    generated_requests: [
      {
        text: "Provide certified copies of the work orders, tender documents and sanction letters for all road resurfacing works in HSR Layout ward between 1 April 2024 and 31 March 2026.",
        rationale: "The work order fixes scope, cost and contractor on record.",
      },
      {
        text: "Provide the total expenditure on road resurfacing in HSR Layout ward for the financial years 2024-25 and 2025-26, with measurement book entries and final bills.",
        rationale: "Measurement books record the quantity of material actually laid.",
      },
      {
        text: "Provide certified copies of the completion certificates, third-party quality test reports and defect liability period clauses for those works.",
        rationale: "A defect liability clause makes early failure the contractor's liability, not the citizen's.",
      },
      {
        text: "Provide certified copies of the file notings on the road works file for HSR Layout ward for the period 1 April 2024 onwards.",
        rationale: "Notings show who approved payment despite the condition of the road.",
      },
    ],
    application_body: "",
    status: "filed",
    filed_offset: -34,
  },
  {
    grievance_text:
      "Sewage has been overflowing onto our street from a manhole near the park for months. BWSSB keeps saying it is scheduled.",
    language: "en",
    public_authority: "BWSSB",
    ward_name: "J P Nagar",
    corporation: "Bengaluru South City Corporation",
    generated_requests: [
      {
        text: "Provide certified copies of all complaints received by BWSSB regarding sewage overflow in J P Nagar between 1 January 2025 and the date of this application, with the action-taken report on each.",
        rationale: "Establishes the record of notice and response.",
      },
      {
        text: "Provide a list of sewerage line repair and replacement works sanctioned for J P Nagar during the financial years 2024-25 and 2025-26, with work order numbers, sanctioned amounts and scheduled completion dates.",
        rationale: "'Scheduled' is only meaningful if a work order exists.",
      },
      {
        text: "Provide certified copies of the inspection reports of the sewerage network in J P Nagar for the period 1 January 2025 onwards.",
        rationale: "Inspection reports record the actual condition officers observed.",
      },
    ],
    application_body: "",
    status: "first_appeal_filed",
    filed_offset: -95,
    first_appeal_offset: -47,
  },
  {
    grievance_text:
      "The transformer in our area fails every week and BESCOM has not replaced it despite repeated complaints.",
    language: "en",
    public_authority: "BESCOM",
    ward_name: "Banashankari",
    corporation: "Bengaluru South City Corporation",
    generated_requests: [
      {
        text: "Provide the fault and outage log for the distribution transformer serving Banashankari 2nd Stage for the period 1 January 2025 onwards.",
        rationale: "The outage log converts a lived complaint into a documented failure rate.",
      },
      {
        text: "Provide certified copies of the load assessment reports for that transformer for the years 2024 and 2025.",
        rationale: "Load assessment shows whether the transformer is undersized for the area.",
      },
      {
        text: "Provide a list of transformer replacement proposals for the Banashankari sub-division for the financial years 2024-25 and 2025-26, with sanctioned amounts and current status.",
        rationale: "Reveals whether a replacement was proposed and then dropped.",
      },
    ],
    application_body: "",
    status: "replied",
    filed_offset: -40,
    reply_offset: -12,
    reply_notes:
      "BESCOM replied to point 1 only, providing a partial outage log for March–May 2025. Points 2 and 3 were not answered and no exemption was cited. This is an incomplete reply under Section 7(8).",
  },
];

export function buildSeedRows(userId: string) {
  const now = new Date();
  return SEEDS.map((s) => {
    const filed = addDays(now, s.filed_offset);
    return {
      user_id: userId,
      grievance_text: s.grievance_text,
      language: s.language,
      public_authority: s.public_authority,
      ward_name: s.ward_name,
      corporation: s.corporation,
      generated_requests: s.generated_requests,
      application_body: body(s.public_authority, s.ward_name, s.generated_requests),
      status: s.status,
      filed_date: filed,
      response_due_date: addDays(filed, 30),
      reply_received_date: s.reply_offset ? addDays(now, s.reply_offset) : null,
      reply_notes: s.reply_notes ?? null,
      is_seeded: true,
      _first_appeal_date: s.first_appeal_offset ? addDays(now, s.first_appeal_offset) : null,
    };
  });
}
