import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog/ConfirmDialog";
import { hasCards } from "@/core/rules/spellbookChanges";
import { ActionButton } from "@/features/shared/action-button/ActionButton";
import { SpellbookLossNote } from "@/features/shared/SpellbookLossNote";
import { TrashIcon } from "@/features/shared/TrashIcon";
import { useSpellbookStatus } from "@/store/useSpellbookStatus";
import { useSpellbookStore } from "@/store/useSpellbookStore";

/** The Clear button: empties the spellbook and drops its name, after a confirm when unsaved work would go. */
export const ClearAction = () => {
  const spellbook = useSpellbookStore((state) => state.spellbook);
  const name = useSpellbookStore((state) => state.name);
  const clear = useSpellbookStore((state) => state.clear);
  const { unsaved } = useSpellbookStatus();

  const [isConfirming, setIsConfirming] = useState(false);

  const hasNothingToClear = !hasCards(spellbook) && name === null;

  const requestClear = () => {
    if (unsaved) {
      setIsConfirming(true);

      return;
    }

    clear();
  };

  const confirmClear = () => {
    clear();
    setIsConfirming(false);
  };

  const cancelClear = () => {
    setIsConfirming(false);
  };

  return (
    <>
      <ActionButton
        icon={<TrashIcon />}
        label="Clear"
        disabled={hasNothingToClear}
        onClick={requestClear}
      />
      <ConfirmDialog
        open={isConfirming}
        title="Clear this spellbook?"
        body={<SpellbookLossNote spellbook={spellbook} />}
        confirmLabel="Clear"
        onConfirm={confirmClear}
        onCancel={cancelClear}
      />
    </>
  );
};
