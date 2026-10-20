import { Dialog } from '@/components/dialog/Dialog';
import type { SavedSpellbook } from '@/core/persistence/savedSpellbooks';
import type { Spellbook } from '@/core/rules/types';
import styles from './LoadDialog.module.css';
import { SavedSpellbookRow } from './saved-spellbook-row/SavedSpellbookRow';

const DEFAULT_TITLE = 'Saved spellbooks';
const OFFICIAL_HEADING = 'Official';
const SAVED_HEADING = 'Saved';
const OFFICIAL_ROW_NAME = 'Official spellbook';

interface LoadDialogProps {
  open: boolean;
  title?: string;
  saved: SavedSpellbook[];
  onLoad: (savedSpellbook: SavedSpellbook) => void;
  /** Shows a delete button on each saved spellbook when given. */
  onDelete?: (name: string) => void;
  /** The mage's official spellbook, listed above the saved ones when given. */
  official?: Spellbook | null;
  onLoadOfficial?: (spellbook: Spellbook) => void;
  onClose: () => void;
}

interface SavedListProps {
  saved: SavedSpellbook[];
  onLoad: (savedSpellbook: SavedSpellbook) => void;
  onDelete?: (name: string) => void;
}

const SavedList = ({ saved, onLoad, onDelete }: SavedListProps) => {
  if (saved.length === 0) {
    return <p className={styles.empty}>No saved spellbooks for this mage yet.</p>;
  }

  return (
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
  );
};

/**
 * The mage's saved spellbooks, to load one, or delete it when `onDelete` is given. With an
 * official spellbook, it comes first in its own section and cannot be deleted.
 */
export const LoadDialog = ({
  open,
  title = DEFAULT_TITLE,
  saved,
  onLoad,
  onDelete,
  official = null,
  onLoadOfficial,
  onClose,
}: LoadDialogProps) => {
  const savedList = <SavedList saved={saved} onLoad={onLoad} onDelete={onDelete} />;

  if (official === null || !onLoadOfficial) {
    return (
      <Dialog open={open} title={title} onClose={onClose} closeButton={true}>
        {savedList}
      </Dialog>
    );
  }

  const officialRow: SavedSpellbook = { name: OFFICIAL_ROW_NAME, spellbook: official };

  return (
    <Dialog open={open} title={title} onClose={onClose} closeButton={true}>
      <section className={styles.section} aria-label={OFFICIAL_HEADING}>
        <h3 className={styles.heading}>{OFFICIAL_HEADING}</h3>
        <ul className={styles.list}>
          <SavedSpellbookRow savedSpellbook={officialRow} onLoad={() => onLoadOfficial(official)} />
        </ul>
      </section>
      <section className={styles.section} aria-label={SAVED_HEADING}>
        <h3 className={styles.heading}>{SAVED_HEADING}</h3>
        {savedList}
      </section>
    </Dialog>
  );
};
