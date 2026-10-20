import { useId } from 'react';
import { mageImage } from '@/core/catalog/mageImage';
import type { Mage } from '@/core/rules/types';
import { MageStats } from '@/features/shared/mage-stats/MageStats';
import styles from './MageTile.module.css';

interface MageTileProps {
  mage: Mage;
  /** The mage of the spellbook being built. */
  current: boolean;
  /** What the mage already has, such as 'Draft · 87 pts · 3 saved', or null for nothing. */
  note: string | null;
  onSelect: (mage: Mage) => void;
}

export const MageTile = ({ mage, current, note, onSelect }: MageTileProps) => {
  const image = mageImage(mage);
  const noteId = useId();

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.tile}
        aria-current={current ? 'true' : undefined}
        // Named by the mage alone; the note is its description.
        aria-label={mage.name}
        aria-describedby={note === null ? undefined : noteId}
        onClick={() => onSelect(mage)}
      >
        {image ? <img className={styles.image} src={image} alt="" loading="lazy" /> : null}
        <span className={styles.name}>{mage.name}</span>
        {note === null ? null : (
          <span id={noteId} className={styles.note}>
            {note}
          </span>
        )}
      </button>
      {/* A sibling, not inside the tile, so opening the stats never picks the mage. */}
      <MageStats mage={mage} className={styles.stats} />
    </div>
  );
};
