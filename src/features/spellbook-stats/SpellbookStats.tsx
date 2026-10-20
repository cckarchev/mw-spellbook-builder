import { BarList, type BarRow } from '@/components/bar-list/BarList';
import { SplitBar } from '@/components/split-bar/SplitBar';
import type { Mage, Spellbook } from '@/core/rules/types';
import { schoolTotal, spellbookStats } from '@/core/stats/spellbookStats';
import type { SchoolPoints } from '@/core/stats/types';
import { cardsById } from '@/data/catalog';
import { AttacksStat } from './AttacksStat';
import { countBars } from './countBars';
import { ManaCurve } from './mana-curve/ManaCurve';
import styles from './SpellbookStats.module.css';
import { StatNote } from './stat-note/StatNote';
import { StatSection } from './stat-section/StatSection';

interface SpellbookStatsProps {
  spellbook: Spellbook;
  mage: Mage;
}

const schoolBars = (schools: SchoolPoints[]): BarRow[] =>
  schools.map((row) => ({
    label: row.school,
    value: schoolTotal(row),
    highlight: row.extraRatePoints,
  }));

/** The numbers behind the spellbook: mana curve, counts, points by school and attacks. */
export const SpellbookStats = ({ spellbook, mage }: SpellbookStatsProps) => {
  const stats = spellbookStats(spellbook, mage, cardsById);

  if (stats.cardCount === 0) {
    return <p className={styles.empty}>Add cards to see stats.</p>;
  }

  return (
    <div className={styles.stats}>
      <StatSection title="Mana curve">
        <ManaCurve curve={stats.manaCurve} sources={stats.manaSources} />
      </StatSection>
      <StatSection title="By type">
        <BarList rows={countBars(stats.types)} label="Cards by type" />
      </StatSection>
      <StatSection title="Points by school">
        <BarList rows={schoolBars(stats.schools)} label="Points by school" />
        {stats.untrainedPoints > 0 ? (
          <StatNote>
            <span className={styles.warningKey} aria-hidden="true" /> {stats.untrainedPoints} of{' '}
            {mage.budget} points go to untrained schools.
          </StatNote>
        ) : null}
      </StatSection>
      <StatSection title="By level">
        <BarList rows={countBars(stats.levels)} label="Cards by level" />
      </StatSection>
      <StatSection title="Actions">
        <SplitBar parts={stats.actions} label="Actions" />
      </StatSection>
      <StatSection title="Attacks">
        <AttacksStat attacks={stats.attacks} />
      </StatSection>
    </div>
  );
};
