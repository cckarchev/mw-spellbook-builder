import { useCallback, useSyncExternalStore } from "react";

/**
 * Wide enough for the catalog and the spellbook side by side. Keep in step with
 * --desktop-up.
 */
export const DESKTOP_QUERY = "(min-width: 1024px)";

const NO_MATCH = false;

const hasMatchMedia = (): boolean => typeof window.matchMedia === "function";

const unsubscribeNothing = () => {
  // Nothing was subscribed without matchMedia.
};

/**
 * Whether the media query matches now, following it as the window changes.
 * False without matchMedia.
 */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!hasMatchMedia()) {
        return unsubscribeNothing;
      }

      const mediaQuery = window.matchMedia(query);

      mediaQuery.addEventListener("change", onChange);

      return () => {
        mediaQuery.removeEventListener("change", onChange);
      };
    },
    [query],
  );

  const getSnapshot = (): boolean => {
    if (!hasMatchMedia()) {
      return NO_MATCH;
    }

    return window.matchMedia(query).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot);
};

/** Whether the builder shows the catalog and the spellbook side by side. */
export const useIsDesktop = (): boolean => useMediaQuery(DESKTOP_QUERY);
