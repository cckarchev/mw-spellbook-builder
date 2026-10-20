import { Dialog } from '@/components/dialog/Dialog';
import type { SavedSpellbook } from '@/core/persistence/savedSpellbooks';
import styles from './LoadDialog.module.css';
import { SavedSpellbookRow } from './saved-spellbook-row/SavedSpellbookRow';

interface LoadDialogProps {
  open: boolean;
  saved: SavedSpellbook[];
  onLoad: (savedSpellbook: SavedSpellbook) => void;
  onDelete: (name: string) => void;
  onClose: () => void;
}

/** The mage's saved spellbooks, to load one or delete it. */
export const LoadDialog = ({ open, saved, onLoad, onDelete, onClose }: LoadDialogProps) => (
  <Dialog open={open} title="Saved spellbooks" onClose={onClose} closeButton={true}>
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
