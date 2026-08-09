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
      { title: "Vicharane — civic complaints & RTI for Bengaluru" },
      {
        name: "description",
        content:
          "Describe a Bengaluru civic problem in plain English or Kannada. Vicharane finds who is responsible, writes the complaint or RTI they must answer, and tracks every deadline.",
      },
      { property: "og:title", content: "Say it in your own words. We'll say it in theirs." },
      {
        property: "og:description",
        content:
          "Vicharane turns a plain-language Bengaluru grievance into a complaint or RTI the right authority is obliged to answer — and holds them to every statutory deadline.",
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

/** Mix a hex colour toward the paper tone: 0 = original, 1 = paper. */
function towardPaper(hex: string, amount: number) {
  const p = [0xf3, 0xef, 0xe6];
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const mix = c.map((v, i) => Math.round(v + (p[i]! - v) * amount));
  return `#${mix.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const WATERMARK: Record<string, string> = Object.fromEntries(
  Object.entries(CORP_COLOR).map(([k, v]) => [k, towardPaper(v, 0.62)]),
);
const WATERMARK_NEUTRAL = towardPaper(NEUTRAL, 0.62);

/** Fixed, non-interactive city watermark behind the whole page. */
function CityBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-background" />
      <WardCity3D
        spin
        intro={false}
        orbitSeconds={180}
        maxFps={30}
        colorFor={(w) => WATERMARK[w.c] ?? WATERMARK_NEUTRAL}
        className="absolute inset-0 h-full w-full opacity-30"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--background) 45%, transparent) 0%, color-mix(in srgb, var(--background) 70%, transparent) 40%, color-mix(in srgb, var(--background) 88%, transparent) 100%)",
        }}
      />
    </div>
  );
}

function Landing() {
  const { t } = useLang();
  return (
    <div className="relative min-h-screen w-full p-4 md:p-8">
      <CityBackdrop />
      <div className="registry-frame relative z-10 mx-auto w-full max-w-5xl bg-transparent">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-background/90 p-6 backdrop-blur-[2px]">
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

        <section className="border-b border-border bg-background/70 p-6 md:p-10">
          <Wordmark size="lg" variant="full" className="mb-6" />
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
