import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WardCity3D } from "@/components/ward-city-3d";
import { Wordmark } from "@/components/wordmark";
import { DataCredit } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";

import { CORP_COLOR, NEUTRAL } from "@/lib/ward-3d";
import { LangToggle, useLang, T } from "@/lib/i18n";



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

const STEPS = [
  { tId: "step1Title", bId: "step1Body" },
  { tId: "step2Title", bId: "step2Body" },
  { tId: "step3Title", bId: "step3Body" },
  { tId: "step4Title", bId: "step4Body" },
] as const;

function Landing() {
  const { t } = useLang();
  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8">
      <div className="registry-frame mx-auto w-full max-w-5xl">
        <header className="flex items-center justify-between gap-4 border-b border-border p-6">
          <div>
            <h1>
              <Wordmark size="sm" />
            </h1>
            <p className="rule-heading mt-1.5">{t("tagline")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <HeaderAuthAction />
          </div>
        </header>

        <section className="border-b border-border">

          <div className="relative">
            <WardCity3D
              spin
              colorFor={(w) => CORP_COLOR[w.c] ?? NEUTRAL}
              className="h-[240px] w-full sm:h-[340px]"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Wordmark size="lg" variant="full" className="items-center text-center" />
            </div>
            <p className="mono-stamp absolute bottom-2 left-4">
              <T id="wardCityCaption" />
            </p>

          </div>
        </section>

        <section className="border-b border-border p-6 md:p-10">
          <p className="rule-heading"><T id="heroEyebrow" /></p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl leading-[1.05] sm:text-5xl">
            <T id="heroHeadline" />
          </h2>
          <p className="mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base">
            <T id="heroSubhead" />
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="bg-foreground px-5 py-2.5 font-display text-sm font-bold text-background transition-transform hover:-translate-y-0.5"
            >
              <T id="ctaDraftFirst" />
            </Link>
            <Link to="/auth" className="border border-foreground px-5 py-2.5 text-sm font-medium hover:bg-secondary">
              <T id="ctaAlreadyHaveAccount" />
            </Link>
          </div>
        </section>


        <section className="border-b border-border">
          <p className="rule-heading border-b border-border px-6 py-3">
            <T id="howItWorksLabel" />
          </p>
          <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x">
            {STEPS.map((s, i) => (
              <div key={s.tId} className="p-6">
                <div className="mono-stamp">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-2 font-display text-lg leading-snug font-bold">
                  <T id={s.tId} />
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  <T id={s.bId} />
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-border p-6 md:p-10">
          <h3 className="max-w-2xl font-display text-2xl leading-tight sm:text-3xl">
            <T id="falseClosureHeading" />
          </h3>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            <T id="falseClosureBody" />
          </p>
        </section>


        <footer className="p-6">
          <Wordmark size="sm" inline className="mb-3" />
          <p className="mono-stamp">
            <T id="footerSection6Note" />
          </p>
          <DataCredit className="mt-3" />
        </footer>

      </div>
    </div>
  );
}

/** Auth-aware header slot; renders nothing until the session resolves. */
function HeaderAuthAction() {
  const { t } = useLang();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (signedIn === null) return <div className="h-9 w-[7.5rem]" aria-hidden="true" />;

  if (signedIn) {
    return (
      <Link
        to="/dashboard"
        className="bg-foreground px-4 py-2 font-display text-sm font-bold whitespace-nowrap text-background transition-transform hover:-translate-y-0.5"
      >
        {t("dashboard")}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/auth"
        className="hidden px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground sm:block"
      >
        {t("logIn")}
      </Link>
      <Link
        to="/auth"
        search={{ mode: "signup" }}
        className="bg-foreground px-4 py-2 font-display text-sm font-bold whitespace-nowrap text-background transition-transform hover:-translate-y-0.5"
      >
        {t("signUp")}
      </Link>
    </div>
  );
}
