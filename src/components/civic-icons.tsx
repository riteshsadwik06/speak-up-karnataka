/**
 * Hand-drawn monoline glyphs for Bengaluru civic roles. 24x24, stroke-based.
 * Not lucide: these are drawn from the actual civic world (broom, transformer,
 * mosquito, khata, ballot box) so an officials list scans by role.
 */
import { useLang, type StrId } from "@/lib/i18n";

export type CivicRole =
  | "waste"
  | "road_maintenance"
  | "road_infra"
  | "street_light"
  | "electrical"
  | "water"
  | "revenue"
  | "veterinary"
  | "health"
  | "police"
  | "representative"
  | "default";

const MAPPING: { match: RegExp; role: CivicRole }[] = [
  { match: /marshal|solid waste|garbage/i, role: "waste" },
  { match: /road maintenance/i, role: "road_maintenance" },
  { match: /road infrastructure/i, role: "road_infra" },
  { match: /street light/i, role: "street_light" },
  { match: /electrical/i, role: "electrical" },
  { match: /water|sewer|bwssb/i, role: "water" },
  { match: /revenue|khata|tax/i, role: "revenue" },
  { match: /veterinary|animal/i, role: "veterinary" },
  { match: /health inspector|health/i, role: "health" },
  { match: /police|traffic/i, role: "police" },
  { match: /corporator|mla|member of|commissioner|mayor/i, role: "representative" },
];

/** Designation text → glyph key, case-insensitive, first match wins. */
export function civicRoleFor(designation?: string | null): CivicRole {
  const text = designation ?? "";
  return MAPPING.find((m) => m.match.test(text))?.role ?? "default";
}

/** Role -> dictionary id for the accessible label on each glyph. */
const ROLE_LABEL_ID: Record<CivicRole, StrId> = {
  waste: "civicRoleWaste",
  road_maintenance: "civicRoleRoadMaintenance",
  road_infra: "civicRoleRoadInfra",
  street_light: "civicRoleStreetLight",
  electrical: "civicRoleElectrical",
  water: "civicRoleWater",
  revenue: "civicRoleRevenue",
  veterinary: "civicRoleVeterinary",
  health: "civicRoleHealth",
  police: "civicRolePolice",
  representative: "civicRoleRepresentative",
  default: "civicRoleDefault",
};

const PATHS: Record<CivicRole, React.ReactNode> = {
  waste: (
    <>
      <path d="M12 2.6v8.4" />
      <path d="M10.4 11h3.2" />
      <path d="M10.4 11 6.6 20.6" />
      <path d="M11.2 11 9.4 20.8" />
      <path d="M12 11v9.8" />
      <path d="M12.8 11l1.8 9.8" />
      <path d="M13.6 11l3.8 9.6" />
    </>
  ),
  road_maintenance: (
    <>
      <path d="M6.5 21 9 4" />
      <path d="M17.5 21 15 4" />
      <path d="M12 5.5v2.2" />
      <path d="M12 10.4v2.2" />
      <ellipse cx="14.4" cy="17" rx="2.3" ry="1.6" />
    </>
  ),
  road_infra: (
    <>
      <path d="M6.5 21 9 4" />
      <path d="M17.5 21 15 4" />
      <path d="M12 5v3" />
      <path d="M12 10.5v3" />
      <path d="M12 16v3" />
    </>
  ),
  street_light: (
    <>
      <path d="M7 21V6.5" />
      <path d="M4.8 21h4.4" />
      <path d="M7 6.5c0-2 1.6-3 3.4-3h2.1" />
      <path d="M12.5 3.5h4.6l1.4 4.2h-7.4z" />
      <path d="M13.4 10.6 12 12.8" />
      <path d="M14.8 10.9v2.6" />
      <path d="M16.4 10.6 17.8 12.8" />
    </>
  ),
  electrical: (
    <>
      <path d="M7.5 8.2h9v8.6h-9z" />
      <path d="M5.6 10.2v4.6" />
      <path d="M18.4 10.2v4.6" />
      <path d="M10 8.2V6.4" />
      <path d="M14 8.2V6.4" />
      <path d="M8.6 5.2h6.8" />
      <path d="M12.6 10.6l-1.8 2.6h2.4l-1.6 2.4" />
    </>
  ),
  water: (
    <>
      <path d="M12 3.2c2.9 3.4 4.8 6 4.8 8.3a4.8 4.8 0 0 1-9.6 0c0-2.3 1.9-4.9 4.8-8.3z" />
      <path d="M3.4 18.2c1.6 0 1.6 1.5 3.2 1.5s1.6-1.5 3.2-1.5 1.6 1.5 3.2 1.5 1.6-1.5 3.2-1.5 1.6 1.5 3.2 1.5" />
    </>
  ),
  revenue: (
    <>
      <path d="M5.5 3.5h9.4l3.6 3.6V20.5H5.5z" />
      <path d="M14.6 3.6v3.6h3.6" />
      <path d="M8.2 10.4h4.6" />
      <path d="M8.2 13h6" />
      <circle cx="15.2" cy="16.6" r="2.6" />
    </>
  ),
  veterinary: (
    <>
      <ellipse cx="8.2" cy="9.4" rx="1.5" ry="1.9" />
      <ellipse cx="12" cy="8.2" rx="1.5" ry="2" />
      <ellipse cx="15.8" cy="9.4" rx="1.5" ry="1.9" />
      <path d="M12 12.2c2.7 0 4.6 1.9 4.6 3.9 0 1.7-1.4 2.8-3 2.8-.7 0-1.1-.3-1.6-.3s-.9.3-1.6.3c-1.6 0-3-1.1-3-2.8 0-2 1.9-3.9 4.6-3.9z" />
    </>
  ),
  health: (
    <>
      <ellipse cx="12" cy="14.6" rx="1.7" ry="3.6" />
      <path d="M10.6 11.3C8.4 9 5.6 8.4 4.2 9.4c-1.3 1 .3 3.2 2.6 4.2 1.3.6 2.7.7 3.5.4" />
      <path d="M13.4 11.3c2.2-2.3 5-2.9 6.4-1.9 1.3 1-.3 3.2-2.6 4.2-1.3.6-2.7.7-3.5.4" />
      <path d="M12 11V8.6" />
      <path d="M10.8 7.2a1.3 1.3 0 1 1 2.4 0" />
      <path d="M10.6 17.4 8.6 20.4" />
      <path d="M13.4 17.4l2 3" />
    </>
  ),
  police: (
    <>
      <path d="M5.4 15.4c0-4 2.9-7.2 6.6-7.2s6.6 3.2 6.6 7.2" />
      <path d="M3.4 15.4h17.2v2.4H3.4z" />
      <path d="M5.8 12.6h12.4" />
      <path d="M12 8.2V5.8" />
      <circle cx="12" cy="4.6" r="1.1" />
    </>
  ),
  representative: (
    <>
      <path d="M4.5 13.5h15V21h-15z" />
      <path d="M8.6 13.5V9.2h6.8v4.3" />
      <path d="M12 3.2v5.4" />
      <path d="M9.8 6.4 12 8.7l2.2-2.3" />
    </>
  ),
  default: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="4.4" />
      <path d="M12 3.8v1.6" />
      <path d="M12 18.6v1.6" />
      <path d="M3.8 12h1.6" />
      <path d="M18.6 12h1.6" />
    </>
  ),
};

const PLATE_FACE = "#ede7da";
const PLATE_SIDE = "#b8ae9b";
const PLATE_INK = "#1f1d1a";

/**
 * The glyph sits on an extruded plate, matching the extrusion language of the
 * 3D ward map. Plate colours are fixed (not currentColor) because the glyph
 * rests on its own light face.
 */
export function CivicIcon({
  role,
  size = 40,
  className = "",
}: {
  role: CivicRole;
  size?: number;
  className?: string;
}) {
  const { lang, t } = useLang();
  const label = t(ROLE_LABEL_ID[role] ?? "civicRoleDefault");

  return (
    <svg
      viewBox="0 0 44 44"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      lang={lang}
      focusable="false"
      className={`shrink-0 transition-transform duration-150 group-hover:-translate-x-px group-hover:-translate-y-px motion-reduce:transition-none motion-reduce:transform-none ${className}`}
    >
      <title>{label}</title>
      {/* shaded side faces, drawn first so they sit behind */}
      <path
        d="M37 4 l3.4 3.4 v32 l-3.4 3.4 v-32 z"
        fill={PLATE_SIDE}
        className="transition-colors duration-150 group-hover:[fill:#a3987f] motion-reduce:transition-none"
      />
      <path
        d="M5 36 l3.4 3.4 h32 l-3.4 -3.4 z"
        fill={PLATE_SIDE}
        className="transition-colors duration-150 group-hover:[fill:#a3987f] motion-reduce:transition-none"
      />
      {/* front face */}
      <rect x="5" y="4" width="32" height="32" fill={PLATE_FACE} stroke={PLATE_INK} strokeWidth={1} />
      {/* edges */}
      <path
        d="M37 4 l3.4 3.4 v32 l-3.4 3.4 M5 36 l3.4 3.4 h32"
        fill="none"
        stroke={PLATE_INK}
        strokeWidth={1}
        strokeLinejoin="round"
      />
      {/* the glyph, centred on the front face */}
      <g
        transform="translate(9.72 8.72) scale(0.94)"
        fill="none"
        stroke={PLATE_INK}
        strokeWidth={1.49}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {PATHS[role] ?? PATHS.default}
      </g>
    </svg>
  );
}

