import { mages } from '@/data/catalog';
import styles from './MagePicker.module.css';
import { MageTile } from './mage-tile/MageTile';
import { mageNoteFor } from './mageNoteFor';
import { useMageSwitch } from './useMageSwitch';

export const MagePicker = () => {
  const { spellbook, selectMage } = useMageSwitch();

  return (
    <main className={styles.picker}>
      <h1 className={styles.title}>Choose a mage</h1>
      <div className={styles.grid}>
        {mages.map((mage) => (
          <MageTile
            key={mage.id}
            mage={mage}
            current={mage.id === spellbook.mageId}
            note={mageNoteFor(mage, spellbook)}
            onSelect={selectMage}
          />
        ))}
      </div>
    </main>
  );
};
