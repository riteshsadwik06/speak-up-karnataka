# Right To Clarity

Build prompt — RTI drafting & deadline tracker (Karnataka)

Paste this into Lovable as the opening message. Build in the order given at the end.

What we're building

A web app that helps Bengaluru residents convert a civic grievance into a legally sound RTI application, and then tracks the statutory clock so they never miss an appeal deadline.

The core insight: most RTI applications fail not because of corruption but because people ask the wrong kind of question. The RTI Act 2005 obliges a public authority to hand over information it holds — records, work orders, file notings, contracts, sanction letters. It does not oblige anyone to explain themselves, justify a decision, or answer a hypothetical. So "why hasn't my road been resurfaced in four years?" gets rejected as not-information, while "provide copies of work orders, sanctioned amounts, tender documents and completion certificates for road works in Ward 25 between 2022 and 2026" must be answered.

The app performs that transformation, then runs the clock.

Name it Vicharane (or keep a placeholder — naming is not the priority).

Stack

React + Vite + Tailwind (Lovable default)

Supabase for auth (email/password) and Postgres

All LLM calls go through a Supabase edge function so the API key is never in the client

Must be responsive — phone and laptop both. Test at 375px width.

Deploy early and often

Database schema

profiles
  id (uuid, FK auth.users)
  full_name, email, address, phone
  is_bpl (boolean, default false)

applications
  id, user_id
  grievance_text (what the user originally typed)
  language (en | kn)
  public_authority (text)
  pio_name, pio_address (text, nullable)
  ward_id, ward_name, corporation (nullable)
  generated_requests (jsonb — array of the document requests)
  application_body (text — the final formatted application)
  status (draft | filed | replied | overdue | first_appeal_filed | second_appeal_filed | closed)
  filed_date (date, nullable)
  response_due_date (date, nullable — filed_date + 30 calendar days)
  reply_received_date (date, nullable)
  reply_notes (text, nullable)
  is_seeded (boolean, default false)
  created_at

appeals
  id, application_id, tier (first | second)
  grounds (text)
  body (text — generated appeal document)
  filed_date (date, nullable)
  due_date (date, nullable)
  created_at


is_seeded matters — see the demo data section.

Screens

1. Landing — one line explaining the product, a before/after example of a bad vs good RTI question, sign up / log in.

2. New application (the core flow)

Step 1: user describes the grievance in plain English or Kannada, free text.

Step 2: user picks the public authority (dropdown, see list below) and optionally selects their ward.

Step 3: app calls the edge function and returns:

3–6 document requests in numbered RTI language

a pre-flight panel flagging problems (see AI spec)

the assembled application, editable inline

Step 4: user copies / downloads the application, sees filing instructions, and marks it filed with a date.

3. Dashboard — list of applications with a status pill and a live day counter ("Day 18 of 30", "Overdue by 4 days — first appeal available"). Sorted by urgency.

4. Application detail — the full text, the timeline, and stage-appropriate actions. When overdue, a prominent "Draft first appeal" button. After a first appeal goes 45 days without a decision, "Draft second appeal".

5. Ward map (build LAST, only if time remains) — flat SVG rendered from the GeoJSON, one path per ward, filled by corporation, click to select. Do NOT build a 3D map.

The AI transformation — this is the most important part of the app

Edge function takes: grievance text, public authority, ward (optional). Returns strict JSON.

System prompt for the model, roughly:

You help Indian citizens draft Right to Information (RTI) applications under the RTI Act 2005.

The Act entitles a citizen to information held in records by a public authority — documents, file notings, work orders, tender papers, sanction letters, inspection reports, complaint registers, expenditure statements, correspondence. It does NOT entitle a citizen to explanations, justifications, opinions, reasons for a decision, or answers to hypothetical questions. Section 2(f) defines information as material in recorded form.

Given a citizen's grievance in plain language, produce document requests that would surface the truth behind that grievance and that a Public Information Officer is legally obliged to answer.

Rules:

Every request must ask for a record, not an answer. Never begin a request with "why".

Be specific about time period, location, and document type.

Prefer "certified copies of…", "a list of…", "the file notings on…", "the total expenditure on…".

3 to 6 requests. More than that invites a fee demand and delay.

Flag any request likely to be refused under Section 8 exemptions — particularly 8(1)(d) commercial confidence, 8(1)(e) fiduciary relationship, 8(1)(j) personal information of third parties — and suggest a narrower reframing.

Never ask the applicant to state a reason for wanting the information. Section 6(2) explicitly bars a public authority from requiring reasons.

Return ONLY valid JSON, no markdown fences: { "requests": [{"text": "...", "rationale": "why this record matters"}], "flags": [{"type": "opinion_seeking|exemption_risk|too_broad|wrong_authority", "message": "...", "suggestion": "..."}], "suggested_authority": "...", "confidence": "high|medium|low" }

Also show the user, side by side, their original phrasing and the reframed requests. This contrast is the product. Make it visually prominent, not a footnote.

Second edge function for appeals: given the application and the reason (no reply / incomplete reply / refusal), generate a Section 19(1) first appeal or Section 19(3) second appeal citing the correct grounds — deemed refusal under Section 7(2) where there was no reply.

Legal facts to hardcode (verified — do not let the model invent these)

Application fee in Karnataka: ₹10. BPL applicants exempt on production of a BPL card copy. Copy charges ₹2 per A4 page.

Payment modes: online via the Karnataka RTI portal (SBI e-Pay), Indian Postal Order, Demand Draft, or court-fee stamp. A court-fee stamp is valid in Karnataka but never for central-government RTIs. IPO is the safest fallback.

Karnataka state portal: rtionline.karnataka.gov.in — Karnataka state public authorities only. Do not use it for central bodies.

PIO must reply within 30 days. 48 hours where life or liberty is concerned.

First appeal: within 30 days of the reply, or of the date the reply was due. Filed with the First Appellate Authority of the same public authority.

FAA must decide within 30 days, extendable to 45 with recorded reasons.

Second appeal: within 90 days, to the Karnataka State Information Commission. Can be filed once 45 days have elapsed with no FAA decision.

KSIC address: Room No. 305, 3rd Floor, M S Building, Bengaluru 560001.

All periods are calendar days — weekends and public holidays included. Do not implement business-day logic.

Section 18 complaint to the Commission has no time limit — offer it as a fallback when a user has missed an appeal window.

Section 6(2): an applicant cannot be required to give reasons for the request. Surface this in the UI.

Public authorities (dropdown)

Bengaluru's civic administration was restructured — BBMP was replaced by the Greater Bengaluru Authority (in force May 2025, fully operational September 2025), with five city corporations and 369 wards replacing the earlier 198.

Bengaluru Central City Corporation

Bengaluru East City Corporation

Bengaluru West City Corporation

Bengaluru North City Corporation

Bengaluru South City Corporation

Greater Bengaluru Authority (apex — planning, arterial roads, cross-corporation projects)

BWSSB (water and sewage)

BESCOM (electricity)

BMRCL (metro)

BDA (development authority)

Other — user enters name and PIO address manually

Include a free-text PIO name/address field for every option, since PIO details change.

Before finalising: check the actual dropdown on the Karnataka RTI portal — it may still list BBMP rather than the new corporations, and the app should match reality rather than the statute.

Ward data

gba-wards-simplified.geojson — 369 wards, GeoJSON FeatureCollection, ~350KB. Properties per feature: ward_id, ward_name, ward_name_kn, Corporation, corporation_id, Assembly, ac_no, zone, TOT_P (population).

Use it for a searchable ward dropdown first. The map is optional polish.

Seeded demo data — BUILD THIS EARLY

Everything interesting in this product happens after 30 days of silence. The demo happens today. So on signup, seed the account with backdated applications (is_seeded = true) covering every state:

Day 3, awaiting reply — storm water drain blockage, Bengaluru East

Day 28, approaching deadline — street light non-repair, Bengaluru West

Day 34, overdue, first appeal available — road resurfacing expenditure, Bengaluru South

First appeal filed 47 days ago, FAA silent, second appeal available — BWSSB sewage overflow

Replied but incomplete — BESCOM transformer complaint

Add a visible "demo data" badge and a button to clear it. This is not cheating; it is the only way a time-based product can be demonstrated on day one.

Explicitly NOT building

Do not add these even if they seem natural:

Automated submission to any government portal (captchas, flaky sessions — will eat the whole build)

A PIO directory (data acquisition trap)

Kannada output (Kannada input is fine — the model handles it)

Document/file upload

Email or push notifications

Any state other than Karnataka

3D or WebGL maps

Payment processing

Build order — do not deviate

Supabase auth + schema + deploy to a live URL. Nothing else until there is a working login on a real domain.

New application flow → edge function → document requests rendered with the before/after contrast.

Application assembly, filing instructions, mark-as-filed.

Dashboard with the live day counter + seeded demo data.

First appeal generation.

Second appeal generation.

Ward dropdown from GeoJSON.

SVG ward map (only if 1–7 are done).

If time runs out, stopping after step 4 still leaves a complete, demonstrable product.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://speak-up-karnataka.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/646c2b56-df63-4aab-a4b6-4053dc4dd100).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
