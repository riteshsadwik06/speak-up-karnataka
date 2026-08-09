/**
 * Application detail route: stage rail, timeline, filing instructions,
 * appeals, complaint-stage actions, transfer panel, and related toasts.
 */
export const DICT_DETAIL = {
  // --- Stage rail ---
  railComplaint: { en: "Complaint", kn: "ದೂರು" },
  railEscalation: { en: "Escalation", kn: "ಉನ್ನತೀಕರಣ" },
  railRti: { en: "RTI", kn: "ಮಾಹಿತಿ ಹಕ್ಕು" },
  railFirstAppeal: { en: "First appeal", kn: "ಪ್ರಥಮ ಮೇಲ್ಮನವಿ" },
  railSecondAppeal: { en: "Second appeal", kn: "ದ್ವಿತೀಯ ಮೇಲ್ಮನವಿ" },
  railDeadlineNone: { en: "no statutory deadline", kn: "ಕಾನೂನುಬದ್ಧ ಕಾಲಮಿತಿ ಇಲ್ಲ" },
  railDeadline30: { en: "30 days", kn: "30 ದಿನಗಳು" },
  railDeadlineFirstAppeal: {
    en: "30 days to file / 45 to decide",
    kn: "ಸಲ್ಲಿಸಲು 30 ದಿನಗಳು / ನಿರ್ಣಯಕ್ಕೆ 45 ದಿನಗಳು",
  },
  railDeadlineSecond: { en: "90 days", kn: "90 ದಿನಗಳು" },

  // --- Header ---
  allApplications: { en: "← All applications", kn: "← ಎಲ್ಲಾ ಅರ್ಜಿಗಳು" },
  demoDataBadge: { en: "Demo data", kn: "ಮಾದರಿ ದತ್ತಾಂಶ" },
  wardSuffix: { en: "ward", kn: "ವಾರ್ಡ್" },

  // --- Complaint stage ---
  sectionComplaint: { en: "The complaint", kn: "ದೂರು" },
  sectionWhatNext: { en: "What happened next?", kn: "ಮುಂದೆ ಏನಾಯಿತು?" },
  btnEscalate: { en: "Still nothing — escalate", kn: "ಇನ್ನೂ ಏನೂ ಆಗಿಲ್ಲ — ಉನ್ನತೀಕರಿಸಿ" },
  btnFalseClosure: {
    en: "They marked it resolved but it isn't",
    kn: "ಪರಿಹಾರವಾಗಿದೆ ಎಂದು ದಾಖಲಿಸಿದ್ದಾರೆ, ಆದರೆ ಆಗಿಲ್ಲ",
  },
  btnFixed: { en: "They fixed it", kn: "ಅವರು ಸರಿಪಡಿಸಿದ್ದಾರೆ" },
  escalatedPrefix: { en: "Escalated", kn: "ಉನ್ನತೀಕರಿಸಲಾಗಿದೆ" },
  escalatedTimeSingular: { en: "time.", kn: "ಬಾರಿ." },
  escalatedTimePlural: { en: "times.", kn: "ಬಾರಿ." },
  closureDateLabel: { en: "Date they marked it resolved", kn: "ಪರಿಹಾರವಾಗಿದೆ ಎಂದು ದಾಖಲಿಸಿದ ದಿನಾಂಕ" },
  stillWrongLabel: {
    en: "What is still wrong on the ground?",
    kn: "ವಾಸ್ತವದಲ್ಲಿ ಇನ್ನೂ ಏನು ತಪ್ಪಾಗಿದೆ?",
  },
  rtiFromClosureExplanation: {
    en: "The RTI will ask for the action-taken report, the work order, the closing officer's name, the completion certificate, the closure photograph, the measurement book entry and the expenditure booked. None of these exist if the work was not done.",
    kn: "ಈ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿಯು ಕ್ರಮ ಕೈಗೊಂಡ ವರದಿ, ಕಾರ್ಯಾದೇಶ, ಪ್ರಕರಣ ಮುಚ್ಚಿದ ಅಧಿಕಾರಿಯ ಹೆಸರು, ಪೂರ್ಣಗೊಂಡ ಪ್ರಮಾಣಪತ್ರ, ಮುಚ್ಚಿದ ಛಾಯಾಚಿತ್ರ, ಮಾಪನ ಪುಸ್ತಕದ ನಮೂದು ಮತ್ತು ಬಿಡುಗಡೆಯಾದ ವೆಚ್ಚವನ್ನು ಕೇಳುತ್ತದೆ. ಕೆಲಸ ಆಗದಿದ್ದರೆ ಇವಾವುವೂ ಅಸ್ತಿತ್ವದಲ್ಲಿ ಇರುವುದಿಲ್ಲ.",
  },
  btnDraftRtiClosure: {
    en: "Draft the RTI against this closure",
    kn: "ಈ ಮುಚ್ಚುಗಡೆಯ ವಿರುದ್ಧ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ರಚಿಸಿ",
  },
  draftingEllipsis: { en: "Drafting…", kn: "ರಚಿಸಲಾಗುತ್ತಿದೆ…" },
  stillWrongTooShortError: {
    en: "Say what is still wrong on the ground — the RTI is built from it.",
    kn: "ವಾಸ್ತವದಲ್ಲಿ ಏನು ತಪ್ಪಾಗಿದೆ ಎಂದು ತಿಳಿಸಿ — ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿಯನ್ನು ಅದರ ಆಧಾರದಲ್ಲಿ ರಚಿಸಲಾಗುತ್ತದೆ.",
  },
  couldNotDraftRtiError: { en: "Could not draft the RTI", kn: "ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" },
  rtiDraftedToast: { en: "RTI drafted against the closure", kn: "ಮುಚ್ಚುಗಡೆಯ ವಿರುದ್ಧ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ರಚಿಸಲಾಗಿದೆ" },
  escalationRecordedToast: { en: "Escalation recorded", kn: "ಉನ್ನತೀಕರಣ ದಾಖಲಿಸಲಾಗಿದೆ" },
  couldNotDraftAppeal: { en: "Could not draft the appeal", kn: "ಮೇಲ್ಮನವಿ ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" },
  draftedSuffix: { en: "drafted", kn: "ರಚಿಸಲಾಗಿದೆ" },

  complaintEscalationNote: {
    en: "Sahaaya 2.0 allows two escalations before the complaint reaches a higher officer. Work through both, then an RTI is the next real lever.",
    kn: "ದೂರು ಉನ್ನತ ಅಧಿಕಾರಿಯನ್ನು ತಲುಪುವ ಮೊದಲು Sahaaya 2.0 ಎರಡು ಉನ್ನತೀಕರಣಗಳಿಗೆ ಅವಕಾಶ ನೀಡುತ್ತದೆ. ಎರಡನ್ನೂ ಪೂರೈಸಿ, ನಂತರ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿಯೇ ಮುಂದಿನ ನಿಜವಾದ ಅಸ್ತ್ರ.",
  },
  complaintNotStatutory: {
    en: "This is a service expectation, not a statutory deadline. The RTI Act's 30-day limit applies to RTI applications, not to civic complaints.",
    kn: "ಇದು ಸೇವಾ ನಿರೀಕ್ಷೆಯೇ ಹೊರತು ಕಾನೂನುಬದ್ಧ ಕಾಲಮಿತಿ ಅಲ್ಲ. ಮಾಹಿತಿ ಹಕ್ಕು ಕಾಯ್ದೆಯ 30 ದಿನಗಳ ಮಿತಿ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿಗಳಿಗೆ ಅನ್ವಯಿಸುತ್ತದೆ, ಸಾರ್ವಜನಿಕ ದೂರುಗಳಿಗೆ ಅಲ್ಲ.",
  },

  sectionWhereItWent: { en: "Where it went", kn: "ಎಲ್ಲಿಗೆ ಹೋಯಿತು" },
  channelNotRecorded: { en: "Channel not recorded.", kn: "ಮಾರ್ಗ ದಾಖಲಾಗಿಲ್ಲ." },
  sectionTimeline: { en: "Timeline", kn: "ಕಾಲಾನುಕ್ರಮ" },
  complaintReferenceLabel: { en: "Complaint reference", kn: "ದೂರಿನ ಸಂಖ್ಯೆ" },
  sentOnLabel: { en: "Sent on", kn: "ಕಳುಹಿಸಿದ ದಿನಾಂಕ" },
  notSentYet: { en: "not sent yet", kn: "ಇನ್ನೂ ಕಳುಹಿಸಿಲ್ಲ" },
  serviceExpectationLabel: { en: "Service expectation", kn: "ಸೇವಾ ನಿರೀಕ್ಷೆ" },
  serviceExpectationDaysSuffix: {
    en: "days — not a statutory deadline",
    kn: "ದಿನಗಳು — ಕಾನೂನುಬದ್ಧ ಕಾಲಮಿತಿ ಅಲ್ಲ",
  },
  markedResolvedLabel: { en: "Marked resolved", kn: "ಪರಿಹಾರವಾಗಿದೆ ಎಂದು ದಾಖಲಿಸಲಾಗಿದೆ" },
  sectionMarkAsSent: { en: "Mark as sent", kn: "ಕಳುಹಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ" },
  placeholderComplaintRef: { en: "Complaint reference number", kn: "ದೂರಿನ ಸಂಖ್ಯೆ" },
  btnStartClock: { en: "Start the clock", kn: "ಕಾಲಮಿತಿ ಆರಂಭಿಸಿ" },

  // --- Application section ---
  toastPortalSafeCopied: { en: "Portal-safe text copied", kn: "ಪೋರ್ಟಲ್‌ಗೆ ಸೂಕ್ತವಾದ ಪಠ್ಯ ನಕಲಿಸಲಾಗಿದೆ" },
  copyKannadaButton: { en: "Copy ಕನ್ನಡ", kn: "ಕನ್ನಡ ನಕಲಿಸಿ" },
  toastKannadaCopied: { en: "Kannada text copied", kn: "ಕನ್ನಡ ಪಠ್ಯ ನಕಲಿಸಲಾಗಿದೆ" },
  portalLatinOnlyNoticeApplication: {
    en: "The online portal accepts Latin characters only, so a Kannada application must be sent by post. Both versions are legally valid.",
    kn: "ಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್ ಲ್ಯಾಟಿನ್ ಅಕ್ಷರಗಳನ್ನು ಮಾತ್ರ ಸ್ವೀಕರಿಸುತ್ತದೆ, ಆದ್ದರಿಂದ ಕನ್ನಡ ಅರ್ಜಿಯನ್ನು ಅಂಚೆ ಮೂಲಕ ಕಳುಹಿಸಬೇಕು. ಎರಡೂ ಆವೃತ್ತಿಗಳೂ ಕಾನೂನುಬದ್ಧವಾಗಿ ಸಿಂಧು.",
  },
  portalLatinOnlyNoticeAppeal: {
    en: "The portal accepts Latin characters only — send the Kannada appeal by post. Both versions are valid.",
    kn: "ಪೋರ್ಟಲ್ ಲ್ಯಾಟಿನ್ ಅಕ್ಷರಗಳನ್ನು ಮಾತ್ರ ಸ್ವೀಕರಿಸುತ್ತದೆ — ಕನ್ನಡ ಮೇಲ್ಮನವಿಯನ್ನು ಅಂಚೆ ಮೂಲಕ ಕಳುಹಿಸಿ. ಎರಡೂ ಆವೃತ್ತಿಗಳೂ ಸಿಂಧು.",
  },
  letterKannadaPostalOnly: { en: "ಕನ್ನಡ (ಅಂಚೆ ಮೂಲಕ ಮಾತ್ರ)", kn: "ಕನ್ನಡ (ಅಂಚೆ ಮೂಲಕ ಮಾತ್ರ)" },
  letterEnglishPortal: { en: "English (portal)", kn: "English (portal)" },
  howToFileVersionHeading: { en: "How to file this version", kn: "ಈ ಆವೃತ್ತಿಯನ್ನು ಸಲ್ಲಿಸುವುದು ಹೇಗೆ" },
  fileKnStep1: {
    en: "Print and sign it, then send it by speed post with acknowledgement due to the PIO.",
    kn: "ಮುದ್ರಿಸಿ ಸಹಿ ಮಾಡಿ, ನಂತರ ಸ್ವೀಕೃತಿ ಸೂಚನೆಯೊಂದಿಗೆ ಸ್ಪೀಡ್ ಪೋಸ್ಟ್ ಮೂಲಕ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿಗೆ ಕಳುಹಿಸಿ.",
  },
  fileKnStep2: {
    en: "Pay the Rs 10 fee by Indian Postal Order or demand draft in favour of the public authority.",
    kn: "ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರದ ಪರವಾಗಿ ಭಾರತೀಯ ಅಂಚೆ ಆದೇಶ ಅಥವಾ ಡಿಮ್ಯಾಂಡ್ ಡ್ರಾಫ್ಟ್ ಮೂಲಕ ರೂ 10 ಶುಲ್ಕ ಪಾವತಿಸಿ.",
  },
  fileKnStep3: {
    en: "Keep the posting receipt — the clock runs from the date of receipt.",
    kn: "ಅಂಚೆ ರಶೀದಿಯನ್ನು ಇರಿಸಿಕೊಳ್ಳಿ — ಸ್ವೀಕೃತಿಯ ದಿನಾಂಕದಿಂದ ಕಾಲಮಿತಿ ಆರಂಭವಾಗುತ್ತದೆ.",
  },
  fileKnStep4: {
    en: "The English version above is the one to use if you would rather file online.",
    kn: "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಸಲ್ಲಿಸಲು ಬಯಸಿದರೆ ಮೇಲಿನ ಇಂಗ್ಲಿಷ್ ಆವೃತ್ತಿಯನ್ನು ಬಳಸಿ.",
  },
  fileEnUsePortalNotice: {
    en: "File this version on the RTI portal. The Kannada version is for postal filing.",
    kn: "ಈ ಆವೃತ್ತಿಯನ್ನು ಮಾಹಿತಿ ಹಕ್ಕು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸಲ್ಲಿಸಿ. ಕನ್ನಡ ಆವೃತ್ತಿ ಅಂಚೆ ಮೂಲಕ ಸಲ್ಲಿಸಲು.",
  },
  postThisVersionNote: {
    en: "Post this version by speed post with acknowledgement due, with the fee by IPO or DD.",
    kn: "ಈ ಆವೃತ್ತಿಯನ್ನು ಸ್ವೀಕೃತಿ ಸೂಚನೆಯೊಂದಿಗೆ ಸ್ಪೀಡ್ ಪೋಸ್ಟ್ ಮೂಲಕ, ಶುಲ್ಕವನ್ನು ಐಪಿಒ ಅಥವಾ ಡಿಡಿ ಮೂಲಕ ಪಾವತಿಸಿ ಕಳುಹಿಸಿ.",
  },
  charactersOfLimit: {
    en: "{count} of {limit} characters (portal limit)",
    kn: "{limit} ಅಕ್ಷರಗಳಲ್ಲಿ {count} (ಪೋರ್ಟಲ್ ಮಿತಿ)",
  },
  overLimitWarning: {
    en: "Over the portal limit - upload the full text as a PDF in the Supporting Document field instead (PDF only, max 5MB).",
    kn: "ಪೋರ್ಟಲ್ ಮಿತಿ ಮೀರಿದೆ - ಬದಲಿಗೆ ಪೂರ್ಣ ಪಠ್ಯವನ್ನು ಪೋಷಕ ದಾಖಲೆ ಕ್ಷೇತ್ರದಲ್ಲಿ ಪಿಡಿಎಫ್ ಆಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಪಿಡಿಎಫ್ ಮಾತ್ರ, ಗರಿಷ್ಠ 5MB).",
  },

  // --- Appeals ---
  sectionNumberFirst: { en: "Section 19(1)", kn: "ಸೆಕ್ಷನ್ 19(1)" },
  sectionNumberSecond: { en: "Section 19(3)", kn: "ಸೆಕ್ಷನ್ 19(3)" },
  groundsLabel: { en: "Grounds", kn: "ಆಧಾರಗಳು" },
  filedOnMiddot: { en: "filed", kn: "ಸಲ್ಲಿಸಿದ್ದು" },
  notFiledYetMiddot: { en: "not filed yet", kn: "ಇನ್ನೂ ಸಲ್ಲಿಸಿಲ್ಲ" },
  faaDecisionDueMiddot: { en: "FAA decision due", kn: "ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರದ ನಿರ್ಣಯ ಬಾಕಿ" },
  noStatutoryDisposalSecond: {
    en: "No statutory disposal deadline for second appeals.",
    kn: "ದ್ವಿತೀಯ ಮೇಲ್ಮನವಿಗಳಿಗೆ ಕಾನೂನುಬದ್ಧ ವಿಲೇವಾರಿ ಕಾಲಮಿತಿ ಇಲ್ಲ.",
  },
  portalGroundToSelectLabel: { en: "Portal ground to select", kn: "ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಆಯ್ಕೆ ಮಾಡಬೇಕಾದ ಆಧಾರ" },
  appealGroundRefused: {
    en: "Access to the requested information was refused",
    kn: "ಕೋರಿದ ಮಾಹಿತಿಗೆ ಪ್ರವೇಶವನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ",
  },
  appealGroundNoResponse: {
    en: "No response received within the time limit",
    kn: "ನಿಗದಿತ ಸಮಯದೊಳಗೆ ಯಾವುದೇ ಪ್ರತಿಕ್ರಿಯೆ ಬಂದಿಲ್ಲ",
  },
  appealGroundExcessFee: {
    en: "Unreasonable amount of fee demanded",
    kn: "ಅಸಮಂಜಸ ಮೊತ್ತದ ಶುಲ್ಕವನ್ನು ಕೇಳಲಾಗಿದೆ",
  },
  appealGroundIncomplete: {
    en: "Incomplete, misleading or false information provided",
    kn: "ಅಪೂರ್ಣ, ದಾರಿತಪ್ಪಿಸುವ ಅಥವಾ ಸುಳ್ಳು ಮಾಹಿತಿ ನೀಡಲಾಗಿದೆ",
  },
  appealGroundOther: { en: "Any other ground", kn: "ಇತರ ಯಾವುದೇ ಆಧಾರ" },
  portalRegNumberOptionalLabel: {
    en: "Portal registration number (optional)",
    kn: "ಪೋರ್ಟಲ್ ನೋಂದಣಿ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)",
  },
  btnMarkAppealFiled: { en: "Mark appeal filed today", kn: "ಮೇಲ್ಮನವಿ ಇಂದು ಸಲ್ಲಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ" },
  toastMarkedFiled: { en: "Marked as filed", kn: "ಸಲ್ಲಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ" },

  // --- Timeline (main) ---
  timelineCreated: { en: "Created", kn: "ರಚಿಸಿದ ದಿನಾಂಕ" },
  checkStatusPortalLink: { en: "Check status on the portal", kn: "ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ" },
  timelineTransferred: { en: "Transferred (Section 6(3))", kn: "ವರ್ಗಾವಣೆಯಾಗಿದೆ (ಸೆಕ್ಷನ್ 6(3))" },
  timelineTransferredTo: { en: "Transferred to", kn: "ಇಲ್ಲಿಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ" },
  timelineNewRegNumber: { en: "New registration number", kn: "ಹೊಸ ನೋಂದಣಿ ಸಂಖ್ಯೆ" },
  replyDueTransfer: { en: "Reply due (transfer + 30 days)", kn: "ಉತ್ತರ ಬಾಕಿ (ವರ್ಗಾವಣೆ + 30 ದಿನಗಳು)" },
  replyDueFiled: { en: "Reply due (filed + 30 days)", kn: "ಉತ್ತರ ಬಾಕಿ (ಸಲ್ಲಿಕೆ + 30 ದಿನಗಳು)" },
  timelineReplyReceived: { en: "Reply received", kn: "ಉತ್ತರ ಸ್ವೀಕರಿಸಲಾಗಿದೆ" },
  filedSuffix: { en: "filed", kn: "ಸಲ್ಲಿಸಲಾಗಿದೆ" },
  draftedValue: { en: "drafted", kn: "ರಚಿಸಲಾಗಿದೆ" },

  // --- Portal picker ---
  sectionPortalSelect: { en: "On the portal, select this", kn: "ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಇದನ್ನು ಆಯ್ಕೆಮಾಡಿ" },
  gbaReorgNotice: {
    en: "Bengaluru was reorganised into the Greater Bengaluru Authority and five city corporations, but the RTI portal still lists the old BBMP zones. Select the zone below, not your GBA corporation.",
    kn: "ಬೆಂಗಳೂರನ್ನು ಗ್ರೇಟರ್ ಬೆಂಗಳೂರು ಪ್ರಾಧಿಕಾರ ಮತ್ತು ಐದು ನಗರ ನಿಗಮಗಳಾಗಿ ಮರುಸಂಘಟಿಸಲಾಗಿದೆ, ಆದರೆ ಮಾಹಿತಿ ಹಕ್ಕು ಪೋರ್ಟಲ್ ಇನ್ನೂ ಹಳೆಯ ಬಿಬಿಎಂಪಿ ವಲಯಗಳನ್ನೇ ಪಟ್ಟಿ ಮಾಡುತ್ತದೆ. ನಿಮ್ಮ ಜಿಬಿಎ ನಿಗಮವಲ್ಲ, ಕೆಳಗಿನ ವಲಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  },
  matchedFromWardZonePrefix: { en: "Matched from your ward's zone", kn: "ನಿಮ್ಮ ವಾರ್ಡ್‌ನ ವಲಯದಿಂದ ಹೊಂದಿಸಲಾಗಿದೆ" },
  confirmLooksRight: { en: "Confirm it looks right.", kn: "ಇದು ಸರಿಯಾಗಿದೆಯೇ ಎಂದು ದೃಢೀಕರಿಸಿ." },
  btnConfirmSave: { en: "Confirm and save", kn: "ದೃಢೀಕರಿಸಿ ಮತ್ತು ಉಳಿಸಿ" },
  selectExactPortalEntry: { en: "Select the exact portal entry…", kn: "ನಿಖರವಾದ ಪೋರ್ಟಲ್ ನಮೂದನ್ನು ಆಯ್ಕೆಮಾಡಿ…" },
  wardZoneNoEquivalentPrefix: { en: "Your ward's GBA zone is", kn: "ನಿಮ್ಮ ವಾರ್ಡ್‌ನ ಜಿಬಿಎ ವಲಯ" },
  wardZoneNoEquivalentSuffix: {
    en: "The portal has no verified equivalent, so pick the closest old BBMP zone yourself.",
    kn: "ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಇದಕ್ಕೆ ಪರಿಶೀಲಿತ ಸಮಾನಾಂತರವಿಲ್ಲ, ಆದ್ದರಿಂದ ಹತ್ತಿರದ ಹಳೆಯ ಬಿಬಿಎಂಪಿ ವಲಯವನ್ನು ನೀವೇ ಆಯ್ಕೆಮಾಡಿ.",
  },
  bwssbSplitWarning: {
    en: "BWSSB is split by function and area on the portal. Picking the wrong unit means a Section 6(3) transfer, which costs at least 5 days and restarts the 30-day clock.",
    kn: "ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಬಿಡಬ್ಲ್ಯುಎಸ್ಎಸ್‌ಬಿ ಕಾರ್ಯ ಮತ್ತು ಪ್ರದೇಶದ ಪ್ರಕಾರ ವಿಭಜಿಸಲಾಗಿದೆ. ತಪ್ಪು ಘಟಕ ಆಯ್ಕೆ ಮಾಡಿದರೆ ಸೆಕ್ಷನ್ 6(3) ವರ್ಗಾವಣೆಯಾಗುತ್ತದೆ, ಇದು ಕನಿಷ್ಠ 5 ದಿನ ವ್ಯರ್ಥ ಮಾಡಿ 30 ದಿನಗಳ ಕಾಲಮಿತಿಯನ್ನು ಮರುಆರಂಭಿಸುತ್ತದೆ.",
  },
  btnSaveSelection: { en: "Save this selection", kn: "ಈ ಆಯ್ಕೆಯನ್ನು ಉಳಿಸಿ" },

  // --- Filing instructions ---
  sectionFilingInstructions: { en: "Filing instructions", kn: "ಸಲ್ಲಿಕೆ ಸೂಚನೆಗಳು" },
  onlineRecommended: { en: "Online (recommended)", kn: "ಆನ್‌ಲೈನ್ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)" },
  onlineFileAtNotice: {
    en: "File at {portal}. No account is needed. The portal takes your email, mobile number and a captcha, then verifies by OTP.",
    kn: "{portal}ನಲ್ಲಿ ಸಲ್ಲಿಸಿ. ಖಾತೆಯ ಅಗತ್ಯವಿಲ್ಲ. ಪೋರ್ಟಲ್ ನಿಮ್ಮ ಇಮೇಲ್, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಕ್ಯಾಪ್ಚಾ ಪಡೆದು ಒಟಿಪಿ ಮೂಲಕ ಪರಿಶೀಲಿಸುತ್ತದೆ.",
  },
  linkFileOnPortal: { en: "File on the Karnataka RTI portal", kn: "ಕರ್ನಾಟಕ ಮಾಹಿತಿ ಹಕ್ಕು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸಲ್ಲಿಸಿ" },
  linkUserManual: { en: "Official user manual (PDF)", kn: "ಅಧಿಕೃತ ಬಳಕೆದಾರ ಕೈಪಿಡಿ (ಪಿಡಿಎಫ್)" },
  paymentModeNetbanking: { en: "Netbanking", kn: "ನೆಟ್‌ಬ್ಯಾಂಕಿಂಗ್" },
  paymentModeCard: { en: "Debit or credit card", kn: "ಡೆಬಿಟ್ ಅಥವಾ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್" },
  paymentModeUpi: { en: "BHIM UPI", kn: "BHIM UPI" },
  paymentModeIpo: {
    en: "Indian Postal Order (IPO) - accepted everywhere, the safest fallback",
    kn: "ಭಾರತೀಯ ಅಂಚೆ ಆದೇಶ (ಐಪಿಒ) - ಎಲ್ಲೆಡೆ ಸ್ವೀಕೃತ, ಅತ್ಯಂತ ಸುರಕ್ಷಿತ ಪರ್ಯಾಯ",
  },
  paymentModeDd: { en: "Demand Draft", kn: "ಡಿಮ್ಯಾಂಡ್ ಡ್ರಾಫ್ಟ್" },
  paymentModeStamp: {
    en: "Court-fee stamp - valid in Karnataka, never for central-government RTIs",
    kn: "ನ್ಯಾಯಾಲಯ ಶುಲ್ಕ ಮುದ್ರಾಂಕ - ಕರ್ನಾಟಕದಲ್ಲಿ ಮಾನ್ಯ, ಕೇಂದ್ರ ಸರ್ಕಾರದ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿಗಳಿಗೆ ಎಂದಿಗೂ ಅಲ್ಲ",
  },
  legalOnlinePaymentNote: {
    en: "Paid through the Government of Karnataka Khajane-II gateway, via ICICI e-Pay or SBI e-Pay as the aggregator.",
    kn: "ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಖಜಾನೆ-II ಗೇಟ್‌ವೇ ಮೂಲಕ, ICICI e-Pay ಅಥವಾ SBI e-Pay ಅಗ್ರಿಗೇಟರ್ ಆಗಿ ಪಾವತಿಸಲಾಗುತ್ತದೆ.",
  },
  byPostHeading: { en: "By post", kn: "ಅಂಚೆ ಮೂಲಕ" },
  postalSendNotice: {
    en: "Send by speed post with acknowledgement due, and keep the receipt - it is your proof of the filing date.",
    kn: "ಸ್ವೀಕೃತಿ ಸೂಚನೆಯೊಂದಿಗೆ ಸ್ಪೀಡ್ ಪೋಸ್ಟ್ ಮೂಲಕ ಕಳುಹಿಸಿ, ಮತ್ತು ರಶೀದಿಯನ್ನು ಇರಿಸಿಕೊಳ್ಳಿ - ಇದು ಸಲ್ಲಿಕೆ ದಿನಾಂಕದ ನಿಮ್ಮ ಪುರಾವೆ.",
  },
  legalFee: {
    en: "Rs. 10 application fee (Karnataka). BPL applicants are exempt on producing a copy of the BPL card.",
    kn: "ರೂ. 10 ಅರ್ಜಿ ಶುಲ್ಕ (ಕರ್ನಾಟಕ). ಬಿಪಿಎಲ್ ಕಾರ್ಡಿನ ಪ್ರತಿ ನೀಡಿದರೆ ಬಿಪಿಎಲ್ ಅರ್ಜಿದಾರರಿಗೆ ವಿನಾಯಿತಿ.",
  },
  bplApplicantsNotice: {
    en: "BPL applicants pay nothing. The portal validates the BPL card number directly; if you do not have a BPL card, an income certificate can be uploaded instead.",
    kn: "ಬಿಪಿಎಲ್ ಅರ್ಜಿದಾರರು ಏನೂ ಪಾವತಿಸಬೇಕಿಲ್ಲ. ಪೋರ್ಟಲ್ ಬಿಪಿಎಲ್ ಕಾರ್ಡ್ ಸಂಖ್ಯೆಯನ್ನು ನೇರವಾಗಿ ಪರಿಶೀಲಿಸುತ್ತದೆ; ಬಿಪಿಎಲ್ ಕಾರ್ಡ್ ಇಲ್ಲದಿದ್ದರೆ ಆದಾಯ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಬದಲಿಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು.",
  },
  legalCopyCharges: { en: "Rs. 2 per A4 page for copies of records.", kn: "ದಾಖಲೆಗಳ ಪ್ರತಿಗಳಿಗೆ ಪ್ರತಿ A4 ಪುಟಕ್ಕೆ ರೂ. 2." },
  supportingDocsNotice: {
    en: "Supporting documents must be a single PDF, maximum 5MB, with a filename containing only letters, numbers, dots, underscores and hyphens.",
    kn: "ಪೋಷಕ ದಾಖಲೆಗಳು ಒಂದೇ ಪಿಡಿಎಫ್ ಆಗಿರಬೇಕು, ಗರಿಷ್ಠ 5MB, ಮತ್ತು ಫೈಲ್ ಹೆಸರಿನಲ್ಲಿ ಅಕ್ಷರಗಳು, ಸಂಖ್ಯೆಗಳು, ಚುಕ್ಕೆಗಳು, ಅಂಡರ್‌ಸ್ಕೋರ್ ಮತ್ತು ಹೈಫನ್ ಮಾತ್ರ ಇರಬೇಕು.",
  },
  legalPortalCaveat: {
    en: "The Karnataka portal covers Karnataka state public authorities only. Do not use it for central bodies.",
    kn: "ಕರ್ನಾಟಕ ಪೋರ್ಟಲ್ ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರಗಳಿಗೆ ಮಾತ್ರ ಅನ್ವಯಿಸುತ್ತದೆ. ಕೇಂದ್ರ ಸಂಸ್ಥೆಗಳಿಗೆ ಇದನ್ನು ಬಳಸಬೇಡಿ.",
  },
  additionalFeeNotice: {
    en: "The PIO may demand an additional fee; that is paid through a link on the status page.",
    kn: "ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ಕೇಳಬಹುದು; ಅದನ್ನು ಸ್ಥಿತಿ ಪುಟದಲ್ಲಿನ ಲಿಂಕ್ ಮೂಲಕ ಪಾವತಿಸಬಹುದು.",
  },
  pioReplyWithinNotice: {
    en: "The PIO must reply within {days} days ({hours} hours where life or liberty is concerned).",
    kn: "ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ {days} ದಿನಗಳೊಳಗೆ ಉತ್ತರಿಸಬೇಕು (ಜೀವ ಅಥವಾ ಸ್ವಾತಂತ್ರ್ಯ ಸಂಬಂಧಿಸಿದ್ದರೆ {hours} ಗಂಟೆಗಳೊಳಗೆ).",
  },
  legalCalendarDays: {
    en: "All periods are calendar days, including weekends and public holidays.",
    kn: "ಎಲ್ಲಾ ಅವಧಿಗಳು ವಾರಾಂತ್ಯ ಮತ್ತು ಸಾರ್ವಜನಿಕ ರಜಾ ದಿನಗಳನ್ನು ಒಳಗೊಂಡಂತೆ ಕ್ಯಾಲೆಂಡರ್ ದಿನಗಳಾಗಿವೆ.",
  },
  legalSection62: {
    en: "Section 6(2): you cannot be asked to give a reason for wanting the information. Never state one.",
    kn: "ಸೆಕ್ಷನ್ 6(2): ಮಾಹಿತಿ ಬಯಸಲು ಕಾರಣ ಕೇಳುವಂತಿಲ್ಲ. ಎಂದಿಗೂ ಕಾರಣ ನೀಡಬೇಡಿ.",
  },
  legalRule14: {
    en: "Karnataka Rule 14: one subject matter per application, and ordinarily no more than 150 words. Multiple subjects mean the PIO may answer only the first.",
    kn: "ಕರ್ನಾಟಕ ನಿಯಮ 14: ಪ್ರತಿ ಅರ್ಜಿಗೆ ಒಂದೇ ವಿಷಯ, ಸಾಮಾನ್ಯವಾಗಿ 150 ಪದಗಳಿಗಿಂತ ಹೆಚ್ಚಿಲ್ಲ. ಹಲವು ವಿಷಯಗಳಿದ್ದರೆ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಮೊದಲನೆಯದಕ್ಕೆ ಮಾತ್ರ ಉತ್ತರಿಸಬಹುದು.",
  },
  splitAdvisory: {
    en: "If your application was forwarded to more than one PIO, the portal splits it into sub-numbers (e.g. .../60104/1). Each sub-number gets its own reply. File your appeal against the specific sub-number you are dissatisfied with, not the parent number.",
    kn: "ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿಗಳಿಗೆ ಕಳುಹಿಸಿದ್ದರೆ, ಪೋರ್ಟಲ್ ಅದನ್ನು ಉಪ-ಸಂಖ್ಯೆಗಳಾಗಿ ವಿಭಜಿಸುತ್ತದೆ (ಉದಾ. .../60104/1). ಪ್ರತಿ ಉಪ-ಸಂಖ್ಯೆಗೆ ಪ್ರತ್ಯೇಕ ಉತ್ತರ ಬರುತ್ತದೆ. ಮೂಲ ಸಂಖ್ಯೆಯಲ್ಲ, ನಿಮಗೆ ತೃಪ್ತಿಯಾಗದ ನಿರ್ದಿಷ್ಟ ಉಪ-ಸಂಖ್ಯೆಯ ವಿರುದ್ಧ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿ.",
  },
  dateFiledLabel: { en: "Date you filed it", kn: "ನೀವು ಸಲ್ಲಿಸಿದ ದಿನಾಂಕ" },
  btnMarkFiled: { en: "Mark as filed", kn: "ಸಲ್ಲಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ" },

  // --- Transfer panel ---
  sectionTransferred: { en: "Was it transferred?", kn: "ಇದನ್ನು ವರ್ಗಾಯಿಸಲಾಗಿದೆಯೇ?" },
  section63Notice: {
    en: "Under Section 6(3) a misdirected application must be transferred within 5 days, and the 30-day clock runs afresh from the new authority's receipt. The portal issues a new registration number on transfer.",
    kn: "ಸೆಕ್ಷನ್ 6(3) ಅಡಿಯಲ್ಲಿ ತಪ್ಪಾಗಿ ಸಲ್ಲಿಸಲಾದ ಅರ್ಜಿಯನ್ನು 5 ದಿನಗಳೊಳಗೆ ವರ್ಗಾಯಿಸಬೇಕು, ಮತ್ತು ಹೊಸ ಪ್ರಾಧಿಕಾರದ ಸ್ವೀಕೃತಿಯಿಂದ 30 ದಿನಗಳ ಕಾಲಮಿತಿ ಹೊಸದಾಗಿ ಆರಂಭವಾಗುತ್ತದೆ. ವರ್ಗಾವಣೆಯ ಸಮಯದಲ್ಲಿ ಪೋರ್ಟಲ್ ಹೊಸ ನೋಂದಣಿ ಸಂಖ್ಯೆಯನ್ನು ನೀಡುತ್ತದೆ.",
  },
  transferDateLabel: { en: "Transfer date", kn: "ವರ್ಗಾವಣೆ ದಿನಾಂಕ" },
  transferredToLabel: { en: "Transferred to", kn: "ಇಲ್ಲಿಗೆ ವರ್ಗಾಯಿಸಲಾಗಿದೆ" },
  placeholderNewAuthority: { en: "Name of the new public authority", kn: "ಹೊಸ ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರದ ಹೆಸರು" },
  newRegNumberOptionalLabel: {
    en: "New registration number (optional)",
    kn: "ಹೊಸ ನೋಂದಣಿ ಸಂಖ್ಯೆ (ಐಚ್ಛಿಕ)",
  },
  btnSaveTransfer: { en: "Save transfer and reset the clock", kn: "ವರ್ಗಾವಣೆ ಉಳಿಸಿ ಮತ್ತು ಕಾಲಮಿತಿ ಮರುಹೊಂದಿಸಿ" },

  // --- Reply ---
  sectionRecordReply: { en: "Record the reply", kn: "ಉತ್ತರವನ್ನು ದಾಖಲಿಸಿ" },
  placeholderReplyNotes: {
    en: "What did they send? What is missing?",
    kn: "ಅವರು ಏನು ಕಳುಹಿಸಿದರು? ಏನು ಕಾಣೆಯಾಗಿದೆ?",
  },
  btnSaveReply: { en: "Save reply", kn: "ಉತ್ತರ ಉಳಿಸಿ" },

  // --- Deemed refusal / first appeal ---
  sectionDeemedRefusal: { en: "Deemed refusal — Section 7(2)", kn: "ಭಾವಿತ ನಿರಾಕರಣೆ — ಸೆಕ್ಷನ್ 7(2)" },
  deemedRefusalNotice: {
    en: "No reply within {days} days is a deemed refusal. You have {window} days from the due date to file a first appeal with the First Appellate Authority of the same public authority.",
    kn: "{days} ದಿನಗಳೊಳಗೆ ಉತ್ತರ ಬಾರದಿದ್ದರೆ ಅದು ಭಾವಿತ ನಿರಾಕರಣೆ. ಅದೇ ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರದ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರಕ್ಕೆ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಲು ಬಾಕಿ ದಿನಾಂಕದಿಂದ {window} ದಿನಗಳ ಕಾಲಾವಕಾಶವಿದೆ.",
  },
  btnDraftFirstAppeal: { en: "Draft first appeal", kn: "ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ರಚಿಸಿ" },
  linkFileFirstAppeal: { en: "File the first appeal on the portal", kn: "ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿ" },
  sectionReplyIncomplete: { en: "Reply incomplete or refused?", kn: "ಉತ್ತರ ಅಪೂರ್ಣವೇ ಅಥವಾ ನಿರಾಕರಿಸಲಾಗಿದೆಯೇ?" },
  firstAppealMustFileNotice: {
    en: "A first appeal must be filed within {window} days of the reply.",
    kn: "ಉತ್ತರ ಬಂದ {window} ದಿನಗಳೊಳಗೆ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಬೇಕು.",
  },
  incompleteReplyDefault: {
    en: "Several points were not answered and no exemption was cited, contrary to Section 7(8).",
    kn: "ಸೆಕ್ಷನ್ 7(8)ಕ್ಕೆ ವಿರುದ್ಧವಾಗಿ, ಹಲವು ಅಂಶಗಳಿಗೆ ಉತ್ತರಿಸಿಲ್ಲ ಮತ್ತು ಯಾವುದೇ ವಿನಾಯಿತಿಯನ್ನು ಉಲ್ಲೇಖಿಸಿಲ್ಲ.",
  },
  incompleteReplyPrefix: { en: "Incomplete reply.", kn: "ಅಪೂರ್ಣ ಉತ್ತರ." },
  refusalDefault: { en: "The PIO refused the information.", kn: "ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಮಾಹಿತಿಯನ್ನು ನಿರಾಕರಿಸಿದರು." },
  refusalPrefix: { en: "Refusal of information.", kn: "ಮಾಹಿತಿ ನಿರಾಕರಣೆ." },
  excessFeeDefault: {
    en: "The PIO demanded an excessive additional fee.",
    kn: "ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಅತಿಯಾದ ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ ಕೇಳಿದರು.",
  },
  excessFeePrefix: { en: "Unreasonable fee demanded.", kn: "ಅಸಮಂಜಸ ಶುಲ್ಕ ಕೇಳಲಾಗಿದೆ." },
  btnDraftIncomplete: { en: "Draft first appeal — incomplete reply", kn: "ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ರಚಿಸಿ — ಅಪೂರ್ಣ ಉತ್ತರ" },
  btnDraftRefusal: { en: "Draft first appeal — refusal", kn: "ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ರಚಿಸಿ — ನಿರಾಕರಣೆ" },
  btnDraftExcessFee: {
    en: "Draft first appeal — unreasonable fee",
    kn: "ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ರಚಿಸಿ — ಅಸಮಂಜಸ ಶುಲ್ಕ",
  },

  // --- Second appeal ---
  sectionSecondAppealHeading: { en: "Second appeal — Section 19(3)", kn: "ದ್ವಿತೀಯ ಮೇಲ್ಮನವಿ — ಸೆಕ್ಷನ್ 19(3)" },
  secondAppealNotice: {
    en: "The First Appellate Authority must decide within {decisionDays} days, extendable to {maxDays} with recorded reasons. A second appeal lies to the {ksic}, within {windowDays} days, and may be filed once {afterDays} days have elapsed with no decision.",
    kn: "ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರವು {decisionDays} ದಿನಗಳೊಳಗೆ ನಿರ್ಣಯಿಸಬೇಕು, ದಾಖಲಿತ ಕಾರಣಗಳೊಂದಿಗೆ {maxDays} ದಿನಗಳವರೆಗೆ ವಿಸ್ತರಿಸಬಹುದು. {ksic}ಗೆ {windowDays} ದಿನಗಳೊಳಗೆ ದ್ವಿತೀಯ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಬಹುದು, ಮತ್ತು ನಿರ್ಣಯವಿಲ್ಲದೆ {afterDays} ದಿನಗಳು ಕಳೆದ ನಂತರ ಸಲ್ಲಿಸಬಹುದು.",
  },
  daysSinceFirstAppeal: {
    en: "{n} days since the first appeal was filed.",
    kn: "ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿ {n} ದಿನಗಳಾಗಿವೆ.",
  },
  secondAppealDraftedLabel: { en: "Second appeal drafted", kn: "ದ್ವಿತೀಯ ಮೇಲ್ಮನವಿ ರಚಿಸಲಾಗಿದೆ" },
  btnDraftSecondAppeal: { en: "Draft second appeal", kn: "ದ್ವಿತೀಯ ಮೇಲ್ಮನವಿ ರಚಿಸಿ" },
  availableAfterDays: { en: "Available after {n} days", kn: "{n} ದಿನಗಳ ನಂತರ ಲಭ್ಯ" },

  // --- Missed window ---
  sectionMissedWindow: { en: "If you have missed a window", kn: "ಗಡುವು ಮೀರಿದ್ದರೆ" },
  legalSection18: {
    en: "A Section 18 complaint to the Information Commission has no time limit — use it if you have missed an appeal window.",
    kn: "ಮಾಹಿತಿ ಆಯೋಗಕ್ಕೆ ಸೆಕ್ಷನ್ 18 ದೂರಿಗೆ ಯಾವುದೇ ಕಾಲಮಿತಿ ಇಲ್ಲ — ಮೇಲ್ಮನವಿಯ ಗಡುವು ಮೀರಿದ್ದರೆ ಇದನ್ನು ಬಳಸಿ.",
  },
  legalKsicAddress: {
    en: "Karnataka State Information Commission, Room No. 305, 3rd Floor, M S Building, Bengaluru 560001",
    kn: "Karnataka State Information Commission, Room No. 305, 3rd Floor, M S Building, Bengaluru 560001",
  },

  // --- Officials ---
  whoIsResponsibleNotice: {
    en: "This is who is responsible. Call them and quote your complaint number.",
    kn: "ಇವರೇ ಜವಾಬ್ದಾರರು. ಅವರಿಗೆ ಕರೆ ಮಾಡಿ ನಿಮ್ಮ ದೂರಿನ ಸಂಖ್ಯೆಯನ್ನು ತಿಳಿಸಿ.",
  },
  oldBbmpWardPrefix: { en: "was", kn: "ಇದು" },
  oldBbmpWardSuffix: { en: "ward under BBMP (pre-2025).", kn: "ಎಂಬ ಬಿಬಿಎಂಪಿ ವಾರ್ಡ್ ಆಗಿತ್ತು (2025ಕ್ಕೂ ಮೊದಲು)." },

  // --- Next action card ---
  nextActionLabel: { en: "Next action", kn: "ಮುಂದಿನ ಕ್ರಮ" },
  naInconsistentTitle: {
    en: "This record does not add up. Check the dates before acting on it.",
    kn: "ಈ ದಾಖಲೆ ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ. ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ದಿನಾಂಕಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
  },
  naFileTitle: { en: "File this and tell us the date.", kn: "ಇದನ್ನು ಸಲ್ಲಿಸಿ ಮತ್ತು ದಿನಾಂಕವನ್ನು ತಿಳಿಸಿ." },
  naSendComplaintTitle: {
    en: "Send this complaint and tell us the date.",
    kn: "ಈ ದೂರನ್ನು ಕಳುಹಿಸಿ ಮತ್ತು ದಿನಾಂಕವನ್ನು ತಿಳಿಸಿ.",
  },
  naNothingToDo: { en: "Nothing to do yet.", kn: "ಸದ್ಯಕ್ಕೆ ಏನೂ ಮಾಡಬೇಕಿಲ್ಲ." },
  naTheyHaveUntil: { en: "They have until {date}.", kn: "ಅವರಿಗೆ {date} ವರೆಗೆ ಕಾಲಾವಕಾಶವಿದೆ." },
  naOverdueTitle: {
    en: "They have missed the deadline. Draft your first appeal.",
    kn: "ಅವರು ಕಾಲಮಿತಿಯನ್ನು ಮೀರಿದ್ದಾರೆ. ನಿಮ್ಮ ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ರಚಿಸಿ.",
  },
  naFalseClosureTitle: {
    en: "They closed this without doing the work. Turn it into an RTI.",
    kn: "ಕೆಲಸ ಮಾಡದೆಯೇ ಇದನ್ನು ಮುಚ್ಚಿದ್ದಾರೆ. ಇದನ್ನು ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿಯಾಗಿ ಪರಿವರ್ತಿಸಿ.",
  },
  naSecondTitle: { en: "Second appeal is now available.", kn: "ಈಗ ದ್ವಿತೀಯ ಮೇಲ್ಮನವಿ ಲಭ್ಯವಿದೆ." },
  naRecordReplyTitle: { en: "Record what they sent.", kn: "ಅವರು ಕಳುಹಿಸಿದ್ದನ್ನು ದಾಖಲಿಸಿ." },
  naReplyCheckTitle: {
    en: "They replied. If the reply is incomplete or refused, appeal it.",
    kn: "ಅವರು ಉತ್ತರಿಸಿದ್ದಾರೆ. ಉತ್ತರ ಅಪೂರ್ಣವಾಗಿದ್ದರೆ ಅಥವಾ ನಿರಾಕರಿಸಿದ್ದರೆ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಿ.",
  },
  naDoneTitle: { en: "This is finished. Nothing further is needed.", kn: "ಇದು ಮುಗಿದಿದೆ. ಇನ್ನೇನೂ ಬೇಕಿಲ್ಲ." },
  btnRecordFalseClosure: {
    en: "Record the closure and draft the RTI",
    kn: "ಮುಚ್ಚುಗಡೆಯನ್ನು ದಾಖಲಿಸಿ ಮತ್ತು ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ ರಚಿಸಿ",
  },

  // --- Collapsed reference sections ---
  sectionWhereToSend: { en: "Where to send it", kn: "ಎಲ್ಲಿಗೆ ಕಳುಹಿಸಬೇಕು" },
  sectionOnPortal: { en: "On the RTI portal", kn: "ಮಾಹಿತಿ ಹಕ್ಕು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ" },
  sectionFeeRules: { en: "Fee and filing rules", kn: "ಶುಲ್ಕ ಮತ್ತು ಸಲ್ಲಿಕೆ ನಿಯಮಗಳು" },
  sectionWasItTransferred: { en: "Was it transferred?", kn: "ಇದು ವರ್ಗಾವಣೆಯಾಗಿದೆಯೇ?" },
  summaryOfficialsOne: { en: "1 official", kn: "1 ಅಧಿಕಾರಿ" },
  summaryOfficialsMany: { en: "{n} officials", kn: "{n} ಅಧಿಕಾರಿಗಳು" },
  summaryNoOfficials: { en: "No officials mapped for this ward", kn: "ಈ ವಾರ್ಡ್‌ಗೆ ಅಧಿಕಾರಿಗಳ ಮಾಹಿತಿ ಇಲ್ಲ" },
  summaryLoading: { en: "Loading…", kn: "ಲೋಡ್ ಆಗುತ್ತಿದೆ…" },
  summaryNoVerifiedMapping: { en: "No verified mapping", kn: "ಪರಿಶೀಲಿತ ಹೊಂದಾಣಿಕೆ ಇಲ್ಲ" },
  summaryNotRecorded: { en: "Not recorded", kn: "ದಾಖಲಾಗಿಲ್ಲ" },
  summaryNotFiledYet: { en: "Not filed yet", kn: "ಇನ್ನೂ ಸಲ್ಲಿಸಿಲ್ಲ" },
  summaryNotSentYet: { en: "Not sent yet", kn: "ಇನ್ನೂ ಕಳುಹಿಸಿಲ್ಲ" },
  summaryFiledDay: { en: "Filed {date} · day {n}", kn: "{date} ರಂದು ಸಲ್ಲಿಸಲಾಗಿದೆ · {n}ನೇ ದಿನ" },
  summarySentDay: { en: "Sent {date} · day {n}", kn: "{date} ರಂದು ಕಳುಹಿಸಲಾಗಿದೆ · {n}ನೇ ದಿನ" },
  summaryFeeRules: {
    en: "Rs. 10, BPL exemption, PDF and character limits",
    kn: "ರೂ. 10, ಬಿಪಿಎಲ್ ವಿನಾಯಿತಿ, ಪಿಡಿಎಫ್ ಮತ್ತು ಅಕ್ಷರ ಮಿತಿಗಳು",
  },
  summaryTransferNotRecorded: {
    en: "No transfer recorded under Section 6(3)",
    kn: "ಸೆಕ್ಷನ್ 6(3) ಅಡಿಯಲ್ಲಿ ಯಾವುದೇ ವರ್ಗಾವಣೆ ದಾಖಲಾಗಿಲ್ಲ",
  },
  summaryOnlineOrPost: { en: "RTI portal, or by post", kn: "ಮಾಹಿತಿ ಹಕ್ಕು ಪೋರ್ಟಲ್, ಅಥವಾ ಅಂಚೆ ಮೂಲಕ" },
} as const;
