/**
 * Officials list surface (grouping headings, empty state, caveat, roles).
 * NOTE: Kannada legal/civic vocabulary follows the Karnataka RTI portal usage.
 */
export const DICT_OFFICIALS = {
  officialsGroupRoadsWorks: { en: "Roads & works", kn: "ರಸ್ತೆ ಮತ್ತು ಕಾಮಗಾರಿ" },
  officialsGroupWasteHealth: { en: "Waste & health", kn: "ತ್ಯಾಜ್ಯ ಮತ್ತು ಆರೋಗ್ಯ" },
  officialsGroupElectricalLights: { en: "Electrical & lights", kn: "ವಿದ್ಯುತ್ ಮತ್ತು ದೀಪಗಳು" },
  officialsGroupRevenueTaxKhata: { en: "Revenue, tax & khata", kn: "ಕಂದಾಯ, ತೆರಿಗೆ ಮತ್ತು ಖಾತಾ" },
  officialsGroupAnimals: { en: "Animals", kn: "ಪ್ರಾಣಿಗಳು" },
  officialsGroupWardOffice: { en: "Ward office", kn: "ವಾರ್ಡ್ ಕಚೇರಿ" },

  officialsCaveat: {
    en: "Officials change often. Verify the name and number before relying on it, and report anything stale.",
    kn: "ಅಧಿಕಾರಿಗಳು ಆಗಾಗ್ಗೆ ಬದಲಾಗುತ್ತಾರೆ. ಅವಲಂಬಿಸುವ ಮೊದಲು ಹೆಸರು ಮತ್ತು ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ, ಮತ್ತು ಹಳೆಯದಾಗಿದ್ದರೆ ವರದಿ ಮಾಡಿ.",
  },

  officialsLoading: { en: "Loading officials…", kn: "ಅಧಿಕಾರಿಗಳ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ…" },

  civicRoleWaste: { en: "Waste marshal / sanitation", kn: "ತ್ಯಾಜ್ಯ ಮಾರ್ಷಲ್ / ನೈರ್ಮಲ್ಯ" },
  civicRoleRoadMaintenance: { en: "Road maintenance engineer", kn: "ರಸ್ತೆ ನಿರ್ವಹಣಾ ಎಂಜಿನಿಯರ್" },
  civicRoleRoadInfra: { en: "Road infrastructure engineer", kn: "ರಸ್ತೆ ಮೂಲಸೌಕರ್ಯ ಎಂಜಿನಿಯರ್" },
  civicRoleStreetLight: { en: "Street light engineer", kn: "ಬೀದಿ ದೀಪ ಎಂಜಿನಿಯರ್" },
  civicRoleElectrical: { en: "Electrical engineer", kn: "ವಿದ್ಯುತ್ ಎಂಜಿನಿಯರ್" },
  civicRoleWater: { en: "Water / sewerage engineer", kn: "ನೀರು / ಒಳಚರಂಡಿ ಎಂಜಿನಿಯರ್" },
  civicRoleRevenue: { en: "Revenue / khata / tax officer", kn: "ಕಂದಾಯ / ಖಾತಾ / ತೆರಿಗೆ ಅಧಿಕಾರಿ" },
  civicRoleVeterinary: { en: "Veterinary officer", kn: "ಪಶುವೈದ್ಯಾಧಿಕಾರಿ" },
  civicRoleHealth: { en: "Health inspector", kn: "ಆರೋಗ್ಯ ನಿರೀಕ್ಷಕ" },
  civicRolePolice: { en: "Police / traffic officer", kn: "ಪೊಲೀಸ್ / ಸಂಚಾರ ಅಧಿಕಾರಿ" },
  civicRoleRepresentative: { en: "Elected representative", kn: "ಚುನಾಯಿತ ಪ್ರತಿನಿಧಿ" },
  civicRoleDefault: { en: "Ward official", kn: "ವಾರ್ಡ್ ಅಧಿಕಾರಿ" },
} as const;
