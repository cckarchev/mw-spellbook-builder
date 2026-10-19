import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { KEEP_BOOK_HINT } from '@/features/shared/BookLossNote';
import { IncomingIssues } from './incoming-issues/IncomingIssues';
import { useIncomingBook } from './useIncomingBook';

const REPLACE_BODY = `This link opens another book. Your current book will be replaced. ${KEEP_BOOK_HINT}`;

/** Opens a book from a share link: asks before replacing a book in progress, then lists its problems. */
export const IncomingLink = () => {
  const { problems, dismiss, pendingReplace, confirmReplace, cancelReplace } = useIncomingBook();

  return (
    <>
      <ConfirmDialog
        open={pendingReplace !== null}
        title="Replace your book?"
        body={<p>{REPLACE_BODY}</p>}
        confirmLabel="Replace"
        onConfirm={confirmReplace}
        onCancel={cancelReplace}
      />
      <IncomingIssues problems={problems} onDismiss={dismiss} />
    </>
  );
};
