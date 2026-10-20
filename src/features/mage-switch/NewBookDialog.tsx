import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import type { Book } from '@/core/rules/types';
import { BookLossNote } from '@/features/shared/BookLossNote';

interface NewBookDialogProps {
  open: boolean;
  /** The book that switching mage would clear. */
  book: Book;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before another mage clears a book that has cards. */
export const NewBookDialog = ({ open, book, onConfirm, onCancel }: NewBookDialogProps) => (
  <ConfirmDialog
    open={open}
    title="Start a new book?"
    body={<BookLossNote book={book} />}
    confirmLabel="Clear and switch"
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);
