import { useState } from 'react';
import { deleteSavedBook, type SavedBook, savedBooks } from '@/core/persistence/savedBooks';
import { useBookStatus } from '@/store/useBookStatus';
import { useBookStore } from '@/store/useBookStore';

/**
 * The mage's saved books for the Load dialog, with loading and deleting them behind their
 * confirms. `onLoaded` runs after a saved book replaces the current one.
 */
export const useSavedBooks = (onLoaded: () => void) => {
  const book = useBookStore((state) => state.book);
  const currentName = useBookStore((state) => state.name);
  const loadBook = useBookStore((state) => state.loadBook);
  const { unsaved } = useBookStatus();

  const [saved, setSaved] = useState<SavedBook[]>([]);
  const [pendingLoad, setPendingLoad] = useState<SavedBook | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const readSaved = () => {
    setSaved(book.mageId === null ? [] : savedBooks(book.mageId));
  };

  /** Re-reads the saved books and drops any pending confirm. */
  const refresh = () => {
    readSaved();
    setPendingLoad(null);
    setPendingDelete(null);
  };

  const load = (savedBook: SavedBook) => {
    loadBook(savedBook.book, savedBook.name);
    setPendingLoad(null);
    onLoaded();
  };

  const requestLoad = (savedBook: SavedBook) => {
    if (unsaved) {
      setPendingLoad(savedBook);

      return;
    }

    load(savedBook);
  };

  const confirmLoad = () => {
    if (pendingLoad === null) {
      return;
    }

    load(pendingLoad);
  };

  const cancelLoad = () => {
    setPendingLoad(null);
  };

  const confirmDelete = () => {
    if (pendingDelete === null || book.mageId === null) {
      return;
    }

    deleteSavedBook(book.mageId, pendingDelete);

    // The book stays, as a draft that no longer comes from a saved book.
    if (pendingDelete === currentName) {
      loadBook(book, null);
    }

    setPendingDelete(null);
    readSaved();
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  return {
    saved,
    pendingLoad,
    pendingDelete,
    refresh,
    requestLoad,
    confirmLoad,
    cancelLoad,
    requestDelete: setPendingDelete,
    confirmDelete,
    cancelDelete,
  };
};
