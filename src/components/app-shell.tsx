import { Link, useRouter } from "@tanstack/react-router";
import { Wordmark, BRAND_RED } from "@/components/wordmark";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  FileText,
  Map as MapIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { OFFICIALS_SOURCE } from "@/lib/officials";
import { LangToggle, useLang, T } from "@/lib/i18n";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navBase =
  "flex items-center gap-3 px-3 py-2 text-sm font-medium leading-[1.6] transition-colors overflow-hidden";
const navIdle = `${navBase} text-muted-foreground hover:bg-secondary hover:text-foreground`;
const navActive = `${navBase} bg-foreground text-background`;

/**
 * Sign out is destructive and sits in the sidebar, so it must never be reached
 * by a stray Enter: it takes two deliberate activations, and it is last in the
 * sidebar tab order.
 */
function SignOutButton({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const { t } = useLang();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          type="button"
          autoFocus={false}
          onBlur={() => setArmed(false)}
          onClick={async () => {
            if (!armed) {
              setArmed(true);
              return;
            }
            await supabase.auth.signOut();
            router.navigate({ to: "/auth" });
          }}
          className={`${navIdle} w-full text-left ${armed ? "border border-foreground text-foreground" : ""}`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={`whitespace-nowrap ${collapsed ? "md:hidden" : ""}`}>
            {armed ? t("navSignOutConfirm") : t("navSignOut")}
          </span>
        </button>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right">
          {armed ? t("navSignOutConfirm") : t("navSignOut")}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export function AppShell({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  const { t } = useLang();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen w-full bg-background p-4 md:p-8">
        <div className="registry-frame mx-auto flex w-full max-w-6xl flex-col md:flex-row relative">
          <aside
            className={`flex flex-col shrink-0 border-b border-border bg-background transition-all duration-300 md:border-b-0 md:border-r relative ${
              collapsed ? "w-full p-4 md:w-16 md:px-2 md:py-6" : "w-full p-6 md:w-60"
            }`}
          >
            <div className="flex items-start justify-between gap-3 overflow-hidden">
              <Link
                to="/"
                className={`block min-w-0 transition-opacity duration-200 hover:opacity-80 ${collapsed ? "md:hidden" : ""}`}
              >
                <h1>
                  <Wordmark size="sm" link={false} />
                </h1>
                <p className="rule-heading mt-1.5 whitespace-nowrap">{t("tagline")}</p>
              </Link>
              {/* Show a mini icon when collapsed */}
              {collapsed && (
                <Link
                  to="/"
                  className="hidden md:flex min-w-0 items-center justify-center w-full hover:opacity-80"
                >
                  <span
                    lang="kn"
                    className="font-kannada font-medium leading-[1.5] text-[1.375rem]"
                    style={{ color: BRAND_RED }}
                  >
                    ವಿ
                  </span>
                </Link>
              )}
              <div className={collapsed ? "md:hidden" : ""}>
                <LangToggle />
              </div>
            </div>

            <nav className="mt-8 space-y-1 flex-1">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link to="/dashboard" className={navIdle} activeProps={{ className: navActive }}>
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? "md:hidden" : ""}`}>
                      {t("navRegistry")}
                    </span>
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{t("navRegistry")}</TooltipContent>}
              </Tooltip>

              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link to="/new" className={navIdle} activeProps={{ className: navActive }}>
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? "md:hidden" : ""}`}>
                      {t("navNewFiling")}
                    </span>
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{t("navNewFiling")}</TooltipContent>}
              </Tooltip>

              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link to="/map" className={navIdle} activeProps={{ className: navActive }}>
                    <MapIcon className="h-4 w-4 shrink-0" />
                    <span className={`whitespace-nowrap ${collapsed ? "md:hidden" : ""}`}>
                      {t("navWardMap")}
                    </span>
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{t("navWardMap")}</TooltipContent>}
              </Tooltip>

              <SignOutButton collapsed={collapsed} />
            </nav>

            <div className="mt-6 hidden md:block border-t border-border pt-4">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground rounded-md"
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                )}
                <span className={`whitespace-nowrap ${collapsed ? "md:hidden" : ""}`}>
                  Collapse
                </span>
              </button>
            </div>
          </aside>

          <main className={`min-w-0 flex-1 ${bare ? "" : "p-6"}`}>{children}</main>
        </div>
        <DataCredit className="mx-auto mt-3 w-full max-w-6xl" />
      </div>
    </TooltipProvider>
  );
}

export function StatusPill({ tone, children }: { tone: string; children: ReactNode }) {
  const tones: Record<string, string> = {
    calm: "border border-foreground text-foreground",
    warn: "border border-foreground text-foreground",
    danger: "border border-foreground bg-foreground text-background",
    neutral: "border border-dashed border-muted-foreground text-muted-foreground",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tones[tone] ?? tones["neutral"]}`}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="rule-heading mb-2">{children}</p>;
}

export function DataCredit({ className = "" }: { className?: string }) {
  return (
    <p className={`text-[11px] text-muted-foreground ${className}`}>
      <T id="officialsDataCredit" as="span" />{" "}
      <a
        href={OFFICIALS_SOURCE}
        target="_blank"
        rel="noreferrer noopener"
        className="underline underline-offset-2"
      >
        Bengawalk City Officials
      </a>
      , CC BY 4.0
    </p>
  );
}
