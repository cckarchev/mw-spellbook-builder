import { ConfirmDialog } from "@/components/confirm-dialog/ConfirmDialog";
import { mages } from "@/data/catalog";
import { LoadDialog } from "@/features/shared/load-dialog/LoadDialog";
import styles from "./MagePicker.module.css";
import { MageTile } from "./mage-tile/MageTile";
import { mageBadgeFor } from "./mageBadgeFor";
import { useLoadSaved } from "./useLoadSaved";
import { useMageSwitch } from "./useMageSwitch";

export const MagePicker = () => {
  const { spellbook, selectMage } = useMageSwitch();
  const loadSaved = useLoadSaved();

  return (
    <main className={styles.picker}>
      <h1 className={styles.title}>Choose a mage</h1>
      <div className={styles.grid}>
        {mages.map((mage) => (
          <MageTile
            key={mage.id}
            mage={mage}
            current={mage.id === spellbook.mageId}
            badge={mageBadgeFor(mage)}
            onSelect={selectMage}
            onOpenSaved={loadSaved.open}
          />
        ))}
      </div>
      {/* The list steps aside while the confirm asks, so only one dialog is
          open at a time. */}
      <LoadDialog
        open={loadSaved.mage !== null && loadSaved.pendingLoad === null}
        title={`Saved ${loadSaved.mage?.name ?? ""} spellbooks`}
        saved={loadSaved.saved}
        onLoad={loadSaved.requestLoad}
        onClose={loadSaved.close}
      />
      <ConfirmDialog
        open={loadSaved.pendingLoad !== null}
        title={`Replace your ${loadSaved.mage?.name ?? ""} draft?`}
        body={<p>Its unsaved changes will be lost.</p>}
        confirmLabel="Replace"
        onConfirm={loadSaved.confirmLoad}
        onCancel={loadSaved.cancelLoad}
      />
    </main>
  );
};
