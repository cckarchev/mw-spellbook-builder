import { useState } from 'react';
import { loadSavedBook, saveBook } from '@/core/persistence/savedBooks';
import { useBookStore } from '@/store/useBookStore';

const EMPTY_NAME_ERROR = 'Enter a name for this book.';

/**
 * The Save dialog's state: the draft name, its error, and the overwrite question.
 * `onSaved` runs after a save, to close the dialog.
 */
export const useSaveBook = (onSaved: () => void) => {
  const book = useBookStore((state) => state.book);
  const currentName = useBookStore((state) => state.name);
  const setName = useBookStore((state) => state.setName);

  const [draftName, setDraftName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmingOverwrite, setConfirmingOverwrite] = useState(false);

  const trimmedName = draftName.trim();

  /** Starts a fresh form from the book's current name. */
  const reset = () => {
    setDraftName(currentName ?? '');
    setError(null);
    setConfirmingOverwrite(false);
  };

  const changeName = (value: string) => {
    setDraftName(value);
    setError(null);
  };

  const commit = () => {
    saveBook(trimmedName, book);
    setName(trimmedName);
    setConfirmingOverwrite(false);
    onSaved();
  };

  const requestSave = () => {
    if (trimmedName === '') {
      setError(EMPTY_NAME_ERROR);

      return;
    }

    const { mageId } = book;
    const nameTaken = mageId !== null && loadSavedBook(mageId, trimmedName) !== null;

    if (nameTaken) {
      setConfirmingOverwrite(true);

      return;
    }

    commit();
  };

  const cancelOverwrite = () => {
    setConfirmingOverwrite(false);
  };

  return {
    draftName,
    trimmedName,
    error,
    confirmingOverwrite,
    reset,
    changeName,
    requestSave,
    confirmOverwrite: commit,
    cancelOverwrite,
  };
};
