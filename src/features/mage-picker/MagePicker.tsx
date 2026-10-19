import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { mages } from '@/data/catalog';
import styles from './MagePicker.module.css';
import { MageTile } from './mage-tile/MageTile';
import { useMageSwitch } from './useMageSwitch';

const NewBook = ({ mageName, copies }: { mageName: string; copies: number }) => (
  <p>
    Your {mageName} book has {copies === 1 ? '1 card' : `${copies} cards`}. It will be cleared. To
    keep it, cancel and copy its link from the Book tab first.
  </p>
);

const CURRENT_MAGE_FALLBACK = 'current';

export const MagePicker = () => {
  const { currentMageId, pendingSwitch, requestSwitch, confirmSwitch, cancelSwitch } =
    useMageSwitch();

  return (
    <main className={styles.picker}>
      <h1 className={styles.title}>Choose a mage</h1>
      <div className={styles.grid}>
        {mages.map((mage) => (
          <MageTile
            key={mage.id}
            mage={mage}
            current={mage.id === currentMageId}
            onSelect={requestSwitch}
          />
        ))}
      </div>
      <ConfirmDialog
        open={pendingSwitch !== null}
        title="Start a new book?"
        body={
          pendingSwitch ? (
            <NewBook
              mageName={pendingSwitch.currentMage?.name ?? CURRENT_MAGE_FALLBACK}
              copies={pendingSwitch.copies}
            />
          ) : null
        }
        confirmLabel="Clear and switch"
        onConfirm={confirmSwitch}
        onCancel={cancelSwitch}
      />
    </main>
  );
};
