import { mageImage } from '@/core/catalog/mageImage';
import type { Mage } from '@/core/rules/types';
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
    <button
      type="button"
      className={styles.tile}
      aria-current={current ? 'true' : undefined}
      onClick={() => onSelect(mage)}
    >
      {image ? <img className={styles.image} src={image} alt="" loading="lazy" /> : null}
      <span className={styles.name}>{mage.name}</span>
    </button>
  );
};
