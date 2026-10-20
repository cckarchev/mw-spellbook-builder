import { Dialog } from '@/components/dialog/Dialog';
import type { SavedSpellbook } from '@/core/persistence/savedSpellbooks';
import styles from './LoadDialog.module.css';
import { SavedSpellbookRow } from './saved-spellbook-row/SavedSpellbookRow';

const DEFAULT_TITLE = 'Saved spellbooks';

interface LoadDialogProps {
  open: boolean;
  title?: string;
  saved: SavedSpellbook[];
  onLoad: (savedSpellbook: SavedSpellbook) => void;
  /** Shows a delete button on each saved spellbook when given. */
  onDelete?: (name: string) => void;
  onClose: () => void;
}

/** The mage's saved spellbooks, to load one, or delete it when `onDelete` is given. */
export const LoadDialog = ({
  open,
  title = DEFAULT_TITLE,
  saved,
  onLoad,
  onDelete,
  onClose,
}: LoadDialogProps) => (
  <Dialog open={open} title={title} onClose={onClose} closeButton={true}>
    {saved.length === 0 ? (
      <p className={styles.empty}>No saved spellbooks for this mage yet.</p>
    ) : (
      <ul className={styles.list}>
        {saved.map((savedSpellbook) => (
          <SavedSpellbookRow
            key={savedSpellbook.name}
            savedSpellbook={savedSpellbook}
            onLoad={onLoad}
            onDelete={onDelete}
          />
        ))}
      </ul>
    )}
  </Dialog>
);
