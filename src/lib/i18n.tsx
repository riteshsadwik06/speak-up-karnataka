/**
 * Lightweight two-language layer (English / Kannada).
 *
 * NOTE FOR REVIEWERS: the Kannada strings in src/lib/dict/* were generated.
 * The government vocabulary block in dict/common.ts is taken from the Karnataka
 * RTI portal; everything else needs a native-speaker pass before a demo.
 *
 * Every user-visible string in the app must live in a dictionary module under
 * src/lib/dict/ and be rendered via `t(...)` or <T id="..."/>. In development,
 * an untranslated-string checker warns about literal English left in the DOM
 * while Kannada is active (see useUntranslatedScan below).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DICT_COMMON } from "@/lib/dict/common";
import { DICT_LANDING } from "@/lib/dict/landing";
import { DICT_AUTH } from "@/lib/dict/auth";
import { DICT_WIZARD } from "@/lib/dict/wizard";
import { DICT_DASHBOARD } from "@/lib/dict/dashboard";
import { DICT_MAP } from "@/lib/dict/map";
import { DICT_DETAIL } from "@/lib/dict/detail";
import { DICT_OFFICIALS } from "@/lib/dict/officials";
import {
  AUTHORITY_NAME_KN,
  AUTHORITY_NOTE_KN,
  CORPORATION_SHORT_KN,
} from "@/lib/dict/authorities";

export type Lang = "en" | "kn";

const STORAGE_KEY = "vicharane.lang";

/** id -> { en, kn } */
export const DICT = {
  ...DICT_COMMON,
  ...DICT_LANDING,
  ...DICT_AUTH,
  ...DICT_WIZARD,
  ...DICT_DASHBOARD,
  ...DICT_MAP,
  ...DICT_DETAIL,
  ...DICT_OFFICIALS,
} as const;

export type StrId = keyof typeof DICT;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (id: StrId) => string };

const LangContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (id) => DICT[id].en,
});

/**
 * Runs in <head> before hydration. It applies the stored language to the
 * document immediately AND captures a language-toggle click that lands before
 * React has hydrated, so the very first tap always counts (BUG 1: the first
 * click used to be swallowed on a slow connection).
 */
export const EARLY_LANG_SCRIPT = `(function(){try{var K=${JSON.stringify(STORAGE_KEY)};var v=localStorage.getItem(K);if(v!=='kn'&&v!=='en'){v='en';}window.__vLang=v;document.documentElement.lang=v;document.addEventListener('click',function(e){if(window.__vLangHydrated){return;}var t=e.target;var el=t&&t.closest?t.closest('[data-lang-toggle]'):null;if(!el){return;}var next=el.getAttribute('data-lang-next')||(window.__vLang==='kn'?'en':'kn');window.__vLang=next;document.documentElement.lang=next;try{localStorage.setItem(K,next);}catch(_){}},true);}catch(_){}})();`;

declare global {
  interface Window {
    __vLang?: Lang;
    __vLangHydrated?: boolean;
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    // The early script already resolved the stored value, and folded in any
    // pre-hydration toggle click. Read from it, then take over.
    const early = window.__vLang;
    const stored = early ?? window.localStorage.getItem(STORAGE_KEY);
    if (stored === "kn" || stored === "en") setLangState(stored);
    window.__vLangHydrated = true;
    return () => {
      window.__vLangHydrated = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.__vLang = l;
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage unavailable — the toggle still works for this session */
    }
  }, []);


  const t = useCallback((id: StrId) => {
    const entry = DICT[id] as { en: string; kn: string } | undefined;
    if (!entry) {
      if (import.meta.env.DEV) console.warn(`[i18n] missing dictionary id: ${String(id)}`);
      return String(id);
    }
    const value = entry[lang] ?? entry.en;
    if (import.meta.env.DEV && lang === "kn" && (!entry.kn || entry.kn === entry.en)) {
      console.warn(`[i18n] no Kannada for id: ${String(id)}`);
    }
    return value;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  useUntranslatedScan(lang);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Kannada needs a taller line box than Latin. Apply wherever script is rendered. */
export const KN_TEXT = "font-kannada leading-[1.65]";

/**
 * Dictionary-backed text node. Applies the Kannada line box and lang attribute
 * automatically, so callers never need to repeat the conditional.
 */
export function T({
  id,
  as: Tag = "span",
  className = "",
}: {
  id: StrId;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "li" | "label" | "strong";
  className?: string;
}) {
  const { lang, t } = useLang();
  return (
    <Tag lang={lang} className={`${lang === "kn" ? KN_TEXT : ""} ${className}`.trim()}>
      {t(id)}
    </Tag>
  );
}

/**
 * Public authority label in the active language. Acronyms stay Latin because
 * that is how the portal prints them.
 */
export function useAuthorityLabel() {
  const { lang } = useLang();
  return useCallback(
    (name: string | null | undefined) =>
      !name ? "" : lang === "kn" ? (AUTHORITY_NAME_KN[name] ?? name) : name,
    [lang],
  );
}

/** Note beside an authority in the picker, keyed by AUTHORITIES[].id. */
export function useAuthorityNote() {
  const { lang } = useLang();
  return useCallback(
    (id: string, en: string) => (lang === "kn" ? (AUTHORITY_NOTE_KN[id] ?? en) : en),
    [lang],
  );
}

/** "Bengaluru East City Corporation" -> "ಪೂರ್ವ" / "East" for compact chips. */
export function useCorporationShort() {
  const { lang } = useLang();
  return useCallback(
    (corporation: string) => {
      const short = corporation.replace("Bengaluru ", "").replace(" City Corporation", "");
      return lang === "kn" ? (CORPORATION_SHORT_KN[short] ?? short) : short;
    },
    [lang],
  );
}

/** Class helper: adds the Kannada line box only when Kannada is active. */
export function useKnClass() {
  const { lang } = useLang();
  return lang === "kn" ? KN_TEXT : "";
}

/**
 * Authoritative bilingual pair from the datasets (ward names, officials).
 * Shows the active language first with the other underneath, muted, so the user
 * can still cross-reference against an English portal.
 */
export function Bi({
  en,
  kn,
  className = "",
  secondaryClassName = "",
}: {
  en?: string | null | undefined;
  kn?: string | null | undefined;
  className?: string;
  secondaryClassName?: string;
}) {
  const { lang } = useLang();
  const useKn = lang === "kn" && !!kn?.trim();
  const primary = useKn ? kn : en;
  const secondary = useKn ? en : lang === "en" ? null : en;

  if (!primary) return <span className={className}>—</span>;

  return (
    <span className={`block ${className}`}>
      <span className={useKn ? `${KN_TEXT} block` : "block"} lang={useKn ? "kn" : undefined}>
        {primary}
      </span>
      {useKn && secondary && secondary !== primary ? (
        <span className={`block text-[11px] leading-tight text-muted-foreground ${secondaryClassName}`}>
          {secondary}
        </span>
      ) : null}
    </span>
  );
}

/** Header language toggle. Always visible — no menu, works at 375px. */
export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  const next: Lang = lang === "en" ? "kn" : "en";
  const label = next === "kn" ? t("switchToKannada") : t("switchToEnglish");

  return (
    <button
      type="button"
      data-lang-toggle=""
      data-lang-next={next}
      onClick={() => setLang(next)}
      lang={next}
      aria-label={next === "kn" ? t("langToggleLabelKn") : t("langToggleLabelEn")}

      className={`shrink-0 whitespace-nowrap rounded-sm border border-border px-2.5 py-1.5 text-xs font-medium leading-[1.6] transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        next === "kn" ? "font-kannada" : ""
      } ${className}`}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Dev-only untranslated-string checker                                */
/* ------------------------------------------------------------------ */

/** Proper nouns, data values and identifiers that stay Latin on purpose. */
const ALLOWED_LATIN =
  /^(?:[\s\d\W]*|BWSSB|BESCOM|BBMP|GBA|BMTC|BDA|Sahaaya(?:\s?2\.0)?|RTI|PIO|APIO|IPO|DD|CC BY 4\.0|Vicharane|Bengawalk City Officials|Khajane-II|karnataka|rtionline\.karnataka\.gov\.in|English \(portal\)|[A-Z0-9/\-.]+)$/i;

function collectDictLatin(): Set<string> {
  const set = new Set<string>();
  for (const entry of Object.values(DICT) as { en: string; kn: string }[]) {
    set.add(entry.en.trim());
    set.add(entry.kn.trim());
  }
  return set;
}

/**
 * While Kannada is active in development, walk the rendered text nodes and warn
 * about any Latin-script string that is not a dictionary value. Gaps become
 * visible in the console instead of silently shipping English.
 */
function useUntranslatedScan(lang: Lang) {
  const known = useRef<Set<string> | null>(null);
  const reported = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!import.meta.env.DEV || lang !== "kn" || typeof window === "undefined") return;
    known.current ??= collectDictLatin();

    const scan = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const misses: string[] = [];
      let node = walker.nextNode();
      while (node) {
        const parent = node.parentElement;
        const text = (node.textContent ?? "").trim();
        if (
          text &&
          parent &&
          !parent.closest("script,style,pre,textarea,code,[data-i18n-ignore]") &&
          /[A-Za-z]{3,}/.test(text) &&
          !ALLOWED_LATIN.test(text) &&
          !known.current!.has(text) &&
          !reported.current.has(text)
        ) {
          reported.current.add(text);
          misses.push(text);
        }
        node = walker.nextNode();
      }
      if (misses.length) {
        console.warn(
          `[i18n] ${misses.length} string(s) rendered outside the dictionary while Kannada is active:`,
          misses,
        );
      }
    };

    const id = window.setTimeout(scan, 800);
    const observer = new MutationObserver(() => {
      window.clearTimeout(id);
      window.setTimeout(scan, 800);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      window.clearTimeout(id);
      observer.disconnect();
    };
  }, [lang]);
}
