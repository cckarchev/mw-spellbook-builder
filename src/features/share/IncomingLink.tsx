import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { spellbookMage } from '@/data/catalog';
import { CURRENT_MAGE_FALLBACK, KEEP_SPELLBOOK_HINT } from '@/features/shared/SpellbookLossNote';
import { IncomingIssues } from './incoming-issues/IncomingIssues';
import { useIncomingSpellbook } from './useIncomingSpellbook';

const replaceBody = (mageName: string) =>
  `This link opens another spellbook. Your ${mageName} spellbook will be replaced. ${KEEP_SPELLBOOK_HINT}`;

/** Opens a spellbook from a share link: asks before replacing a spellbook in progress, then lists its problems. */
export const IncomingLink = () => {
  const { problems, dismiss, pendingReplace, confirmReplace, cancelReplace } =
    useIncomingSpellbook();
  const replacedMage = pendingReplace ? spellbookMage(pendingReplace.spellbook) : undefined;
  const replacedMageName = replacedMage?.name ?? CURRENT_MAGE_FALLBACK;

  return (
    <>
      <ConfirmDialog
        open={pendingReplace !== null}
        title="Replace your spellbook?"
        body={<p>{replaceBody(replacedMageName)}</p>}
        confirmLabel="Replace"
        onConfirm={confirmReplace}
        onCancel={cancelReplace}
      />
      <IncomingIssues problems={problems} onDismiss={dismiss} />
    </>
  );
};
