/**
 * New-filing wizard: entry choice, grievance capture, authority/ward picker,
 * drafting panels, pre-flight checks and the revise box.
 */
export const DICT_WIZARD = {
  wizardTitleComplaint: { en: "New civic complaint", kn: "ಹೊಸ ಸಾರ್ವಜನಿಕ ದೂರು" },
  wizardTitleRti: { en: "New RTI application", kn: "ಹೊಸ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿ" },

  stepWhatWentWrong: { en: "What went wrong", kn: "ಏನಾಗಿದೆ" },
  stepWhereToSend: { en: "Where to send it", kn: "ಎಲ್ಲಿಗೆ ಕಳುಹಿಸಬೇಕು" },
  stepYourComplaint: { en: "Your complaint", kn: "ನಿಮ್ಮ ದೂರು" },
  stepGrievance: { en: "Grievance", kn: "ದೂರು" },
  stepAuthority: { en: "Authority", kn: "ಪ್ರಾಧಿಕಾರ" },
  stepRequests: { en: "Requests", kn: "ಕೋರಿಕೆಗಳು" },
  stepFileIt: { en: "File it", kn: "ಸಲ್ಲಿಸಿ" },

  step1HaveYouReported: {
    en: "Step 1 · Have you reported this already?",
    kn: "ಹಂತ 1 · ನೀವು ಈಗಾಗಲೇ ಇದನ್ನು ವರದಿ ಮಾಡಿದ್ದೀರಾ?",
  },
  haventReportedYet: { en: "I haven't reported this yet", kn: "ನಾನು ಇನ್ನೂ ಇದನ್ನು ವರದಿ ಮಾಡಿಲ್ಲ" },
  haventReportedYetHelp: {
    en: "Start with a civic complaint. It is faster, free, and it creates the paper trail an RTI can later test.",
    kn: "ಸಾರ್ವಜನಿಕ ದೂರಿನಿಂದ ಪ್ರಾರಂಭಿಸಿ. ಇದು ವೇಗವಾಗಿ, ಉಚಿತವಾಗಿ ಇರುತ್ತದೆ, ಮತ್ತು ಇದು ಮಾಹಿತಿ ಹಕ್ಕು ನಂತರ ಪರೀಕ್ಷಿಸಬಹುದಾದ ದಾಖಲೆಯ ಜಾಡು ಸೃಷ್ಟಿಸುತ್ತದೆ.",
  },
  alreadyReported: { en: "I already reported it", kn: "ನಾನು ಈಗಾಗಲೇ ಇದನ್ನು ವರದಿ ಮಾಡಿದ್ದೇನೆ" },
  alreadyReportedHelp: {
    en: "Go straight to an RTI application for the records behind what happened next.",
    kn: "ನಂತರ ಏನಾಯಿತು ಎಂಬುದರ ಹಿಂದಿನ ದಾಖಲೆಗಳಿಗಾಗಿ ನೇರವಾಗಿ ಮಾಹಿತಿ ಹಕ್ಕು ಅರ್ಜಿಗೆ ಹೋಗಿ.",
  },
  whatHappened: { en: "What happened?", kn: "ಏನಾಯಿತು?" },
  priorNoResponse: { en: "No response yet", kn: "ಇನ್ನೂ ಪ್ರತಿಕ್ರಿಯೆ ಬಂದಿಲ್ಲ" },
  priorFalseClosure: {
    en: "They say it's fixed, but it isn't",
    kn: "ಸರಿಪಡಿಸಲಾಗಿದೆ ಎಂದು ಅವರು ಹೇಳುತ್ತಾರೆ, ಆದರೆ ಅದು ಸರಿಯಾಗಿಲ್ಲ",
  },
  priorRefused: {
    en: "They refused or gave a partial answer",
    kn: "ಅವರು ನಿರಾಕರಿಸಿದ್ದಾರೆ ಅಥವಾ ಭಾಗಶಃ ಉತ್ತರ ನೀಡಿದ್ದಾರೆ",
  },
  complaintRefLabel: { en: "Complaint reference (if any)", kn: "ದೂರಿನ ಸಂಖ್ಯೆ (ಇದ್ದರೆ)" },
  dateReportedLabel: { en: "Date you reported it", kn: "ನೀವು ವರದಿ ಮಾಡಿದ ದಿನಾಂಕ" },
  dateMarkedResolvedLabel: { en: "Date they marked it resolved", kn: "ಪರಿಹರಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿದ ದಿನಾಂಕ" },
  whatIsStillWrongLabel: {
    en: "What is still wrong on the ground?",
    kn: "ವಾಸ್ತವದಲ್ಲಿ ಇನ್ನೂ ಏನು ಸರಿಯಿಲ್ಲ?",
  },
  falseClosureRecordsNote: {
    en: "We will ask for the action-taken report, work order, completion certificate, closure photograph and the expenditure booked — records that cannot exist if the work was never done.",
    kn: "ನಾವು ಕೈಗೊಂಡ ಕ್ರಮದ ವರದಿ, ಕಾರ್ಯಾದೇಶ, ಪೂರ್ಣಗೊಂಡ ಪ್ರಮಾಣಪತ್ರ, ಮುಚ್ಚುವಿಕೆಯ ಛಾಯಾಚಿತ್ರ ಮತ್ತು ದಾಖಲಾದ ವೆಚ್ಚವನ್ನು ಕೇಳುತ್ತೇವೆ — ಕೆಲಸ ಎಂದೂ ನಡೆಯದಿದ್ದರೆ ಇರಲಾಗದ ದಾಖಲೆಗಳು.",
  },

  whatWentWrongLabel: { en: "What went wrong?", kn: "ಏನಾಗಿದೆ?" },
  whatWentWrongHelp: {
    en: "Write it plainly, in English or Kannada. Do not try to sound legal — that is our job.",
    kn: "ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಸರಳವಾಗಿ ಬರೆಯಿರಿ. ಕಾನೂನಿನಂತೆ ಧ್ವನಿಸಲು ಪ್ರಯತ್ನಿಸಬೇಡಿ — ಅದು ನಮ್ಮ ಕೆಲಸ.",
  },
  grievancePlaceholder: {
    en: "e.g. The storm water drain on our lane has been blocked since last monsoon and floods the road every time it rains…",
    kn: "ಉದಾ. ನಮ್ಮ ಗಲ್ಲಿಯ ಮಳೆನೀರು ಚರಂಡಿ ಕಳೆದ ಮಳೆಗಾಲದಿಂದ ಬ್ಲಾಕ್ ಆಗಿದ್ದು, ಮಳೆ ಬಂದಾಗಲೆಲ್ಲಾ ರಸ್ತೆ ಮುಳುಗುತ್ತದೆ…",
  },
  languageLabel: { en: "Language", kn: "ಭಾಷೆ" },
  applicationLanguageLabel: { en: "Language of the application", kn: "ಅರ್ಜಿಯ ಭಾಷೆ" },
  applicationLanguageHelp: {
    en: "This sets the language of the letter that gets filed, not the language of this site. Change the site language with the toggle in the header.",
    kn: "ಇದು ಸಲ್ಲಿಸಲಾಗುವ ಪತ್ರದ ಭಾಷೆಯನ್ನು ನಿರ್ಧರಿಸುತ್ತದೆ, ಈ ತಾಣದ ಭಾಷೆಯನ್ನಲ್ಲ. ತಾಣದ ಭಾಷೆಯನ್ನು ಶಿರೋಭಾಗದ ಟಾಗಲ್‌ನಿಂದ ಬದಲಾಯಿಸಿ.",
  },
  continueButton: { en: "Continue", kn: "ಮುಂದುವರಿಸಿ" },

  step2WhoseProblem: { en: "Step 2 · Whose problem is this?", kn: "ಹಂತ 2 · ಇದು ಯಾರ ಜವಾಬ್ದಾರಿ?" },
  step2WhoHoldsRecords: { en: "Step 2 · Who holds the records?", kn: "ಹಂತ 2 · ದಾಖಲೆಗಳನ್ನು ಯಾರು ಹೊಂದಿದ್ದಾರೆ?" },
  otherAuthorityPlaceholder: { en: "Name of the public authority", kn: "ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರದ ಹೆಸರು" },
  pioNameAddressOptional: {
    en: "PIO name and address (optional — details change often)",
    kn: "ಮಾಹಿತಿ ಅಧಿಕಾರಿಯ ಹೆಸರು ಮತ್ತು ವಿಳಾಸ (ಐಚ್ಛಿಕ — ವಿವರಗಳು ಆಗಾಗ ಬದಲಾಗುತ್ತವೆ)",
  },
  pioNamePlaceholder: { en: "PIO name / designation", kn: "ಮಾಹಿತಿ ಅಧಿಕಾರಿಯ ಹೆಸರು / ಹುದ್ದೆ" },
  pioAddressPlaceholder: { en: "PIO office address", kn: "ಮಾಹಿತಿ ಅಧಿಕಾರಿಯ ಕಚೇರಿ ವಿಳಾಸ" },
  wardOptionalLabel: { en: "Ward (optional)", kn: "ವಾರ್ಡ್ (ಐಚ್ಛಿಕ)" },
  wardSearchPlaceholder: {
    en: "Search ward, zone or corporation…",
    kn: "ವಾರ್ಡ್, ವಲಯ ಅಥವಾ ನಿಗಮ ಹುಡುಕಿ…",
  },
  hideTheMap: { en: "Hide the map", kn: "ನಕ್ಷೆಯನ್ನು ಮರೆಮಾಡಿ" },
  findItOnMap: { en: "Find it on the map", kn: "ನಕ್ಷೆಯಲ್ಲಿ ಹುಡುಕಿ" },
  zoneWord: { en: "zone", kn: "ವಲಯ" },

  draftMyComplaint: { en: "Draft my complaint", kn: "ನನ್ನ ದೂರನ್ನು ರಚಿಸಿ" },
  draftMyRequests: { en: "Draft my requests", kn: "ನನ್ನ ಕೋರಿಕೆಗಳನ್ನು ರಚಿಸಿ" },
  drafting: { en: "Drafting…", kn: "ರಚಿಸಲಾಗುತ್ತಿದೆ…" },

  whereYouAre: { en: "Where you are", kn: "ನೀವು ಎಲ್ಲಿದ್ದೀರಿ" },
  step3YourComplaint: { en: "Step 3 · Your complaint", kn: "ಹಂತ 3 · ನಿಮ್ಮ ದೂರು" },
  asksForCheckableAction: { en: "asks for one checkable action", kn: "ಪರಿಶೀಲಿಸಬಹುದಾದ ಒಂದು ಕ್ರಮವನ್ನು ಕೇಳುತ್ತದೆ" },
  complaintCopied: { en: "Complaint copied", kn: "ದೂರು ನಕಲಿಸಲಾಗಿದೆ" },

  whereToSendIt: { en: "Where to send it", kn: "ಎಲ್ಲಿಗೆ ಕಳುಹಿಸಬೇಕು" },
  whereToSendItHelp: {
    en: "A starting point — confirm the channel before you send, and tell us where it actually went.",
    kn: "ಇದೊಂದು ಪ್ರಾರಂಭಿಕ ಬಿಂದು — ಕಳುಹಿಸುವ ಮೊದಲು ಮಾರ್ಗವನ್ನು ಖಚಿತಪಡಿಸಿ, ಮತ್ತು ಅದು ನಿಜವಾಗಿ ಎಲ್ಲಿಗೆ ಹೋಯಿತು ಎಂದು ನಮಗೆ ತಿಳಿಸಿ.",
  },
  markAsFiled: { en: "Mark as filed", kn: "ಸಲ್ಲಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ" },
  complaintNoDeadlineNote: {
    en: "Complaints have no statutory deadline. We track {days} days as a service expectation only.",
    kn: "ದೂರುಗಳಿಗೆ ಯಾವುದೇ ಶಾಸನಬದ್ಧ ಗಡುವು ಇಲ್ಲ. ನಾವು {days} ದಿನಗಳನ್ನು ಸೇವಾ ನಿರೀಕ್ಷೆಯಾಗಿ ಮಾತ್ರ ಟ್ರ್ಯಾಕ್ ಮಾಡುತ್ತೇವೆ.",
  },
  complaintRefNumberLabel: { en: "Complaint reference number", kn: "ದೂರಿನ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ" },
  dateSentLabel: { en: "Date sent", kn: "ಕಳುಹಿಸಿದ ದಿನಾಂಕ" },
  saveAsDraft: { en: "Save as draft", kn: "ಕರಡಾಗಿ ಉಳಿಸಿ" },
  haveSentStartClock: { en: "I have sent it — start the clock", kn: "ನಾನು ಇದನ್ನು ಕಳುಹಿಸಿದ್ದೇನೆ — ಗಡುವು ಪ್ರಾರಂಭಿಸಿ" },
  couldNotDraftComplaint: { en: "Could not draft the complaint", kn: "ದೂರನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" },
  couldNotDraftApplication: { en: "Could not draft the application", kn: "ಅರ್ಜಿಯನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" },
  couldNotRevise: { en: "Could not revise the draft", kn: "ಕರಡನ್ನು ಪರಿಷ್ಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" },
  couldNotSave: { en: "Could not save", kn: "ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" },
  savedSubject: { en: "Saved \"{subject}\"", kn: "\"{subject}\" ಉಳಿಸಲಾಗಿದೆ" },

  wrongAuthorityHeading: { en: "This may be the wrong public authority", kn: "ಇದು ತಪ್ಪು ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರವಾಗಿರಬಹುದು" },
  wrongAuthorityBody: {
    en: "You selected {authority}. Based on your grievance, these records are likely held by {suggested}. Filing with the wrong authority means it must be transferred under Section 6(3), which adds at least 5 days and restarts the 30-day clock.",
    kn: "ನೀವು {authority} ಆಯ್ಕೆ ಮಾಡಿದ್ದೀರಿ. ನಿಮ್ಮ ದೂರಿನ ಆಧಾರದ ಮೇಲೆ, ಈ ದಾಖಲೆಗಳನ್ನು {suggested} ಹೊಂದಿರುವ ಸಾಧ್ಯತೆ ಇದೆ. ತಪ್ಪು ಪ್ರಾಧಿಕಾರದಲ್ಲಿ ಸಲ್ಲಿಸಿದರೆ ಅದನ್ನು ಕಲಂ 6(3) ಅಡಿ ವರ್ಗಾಯಿಸಬೇಕಾಗುತ್ತದೆ, ಇದು ಕನಿಷ್ಠ 5 ದಿನ ಸೇರಿಸಿ 30 ದಿನಗಳ ಗಡುವನ್ನು ಮರುಪ್ರಾರಂಭಿಸುತ್ತದೆ.",
  },
  switchAndRedraft: { en: "Switch to {suggested} and redraft", kn: "{suggested} ಗೆ ಬದಲಿಸಿ ಮತ್ತು ಮರುರಚಿಸಿ" },
  redrafting: { en: "Redrafting…", kn: "ಮರುರಚಿಸಲಾಗುತ್ತಿದೆ…" },
  keepAuthority: { en: "Keep {authority}", kn: "{authority} ಅನ್ನೇ ಇರಿಸಿ" },

  multiSubjectHeading: { en: "This covers more than one subject", kn: "ಇದು ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ವಿಷಯಗಳನ್ನು ಒಳಗೊಂಡಿದೆ" },
  multiSubjectBody: {
    en: "Karnataka's Rule 14 requires one subject per application. If you file all of these together, the PIO may answer only the first and tell you to file separately for the rest. This draft covers {subject}.",
    kn: "ಕರ್ನಾಟಕದ ನಿಯಮ 14ರ ಪ್ರಕಾರ ಪ್ರತಿ ಅರ್ಜಿಗೆ ಒಂದೇ ವಿಷಯ ಇರಬೇಕು. ಇವೆಲ್ಲವನ್ನೂ ಒಟ್ಟಿಗೆ ಸಲ್ಲಿಸಿದರೆ, ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಮೊದಲನೆಯದಕ್ಕೆ ಮಾತ್ರ ಉತ್ತರಿಸಿ ಉಳಿದವುಗಳಿಗೆ ಪ್ರತ್ಯೇಕವಾಗಿ ಸಲ್ಲಿಸಲು ಹೇಳಬಹುದು. ಈ ಕರಡು {subject} ಅನ್ನು ಒಳಗೊಂಡಿದೆ.",
  },
  draftedTag: { en: "drafted", kn: "ರಚಿಸಲಾಗಿದೆ" },
  draftThisToo: { en: "Draft this too — {label}", kn: "ಇದನ್ನೂ ರಚಿಸಿ — {label}" },

  whatYouWroteHeading: { en: "What you wrote — a PIO can refuse this", kn: "ನೀವು ಬರೆದದ್ದು — ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಇದನ್ನು ನಿರಾಕರಿಸಬಹುದು" },
  section2fNote: {
    en: "A grievance asks for action or an explanation. Section 2(f) only entitles you to material held in recorded form.",
    kn: "ದೂರು ಎಂದರೆ ಕ್ರಮ ಅಥವಾ ವಿವರಣೆ ಕೇಳುವುದು. ಕಲಂ 2(ಎಫ್) ದಾಖಲಿತ ರೂಪದಲ್ಲಿ ಇರುವ ಸಾಮಗ್ರಿಗೆ ಮಾತ್ರ ಹಕ್ಕು ನೀಡುತ್ತದೆ.",
  },
  whatWeAskForHeading: {
    en: "What we ask for — records the authority must produce",
    kn: "ನಾವು ಏನನ್ನು ಕೇಳುತ್ತೇವೆ — ಪ್ರಾಧಿಕಾರ ಒದಗಿಸಬೇಕಾದ ದಾಖಲೆಗಳು",
  },
  wordsOfRule14: { en: "{count} / {limit} words (Karnataka Rule 14)", kn: "{count} / {limit} ಪದಗಳು (ಕರ್ನಾಟಕ ನಿಯಮ 14)" },
  rule14OverLimitNote: {
    en: "Rule 14 says an application shall not ORDINARILY exceed 150 words, so this is not automatically invalid - but a PIO may push back. Consider trimming, or add a line explaining why the extra length is necessary.",
    kn: "ನಿಯಮ 14ರ ಪ್ರಕಾರ ಅರ್ಜಿ ಸಾಮಾನ್ಯವಾಗಿ 150 ಪದಗಳನ್ನು ಮೀರಬಾರದು, ಆದ್ದರಿಂದ ಇದು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅಮಾನ್ಯವಲ್ಲ - ಆದರೆ ಮಾಹಿತಿ ಅಧಿಕಾರಿ ಆಕ್ಷೇಪಿಸಬಹುದು. ಸಂಕ್ಷಿಪ್ತಗೊಳಿಸುವುದನ್ನು ಪರಿಗಣಿಸಿ, ಅಥವಾ ಹೆಚ್ಚುವರಿ ಉದ್ದ ಏಕೆ ಅಗತ್ಯ ಎಂದು ವಿವರಿಸುವ ಸಾಲನ್ನು ಸೇರಿಸಿ.",
  },
  confidenceLabel: { en: "Confidence: {value}", kn: "ವಿಶ್ವಾಸ ಮಟ್ಟ: {value}" },
  subjectLabel: { en: "Subject: {value}", kn: "ವಿಷಯ: {value}" },
  suggestedAuthorityLabel: { en: "Suggested authority: {value}", kn: "ಸೂಚಿತ ಪ್ರಾಧಿಕಾರ: {value}" },

  improveThisDraft: { en: "Improve this draft", kn: "ಈ ಕರಡನ್ನು ಸುಧಾರಿಸಿ" },
  improveDraftPlaceholder: {
    en: "Add anything that would make these harder to refuse - dates, the exact stretch of road, a complaint number you already have...",
    kn: "ಇವುಗಳನ್ನು ನಿರಾಕರಿಸಲು ಕಷ್ಟವಾಗಿಸುವ ಯಾವುದನ್ನಾದರೂ ಸೇರಿಸಿ - ದಿನಾಂಕಗಳು, ರಸ್ತೆಯ ನಿಖರ ವ್ಯಾಪ್ತಿ, ನಿಮ್ಮಲ್ಲಿ ಈಗಾಗಲೇ ಇರುವ ದೂರಿನ ಸಂಖ್ಯೆ...",
  },
  reviseButton: { en: "Revise", kn: "ಪರಿಷ್ಕರಿಸಿ" },
  revising: { en: "Revising…", kn: "ಪರಿಷ್ಕರಿಸಲಾಗುತ್ತಿದೆ…" },

  preflightCheck: { en: "Pre-flight check", kn: "ಪೂರ್ವ-ಪರಿಶೀಲನೆ" },
  preflightPassed: {
    en: "Pre-flight check passed - no opinion-seeking phrasing or obvious Section 8 exemption risk detected.",
    kn: "ಪೂರ್ವ-ಪರಿಶೀಲನೆ ಯಶಸ್ವಿ - ಅಭಿಪ್ರಾಯ ಕೇಳುವ ಪದಪ್ರಯೋಗ ಅಥವಾ ಸ್ಪಷ್ಟ ಕಲಂ 8 ವಿನಾಯಿತಿ ಅಪಾಯ ಪತ್ತೆಯಾಗಿಲ್ಲ.",
  },
  suggestionLabel: { en: "Suggestion: {value}", kn: "ಸಲಹೆ: {value}" },
  applyThisFix: { en: "Apply this", kn: "ಇದನ್ನು ಅನ್ವಯಿಸಿ" },
  addressWordingProblem: {
    en: "Address this problem with request wording: {message} Suggested fix: {suggestion}",
    kn: "ಕೋರಿಕೆಯ ಪದಪ್ರಯೋಗದಲ್ಲಿನ ಈ ಸಮಸ್ಯೆಯನ್ನು ಪರಿಹರಿಸಿ: {message} ಸೂಚಿಸಲಾದ ಪರಿಹಾರ: {suggestion}",
  },

  flagOpinionSeeking: { en: "Asks for an opinion, not a record", kn: "ದಾಖಲೆಗಿಂತ ಅಭಿಪ್ರಾಯ ಕೇಳುತ್ತದೆ" },
  flagExemptionRisk: { en: "May be refused under Section 8", kn: "ಕಲಂ 8ರ ಅಡಿ ನಿರಾಕರಿಸುವ ಸಾಧ್ಯತೆ ಇದೆ" },
  flagTooBroad: { en: "Too broad — invites a fee demand", kn: "ಅತಿ ವಿಸ್ತಾರ — ಶುಲ್ಕ ಬೇಡಿಕೆಗೆ ಆಸ್ಪದ ನೀಡುತ್ತದೆ" },
  flagWrongAuthority: { en: "Possibly the wrong public authority", kn: "ಬಹುಶಃ ತಪ್ಪು ಸಾರ್ವಜನಿಕ ಪ್ರಾಧಿಕಾರ" },

  editBeforeFiling: {
    en: "The application — edit anything before you file",
    kn: "ಅರ್ಜಿ — ಸಲ್ಲಿಸುವ ಮೊದಲು ಏನನ್ನಾದರೂ ಸಂಪಾದಿಸಿ",
  },
  portalLatinOnlyNote: {
    en: "The online portal accepts Latin characters only, so a Kannada application must be sent by post. Both versions are legally valid.",
    kn: "ಆನ್‌ಲೈನ್ ಪೋರ್ಟಲ್ ಲ್ಯಾಟಿನ್ ಅಕ್ಷರಗಳನ್ನು ಮಾತ್ರ ಸ್ವೀಕರಿಸುತ್ತದೆ, ಆದ್ದರಿಂದ ಕನ್ನಡ ಅರ್ಜಿಯನ್ನು ಅಂಚೆ ಮೂಲಕ ಕಳುಹಿಸಬೇಕು. ಎರಡೂ ಆವೃತ್ತಿಗಳೂ ಕಾನೂನುಬದ್ಧವಾಗಿ ಸಿಂಧು.",
  },
  kannadaPostalOnly: { en: "ಕನ್ನಡ (ಅಂಚೆ ಮೂಲಕ ಮಾತ್ರ)", kn: "ಕನ್ನಡ (ಅಂಚೆ ಮೂಲಕ ಮಾತ್ರ)" },
  englishPortal: { en: "English (portal)", kn: "English (portal)" },
  postThisVersionNote: {
    en: "Post this version: speed post with acknowledgement due, fee by Indian Postal Order or DD.",
    kn: "ಈ ಆವೃತ್ತಿಯನ್ನು ಅಂಚೆ ಮಾಡಿ: ಸ್ಪೀಡ್ ಪೋಸ್ಟ್ ಜೊತೆಗೆ ಸ್ವೀಕೃತಿ ಪಾವತಿ, ಶುಲ್ಕವನ್ನು ಇಂಡಿಯನ್ ಪೋಸ್ಟಲ್ ಆರ್ಡರ್ ಅಥವಾ ಡಿಡಿ ಮೂಲಕ ನೀಡಿ.",
  },
  fileThisVersionNote: {
    en: "File this version on the RTI portal.",
    kn: "ಈ ಆವೃತ್ತಿಯನ್ನು ಮಾಹಿತಿ ಹಕ್ಕು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸಲ್ಲಿಸಿ.",
  },
  saveAndMarkFiledToday: { en: "Save & mark filed today", kn: "ಉಳಿಸಿ ಮತ್ತು ಇಂದು ಸಲ್ಲಿಸಿದಂತೆ ಗುರುತಿಸಿ" },
  saveAllAsDrafts: { en: "Save all as drafts", kn: "ಎಲ್ಲವನ್ನೂ ಕರಡುಗಳಾಗಿ ಉಳಿಸಿ" },

  whoIsResponsibleHelp: {
    en: "This is who is responsible. Call them, and quote your complaint number.",
    kn: "ಇವರೇ ಜವಾಬ್ದಾರರು. ಅವರಿಗೆ ಕರೆ ಮಾಡಿ, ಮತ್ತು ನಿಮ್ಮ ದೂರಿನ ಸಂಖ್ಯೆಯನ್ನು ಉಲ್ಲೇಖಿಸಿ.",
  },
  oldBbmpWardNote: {
    en: "{ward} was {oldWard} ward under BBMP (pre-2025).",
    kn: "{ward} ಬಿಬಿಎಂಪಿ (2025ಕ್ಕೂ ಮುಂಚಿನ) ಅಡಿ {oldWard} ವಾರ್ಡ್ ಆಗಿತ್ತು.",
  },

  wardMapLoading: { en: "Loading ward map…", kn: "ವಾರ್ಡ್ ನಕ್ಷೆ ಲೋಡ್ ಆಗುತ್ತಿದೆ…" },
  wardMapAriaLabel: { en: "Map of Greater Bengaluru Authority wards", kn: "ಗ್ರೇಟರ್ ಬೆಂಗಳೂರು ಪ್ರಾಧಿಕಾರದ ವಾರ್ಡ್‌ಗಳ ನಕ್ಷೆ" },
  tapWardToSelect: { en: "Tap a ward to select it", kn: "ಆಯ್ಕೆ ಮಾಡಲು ವಾರ್ಡ್ ಟ್ಯಾಪ್ ಮಾಡಿ" },

  routingChecking: {
    en: "Working out who owns this…",
    kn: "ಇದು ಯಾರ ಜವಾಬ್ದಾರಿ ಎಂದು ಕಂಡುಹಿಡಿಯಲಾಗುತ್ತಿದೆ…",
  },
  routingSuggestionWard: {
    en: "From what you wrote, this looks like {authority}, ward {ward} — a {category} issue. Change it below if that is not right.",
    kn: "ನೀವು ಬರೆದಿರುವುದರಿಂದ, ಇದು {authority}, {ward} ವಾರ್ಡ್‌ಗೆ ಸಂಬಂಧಿಸಿದ {category} ಸಮಸ್ಯೆ ಎಂದು ಕಾಣುತ್ತದೆ. ಸರಿಯಿಲ್ಲದಿದ್ದರೆ ಕೆಳಗೆ ಬದಲಾಯಿಸಿ.",
  },
  routingSuggestionNoWard: {
    en: "From what you wrote, this looks like {authority} — a {category} issue. Change it below if that is not right.",
    kn: "ನೀವು ಬರೆದಿರುವುದರಿಂದ, ಇದು {authority} — {category} ಸಮಸ್ಯೆ ಎಂದು ಕಾಣುತ್ತದೆ. ಸರಿಯಿಲ್ಲದಿದ್ದರೆ ಕೆಳಗೆ ಬದಲಾಯಿಸಿ.",
  },
  routingLowConfidence: {
    en: "We are not certain of this one — please check it.",
    kn: "ಇದರ ಬಗ್ಗೆ ನಮಗೆ ಖಚಿತವಿಲ್ಲ — ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.",
  },
  corporationMismatch: {
    en: "{ward} is in {wardCorp}, but you have selected {selected}. Filing with the wrong corporation means a Section 6(3) transfer, which costs at least five days.",
    kn: "{ward} {wardCorp} ವ್ಯಾಪ್ತಿಯಲ್ಲಿದೆ, ಆದರೆ ನೀವು {selected} ಆಯ್ಕೆ ಮಾಡಿದ್ದೀರಿ. ತಪ್ಪು ಪಾಲಿಕೆಗೆ ಸಲ್ಲಿಸಿದರೆ ಕಲಂ 6(3) ವರ್ಗಾವಣೆ ಆಗುತ್ತದೆ, ಅದು ಕನಿಷ್ಠ ಐದು ದಿನ ತಿನ್ನುತ್ತದೆ.",
  },
  switchToCorporation: { en: "Switch to {corp}", kn: "{corp}ಗೆ ಬದಲಾಯಿಸಿ" },
  keepMyChoice: { en: "Keep my choice", kn: "ನನ್ನ ಆಯ್ಕೆಯನ್ನೇ ಇಟ್ಟುಕೊಳ್ಳಿ" },
} as const;
