import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { ActionButton } from '@/features/shared/action-button/ActionButton';
import { SaveIcon } from '../Icons';
import { SaveDialog } from './save-dialog/SaveDialog';
import { useSaveBook } from './useSaveBook';

/** The Save button, its name dialog, and the question before overwriting a saved book. */
export const SaveAction = () => {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
  };

  const save = useSaveBook(close);

  const open = () => {
    save.reset();
    setIsOpen(true);
  };

  return (
    <>
      <ActionButton icon={<SaveIcon />} label="Save" onClick={open} />
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
        body={<p>A saved book with this name already exists and will be replaced.</p>}
        confirmLabel="Overwrite"
        onConfirm={save.confirmOverwrite}
        onCancel={save.cancelOverwrite}
      />
    </>
  );
};
