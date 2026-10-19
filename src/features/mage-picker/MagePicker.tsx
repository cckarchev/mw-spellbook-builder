import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import type { Card, Mage, School } from '@/core/rules/types';
import { mages } from '@/data/catalog';
import styles from './MagePicker.module.css';
import { MageTile } from './mage-tile/MageTile';
import { SchoolChoice } from './school-choice/SchoolChoice';
import { type PendingSwitch, useMageSwitch } from './useMageSwitch';

const IllegalCards = ({ mage, cards }: { mage: Mage; cards: Card[] }) => (
  <>
    <p>The {mage.name} cannot use these cards. They will leave the book:</p>
    <ul className={styles.cardList}>
      {cards.map((card) => (
        <li key={card.id}>{card.name}</li>
      ))}
    </ul>
  </>
);

const NewBook = ({ mageName, copies }: { mageName: string; copies: number }) => (
  <p>
    Your {mageName} book has {copies === 1 ? '1 card' : `${copies} cards`}. It will be cleared. To
    keep it, cancel and copy its link from the Book tab first.
  </p>
);

const CURRENT_MAGE_FALLBACK = 'current';

const SWITCH_COPY = {
  newBook: { title: 'Start a new book?', confirmLabel: 'Clear and switch' },
  removeCards: { title: 'Remove cards?', confirmLabel: 'Remove and switch' },
} as const;

const SwitchBody = ({ pending }: { pending: PendingSwitch }) =>
  pending.kind === 'newBook' ? (
    <NewBook
      mageName={pending.currentMage?.name ?? CURRENT_MAGE_FALLBACK}
      copies={pending.copies}
    />
  ) : (
    <IllegalCards mage={pending.mage} cards={pending.illegalCards} />
  );

export const MagePicker = () => {
  const { currentMageId, pendingSwitch, requestSwitch, confirmSwitch, cancelSwitch } =
    useMageSwitch();

  const [mageAskingSchool, setMageAskingSchool] = useState<Mage | null>(null);

  const handleSelect = (mage: Mage) => {
    if (mage.training.schoolChoice.length > 0) {
      setMageAskingSchool(mage);

      return;
    }

    requestSwitch(mage, null);
  };

  const handleSchool = (school: School) => {
    const mage = mageAskingSchool;

    setMageAskingSchool(null);

    if (mage) {
      requestSwitch(mage, school);
    }
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
            onSelect={handleSelect}
          />
        ))}
      </div>
      <SchoolChoice
        open={mageAskingSchool !== null}
        schools={mageAskingSchool?.training.schoolChoice ?? []}
        onChoose={handleSchool}
        onCancel={() => setMageAskingSchool(null)}
      />
      <ConfirmDialog
        open={pendingSwitch !== null}
        title={SWITCH_COPY[pendingSwitch?.kind ?? 'newBook'].title}
        body={pendingSwitch ? <SwitchBody pending={pendingSwitch} /> : null}
        confirmLabel={SWITCH_COPY[pendingSwitch?.kind ?? 'newBook'].confirmLabel}
        onConfirm={confirmSwitch}
        onCancel={cancelSwitch}
      />
    </main>
  );
};
