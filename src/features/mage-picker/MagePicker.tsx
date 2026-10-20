import { useNavigate } from 'react-router-dom';
import { builderPath } from '@/core/routing/paths';
import type { Mage } from '@/core/rules/types';
import { mages } from '@/data/catalog';
import { useBookStore } from '@/store/useBookStore';
import styles from './MagePicker.module.css';
import { MageTile } from './mage-tile/MageTile';

/**
 * Every mage, to start or go back to a book. Picking one opens its builder, which switches
 * the book to that mage, asking first when that would clear a book with cards.
 */
export const MagePicker = () => {
  const navigate = useNavigate();
  const currentMageId = useBookStore((state) => state.book.mageId);

  const openMage = (mage: Mage) => {
    navigate(builderPath(mage.name, 'cards'));
  };

  return (
    <main className={styles.picker}>
      <h1 className={styles.title}>Choose a mage</h1>
      <div className={styles.grid}>
        {mages.map((mage) => (
          <MageTile
            key={mage.id}
            mage={mage}
            current={mage.id === currentMageId}
            onSelect={openMage}
          />
        ))}
      </div>
    </main>
  );
};
