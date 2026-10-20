import { mages } from '@/data/catalog';
import { NewBookDialog } from '@/features/mage-switch/NewBookDialog';
import { useMageSwitch } from '@/features/mage-switch/useMageSwitch';
import styles from './MagePicker.module.css';
import { MageTile } from './mage-tile/MageTile';

export const MagePicker = () => {
  const { book, pendingSwitch, requestSwitch, confirmSwitch, cancelSwitch } = useMageSwitch();

  return (
    <main className={styles.picker}>
      <h1 className={styles.title}>Choose a mage</h1>
      <div className={styles.grid}>
        {mages.map((mage) => (
          <MageTile
            key={mage.id}
            mage={mage}
            current={mage.id === book.mageId}
            onSelect={requestSwitch}
          />
        ))}
      </div>
      <NewBookDialog
        open={pendingSwitch !== null}
        book={book}
        onConfirm={confirmSwitch}
        onCancel={cancelSwitch}
      />
    </main>
  );
};
