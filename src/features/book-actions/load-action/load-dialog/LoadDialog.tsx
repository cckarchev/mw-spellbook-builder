import { Dialog } from '@/components/dialog/Dialog';
import type { SavedBook } from '@/core/persistence/savedBooks';
import styles from './LoadDialog.module.css';
import { SavedBookRow } from './saved-book-row/SavedBookRow';

interface LoadDialogProps {
  open: boolean;
  saved: SavedBook[];
  onLoad: (savedBook: SavedBook) => void;
  onDelete: (name: string) => void;
  onClose: () => void;
}

/** The mage's saved books, to load one or delete it. */
export const LoadDialog = ({ open, saved, onLoad, onDelete, onClose }: LoadDialogProps) => (
  <Dialog open={open} title="Saved books" onClose={onClose} closeButton={true}>
    {saved.length === 0 ? (
      <p className={styles.empty}>No saved books for this mage yet.</p>
    ) : (
      <ul className={styles.list}>
        {saved.map((savedBook) => (
          <SavedBookRow
            key={savedBook.name}
            savedBook={savedBook}
            onLoad={onLoad}
            onDelete={onDelete}
          />
        ))}
      </ul>
    )}
  </Dialog>
);
