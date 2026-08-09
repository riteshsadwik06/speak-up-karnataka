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


/**
 * Same normalisation as the ward search: case, punctuation, spacing and script
 * insensitive. Kannada input is NFC-normalised and stripped of zero-width
 * joiners, and the Kannada words for "ward" / "nagara" are dropped exactly as
 * their Latin equivalents are, so ಕಗ್ಗದಾಸಪುರ ವಾರ್ಡ್ matches ಕಗ್ಗದಾಸಪುರ.
 */
export function normalizeWardText(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .toLowerCase()
    .replace(/[.'’`_\-,]/g, " ")
    .replace(/\bward\b|\bnagara?\b/g, " ")
    .replace(/ವಾರ್ಡ್|ವಾರ್ಡು|ವಾರ್ಡ/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Spacing-insensitive comparison key, for "K.R. Pura" === "krpura". */
export function wardKey(s: string): string {
  return normalizeWardText(s).replace(/\s+/g, "");
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
  const qk = wardKey(locality);
  if (qk.length < 3) return null;

  const keysOf = (w: Ward) => [wardKey(w.ward_name), wardKey(w.ward_name_kn)];

  const exact = WARDS.find((w) => keysOf(w).some((k) => k && k === qk));
  if (exact) return exact;

  // Either direction: the resident may write "Kaggadasapura main road" or just
  // part of the ward name, in Latin or in Kannada.
  const partial = WARDS.filter((w) =>
    keysOf(w).some((k) => k.length >= 3 && (k.includes(qk) || qk.includes(k))),
  );
  if (partial.length === 1) return partial[0]!;

  try {
    const data = await loadOfficials();
    for (const [name, block] of Object.entries(data.wards)) {
      const old = block.oldBbmpWard ? wardKey(block.oldBbmpWard) : "";
      if (old && (old === qk || old.includes(qk) || qk.includes(old))) {
        const hit = wardByName(name);
        if (hit) return hit;
      }
    }
  } catch {
    // ignore
  }

  if (partial.length > 1) {
    // Prefer the ward whose name is closest in length to what was written.
    return (
      [...partial].sort(
        (a, b) =>
          Math.abs(wardKey(a.ward_name).length - qk.length) -
          Math.abs(wardKey(b.ward_name).length - qk.length),
      )[0] ?? null
    );
  }

  return null;

}
