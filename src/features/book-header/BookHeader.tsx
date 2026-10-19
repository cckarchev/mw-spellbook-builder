import { Link } from 'react-router-dom';
import type { Mage, School } from '@/core/rules/types';
import type { BookSummary } from '@/core/rules/validateBook';
import styles from './BookHeader.module.css';

interface BookHeaderProps {
  mage: Mage;
  schoolChoice: School | null;
  summary: BookSummary;
}

type BookState = 'valid' | 'over' | 'invalid';

const bookState = (summary: BookSummary): BookState => {
  if (summary.overBy > 0) {
    return 'over';
  }

  if (summary.issues.length > 0) {
    return 'invalid';
  }

  return 'valid';
};

const STATE_LABELS: Record<BookState, (summary: BookSummary) => string> = {
  valid: () => 'Valid',
  over: (summary) => `${summary.overBy} over`,
  invalid: (summary) =>
    summary.issues.length === 1 ? '1 problem' : `${summary.issues.length} problems`,
};

/** The mage, the points used out of the budget, and whether the book is valid. */
export const BookHeader = ({ mage, schoolChoice, summary }: BookHeaderProps) => {
  const state = bookState(summary);
  const mageLabel = schoolChoice === null ? mage.name : `${mage.name} (${schoolChoice})`;

  return (
    <header className={styles.header} data-state={state}>
      <div className={styles.mage}>
        <span className={styles.mageName}>{mageLabel}</span>
        <Link className={styles.change} to="/">
          Change mage
        </Link>
      </div>
      <div className={styles.score}>
        <span className={styles.points}>
          {summary.points} / {summary.budget}
        </span>
        <span className={styles.state}>{STATE_LABELS[state](summary)}</span>
      </div>
    </header>
  );
};
