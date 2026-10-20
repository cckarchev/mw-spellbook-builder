import styles from './BarList.module.css';

export interface BarRow {
  label: string;
  value: number;
  /** The part of the value drawn in the warning color, such as points above the trained rate. */
  highlight?: number;
}

interface BarListProps {
  rows: BarRow[];
  /** Names the list for assistive tech. */
  label: string;
}

const FULL_WIDTH_PERCENT = 100;

const percentOf = (part: number, whole: number): string => {
  if (whole === 0) {
    return '0%';
  }

  return `${(part / whole) * FULL_WIDTH_PERCENT}%`;
};

/** Horizontal bars, each scaled to the largest value in the list. */
export const BarList = ({ rows, label }: BarListProps) => {
  const largest = Math.max(0, ...rows.map((row) => row.value));

  return (
    <ul className={styles.list} aria-label={label}>
      {rows.map((row) => (
        <li key={row.label} className={styles.row}>
          <span className={styles.label}>{row.label}</span>
          <span className={styles.track}>
            <span
              data-bar=""
              className={styles.bar}
              style={{ width: percentOf(row.value, largest) }}
            >
              {row.highlight ? (
                <span
                  className={styles.highlight}
                  style={{ width: percentOf(row.highlight, row.value) }}
                />
              ) : null}
            </span>
          </span>
          <span className={styles.value}>{row.value}</span>
        </li>
      ))}
    </ul>
  );
};
