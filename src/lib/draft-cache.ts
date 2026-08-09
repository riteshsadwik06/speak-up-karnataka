/**
 * Session-scoped scratch storage for wizard text, keyed to the route.
 * Anything the user types survives hydration, an accidental navigation or a
 * refresh, and is cleared once the draft has been saved to the database.
 */
const PREFIX = "vicharane:draft:";

export function readDraftCache(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(PREFIX + key) ?? "";
  } catch {
    return "";
  }
}

export function writeDraftCache(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    if (value) window.sessionStorage.setItem(PREFIX + key, value);
    else window.sessionStorage.removeItem(PREFIX + key);
  } catch {
    /* private mode / quota — the in-memory state still holds the text */
  }
}

export function clearDraftCache(...keys: string[]): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of keys) window.sessionStorage.removeItem(PREFIX + key);
  } catch {
    /* nothing to clean up */
  }
}
