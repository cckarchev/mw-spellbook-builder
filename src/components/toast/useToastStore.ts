import { create } from "zustand";

export const TOAST_DURATION_MS = 2500;

/**
 * For a message the player has to read and act on, such as a failure with a way
 * out.
 */
export const LONG_TOAST_DURATION_MS = 6000;

interface ToastStore {
  message: string | null;
  durationMs: number;
  /** Changes on every show, so a repeated message starts its time over. */
  showId: number;
  show: (message: string, durationMs?: number) => void;
  hide: () => void;
}

/** The one short message the app shows over the page, such as "Link copied". */
export const useToastStore = create<ToastStore>()((set, get) => ({
  message: null,
  durationMs: TOAST_DURATION_MS,
  showId: 0,

  show: (message, durationMs = TOAST_DURATION_MS) => {
    set({ message, durationMs, showId: get().showId + 1 });
  },

  hide: () => {
    set({ message: null });
  },
}));
