import { loadSavedBook } from '@/core/persistence/savedBooks';
import { hasUnsavedChanges } from '@/core/rules/bookChanges';
import { useBookStore } from './useBookStore';

interface BookStatus {
  /** The saved book's name, null when the book has none or its saved copy is gone. */
  name: string | null;
  unsaved: boolean;
}

/**
 * The book's name and whether it differs from its saved copy. Reads storage on each render,
 * which is cheap for books this small and picks up a save or a delete right away.
 */
export const useBookStatus = (): BookStatus => {
  const book = useBookStore((state) => state.book);
  const storedName = useBookStore((state) => state.name);

  const { mageId } = book;
  const saved = storedName !== null && mageId !== null ? loadSavedBook(mageId, storedName) : null;
  const name = saved === null ? null : storedName;

  return { name, unsaved: hasUnsavedChanges(book, saved) };
};
