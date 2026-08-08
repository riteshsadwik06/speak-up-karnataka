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
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center px-4 py-5 sm:px-6">
        <span className="font-display text-2xl">Vicharane</span>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <Link
            to="/auth"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="rounded-md bg-accent px-3.5 py-1.5 font-medium text-accent-foreground"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <section className="py-10 sm:py-16">
          <p className="rule-heading">Right to Information Act, 2005 · Karnataka</p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
            Ask for <em className="text-accent">records</em>, not explanations — then watch the clock.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Vicharane turns a Bengaluru civic grievance into an RTI application a Public Information
            Officer is legally obliged to answer, and tracks every statutory deadline from the 30-day
            reply window to the second appeal.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Draft my first RTI
            </Link>
            <Link
              to="/auth"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              I already have an account
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="paper-card border-destructive/30 p-5">
            <p className="rule-heading text-destructive">Rejected — not information</p>
            <p className="mt-3 font-display text-xl leading-snug">
              “Why hasn't my road been resurfaced in four years?”
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Section 2(f) defines information as material held in recorded form. No authority is
              obliged to explain itself, justify a decision, or answer a hypothetical.
            </p>
          </div>
          <div className="paper-card border-accent/40 p-5">
            <p className="rule-heading text-accent">Must be answered</p>
            <p className="mt-3 font-display text-xl leading-snug">
              “Provide certified copies of work orders, sanctioned amounts, tender documents and
              completion certificates for road works in Ward 25 between 2022 and 2026.”
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Every one of these is a record the authority already holds. Refusal now requires a
              specific exemption under Section 8 or 9.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "30 days to reply",
              d: "Calendar days, weekends included. Miss it and the PIO is in deemed refusal under Section 7(2).",
            },
            {
              t: "30 days to appeal",
              d: "First appeal to the First Appellate Authority, from the reply or from the date it was due.",
            },
            {
              t: "90 days, second appeal",
              d: "To the Karnataka State Information Commission — available once 45 days pass with no FAA decision.",
            },
          ].map((c) => (
            <div key={c.t} className="paper-card p-5">
              <p className="font-display text-2xl">{c.t}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </section>

        <p className="mt-10 rounded-md border border-border bg-secondary/60 p-4 text-sm text-muted-foreground">
          Section 6(2): a public authority cannot require you to give a reason for wanting the
          information. Vicharane never asks you for one.
        </p>
      </main>
    </div>
  );
}
