import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vicharane — RTI drafting & deadline tracker for Bengaluru" },
      {
        name: "description",
        content:
          "Most RTI applications fail because they ask the wrong question. Vicharane rewrites your grievance as records a PIO must hand over, then runs the 30-day statutory clock.",
      },
      { property: "og:title", content: "Vicharane — ask for records, not explanations" },
      {
        property: "og:description",
        content: "Draft a legally sound RTI application for Bengaluru and never miss an appeal deadline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const CLOCKS = [
  { day: "30", t: "Reply due", d: "Calendar days from filing. Silence is deemed refusal under Section 7(2)." },
  { day: "30", t: "First appeal", d: "To the First Appellate Authority, from the reply or the date it was due." },
  { day: "90", t: "Second appeal", d: "To the Karnataka State Information Commission, once the FAA goes quiet." },
];

function Landing() {
  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8">
      <div className="registry-frame mx-auto w-full max-w-5xl">
        <header className="flex items-center justify-between gap-4 border-b border-border p-6">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">VICHARANE</h1>
            <p className="rule-heading mt-1">Public Records Tracker</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="bg-foreground px-4 py-2 font-display text-sm font-bold text-background transition-transform hover:-translate-y-0.5"
            >
              GET STARTED
            </Link>
          </div>
        </header>

        <section className="border-b border-border p-6 md:p-10">
          <p className="rule-heading">Right to Information Act, 2005 · Karnataka</p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl leading-[1.05] sm:text-5xl">
            Ask for records, not explanations — then watch the clock.
          </h2>
          <p className="mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Vicharane turns a Bengaluru civic grievance into an application a Public Information Officer is legally
            obliged to answer, and tracks every statutory deadline through to the second appeal.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="bg-foreground px-5 py-2.5 font-display text-sm font-bold text-background transition-transform hover:-translate-y-0.5"
            >
              DRAFT MY FIRST RTI
            </Link>
            <Link to="/auth" className="border border-foreground px-5 py-2.5 text-sm font-medium hover:bg-secondary">
              I already have an account
            </Link>
          </div>
        </section>

        <section className="grid border-b border-border md:grid-cols-2">
          <div className="border-b border-border p-6 md:border-b-0 md:border-r">
            <p className="rule-heading">Rejected — not information</p>
            <p className="mt-3 font-display text-lg leading-snug text-muted-foreground">
              “Why hasn’t my road been resurfaced in four years?”
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Section 2(f) defines information as material held in recorded form. No authority is obliged to explain
              itself.
            </p>
          </div>
          <div className="p-6">
            <p className="rule-heading text-foreground">Must be answered</p>
            <p className="mt-3 font-display text-lg leading-snug">
              “Provide certified copies of work orders, sanctioned amounts and completion certificates for road works
              in Ward 25 between 2022 and 2026.”
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Every one of these is a record already held. Refusal now needs a specific exemption under Section 8 or 9.
            </p>
          </div>
        </section>

        <section className="grid divide-y divide-border border-b border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {CLOCKS.map((c) => (
            <div key={c.t} className="p-6">
              <div className="font-display text-3xl font-bold">DAY {c.day}</div>
              <p className="rule-heading mt-1">{c.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </section>

        <footer className="p-6">
          <p className="mono-stamp">
            Section 6(2): a public authority cannot require you to give a reason for wanting the information.
            Vicharane never asks you for one.
          </p>
        </footer>
      </div>
    </div>
  );
}
