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
  dashboardDemoTag: { en: "demo", kn: "ಮಾದರಿ" },
  dashboardComplaintTag: { en: "complaint", kn: "ದೂರು" },
  dashboardCityMapAriaLabel: {
    en: "3D map of GBA wards, lit up where RTI filings are active",
    kn: "ಮಾಹಿತಿ ಹಕ್ಕು ಸಲ್ಲಿಕೆಗಳು ಸಕ್ರಿಯವಿರುವ GBA ವಾರ್ಡ್‌ಗಳ 3D ನಕ್ಷೆ",
  },
} as const;
