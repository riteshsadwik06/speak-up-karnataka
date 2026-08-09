/**
 * Collapsed reference section.
 *
 * The detail page leads with one action; everything else lives behind one of
 * these. Each header carries a one-line summary so the user can tell whether
 * opening it is worth a tap. Open/closed state is remembered per signed-in
 * user, so someone who always wants the officials list open gets it open.
 */
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KN_TEXT, useLang } from "@/lib/i18n";

let cachedUid: string | null = null;

/**
 * The signed-in user id, resolved synchronously from the stored session where
 * possible. `getUser()` is a network call and can settle after the user has
 * already toggled a section, which would silently drop their preference.
 */
function readUidFromStorage(): string | null {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (!key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { user?: { id?: string } };
      if (parsed?.user?.id) return parsed.user.id;
    }
  } catch {
    /* storage unavailable */
  }
  return null;
}

function useUserId() {
  const [uid, setUid] = useState<string | null>(cachedUid);
  useEffect(() => {
    if (cachedUid) {
      setUid(cachedUid);
      return;
    }
    const local = readUidFromStorage();
    if (local) {
      cachedUid = local;
      setUid(local);
      return;
    }
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      cachedUid = data.user?.id ?? "anon";
      if (alive) setUid(cachedUid);
    });
    return () => {
      alive = false;
    };
  }, []);
  return uid;
}


function storageKey(uid: string) {
  return `vicharane.folds.${uid}`;
}

function readAll(uid: string): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(storageKey(uid));
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function Fold({
  id,
  label,
  summary,
  defaultOpen = false,
  children,
}: {
  id: string;
  label: string;
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const { lang } = useLang();
  const uid = useUserId();
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!uid) return;
    const stored = readAll(uid)[id];
    if (typeof stored === "boolean") setOpen(stored);
  }, [uid, id]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (!uid) return;
    try {
      const all = readAll(uid);
      all[id] = next;
      window.localStorage.setItem(storageKey(uid), JSON.stringify(all));
    } catch {
      /* storage unavailable — the section still toggles for this session */
    }
  }

  const knClass = lang === "kn" ? KN_TEXT : "";

  return (
    <section className="border-b border-border last:border-b-0">
      <h2>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={`fold-${id}`}
          className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-1 py-4 text-left transition-colors hover:bg-muted/60"
        >
          <span className="min-w-0">
            <span lang={lang} className={`rule-heading block ${knClass}`}>
              {label}
            </span>
            {summary ? (
              <span
                lang={lang}
                className={`mt-0.5 block truncate text-xs text-muted-foreground ${knClass}`}
              >
                {summary}
              </span>
            ) : null}
          </span>
          <span aria-hidden className="shrink-0 font-mono text-xs text-muted-foreground">
            {open ? "−" : "+"}
          </span>
        </button>
      </h2>
      <div id={`fold-${id}`} hidden={!open} className="pb-5">
        {children}
      </div>
    </section>
  );
}
