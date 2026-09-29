"use client";

import { useEffect, useState } from "react";

// A per-visitor UI preference remembered in localStorage (same pattern as
// SoundToggle / the star field). Returns `hydrated` so callers can skip
// rendering heavy visuals until the stored value is known -- avoids a
// flash of the default on load and any SSR mismatch.
export function usePersistentChoice<T extends string>(key: string, allowed: readonly T[], fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored && (allowed as readonly string[]).includes(stored)) setValue(stored as T);
    } catch {
      // private mode / blocked storage -- keep the fallback
    }
    setHydrated(true);
    // allowed is a static list per caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function update(next: T) {
    setValue(next);
    try {
      window.localStorage.setItem(key, next);
    } catch {
      // best-effort
    }
  }

  return [value, update, hydrated] as const;
}
