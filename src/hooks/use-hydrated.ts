import { useEffect, useState } from "react";

/**
 * False during SSR and the first client render, true once React has hydrated
 * and event handlers are actually attached. Use it to gate interactive
 * controls so early taps and keystrokes are never silently discarded.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
