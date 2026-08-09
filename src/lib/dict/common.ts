/**
 * Shared vocabulary: government terms, navigation, generic UI.
 * NOTE: Kannada legal terms follow the Karnataka RTI portal's own wording.
 */
export const DICT_COMMON = {
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
  navMenu: { en: "Menu", kn: "ಮೆನು" },
  tagline: { en: "Public Records Tracker", kn: "ಸಾರ್ವಜನಿಕ ದಾಖಲೆಗಳ ಟ್ರ್ಯಾಕರ್" },
  dashboard: { en: "Dashboard", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },
  logIn: { en: "Log in", kn: "ಪ್ರವೇಶಿಸಿ" },
  signUp: { en: "Sign up", kn: "ನೋಂದಾಯಿಸಿ" },

  // --- Registry / dashboard (legacy keys kept for existing call sites) ---
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

  // --- Drafts / filing route (legacy keys) ---
  theApplication: { en: "The application", kn: "ಅರ್ಜಿ" },
  copy: { en: "Copy", kn: "ನಕಲಿಸಿ" },
  copyPortalSafe: { en: "Copy portal-safe", kn: "ಪೋರ್ಟಲ್‌ಗೆ ಸೂಕ್ತವಾದ ಪಠ್ಯ ನಕಲಿಸಿ" },
  download: { en: "Download", kn: "ಡೌನ್‌ಲೋಡ್" },
  clearDemoData: { en: "Clear demo data", kn: "ಡೆಮೊ ಮಾಹಿತಿ ಅಳಿಸಿ" },
  demoDataCleared: { en: "Demo data cleared", kn: "ಡೆಮೊ ಮಾಹಿತಿ ಅಳಿಸಲಾಗಿದೆ" },
  yourComplaint: { en: "Your complaint", kn: "ನಿಮ್ಮ ದೂರು" },
  whoIsResponsible: { en: "Who is responsible", kn: "ಯಾರು ಜವಾಬ್ದಾರರು" },
  official: { en: "Official", kn: "ಅಧಿಕಾರಿ" },
  informationRequested: { en: "Information requested", kn: "ಕೋರಲಾದ ಮಾಹಿತಿ" },
  noOfficials: {
    en: "No officials listed for this ward.",
    kn: "ಈ ವಾರ್ಡ್‌ಗೆ ಯಾವುದೇ ಅಧಿಕಾರಿಗಳ ಪಟ್ಟಿ ಇಲ್ಲ.",
  },

  // --- Generic UI ---
  back: { en: "Back", kn: "ಹಿಂದೆ" },
  next: { en: "Next", kn: "ಮುಂದೆ" },
  cancel: { en: "Cancel", kn: "ರದ್ದುಮಾಡಿ" },
  save: { en: "Save", kn: "ಉಳಿಸಿ" },
  saving: { en: "Saving…", kn: "ಉಳಿಸಲಾಗುತ್ತಿದೆ…" },
  saved: { en: "Saved", kn: "ಉಳಿಸಲಾಗಿದೆ" },
  close: { en: "Close", kn: "ಮುಚ್ಚಿ" },
  copied: { en: "Copied", kn: "ನಕಲಿಸಲಾಗಿದೆ" },
  copyFailed: { en: "Copy failed", kn: "ನಕಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" },
  somethingWentWrong: { en: "Something went wrong", kn: "ಏನೋ ತಪ್ಪಾಗಿದೆ" },
  tryAgain: { en: "Try again", kn: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" },
  optional: { en: "Optional", kn: "ಐಚ್ಛಿಕ" },
  required: { en: "Required", kn: "ಕಡ್ಡಾಯ" },
  notFound: { en: "Not found", kn: "ಕಂಡುಬಂದಿಲ್ಲ" },

  // --- Language toggle ---
  switchToKannada: { en: "ಕನ್ನಡ", kn: "ಕನ್ನಡ" },
  switchToEnglish: { en: "English", kn: "English" },
  langToggleLabelKn: { en: "View in Kannada", kn: "ಕನ್ನಡದಲ್ಲಿ ವೀಕ್ಷಿಸಿ" },
  langToggleLabelEn: { en: "View in English", kn: "ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ" },
  bengaluruWord: { en: "Bengaluru", kn: "ಬೆಂಗಳೂರು" },
} as const;
