/**
 * Kannada renderings for public authority names and their one-line notes.
 *
 * Acronyms that the portal itself prints in Latin (BWSSB, BESCOM, BMRCL, BDA,
 * GBA) stay untranslated — only the descriptive part is rendered in Kannada.
 * Keyed by the English name exactly as stored in the database, so the label can
 * be resolved from a saved application row as well as from the picker.
 */
export const AUTHORITY_NAME_KN: Record<string, string> = {
  "Bengaluru Central City Corporation": "ಬೆಂಗಳೂರು ಕೇಂದ್ರ ನಗರ ಪಾಲಿಕೆ",
  "Bengaluru East City Corporation": "ಬೆಂಗಳೂರು ಪೂರ್ವ ನಗರ ಪಾಲಿಕೆ",
  "Bengaluru West City Corporation": "ಬೆಂಗಳೂರು ಪಶ್ಚಿಮ ನಗರ ಪಾಲಿಕೆ",
  "Bengaluru North City Corporation": "ಬೆಂಗಳೂರು ಉತ್ತರ ನಗರ ಪಾಲಿಕೆ",
  "Bengaluru South City Corporation": "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ನಗರ ಪಾಲಿಕೆ",
  "Greater Bengaluru Authority": "ಗ್ರೇಟರ್ ಬೆಂಗಳೂರು ಪ್ರಾಧಿಕಾರ",
  BWSSB: "BWSSB (ಜಲಮಂಡಳಿ)",
  BESCOM: "BESCOM (ವಿದ್ಯುತ್ ಸರಬರಾಜು)",
  BMRCL: "BMRCL (ನಮ್ಮ ಮೆಟ್ರೊ)",
  BDA: "BDA (ಬೆಂಗಳೂರು ಅಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರ)",
  "Other — enter authority manually": "ಇತರೆ — ಪ್ರಾಧಿಕಾರವನ್ನು ನೀವೇ ನಮೂದಿಸಿ",
};

/** Short corporation labels used in the map hover chip. */
export const CORPORATION_SHORT_KN: Record<string, string> = {
  Central: "ಕೇಂದ್ರ",
  East: "ಪೂರ್ವ",
  West: "ಪಶ್ಚಿಮ",
  North: "ಉತ್ತರ",
  South: "ದಕ್ಷಿಣ",
};

/** Keyed by AUTHORITIES[].id in rti-data.ts. */
export const AUTHORITY_NOTE_KN: Record<string, string> = {
  bcc: "ವಾರ್ಡ್ ಮಟ್ಟದ ರಸ್ತೆ, ಚರಂಡಿ, ಕಸ, ಬೀದಿ ದೀಪ (ಕೇಂದ್ರ)",
  bec: "ವಾರ್ಡ್ ಮಟ್ಟದ ನಾಗರಿಕ ಕಾಮಗಾರಿಗಳು (ಪೂರ್ವ)",
  bwc: "ವಾರ್ಡ್ ಮಟ್ಟದ ನಾಗರಿಕ ಕಾಮಗಾರಿಗಳು (ಪಶ್ಚಿಮ)",
  bnc: "ವಾರ್ಡ್ ಮಟ್ಟದ ನಾಗರಿಕ ಕಾಮಗಾರಿಗಳು (ಉತ್ತರ)",
  bsc: "ವಾರ್ಡ್ ಮಟ್ಟದ ನಾಗರಿಕ ಕಾಮಗಾರಿಗಳು (ದಕ್ಷಿಣ)",
  gba: "ಉನ್ನತ ಸಂಸ್ಥೆ — ಯೋಜನೆ, ಮುಖ್ಯ ರಸ್ತೆಗಳು, ಪಾಲಿಕೆಗಳ ನಡುವಿನ ಯೋಜನೆಗಳು",
  bwssb: "ನೀರು ಸರಬರಾಜು ಮತ್ತು ಒಳಚರಂಡಿ",
  bescom: "ವಿದ್ಯುತ್ ಸರಬರಾಜು, ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್, ಬಿಲ್ಲಿಂಗ್",
  bmrcl: "ನಮ್ಮ ಮೆಟ್ರೊ ನಿರ್ಮಾಣ ಮತ್ತು ಕಾರ್ಯಾಚರಣೆ",
  bda: "ಬಡಾವಣೆಗಳು, ನಿವೇಶನಗಳು, ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳು",
  other: "ಕರ್ನಾಟಕದ ಇತರ ಯಾವುದೇ ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರ",
};

/** Complaint channels, keyed by COMPLAINT_CHANNELS[].id in rti-data.ts. */
export const CHANNEL_NAME_KN: Record<string, string> = {
  sahaaya: "ಸಹಾಯ 2.0 (ನಮ್ಮ ಬೆಂಗಳೂರು)",
  bwssb: "BWSSB (ಜಲಮಂಡಳಿ)",
  bescom: "BESCOM (ವಿದ್ಯುತ್)",
  other: "ಇತರೆ / ನೀವೇ ನಮೂದಿಸಿದ್ದು",
};

export const CHANNEL_NOTE_KN: Record<string, string> = {
  sahaaya:
    "GBA ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳು — ರಸ್ತೆ, ಚರಂಡಿ, ಕಸ, ಬೀದಿ ದೀಪ, ಮರಗಳು, ಒತ್ತುವರಿ, ಕಟ್ಟಡ ಉಲ್ಲಂಘನೆ",
  bwssb: "ನೀರು ಸರಬರಾಜು ಮತ್ತು ಒಳಚರಂಡಿ",
  bescom: "ವಿದ್ಯುತ್ ಸರಬರಾಜು, ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್, ಬಿಲ್ಲಿಂಗ್",
  other: "ಇತರ ಯಾವುದೇ ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರ",
};
