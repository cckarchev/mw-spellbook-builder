import { create } from 'zustand';

interface ToastStore {
  message: string | null;
  /** Changes on every show, so a repeated message starts its time over. */
  showId: number;
  show: (message: string) => void;
  hide: () => void;
}

/** The one short message the app shows over the page, such as "Link copied". */
export const useToastStore = create<ToastStore>()((set, get) => ({
  message: null,
  showId: 0,

  show: (message) => {
    set({ message, showId: get().showId + 1 });
  },

  hide: () => {
    set({ message: null });
  },
}));
