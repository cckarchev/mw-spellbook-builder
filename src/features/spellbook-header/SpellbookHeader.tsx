import type { Mage } from '@/core/rules/types';
import type { SpellbookSummary } from '@/core/rules/validateSpellbook';
import { plural } from '@/core/text/plural';
import { MageStats } from '@/features/shared/mage-stats/MageStats';
import styles from './SpellbookHeader.module.css';

interface SpellbookHeaderProps {
  mage: Mage;
  summary: SpellbookSummary;
  /** The saved spellbook's name, null for a spellbook never saved. */
  name: string | null;
  unsaved: boolean;
}

type SpellbookState = 'valid' | 'over' | 'invalid';

const spellbookState = (summary: SpellbookSummary): SpellbookState => {
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

/** What is wrong, all of it: "4 over · 2 problems". */
const stateLabel = (summary: SpellbookSummary): string => {
  const parts: string[] = [];

  if (summary.overBy > 0) {
    parts.push(`${summary.overBy} over`);
  }

  if (summary.issues.length > 0) {
    parts.push(plural(summary.issues.length, 'problem', 'problems'));
  }

  if (parts.length === 0) {
    return VALID_LABEL;
  }

  return parts.join(LABEL_SEPARATOR);
};

const UNSAVED_LABEL = 'unsaved';

/** The mage, the saved spellbook's name, the points used out of the budget, and whether the spellbook is valid. */
export const SpellbookHeader = ({ mage, summary, name, unsaved }: SpellbookHeaderProps) => {
  const state = spellbookState(summary);

  return (
    <section className={styles.header} data-state={state} aria-label="Spellbook summary">
      <div className={styles.titles}>
        <h1 className={styles.mageName}>
          <MageStats mage={mage} label={mage.name} className={styles.mageButton} />
        </h1>
        {name === null ? null : (
          <p className={styles.spellbookName}>
            <span className={styles.nameText}>{name}</span>
            {unsaved ? <span className={styles.unsaved}>{UNSAVED_LABEL}</span> : null}
          </p>
        )}
      </div>
      <div className={styles.score}>
        <span className={styles.points}>
          {summary.points} / {summary.budget}
        </span>
        <span className={styles.state}>{stateLabel(summary)}</span>
      </div>
    </section>
  );
};
