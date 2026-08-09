import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

function AuthPage() {
  const { mode } = Route.useSearch();
  const router = useRouter();
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
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6">
        <Link to="/" className="inline-block">
          <Wordmark size="lg" />
        </Link>
      </header>
      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:pt-0">
        <div className="paper-card w-full max-w-md p-6 sm:p-8">
          {sent ? (
            <>
              <h1 className="text-2xl">Check your email</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                We sent a confirmation link to {email}. Click it to activate your account, then come
                back and log in.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setIsSignup(false);
                }}
                className="mt-5 text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                Back to log in
              </button>
            </>
          ) : (
            <>
              <h1 className="text-3xl">{isSignup ? "Create your account" : "Welcome back"}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isSignup
                  ? "New accounts start with demo applications at every stage of the statutory clock."
                  : "Pick up your applications and deadlines."}
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                {isSignup && (
                  <Field label="Full name">
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                      placeholder="As it should appear on the application"
                    />
                  </Field>
                )}
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Password">
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
                  {busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}
                </button>
              </form>
              <button
                onClick={() => setIsSignup((v) => !v)}
                className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground"
              >
                {isSignup ? "Already have an account? Log in" : "No account yet? Sign up"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="rule-heading mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
