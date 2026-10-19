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

const VALID_LABEL = 'Valid';
const LABEL_SEPARATOR = ' · ';

const problemsLabel = (count: number): string => (count === 1 ? '1 problem' : `${count} problems`);

/** What is wrong, all of it: "4 over · 2 problems". */
const stateLabel = (summary: BookSummary): string => {
  const parts: string[] = [];

  if (summary.overBy > 0) {
    parts.push(`${summary.overBy} over`);
  }

  if (summary.issues.length > 0) {
    parts.push(problemsLabel(summary.issues.length));
  }

  if (parts.length === 0) {
    return VALID_LABEL;
  }

  return parts.join(LABEL_SEPARATOR);
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
        <span className={styles.state}>{stateLabel(summary)}</span>
      </div>
    </header>
  );
};
