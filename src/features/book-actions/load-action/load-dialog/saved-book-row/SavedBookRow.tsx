import type { SavedBook } from '@/core/persistence/savedBooks';
import { summarizeBook } from '@/core/rules/validateBook';
import { bookMage, cardsById } from '@/data/catalog';
import { TrashIcon } from '../../../Icons';
import styles from './SavedBookRow.module.css';

interface SavedBookRowProps {
  savedBook: SavedBook;
  onLoad: (savedBook: SavedBook) => void;
  onDelete: (name: string) => void;
}

/** One saved book: load it by its name, or delete it. */
export const SavedBookRow = ({ savedBook, onLoad, onDelete }: SavedBookRowProps) => {
  const { name, book } = savedBook;
  const mage = bookMage(book);
  const points = mage ? summarizeBook(book, mage, cardsById).points : 0;

  return (
    <li className={styles.row}>
      <button type="button" className={styles.load} onClick={() => onLoad(savedBook)}>
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
