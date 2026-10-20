import { type FormEvent, useId } from 'react';
import { Button } from '@/components/button/Button';
import { Dialog } from '@/components/dialog/Dialog';
import styles from './SaveDialog.module.css';

/** Long enough for "Tourney 2026 Fire Wizard", short enough for the header line. */
const NAME_MAX_LENGTH = 40;

interface SaveDialogProps {
  open: boolean;
  name: string;
  error: string | null;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onClose: () => void;
}

/** Asks for the name to save the book under. */
export const SaveDialog = ({
  open,
  name,
  error,
  onNameChange,
  onSave,
  onClose,
}: SaveDialogProps) => {
  const inputId = useId();
  const errorId = useId();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave();
  };

  return (
    <Dialog open={open} title="Save book" onClose={onClose} closeButton={true}>
      <form className={styles.form} onSubmit={submit} noValidate={true}>
        <label className={styles.label} htmlFor={inputId}>
          Book name
        </label>
        <input
          id={inputId}
          type="text"
          className={styles.input}
          value={name}
          maxLength={NAME_MAX_LENGTH}
          autoComplete="off"
          aria-invalid={error !== null}
          aria-describedby={error === null ? undefined : errorId}
          onChange={(event) => onNameChange(event.target.value)}
        />
        {error === null ? null : (
          <p id={errorId} className={styles.error}>
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" className={styles.save}>
          Save
        </Button>
      </form>
    </Dialog>
  );
};
