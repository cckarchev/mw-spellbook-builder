import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { ActionButton } from '@/features/shared/action-button/ActionButton';
import { LoadIcon } from '../Icons';
import { LoadDialog } from './load-dialog/LoadDialog';
import { useSavedBooks } from './useSavedBooks';

/** The Load button, the saved books, and the questions before replacing or deleting one. */
export const LoadAction = () => {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
  };

  const books = useSavedBooks(close);
  const isConfirming = books.pendingLoad !== null || books.pendingDelete !== null;

  const open = () => {
    books.refresh();
    setIsOpen(true);
  };

  return (
    <>
      <ActionButton icon={<LoadIcon />} label="Load" onClick={open} />
      {/* The list steps aside while a confirm asks, so only one dialog is open at a time. */}
      <LoadDialog
        open={isOpen && !isConfirming}
        saved={books.saved}
        onLoad={books.requestLoad}
        onDelete={books.requestDelete}
        onClose={close}
      />
      <ConfirmDialog
        open={books.pendingLoad !== null}
        title="Replace current spellbook?"
        body={<p>Unsaved changes will be lost.</p>}
        confirmLabel="Replace"
        onConfirm={books.confirmLoad}
        onCancel={books.cancelLoad}
      />
      <ConfirmDialog
        open={books.pendingDelete !== null}
        title={`Delete "${books.pendingDelete ?? ''}"?`}
        body={<p>This saved spellbook will be removed permanently.</p>}
        confirmLabel="Delete"
        onConfirm={books.confirmDelete}
        onCancel={books.cancelDelete}
      />
    </>
  );
};
