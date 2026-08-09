/**
 * Dashboard registry: subheading, ward-filter chip, clock captions, toasts.
 */
export const DICT_DASHBOARD = {
  dashboardMonitoringDeadlines: {
    en: "Monitoring {n} statutory {noun}.",
    kn: "{n} ಶಾಸನಬದ್ಧ {noun} ಗಮನಿಸಲಾಗುತ್ತಿದೆ.",
  },
  dashboardDeadlineSingular: { en: "deadline", kn: "ಕಾಲಮಿತಿ" },
  dashboardDeadlinePlural: { en: "deadlines", kn: "ಕಾಲಮಿತಿಗಳನ್ನು" },
  dashboardNoApplicationsYet: { en: "No applications yet.", kn: "ಇನ್ನೂ ಯಾವುದೇ ಅರ್ಜಿ ಇಲ್ಲ." },
  dashboardWardsWithLiveFilings: {
    en: "{n} {noun} with live filings",
    kn: "{n} {noun}ಗಳಲ್ಲಿ ಸಕ್ರಿಯ ಸಲ್ಲಿಕೆಗಳಿವೆ",
  },
  dashboardWardSingular: { en: "ward", kn: "ವಾರ್ಡ್" },
  dashboardWardPlural: { en: "wards", kn: "ವಾರ್ಡ್" },
  dashboardFilteredTo: { en: "filtered to {ward}", kn: "{ward} ಗೆ ಸೀಮಿತ" },
  dashboardRecordSummary: {
    en: "{total} {recordNoun} tracked · {live} with a live statutory deadline.",
    kn: "{total} {recordNoun} ಗಮನಿಸಲಾಗುತ್ತಿದೆ · {live} ಸಕ್ರಿಯ ಶಾಸನಬದ್ಧ ಕಾಲಮಿತಿಯೊಂದಿಗೆ.",
  },
  dashboardRecordSingular: { en: "record", kn: "ದಾಖಲೆ" },
  dashboardRecordPlural: { en: "records", kn: "ದಾಖಲೆಗಳು" },
  dashboardInconsistent: {
    en: "Needs attention — inconsistent state",
    kn: "ಗಮನ ಅಗತ್ಯ — ಹೊಂದಾಣಿಕೆಯಾಗದ ಸ್ಥಿತಿ",
  },
  loadDemoData: { en: "Load demo data", kn: "ಮಾದರಿ ದತ್ತಾಂಶ ಲೋಡ್ ಮಾಡಿ" },
  demoDataLoaded: { en: "Demo data loaded", kn: "ಮಾದರಿ ದತ್ತಾಂಶ ಲೋಡ್ ಆಗಿದೆ" },
  demoDataLoading: { en: "Loading demo data…", kn: "ಮಾದರಿ ದತ್ತಾಂಶ ಲೋಡ್ ಆಗುತ್ತಿದೆ…" },
  dashboardDemoTag: { en: "demo", kn: "ಮಾದರಿ" },
  dashboardComplaintTag: { en: "complaint", kn: "ದೂರು" },
  dashboardCityMapAriaLabel: {
    en: "3D map of GBA wards, lit up where RTI filings are active",
    kn: "ಮಾಹಿತಿ ಹಕ್ಕು ಸಲ್ಲಿಕೆಗಳು ಸಕ್ರಿಯವಿರುವ GBA ವಾರ್ಡ್‌ಗಳ 3D ನಕ್ಷೆ",
  },
  groupNeedsYou: { en: "Needs you now", kn: "ಈಗ ನಿಮ್ಮ ಕ್ರಮ ಬೇಕು" },
  groupWaiting: { en: "Waiting on them", kn: "ಅವರ ಉತ್ತರಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ" },
  groupDone: { en: "Done", kn: "ಮುಗಿದಿದೆ" },
  groupShow: { en: "Show", kn: "ತೋರಿಸಿ" },
  groupHide: { en: "Hide", kn: "ಮರೆಮಾಡಿ" },
  statusNotFiledYet: { en: "Not filed yet", kn: "ಇನ್ನೂ ಸಲ್ಲಿಸಿಲ್ಲ" },
  statusFalseClosure: {
    en: "Closed without the work being done",
    kn: "ಕೆಲಸ ಆಗದೆ ಮುಚ್ಚಲಾಗಿದೆ",
  },
} as const;
