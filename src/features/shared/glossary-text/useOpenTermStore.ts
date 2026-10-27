import { create } from "zustand";

interface OpenTermStore {
  /** The glossary term whose definition is showing, or null. */
  openId: string | null;
  toggle: (id: string) => void;
  /** Closes the term, if it is the open one. */
  close: (id: string) => void;
}

/**
 * Shared by every glossary term on the page, so opening one closes the others.
 */
export const useOpenTermStore = create<OpenTermStore>()((set, get) => ({
  openId: null,

  toggle: (id) => {
    const isOpen = get().openId === id;

    set({ openId: isOpen ? null : id });
  },

  close: (id) => {
    if (get().openId === id) {
      set({ openId: null });
    }
  },
}));
