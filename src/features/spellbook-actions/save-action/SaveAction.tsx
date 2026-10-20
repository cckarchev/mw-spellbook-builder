import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { hasCards } from '@/core/rules/bookChanges';
import { ActionButton } from '@/features/shared/action-button/ActionButton';
import { useBookStatus } from '@/store/useBookStatus';
import { useBookStore } from '@/store/useBookStore';
import { SaveIcon } from '../Icons';
import { SaveDialog } from './save-dialog/SaveDialog';
import { useSaveBook } from './useSaveBook';

/**
 * The Save button, its name dialog, and the question before overwriting a saved book. The
 * button only works when there is something new to keep: cards, with unsaved changes.
 */
export const SaveAction = () => {
  const book = useBookStore((state) => state.book);
  const { unsaved } = useBookStatus();

  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
  };

  const save = useSaveBook(close);

  const hasNothingToSave = !(hasCards(book) && unsaved);

  const open = () => {
    save.reset();
    setIsOpen(true);
  };

  return (
    <>
      <ActionButton icon={<SaveIcon />} label="Save" disabled={hasNothingToSave} onClick={open} />
      <SaveDialog
        open={isOpen && !save.confirmingOverwrite}
        name={save.draftName}
        error={save.error}
        onNameChange={save.changeName}
        onSave={save.requestSave}
        onClose={close}
      />
      <ConfirmDialog
        open={save.confirmingOverwrite}
        title={`Overwrite "${save.trimmedName}"?`}
        body={<p>A saved spellbook with this name already exists and will be replaced.</p>}
        confirmLabel="Overwrite"
        onConfirm={save.confirmOverwrite}
        onCancel={save.cancelOverwrite}
      />
    </>
  );
};
