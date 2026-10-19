import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { mages } from '@/data/catalog';
import { BookLossNote } from '@/features/shared/BookLossNote';
import styles from './MagePicker.module.css';
import { MageTile } from './mage-tile/MageTile';
import { useMageSwitch } from './useMageSwitch';

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
      <ConfirmDialog
        open={pendingSwitch !== null}
        title="Start a new book?"
        body={<BookLossNote book={book} />}
        confirmLabel="Clear and switch"
        onConfirm={confirmSwitch}
        onCancel={cancelSwitch}
      />
    </main>
  );
};
