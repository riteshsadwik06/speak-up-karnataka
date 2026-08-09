/**
 * Ward identity resolution, shared by the client and the drafting prompts.
 *
 * Anything that ends up in a filed document must come from here — the ward list is
 * authoritative, the model is not. See `stripUnsuppliedIdentifiers` in rti.server.ts.
 */
import { WARDS, type Ward } from "./wards";
import { loadOfficials } from "./officials";

export type WardIdentity = {
  name: string;
  nameKn?: string | null;
  /** Plain ward number, e.g. "17". Never a synthesised code like "C-017". */
  number?: string | null;
  corporation?: string | null;
  zone?: string | null;
  assembly?: string | null;
  oldBbmpWard?: string | null;
};

/**
 * The dataset's ward_id ("C-017") is an internal key, not an identifier any
 * department uses. Only the plain number inside it is real.
 */
export function wardNumberOf(wardId: string | null | undefined): string | null {
  const digits = (wardId ?? "").match(/\d+/)?.[0];
  if (!digits) return null;
  return String(Number(digits));
}


/** Same normalisation as the ward search: case, punctuation and spacing insensitive. */
export function normalizeWardText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.'’`_-]/g, " ")
    .replace(/\bward\b|\bnagara?\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wardById(wardId: string | null | undefined): Ward | undefined {
  if (!wardId) return undefined;
  return WARDS.find((w) => w.ward_id === wardId);
}

export function wardByName(name: string | null | undefined): Ward | undefined {
  if (!name) return undefined;
  const n = normalizeWardText(name);
  return WARDS.find((w) => normalizeWardText(w.ward_name) === n);
}

export function identityFor(ward: Ward | undefined | null, oldBbmpWard?: string | null): WardIdentity | null {
  if (!ward) return null;
  return {
    name: ward.ward_name,
    nameKn: ward.ward_name_kn || null,
    number: wardNumberOf(ward.ward_id),
    corporation: ward.corporation,
    zone: ward.zone_name,
    assembly: ward.assembly || null,
    oldBbmpWard: oldBbmpWard ?? null,

  };
}

/** Identity enriched with the former BBMP ward name, where the officials dataset knows it. */
export async function identityWithHistory(ward: Ward | undefined | null): Promise<WardIdentity | null> {
  const base = identityFor(ward);
  if (!base) return null;
  try {
    const data = await loadOfficials();
    const block = Object.entries(data.wards).find(
      ([name]) => normalizeWardText(name) === normalizeWardText(base.name),
    );
    if (block?.[1]?.oldBbmpWard) base.oldBbmpWard = block[1].oldBbmpWard;
  } catch {
    // The officials dataset is optional context — never block drafting on it.
  }
  return base;
}

/**
 * Match a locality named in free text against ward names, Kannada ward names and the
 * former BBMP ward names. Returns null rather than guessing.
 */
export async function wardForLocality(locality: string): Promise<Ward | null> {
  const q = normalizeWardText(locality);
  if (q.length < 3) return null;

  const exact = WARDS.find(
    (w) => normalizeWardText(w.ward_name) === q || normalizeWardText(w.ward_name_kn) === q,
  );
  if (exact) return exact;

  const partial = WARDS.filter(
    (w) => normalizeWardText(w.ward_name).includes(q) || normalizeWardText(w.ward_name_kn).includes(q),
  );
  if (partial.length === 1) return partial[0]!;

  try {
    const data = await loadOfficials();
    for (const [name, block] of Object.entries(data.wards)) {
      const old = block.oldBbmpWard ? normalizeWardText(block.oldBbmpWard) : "";
      if (old && (old === q || old.includes(q))) {
        const hit = wardByName(name);
        if (hit) return hit;
      }
    }
  } catch {
    // ignore
  }

  return partial[0] ?? null;
}
