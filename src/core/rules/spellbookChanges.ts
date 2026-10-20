import type { Spellbook } from './types';

/** Whether a spellbook holds at least one card; a spellbook with only a mage counts as empty. */
export const hasCards = (spellbook: Spellbook): boolean => Object.keys(spellbook.counts).length > 0;

/** Copies of every card in the spellbook. */
export const copyCount = (spellbook: Spellbook): number =>
  Object.values(spellbook.counts).reduce((total, count) => total + count, 0);

/** The same mage and copies, in any order. */
export const sameSpellbook = (first: Spellbook, second: Spellbook): boolean => {
  const firstEntries = Object.entries(first.counts);
  const sameCardCount = firstEntries.length === Object.keys(second.counts).length;
  const sameCopies = firstEntries.every(([cardId, count]) => second.counts[cardId] === count);

  return first.mageId === second.mageId && sameCardCount && sameCopies;
};

/** A new spellbook for the mage, with no cards yet. */
export const emptySpellbook = (mageId: string): Spellbook => ({ mageId, counts: {} });

/**
 * Whether the spellbook would lose work if replaced. `saved` is the saved copy of the spellbook's
 * name, null when it has no name: then any card counts as unsaved work.
 */
export const hasUnsavedChanges = (spellbook: Spellbook, saved: Spellbook | null): boolean => {
  if (saved === null) {
    return hasCards(spellbook);
  }

  return !sameSpellbook(spellbook, saved);
};
