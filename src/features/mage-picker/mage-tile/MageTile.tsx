import { mageImage } from '@/core/catalog/mageImage';
import type { Mage } from '@/core/rules/types';
import { MageStats } from '@/features/shared/mage-stats/MageStats';
import styles from './MageTile.module.css';

interface MageTileProps {
  mage: Mage;
  /** The mage of the book being built. */
  current: boolean;
  onSelect: (mage: Mage) => void;
}

export const MageTile = ({ mage, current, onSelect }: MageTileProps) => {
  const image = mageImage(mage);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.tile}
        aria-current={current ? 'true' : undefined}
        onClick={() => onSelect(mage)}
      >
        {image ? <img className={styles.image} src={image} alt="" loading="lazy" /> : null}
        <span className={styles.name}>{mage.name}</span>
      </button>
      {/* A sibling, not inside the tile, so opening the stats never picks the mage. */}
      <MageStats mage={mage} className={styles.stats} />
    </div>
  );
};
