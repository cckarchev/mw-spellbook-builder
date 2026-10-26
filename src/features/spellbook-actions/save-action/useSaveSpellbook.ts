import { useState } from "react";
import {
  LONG_TOAST_DURATION_MS,
  useToastStore,
} from "@/components/toast/useToastStore";
import { loadSavedSpellbook } from "@/core/persistence/savedSpellbooks";
import { useSpellbookStore } from "@/store/useSpellbookStore";

const EMPTY_NAME_ERROR = "Enter a name for this spellbook.";
const SAVE_FAILED =
  "Could not save. This browser is not letting the site store data.";

/**
 * The Save dialog's state: the draft name, its error, and the overwrite
 * question. `onSaved` runs after a save, to close the dialog; a save the
 * browser would not store shows a toast.
 */
export const useSaveSpellbook = (onSaved: () => void) => {
  const spellbook = useSpellbookStore((state) => state.spellbook);
  const currentName = useSpellbookStore((state) => state.name);
  const save = useSpellbookStore((state) => state.save);
  const showToast = useToastStore((state) => state.show);

  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmingOverwrite, setConfirmingOverwrite] = useState(false);

  const trimmedName = draftName.trim();

  /** Starts a fresh form from the spellbook's current name. */
  const reset = () => {
    setDraftName(currentName ?? "");
    setError(null);
    setConfirmingOverwrite(false);
  };

  const changeName = (value: string) => {
    setDraftName(value);
    setError(null);
  };

  const commit = () => {
    const saved = save(trimmedName);

    setConfirmingOverwrite(false);
    onSaved();

    if (!saved) {
      showToast(SAVE_FAILED, LONG_TOAST_DURATION_MS);
    }
  };

  const requestSave = () => {
    if (trimmedName === "") {
      setError(EMPTY_NAME_ERROR);

      return;
    }

    const { mageId } = spellbook;
    const nameTaken =
      mageId !== null && loadSavedSpellbook(mageId, trimmedName) !== null;
    // Saving the loaded spellbook under its own name updates it; there is
    // nothing else to lose.
    const isOwnName = trimmedName === currentName;

    if (nameTaken && !isOwnName) {
      setConfirmingOverwrite(true);

      return;
    }

    commit();
  };

  const cancelOverwrite = () => {
    setConfirmingOverwrite(false);
  };

  return {
    draftName,
    trimmedName,
    error,
    confirmingOverwrite,
    reset,
    changeName,
    requestSave,
    confirmOverwrite: commit,
    cancelOverwrite,
  };
};
