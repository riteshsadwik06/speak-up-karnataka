/**
 * Typed accessor for the Bengaluru civic officials dataset.
 *
 * Data: https://github.com/Vonter/city-officials (non-code data: CC BY 4.0).
 * Derived at build time by scripts/build-officials.mjs and served from public/data,
 * so the ~390KB payload never enters the main bundle — it is fetched lazily on
 * first use and cached for the session.
 */

export type Official = {
  designation?: string;
  name?: string;
  phone?: string;
  email?: string;
  nameKn?: string;
  designationKn?: string;
};

export type WardOfficials = {
  wardNo: string;
  oldBbmpWard?: string;
  officials: Official[];
};

export type DepartmentBlock = Record<string, Official[]>;

export type OfficialsData = {
  _source: string;
  _licence: string;
  wards: Record<string, WardOfficials>;
  gbaZone: DepartmentBlock;
  gbaCorporation: DepartmentBlock;
  bbmpZone: DepartmentBlock;
  bwssbSubdivision: DepartmentBlock;
  bwssbServiceStation: DepartmentBlock;
  bescomSubdivision: DepartmentBlock;
  bescomSection: DepartmentBlock;

  policeCity: DepartmentBlock;
  electionAc: DepartmentBlock;
  oldCorporator: DepartmentBlock;
};

export const OFFICIALS_SOURCE = "https://github.com/Vonter/city-officials";
export const OFFICIALS_LICENCE = "Non-code data: CC BY 4.0";
export const OFFICIALS_CREDIT = "Officials data from Bengawalk City Officials, CC BY 4.0";
export const OFFICIALS_CAVEAT =
  "Officials change often. Verify the name and number before relying on it, and report anything stale.";

let dataPromise: Promise<OfficialsData> | null = null;
let cached: OfficialsData | null = null;
let wardIndex: Record<string, WardOfficials> | null = null;
let wardIndexNormalized: Record<string, WardOfficials> | null = null;

/** Strips everything but letters and digits, so "J.P Nagar" and "J P Nagar" collide. */
function normalizeWardKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Lazily fetch (and cache) the officials asset. */
export function loadOfficials(): Promise<OfficialsData> {
  dataPromise ??= fetch("/data/blr-officials.json")
    .then((r) => {
      if (!r.ok) throw new Error(`officials asset ${r.status}`);
      return r.json() as Promise<OfficialsData>;
    })
    .then((d) => {
      cached = d;
      wardIndex = {};
      wardIndexNormalized = {};
      for (const [name, block] of Object.entries(d.wards)) {
        wardIndex[name.toLowerCase()] = block;
        wardIndexNormalized[normalizeWardKey(name)] = block;
      }
      return d;
    })
    .catch((e) => {
      dataPromise = null;
      throw e;
    });
  return dataPromise;
}

/**
 * Ward block matched on the ward name. Tries an exact case-insensitive match
 * first, then falls back to a normalised match (punctuation/spacing stripped)
 * so "J P Nagar" still finds the dataset's "J.P Nagar".
 */
export async function officialsForWard(wardName: string): Promise<WardOfficials | null> {
  await loadOfficials();
  const trimmed = wardName.trim();
  const hit =
    wardIndex?.[trimmed.toLowerCase()] ?? wardIndexNormalized?.[normalizeWardKey(trimmed)] ?? null;
  // Every ward name shown anywhere in the app (seeded or real) should resolve.
  // A silent miss here is exactly how a whole demo row loses its officials panel.
  if (!hit && import.meta.env.DEV) {
    console.error(`[officials] no officials block resolves for ward name "${wardName}"`);
  }
  return hit;
}

/** Officials for one area within a department block (case-insensitive). */
export function officialsForDepartment(block: DepartmentBlock, area: string): Official[] {
  const direct = block[area];
  if (direct) return direct;
  const key = area.trim().toLowerCase();
  for (const [k, v] of Object.entries(block)) if (k.trim().toLowerCase() === key) return v;
  return [];
}

/** Synchronous read of the already-loaded dataset, if any. */
export function peekOfficials(): OfficialsData | null {
  return cached;
}
