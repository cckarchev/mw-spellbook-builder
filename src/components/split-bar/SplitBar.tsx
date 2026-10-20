import type { CountRow } from '@/core/stats/types';
import styles from './SplitBar.module.css';

interface SplitBarProps {
  parts: CountRow[];
  /** Names the bar for assistive tech. */
  label: string;
}

const PART_SEPARATOR = ' · ';

/** One bar split by count, with each part's label and count under it. */
export const SplitBar = ({ parts, label }: SplitBarProps) => {
  const caption = parts.map((part) => `${part.label} ${part.count}`).join(PART_SEPARATOR);

  return (
    <div className={styles.split}>
      <div className={styles.bar} role="img" aria-label={`${label}: ${caption}`}>
        {parts.map((part) => (
          <span key={part.label} className={styles.part} style={{ flexGrow: part.count }} />
        ))}
      </div>
      <p className={styles.caption}>{caption}</p>
    </div>
  );
};
