/**
 * Lightweight two-language layer (English / Kannada).
 *
 * NOTE FOR REVIEWERS: the Kannada strings below were generated. The government
 * vocabulary block at the top is taken verbatim from the Karnataka RTI portal;
 * everything else needs a native-speaker pass before this is demoed.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "kn";

const STORAGE_KEY = "vicharane.lang";

/** id -> { en, kn } */
export const DICT = {
  // --- Government vocabulary (verbatim from the Karnataka RTI portal) ---
  rti: { en: "Right to Information", kn: "ಮಾಹಿತಿ ಹಕ್ಕು" },
  submitRequest: { en: "Submit request", kn: "ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ" },
  firstAppeal: { en: "First appeal", kn: "ಪ್ರಥಮ ಮೇಲ್ಮನವಿ" },
  submitFirstAppeal: { en: "Submit first appeal", kn: "ಪ್ರಥಮ ಮೇಲ್ಮನವಿಯನ್ನು ಸಲ್ಲಿಸಿ" },
  viewStatus: { en: "View status", kn: "ಸ್ಥಿತಿಯನ್ನು ವೀಕ್ಷಿಸಿ" },
  viewHistory: { en: "View history", kn: "ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಿ" },
  registrationNumber: { en: "Registration number", kn: "ನೋಂದಣಿ ಸಂಖ್ಯೆ" },
  publicAuthority: { en: "Public authority", kn: "ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರ" },
  pio: { en: "Public Information Officer", kn: "ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ" },
  applicant: { en: "Applicant", kn: "ಅರ್ಜಿದಾರ" },
  fee: { en: "Fee", kn: "ಶುಲ್ಕ" },
  payment: { en: "Payment", kn: "ಪಾವತಿ" },
  filingDate: { en: "Filing date", kn: "ಫೈಲಿಂಗ್ ದಿನಾಂಕ" },
  record: { en: "Record", kn: "ದಾಖಲೆ" },
  bpl: { en: "Below poverty line", kn: "ಬಡತನ ರೇಖೆಗಿಂತ ಕೆಳಗಿನ" },
  secondAppeal: { en: "Second appeal", kn: "ದ್ವಿತೀಯ ಮೇಲ್ಮನವಿ" },

  // --- Navigation / shell ---
  navRegistry: { en: "Registry", kn: "ನೋಂದಣಿ ಪಟ್ಟಿ" },
  navNewFiling: { en: "New filing", kn: "ಹೊಸ ಸಲ್ಲಿಕೆ" },
  navWardMap: { en: "Ward map", kn: "ವಾರ್ಡ್ ನಕ್ಷೆ" },
  navSignOut: { en: "Sign out", kn: "ನಿರ್ಗಮಿಸಿ" },
  tagline: { en: "Public Records Tracker", kn: "ಸಾರ್ವಜನಿಕ ದಾಖಲೆಗಳ ಟ್ರ್ಯಾಕರ್" },
  dashboard: { en: "Dashboard", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },
  logIn: { en: "Log in", kn: "ಪ್ರವೇಶಿಸಿ" },
  signUp: { en: "Sign up", kn: "ನೋಂದಾಯಿಸಿ" },

  // --- Registry / dashboard ---
  registryTitle: { en: "RTI Registry", kn: "ಮಾಹಿತಿ ಹಕ್ಕು ನೋಂದಣಿ ಪಟ್ಟಿ" },
  newFilingCta: { en: "NEW FILING", kn: "ಹೊಸ ಸಲ್ಲಿಕೆ" },
  colRefStatus: { en: "Ref / Status", kn: "ಸಂಖ್ಯೆ / ಸ್ಥಿತಿ" },
  colGrievance: { en: "Grievance & Authority", kn: "ದೂರು ಮತ್ತು ಪ್ರಾಧಿಕಾರ" },
  colTimeline: { en: "Timeline", kn: "ಕಾಲಾನುಕ್ರಮ" },
  colDeadline: { en: "Deadline", kn: "ಕಾಲಮಿತಿ" },
  statusNotFiled: { en: "Not filed", kn: "ಸಲ್ಲಿಸಿಲ್ಲ" },
  statusActionDue: { en: "Action due", kn: "ಕ್ರಮ ಬಾಕಿ" },
  statusInProgress: { en: "In progress", kn: "ಪ್ರಗತಿಯಲ್ಲಿದೆ" },
  loading: { en: "Loading…", kn: "ಲೋಡ್ ಆಗುತ್ತಿದೆ…" },
  nothingFiled: { en: "Nothing filed yet", kn: "ಇನ್ನೂ ಏನೂ ಸಲ್ಲಿಸಿಲ್ಲ" },
  draftFirstRti: { en: "Draft your first RTI", kn: "ನಿಮ್ಮ ಮೊದಲ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ರಚಿಸಿ" },
  filedOn: { en: "Filed", kn: "ಸಲ್ಲಿಸಿದ್ದು" },
  awaitingAction: { en: "Awaiting your action", kn: "ನಿಮ್ಮ ಕ್ರಮಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ" },
  day: { en: "DAY", kn: "ದಿನ" },
  clearFilter: { en: "Clear filter", kn: "ಶೋಧನೆ ತೆರವುಗೊಳಿಸಿ" },
  clearDemo: { en: "Clear demo data", kn: "ಮಾದರಿ ದತ್ತಾಂಶ ತೆರವುಗೊಳಿಸಿ" },

  // --- Drafts / filing route ---
  theApplication: { en: "The application", kn: "ಅರ್ಜಿ" },
  copy: { en: "Copy", kn: "ನಕಲಿಸಿ" },
  copyPortalSafe: { en: "Copy portal-safe", kn: "ಪೋರ್ಟಲ್‌ಗೆ ಸೂಕ್ತವಾದ ಪಠ್ಯ ನಕಲಿಸಿ" },
  download: { en: "Download", kn: "ಡೌನ್‌ಲೋಡ್" },
  yourComplaint: { en: "Your complaint", kn: "ನಿಮ್ಮ ದೂರು" },
  whoIsResponsible: { en: "Who is responsible", kn: "ಯಾರು ಜವಾಬ್ದಾರರು" },
  official: { en: "Official", kn: "ಅಧಿಕಾರಿ" },
  informationRequested: { en: "Information requested", kn: "ಕೋರಲಾದ ಮಾಹಿತಿ" },
  noOfficials: {
    en: "No officials listed for this ward.",
    kn: "ಈ ವಾರ್ಡ್‌ಗೆ ಯಾವುದೇ ಅಧಿಕಾರಿಗಳ ಪಟ್ಟಿ ಇಲ್ಲ.",
  },

  // --- Language toggle ---
  switchToKannada: { en: "ಕನ್ನಡ", kn: "ಕನ್ನಡ" },
  switchToEnglish: { en: "English", kn: "English" },
} as const;

export type StrId = keyof typeof DICT;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (id: StrId) => string };

const LangContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (id) => DICT[id].en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "kn" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage unavailable — the toggle still works for this session */
    }
  }, []);

  const t = useCallback((id: StrId) => DICT[id][lang] ?? DICT[id].en, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Kannada needs a taller line box than Latin. Apply wherever script is rendered. */
export const KN_TEXT = "font-kannada leading-[1.65]";

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
  const { lang, setLang } = useLang();
  const next: Lang = lang === "en" ? "kn" : "en";
  const label = next === "kn" ? "ಕನ್ನಡ" : "English";

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      lang={next}
      aria-label={next === "kn" ? "ಕನ್ನಡದಲ್ಲಿ ವೀಕ್ಷಿಸಿ" : "View in English"}
      className={`shrink-0 whitespace-nowrap rounded-sm border border-border px-2.5 py-1.5 text-xs font-medium leading-[1.6] transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        next === "kn" ? "font-kannada" : ""
      } ${className}`}
    >
      {label}
    </button>
  );
}
