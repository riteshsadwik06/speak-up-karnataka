// Landing route.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WardCity3D } from "@/components/ward-city-3d";
import { Wordmark } from "@/components/wordmark";
import { DataCredit } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";

import { CORP_COLOR, NEUTRAL } from "@/lib/ward-3d";
import { LangToggle, useLang, T } from "@/lib/i18n";
import { 
  ArrowRight, ArrowDown, User, BrainCircuit, Database, FileText, 
  Scale, MapPin, Building2, Gavel, CalendarClock, History, MessageSquare, Code2
} from "lucide-react";



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
  Object.entries(CORP_COLOR).map(([k, v]) => [k, towardPaper(v, 0.18)]),
);
const WATERMARK_NEUTRAL = towardPaper(NEUTRAL, 0.18);

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
        className="absolute inset-0 h-full w-full opacity-45"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--background) 25%, transparent) 0%, color-mix(in srgb, var(--background) 40%, transparent) 45%, color-mix(in srgb, var(--background) 55%, transparent) 100%)",
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
      <div className="registry-frame relative z-10 mx-auto w-full max-w-5xl !bg-transparent">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-background/72 p-6">
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

        <section className="border-b border-border bg-background/58 p-6 md:p-10">
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



        <section className="border-b border-border bg-background/68">
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

        <section className="border-b border-border bg-background/68 p-6 md:p-10">
          <h3 className="max-w-2xl font-display text-2xl leading-tight sm:text-3xl">
            <T id="falseClosureHeading" />
          </h3>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            <T id="falseClosureBody" />
          </p>
        </section>

        <section className="border-b border-border bg-background/50 p-6 md:p-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-left md:text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Architecture & Platform Flow</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A comprehensive view of how Vicharane transforms unstructured citizen grievances into legally binding, trackable resolutions using AI and modern web infrastructure.
              </p>
            </div>

            {/* User Flow Pipeline */}
            <h3 className="font-display text-2xl font-bold mb-6 border-b border-border pb-2">1. The Resolution Pipeline</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
              {/* 1. Citizen Input */}
              <div className="bg-background border border-border rounded-xl p-6 shadow-sm flex flex-col h-full relative">
                <div className="h-12 w-12 rounded-lg bg-foreground text-background flex items-center justify-center mb-4 transition-transform hover:scale-105">
                  <User size={24} />
                </div>
                <h4 className="font-display font-bold text-lg mb-2">1. Citizen Input</h4>
                <p className="text-sm text-muted-foreground mb-4">Users submit their grievances in plain, unstructured language.</p>
                <ul className="text-xs space-y-2 mt-auto">
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" /> Native Kannada support</li>
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" /> Natural English support</li>
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" /> No legal knowledge required</li>
                </ul>
                <ArrowRight className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                <ArrowDown className="lg:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 text-muted-foreground z-10" />
              </div>

              {/* 2. AI Intelligence Engine */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm flex flex-col h-full relative">
                <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-4 transition-transform hover:scale-105">
                  <BrainCircuit size={24} />
                </div>
                <h4 className="font-display font-bold text-lg mb-2">2. AI Intelligence</h4>
                <p className="text-sm text-muted-foreground mb-4">Multi-stage LLM processing of the unstructured input.</p>
                <ul className="text-xs space-y-3 mt-auto">
                  <li className="flex gap-2 items-start"><Building2 size={14} className="shrink-0 text-primary mt-0.5" /> <b>Stakeholder Mapping:</b> Identifies exact civic authority (BBMP, BESCOM, BWSSB)</li>
                  <li className="flex gap-2 items-start"><MapPin size={14} className="shrink-0 text-primary mt-0.5" /> <b>Location Mapping:</b> Extracts ward identities & local coordinates</li>
                  <li className="flex gap-2 items-start"><FileText size={14} className="shrink-0 text-primary mt-0.5" /> <b>Problem Drafting:</b> Converts emotion into concise actionable summaries</li>
                  <li className="flex gap-2 items-start"><Gavel size={14} className="shrink-0 text-primary mt-0.5" /> <b>Legal Translation:</b> Formats into RTI Act 2005 syntax and rule structures</li>
                </ul>
                <ArrowRight className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                <ArrowDown className="lg:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 text-muted-foreground z-10" />
              </div>

              {/* 3. Document Generation */}
              <div className="bg-background border border-border rounded-xl p-6 shadow-sm flex flex-col h-full relative">
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-4 border border-border transition-transform hover:scale-105">
                  <FileText size={24} />
                </div>
                <h4 className="font-display font-bold text-lg mb-2">3. Statutory Drafts</h4>
                <p className="text-sm text-muted-foreground mb-4">Outputs strictly formatted legal documents ready for submission.</p>
                <ul className="text-xs space-y-2 mt-auto">
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-secondary-foreground mt-1 shrink-0" /> Section 6(1) RTI Applications</li>
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-secondary-foreground mt-1 shrink-0" /> First Appeals under 19(1)</li>
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-secondary-foreground mt-1 shrink-0" /> Second Appeals under 19(3)</li>
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-secondary-foreground mt-1 shrink-0" /> Dual-language output formats</li>
                </ul>
                <ArrowRight className="hidden lg:block absolute -right-5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                <ArrowDown className="lg:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 text-muted-foreground z-10" />
              </div>

              {/* 4. Action Timeline */}
              <div className="bg-background border border-border rounded-xl p-6 shadow-sm flex flex-col h-full">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4 border border-border transition-transform hover:scale-105">
                  <CalendarClock size={24} />
                </div>
                <h4 className="font-display font-bold text-lg mb-2">4. Action Timeline</h4>
                <p className="text-sm text-muted-foreground mb-4">Dynamic dashboard tracking progress and prompting user action.</p>
                <ul className="text-xs space-y-3 mt-auto">
                  <li className="flex gap-2 items-start"><History size={14} className="shrink-0 text-foreground mt-0.5" /> <b>Submission Log:</b> History of all filed applications & documents</li>
                  <li className="flex gap-2 items-start"><Scale size={14} className="shrink-0 text-foreground mt-0.5" /> <b>Statutory Deadlines:</b> Enforces the strict 30/45/90 day RTI clock</li>
                  <li className="flex gap-2 items-start"><MessageSquare size={14} className="shrink-0 text-foreground mt-0.5" /> <b>Next Actions:</b> Intelligent prompts (e.g. "30 days passed, file First Appeal now")</li>
                </ul>
              </div>
            </div>

            {/* Software Stack */}
            <h3 className="font-display text-2xl font-bold mb-6 border-b border-border pb-2 mt-12">2. Technology Stack</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Frontend */}
              <div className="p-6 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <Code2 className="text-primary" />
                  <h4 className="font-bold text-lg">Client Application</h4>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Framework:</strong> React 19 + TanStack Start (SSR)</li>
                  <li><strong className="text-foreground">Styling:</strong> Tailwind CSS + Radix UI Primitives</li>
                  <li><strong className="text-foreground">Visuals:</strong> Three.js (3D Ward Maps)</li>
                  <li><strong className="text-foreground">Routing:</strong> TanStack Router (Type-safe)</li>
                </ul>
              </div>

              {/* AI Infrastructure */}
              <div className="p-6 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <BrainCircuit className="text-primary" />
                  <h4 className="font-bold text-lg">AI Infrastructure</h4>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Gateway:</strong> Lovable AI Gateway / Groq API</li>
                  <li><strong className="text-foreground">Primary Model:</strong> GPT-4.1 class (openai/gpt-5.6-sol)</li>
                  <li><strong className="text-foreground">Fallback Models:</strong> Moonshot MoE & GPT-OSS-120b</li>
                  <li><strong className="text-foreground">Strategy:</strong> System prompts mapped to Karnataka legal limits</li>
                </ul>
              </div>

              {/* Backend & DB */}
              <div className="p-6 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="text-primary" />
                  <h4 className="font-bold text-lg">Backend & Data</h4>
                </div>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Database:</strong> Supabase (PostgreSQL)</li>
                  <li><strong className="text-foreground">Auth:</strong> Supabase Auth & RLS Policies</li>
                  <li><strong className="text-foreground">Hosting:</strong> Vercel Edge Serverless</li>
                  <li><strong className="text-foreground">Validation:</strong> Zod (Strict schema typing)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>


        <footer className="bg-background/68 p-6">
          <Wordmark size="sm" inline className="mb-3" />
          <p className="mono-stamp">
            <T id="footerSection6Note" />
          </p>
          <p className="mono-stamp mt-1">
            <T id="wardCityCaption" />
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
