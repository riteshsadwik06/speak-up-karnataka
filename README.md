# ವಿಚಾರಣೆ · Vicharane

A civic accountability app for Bengaluru. Say it in your own words, we'll say it in theirs.

**Live app:** https://speak-up-karnataka.lovable.app

## What it does

A resident describes a civic problem in plain English or Kannada — a pothole, an overflowing drain, a transformer that keeps failing. Vicharane works out which body actually owns it, drafts a civic complaint, and names the officer responsible, with their phone number.

That's the easy part. The real problem starts when the department marks the complaint **resolved** without doing the work — which is the default outcome, not the exception. When that happens, Vicharane converts the complaint into a Right to Information application demanding the specific records that would prove the work happened: the action-taken report, the work order with execution dates, the completion certificate, the site photograph relied upon, the measurement book entry, the expenditure with voucher number. None of these exist if the work wasn't done.

The RTI Act doesn't oblige anyone to explain themselves or answer a hypothetical — Section 2(f) only entitles a citizen to material already held in recorded form. So "why hasn't my road been fixed in four years?" gets rejected as not-information, while "provide certified copies of the work orders, sanctioned amounts, and completion certificates for road works in this ward between 2024 and 2026" must be answered. Vicharane performs that translation, then runs the statutory clock so the resident never misses an appeal window.

## Why this is harder than it sounds in Bengaluru

- **BBMP was dissolved in 2025.** The Greater Bengaluru Authority replaced it with five city corporations and 369 wards (up from 198), but the state RTI portal still lists the nine legacy BBMP zones. Vicharane maps a resident's ward to the correct legacy portal entry — and honestly tells the resident when there isn't a confident mapping, rather than guessing.
- **Karnataka's Rule 14 caps an RTI application at one subject.** File a request covering several subjects together and the PIO may lawfully answer only the first. Vicharane detects distinct subjects in a grievance and drafts them as separate applications.
- **The portal is Latin-script only.** A Kannada-language application can't be filed online — it has to go by post. Vicharane produces both versions and tells the resident which one goes where.
- **All deadlines are calendar days**, weekends and holidays included — a 30-day reply window, 30 days to file a first appeal, 90 days for a second appeal to the Karnataka State Information Commission. Vicharane tracks all of them and drafts the next step the day it's due.

## Stack

- [TanStack Start](https://tanstack.com/start) + React + Tailwind + shadcn/ui
- [Supabase](https://supabase.com) for auth and Postgres, with row-level security on every table
- AI drafting (grievance → RTI requests, appeal generation) runs through a server-only Lovable AI gateway — the model never sees the client, and the API key is never shipped to the browser
- Ward geometry rendered with Three.js (WebGL), gated behind a one-canvas-per-page registry so it never competes with itself

Built with [Lovable](https://lovable.dev).

## Data & attribution

- Ward boundaries and demographics: a simplified GeoJSON of the 369 GBA wards.
- Officials data — names, designations, phone numbers, Kannada names — from [Bengawalk's City Officials project](https://github.com/Vonter/city-officials), **CC BY 4.0**. Attribution is shown wherever this data is displayed and must stay visible.

## Local development

```sh
bun install   # or: npm install
bun run dev   # or: npm run dev
```

The app needs a `.env` with Supabase client config (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) — these are public, client-safe values, not secrets.

**Two things won't work outside Lovable's own environment:**

1. **AI drafting** (grievance → RTI requests, appeal generation) — the model gateway key is injected only inside Lovable's hosted dev preview and production, by design, so it's never present client-side. Locally you'll see "AI is not configured for this project" wherever a draft would normally appear.
2. **The 3D ward map inset and the officials dataset** — both are served from Lovable's asset CDN via relative `/__l5e/assets-v1/...` URLs, which only resolve inside Lovable's environment. A plain local `vite dev` gets a 404 on those requests; since the map component treats a failed fetch as decorative and fails silently, you'll just see an empty box rather than an error.

Everything else — the wizard, the statutory clock, ward lookup, application storage, the dashboard — works the same locally as it does live.

## Continue building in Lovable

Open the project in the [Lovable editor](https://lovable.dev/projects/646c2b56-df63-4aab-a4b6-4053dc4dd100) to keep building with AI. Every change made there is committed straight to this repository, and pushes to `main` sync back into Lovable for your next prompt.
