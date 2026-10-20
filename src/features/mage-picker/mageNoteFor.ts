import { readDraft } from '@/core/persistence/drafts';
import { savedBooks } from '@/core/persistence/savedBooks';
import { hasCards } from '@/core/rules/bookChanges';
import type { Book, Mage } from '@/core/rules/types';
import { summarizeBook } from '@/core/rules/validateBook';
import { mageNote } from '@/core/text/mageNote';
import { cardsById } from '@/data/catalog';

/** What the mage's tile says: its draft's points and how many books it has saved. */
export const mageNoteFor = (mage: Mage, currentBook: Book): string | null => {
  // The open book is the freshest copy of its mage's draft.
  const draft = currentBook.mageId === mage.id ? currentBook : (readDraft(mage.id)?.book ?? null);
  const hasDraft = draft !== null && hasCards(draft);
  const draftPoints = hasDraft ? summarizeBook(draft, mage, cardsById).points : null;

  return mageNote(draftPoints, savedBooks(mage.id).length);
};
