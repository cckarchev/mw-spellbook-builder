import type { CSSProperties } from 'react';
import type { ManaCurve as ManaCurveStats, ManaSources } from '@/core/stats/types';
import styles from './ManaCurve.module.css';

interface ManaCurveProps {
  curve: ManaCurveStats;
  mageName: string;
  sources: ManaSources;
}

interface CurveColumn {
  label: string;
  count: number;
  variable: boolean;
}

const VARIABLE_LABEL = 'X';
/** The bar's share of the tallest bar, from 0 to 1. */
const fillOf = (count: number, largest: number): number => {
  if (largest === 0) {
    return 0;
  }

  return count / largest;
};

const sourcesLine = (sources: ManaSources): string => {
  const cards = sources.cards.map((source) => `${source.name} ×${source.count}`).join(', ');

  return `Mana sources in book: ${cards}: up to +${sources.total}`;
};

const channelingSentence = (curve: ManaCurveStats, mageName: string): string => {
  const { channeling, atOrBelow, above } = curve;

  return `${mageName} channels ${channeling} per round. ${atOrBelow} cards cost ${channeling} or less, ${above} cost more.`;
};

/** Copies per mana cost, with a dashed mark after the column the mage's channeling falls in. */
export const ManaCurve = ({ curve, mageName, sources }: ManaCurveProps) => {
  const columns: CurveColumn[] = [
    ...curve.buckets.map((bucket) => ({ ...bucket, variable: false })),
    { label: VARIABLE_LABEL, count: curve.variable, variable: true },
  ];
  const largest = Math.max(...columns.map((column) => column.count));
  const markerStyle = {
    '--curve-columns': columns.length,
    '--channeling-columns': curve.channelingBucket + 1,
  } as CSSProperties;

  return (
    <div className={styles.curve}>
      <div className={styles.chart} style={markerStyle}>
        <ol className={styles.columns} aria-label="Cards per mana cost">
          {columns.map((column) => (
            <li
              key={column.label}
              className={column.variable ? styles.variableColumn : styles.column}
              aria-label={`${column.label}: ${column.count}`}
            >
              <span className={styles.stack}>
                <span className={styles.count}>{column.count}</span>
                <span
                  className={styles.bar}
                  style={{ '--fill': fillOf(column.count, largest) } as CSSProperties}
                />
              </span>
              <span className={styles.label}>{column.label}</span>
            </li>
          ))}
        </ol>
        <span className={styles.channeling} aria-hidden="true" />
      </div>
      <p className={styles.note}>
        <span className={styles.legend} aria-hidden="true" /> {channelingSentence(curve, mageName)}
      </p>
      {sources.total > 0 ? <p className={styles.note}>{sourcesLine(sources)}</p> : null}
    </div>
  );
};
