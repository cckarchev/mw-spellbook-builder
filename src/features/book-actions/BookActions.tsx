import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { ActionButton } from '@/features/shared/action-button/ActionButton';
import styles from './BookActions.module.css';
import { SaveIcon } from './Icons';
import { SaveDialog } from './save-dialog/SaveDialog';
import { useSaveBook } from './save-dialog/useSaveBook';

/** Save the book under a name, load a saved one, or clear it. */
export const BookActions = () => {
  const [isSaveOpen, setIsSaveOpen] = useState(false);

  const closeSave = () => {
    setIsSaveOpen(false);
  };

  const save = useSaveBook(closeSave);

  const openSave = () => {
    save.reset();
    setIsSaveOpen(true);
  };

  return (
    <section className={styles.actions} aria-label="Saved books">
      <ActionButton icon={<SaveIcon />} label="Save" onClick={openSave} />
      <SaveDialog
        open={isSaveOpen && !save.confirmingOverwrite}
        name={save.draftName}
        error={save.error}
        onNameChange={save.changeName}
        onSave={save.requestSave}
        onClose={closeSave}
      />
      <ConfirmDialog
        open={save.confirmingOverwrite}
        title={`Overwrite "${save.trimmedName}"?`}
        body={<p>A saved book with this name already exists and will be replaced.</p>}
        confirmLabel="Overwrite"
        onConfirm={save.confirmOverwrite}
        onCancel={save.cancelOverwrite}
      />
    </section>
  );
};
