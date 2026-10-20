import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { hasCards } from '@/core/rules/bookChanges';
import { ActionButton } from '@/features/shared/action-button/ActionButton';
import { BookLossNote } from '@/features/shared/BookLossNote';
import { useBookStatus } from '@/store/useBookStatus';
import { useBookStore } from '@/store/useBookStore';
import { TrashIcon } from '../Icons';

/** The Clear button: empties the book and drops its name, after a confirm when unsaved work would go. */
export const ClearAction = () => {
  const book = useBookStore((state) => state.book);
  const name = useBookStore((state) => state.name);
  const clear = useBookStore((state) => state.clear);
  const { unsaved } = useBookStatus();

  const [isConfirming, setIsConfirming] = useState(false);

  const hasNothingToClear = !hasCards(book) && name === null;

  const requestClear = () => {
    if (unsaved) {
      setIsConfirming(true);

      return;
    }

    clear();
  };

  const confirmClear = () => {
    clear();
    setIsConfirming(false);
  };

  const cancelClear = () => {
    setIsConfirming(false);
  };

  return (
    <>
      <ActionButton
        icon={<TrashIcon />}
        label="Clear"
        disabled={hasNothingToClear}
        onClick={requestClear}
      />
      <ConfirmDialog
        open={isConfirming}
        title="Clear this spellbook?"
        body={<BookLossNote book={book} />}
        confirmLabel="Clear"
        onConfirm={confirmClear}
        onCancel={cancelClear}
      />
    </>
  );
};
