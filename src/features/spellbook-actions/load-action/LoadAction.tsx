import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { ActionButton } from '@/features/shared/action-button/ActionButton';
import { LoadIcon } from '../Icons';
import { LoadDialog } from './load-dialog/LoadDialog';
import { useSavedSpellbooks } from './useSavedSpellbooks';

/** The Load button, the saved spellbooks, and the questions before replacing or deleting one. */
export const LoadAction = () => {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
  };

  const spellbooks = useSavedSpellbooks(close);
  const isConfirming = spellbooks.pendingLoad !== null || spellbooks.pendingDelete !== null;

  const open = () => {
    spellbooks.refresh();
    setIsOpen(true);
  };

  return (
    <>
      <ActionButton icon={<LoadIcon />} label="Load" onClick={open} />
      {/* The list steps aside while a confirm asks, so only one dialog is open at a time. */}
      <LoadDialog
        open={isOpen && !isConfirming}
        saved={spellbooks.saved}
        onLoad={spellbooks.requestLoad}
        onDelete={spellbooks.requestDelete}
        onClose={close}
      />
      <ConfirmDialog
        open={spellbooks.pendingLoad !== null}
        title="Replace current spellbook?"
        body={<p>Unsaved changes will be lost.</p>}
        confirmLabel="Replace"
        onConfirm={spellbooks.confirmLoad}
        onCancel={spellbooks.cancelLoad}
      />
      <ConfirmDialog
        open={spellbooks.pendingDelete !== null}
        title={`Delete "${spellbooks.pendingDelete ?? ''}"?`}
        body={<p>This saved spellbook will be removed permanently.</p>}
        confirmLabel="Delete"
        onConfirm={spellbooks.confirmDelete}
        onCancel={spellbooks.cancelDelete}
      />
    </>
  );
};
