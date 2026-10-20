import { readDraft } from '@/core/persistence/drafts';
import { savedSpellbooks } from '@/core/persistence/savedSpellbooks';
import { hasCards } from '@/core/rules/spellbookChanges';
import type { Mage, Spellbook } from '@/core/rules/types';
import { summarizeSpellbook } from '@/core/rules/validateSpellbook';
import { mageNote } from '@/core/text/mageNote';
import { cardsById } from '@/data/catalog';

/** What the mage's tile says: its draft's points and how many spellbooks it has saved. */
export const mageNoteFor = (mage: Mage, currentSpellbook: Spellbook): string | null => {
  // The open spellbook is the freshest copy of its mage's draft.
  const draft =
    currentSpellbook.mageId === mage.id
      ? currentSpellbook
      : (readDraft(mage.id)?.spellbook ?? null);
  const hasDraft = draft !== null && hasCards(draft);
  const draftPoints = hasDraft ? summarizeSpellbook(draft, mage, cardsById).points : null;

  return mageNote(draftPoints, savedSpellbooks(mage.id).length);
};
