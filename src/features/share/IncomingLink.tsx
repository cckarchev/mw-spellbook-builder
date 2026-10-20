import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { bookMage } from '@/data/catalog';
import { CURRENT_MAGE_FALLBACK, KEEP_BOOK_HINT } from '@/features/shared/BookLossNote';
import { IncomingIssues } from './incoming-issues/IncomingIssues';
import { useIncomingBook } from './useIncomingBook';

const replaceBody = (mageName: string) =>
  `This link opens another book. Your ${mageName} book will be replaced. ${KEEP_BOOK_HINT}`;

/** Opens a book from a share link: asks before replacing a book in progress, then lists its problems. */
export const IncomingLink = () => {
  const { problems, dismiss, pendingReplace, confirmReplace, cancelReplace } = useIncomingBook();
  const replacedMage = pendingReplace ? bookMage(pendingReplace.book) : undefined;
  const replacedMageName = replacedMage?.name ?? CURRENT_MAGE_FALLBACK;

  return (
    <>
      <ConfirmDialog
        open={pendingReplace !== null}
        title="Replace your book?"
        body={<p>{replaceBody(replacedMageName)}</p>}
        confirmLabel="Replace"
        onConfirm={confirmReplace}
        onCancel={cancelReplace}
      />
      <IncomingIssues problems={problems} onDismiss={dismiss} />
    </>
  );
};
