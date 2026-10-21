import { vi } from "vitest";

type ChangeListener = (event: MediaQueryListEvent) => void;

/**
 * Stubs window.matchMedia so every query reports `matches`, and lets a test flip it
 * as if the window crossed a breakpoint. Undo it with vi.unstubAllGlobals().
 */
export const stubMatchMedia = (matches: boolean) => {
  const listeners = new Set<ChangeListener>();
  const queries: string[] = [];
  let current = matches;

  const matchMedia = (query: string) => {
    queries.push(query);

    return {
      get matches() {
        return current;
      },
      media: query,
      addEventListener: (_type: "change", listener: ChangeListener) => {
        listeners.add(listener);
      },
      removeEventListener: (_type: "change", listener: ChangeListener) => {
        listeners.delete(listener);
      },
    };
  };

  vi.stubGlobal("matchMedia", matchMedia);

  const setMatches = (next: boolean) => {
    current = next;

    for (const listener of listeners) {
      listener({ matches: next } as MediaQueryListEvent);
    }
  };

  return { setMatches, queries };
};
