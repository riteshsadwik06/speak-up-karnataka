import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LangToggle, T, useLang, type StrId } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signup" | "login" } => ({
    mode: search["mode"] === "signup" ? ("signup" as const) : ("login" as const),
  }),

  head: () => ({
    meta: [
      { title: "Sign in — Vicharane RTI tracker" },
      { name: "description", content: "Log in or create an account to draft and track RTI applications." },
      { property: "og:title", content: "Sign in — Vicharane" },
      { property: "og:description", content: "Draft RTI applications and track statutory deadlines." },
    ],
  }),
  component: AuthPage,
});

function mapAuthError(message: string): StrId {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials")) {
    return "authErrorInvalidCredentials";
  }
  if (m.includes("already registered") || m.includes("already exists")) {
    return "authErrorUserExists";
  }
  if (m.includes("weak") || m.includes("leaked") || m.includes("password")) {
    return "authErrorWeakPassword";
  }
  return "somethingWentWrong";
}

function AuthPage() {
  const { mode } = Route.useSearch();
  const router = useRouter();
  const { t } = useLang();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          return;
        }
        router.navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      toast.error(t(mapAuthError(message)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-5 sm:px-6">
        <Wordmark size="lg" variant="full" />
        <div className="ml-auto">
          <LangToggle />
        </div>
      </header>
      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:pt-0">
        <div className="paper-card w-full max-w-md p-6 sm:p-8">
          {sent ? (
            <>
              <T id="authCheckEmailTitle" as="h1" className="text-2xl" />
              <p className="mt-3 text-sm text-muted-foreground">
                {t("authCheckEmailBody").replace("{email}", email)}
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setIsSignup(false);
                }}
                className="mt-5 text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                <T id="authBackToLogin" />
              </button>
            </>
          ) : (
            <>
              <T id={isSignup ? "authCreateAccountTitle" : "authWelcomeBackTitle"} as="h1" className="text-3xl" />
              <p className="mt-2 text-sm text-muted-foreground">
                <T id={isSignup ? "authSignupSubtitle" : "authLoginSubtitle"} />
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                {isSignup && (
                  <Field labelId="authFullNameLabel">
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                      placeholder={t("authFullNamePlaceholder")}
                    />
                  </Field>
                )}
                <Field labelId="authEmailLabel">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field labelId="authPasswordLabel">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  <T id={busy ? "authPleaseWait" : isSignup ? "authCreateAccountCta" : "authLogInCta"} />
                </button>
              </form>
              <button
                onClick={() => setIsSignup((v) => !v)}
                className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
              >
                <T id={isSignup ? "authHaveAccount" : "authNoAccount"} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25";

function Field({ labelId, children }: { labelId: StrId; children: React.ReactNode }) {
  return (
    <label className="block">
      <T id={labelId} as="span" className="rule-heading mb-1.5 block" />
      {children}
    </label>
  );
}
