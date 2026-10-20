import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { KEEP_BOOK_HINT } from '@/features/shared/BookLossNote';
import { useBookStore } from '@/store/useBookStore';
import { IncomingIssues } from './incoming-issues/IncomingIssues';
import { NewBookDialog } from './NewBookDialog';
import { useUrlBook } from './useUrlBook';

const REPLACE_BODY = `This link opens another book. Your current book will be replaced. ${KEEP_BOOK_HINT}`;

/**
 * Keeps the book in step with the URL: opens share links, follows the mage in the path,
 * asks before either clears a book with cards, and lists the problems of a linked book.
 */
export const UrlBook = () => {
  const book = useBookStore((state) => state.book);
  const { problems, dismissProblems, pending, confirm, cancel } = useUrlBook();

  return (
    <>
      <ConfirmDialog
        open={pending?.kind === 'askReplace'}
        title="Replace your book?"
        body={<p>{REPLACE_BODY}</p>}
        confirmLabel="Replace"
        onConfirm={confirm}
        onCancel={cancel}
      />
      <NewBookDialog
        open={pending?.kind === 'askNewBook'}
        book={book}
        onConfirm={confirm}
        onCancel={cancel}
      />
      <IncomingIssues problems={problems} onDismiss={dismissProblems} />
    </>
  );
};
