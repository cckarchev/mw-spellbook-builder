import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog/ConfirmDialog";
import { hasCards } from "@/core/rules/spellbookChanges";
import { ActionButton } from "@/features/shared/action-button/ActionButton";
import { useSpellbookStatus } from "@/store/useSpellbookStatus";
import { useSpellbookStore } from "@/store/useSpellbookStore";
import { SaveIcon } from "../Icons";
import { SaveDialog } from "./save-dialog/SaveDialog";
import { useSaveSpellbook } from "./useSaveSpellbook";

/**
 * The Save button, its name dialog, and the question before overwriting a saved spellbook. The
 * button only works when there is something new to keep: cards, with unsaved changes.
 */
export const SaveAction = () => {
  const spellbook = useSpellbookStore((state) => state.spellbook);
  const { unsaved } = useSpellbookStatus();

  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
  };

  const save = useSaveSpellbook(close);

  const hasNothingToSave = !(hasCards(spellbook) && unsaved);

  const open = () => {
    save.reset();
    setIsOpen(true);
  };

  return (
    <>
      <ActionButton
        icon={<SaveIcon />}
        label="Save"
        disabled={hasNothingToSave}
        onClick={open}
      />
      <SaveDialog
        open={isOpen && !save.confirmingOverwrite}
        name={save.draftName}
        error={save.error}
        onNameChange={save.changeName}
        onSave={save.requestSave}
        onClose={close}
      />
      <ConfirmDialog
        open={save.confirmingOverwrite}
        title={`Overwrite "${save.trimmedName}"?`}
        body={
          <p>
            A saved spellbook with this name already exists and will be
            replaced.
          </p>
        }
        confirmLabel="Overwrite"
        onConfirm={save.confirmOverwrite}
        onCancel={save.cancelOverwrite}
      />
    </>
  );
};
