import { savedCopy } from '@/core/persistence/savedBooks';
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
  // Read only to render again after a save, which can leave the book and the name unchanged.
  useBookStore((state) => state.savedRevision);

  const saved = savedCopy(book, storedName);
  const name = saved === null ? null : storedName;

  return { name, unsaved: hasUnsavedChanges(book, saved) };
};
