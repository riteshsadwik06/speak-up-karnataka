/**
 * Typed accessor for the Bengaluru civic officials dataset.
 *
 * Data: https://github.com/Vonter/city-officials (non-code data: CC BY 4.0).
 * Derived at build time by scripts/build-officials.mjs and served from the CDN,
 * so the ~390KB payload never enters the main bundle — it is fetched lazily on
 * first use and cached for the session.
 */
import asset from "@/assets/blr-officials.json.asset.json";

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
  bescomSubdivision: DepartmentBlock;
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

/** Lazily fetch (and cache) the officials asset. */
export function loadOfficials(): Promise<OfficialsData> {
  dataPromise ??= fetch(asset.url)
    .then((r) => {
      if (!r.ok) throw new Error(`officials asset ${r.status}`);
      return r.json() as Promise<OfficialsData>;
    })
    .then((d) => {
      cached = d;
      wardIndex = {};
      for (const [name, block] of Object.entries(d.wards)) wardIndex[name.toLowerCase()] = block;
      return d;
    })
    .catch((e) => {
      dataPromise = null;
      throw e;
    });
  return dataPromise;
}

/** Ward block matched case-insensitively on the ward name, or null. */
export async function officialsForWard(wardName: string): Promise<WardOfficials | null> {
  await loadOfficials();
  return wardIndex?.[wardName.trim().toLowerCase()] ?? null;
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
