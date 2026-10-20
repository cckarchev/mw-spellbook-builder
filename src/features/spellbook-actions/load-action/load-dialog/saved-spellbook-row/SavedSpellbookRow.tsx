import type { SavedSpellbook } from '@/core/persistence/savedSpellbooks';
import { summarizeSpellbook } from '@/core/rules/validateSpellbook';
import { cardsById, spellbookMage } from '@/data/catalog';
import { TrashIcon } from '../../../Icons';
import styles from './SavedSpellbookRow.module.css';

interface SavedSpellbookRowProps {
  savedSpellbook: SavedSpellbook;
  onLoad: (savedSpellbook: SavedSpellbook) => void;
  onDelete: (name: string) => void;
}

/** One saved spellbook: load it by its name, or delete it. */
export const SavedSpellbookRow = ({ savedSpellbook, onLoad, onDelete }: SavedSpellbookRowProps) => {
  const { name, spellbook } = savedSpellbook;
  const mage = spellbookMage(spellbook);
  const points = mage ? summarizeSpellbook(spellbook, mage, cardsById).points : 0;

  return (
    <li className={styles.row}>
      <button type="button" className={styles.load} onClick={() => onLoad(savedSpellbook)}>
        <span className={styles.name}>{name}</span>
        <span className={styles.points}>{points} pts</span>
      </button>
      <button
        type="button"
        className={styles.delete}
        aria-label={`Delete ${name}`}
        title={`Delete ${name}`}
        onClick={() => onDelete(name)}
      >
        <TrashIcon />
      </button>
    </li>
  );
};
