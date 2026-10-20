import { create } from 'zustand';
import {
  migrateLegacySpellbook,
  readCurrentMageId,
  readDraft,
  writeCurrentMageId,
  writeDraft,
} from '@/core/persistence/drafts';
import { saveSpellbook } from '@/core/persistence/savedSpellbooks';
import { emptySpellbook } from '@/core/rules/spellbookChanges';
import type { Spellbook } from '@/core/rules/types';
import { canAddCopy } from '@/core/rules/validateSpellbook';
import { cardsById, spellbookMage } from '@/data/catalog';

interface SpellbookStore {
  /** The spellbook being built, kept as its mage's draft so it survives a reload and a mage switch. */
  spellbook: Spellbook;
  /** The name of the saved spellbook this one was saved as or loaded from, null for none. */
  name: string | null;
  /**
   * Goes up on every save. A save can leave the spellbook and its name as they were, so this is
   * what tells readers of the saved copy to read it again.
   */
  savedRevision: number;
  /** Adds one copy, unless the + control would be disabled for it. */
  addCopy: (cardId: string) => void;
  removeCopy: (cardId: string) => void;
  /** Switches to the mage's draft, or a new spellbook for it; the current spellbook stays as its draft. */
  openMage: (mageId: string) => void;
  loadSpellbook: (spellbook: Spellbook, name?: string | null) => void;
  /**
   * Saves the spellbook under the name, replacing a saved spellbook with that name, and names it.
   * False, with nothing changed, when storage would not keep it.
   */
  save: (name: string) => boolean;
  /** Empties the spellbook and drops its name; the mage stays. */
  clear: () => void;
}

const noSpellbook = (): Spellbook => ({ mageId: null, counts: {} });

interface InitialState {
  spellbook: Spellbook;
  name: string | null;
}

const readInitialState = (): InitialState => {
  migrateLegacySpellbook();

  const mageId = readCurrentMageId();
  const draft = mageId === null ? null : readDraft(mageId);

  return draft ?? { spellbook: noSpellbook(), name: null };
};

const withoutCard = (counts: Spellbook['counts'], cardId: string): Spellbook['counts'] => {
  const remaining = { ...counts };

  delete remaining[cardId];

  return remaining;
};

export const createSpellbookStore = () => {
  const store = create<SpellbookStore>()((set, get) => ({
    ...readInitialState(),
    savedRevision: 0,

    addCopy: (cardId) => {
      const { spellbook } = get();
      const card = cardsById.get(cardId);
      const mage = spellbookMage(spellbook);

      if (!(card && mage && canAddCopy(spellbook, card, mage))) {
        return;
      }

      const count = spellbook.counts[cardId] ?? 0;

      set({ spellbook: { ...spellbook, counts: { ...spellbook.counts, [cardId]: count + 1 } } });
    },

    removeCopy: (cardId) => {
      const { spellbook } = get();
      const count = spellbook.counts[cardId] ?? 0;

      if (count === 0) {
        return;
      }

      const counts =
        count === 1
          ? withoutCard(spellbook.counts, cardId)
          : { ...spellbook.counts, [cardId]: count - 1 };

      set({ spellbook: { ...spellbook, counts } });
    },

    openMage: (mageId) => {
      if (get().spellbook.mageId === mageId) {
        return;
      }

      const draft = readDraft(mageId);

      set(draft ?? { spellbook: emptySpellbook(mageId), name: null });
    },

    loadSpellbook: (spellbook, name = null) => {
      set({ spellbook, name });
    },

    save: (name) => {
      const { spellbook, savedRevision } = get();

      const stored = saveSpellbook(name, spellbook);

      if (!stored) {
        return false;
      }

      set({ name, savedRevision: savedRevision + 1 });

      return true;
    },

    clear: () => {
      const { mageId } = get().spellbook;

      set({ spellbook: { mageId, counts: {} }, name: null });
    },
  }));

  store.subscribe(({ spellbook, name }) => {
    if (spellbook.mageId === null) {
      return;
    }

    writeDraft({ spellbook, name });
    writeCurrentMageId(spellbook.mageId);
  });

  return store;
};

export const useSpellbookStore = createSpellbookStore();
