import { useState } from "react";
import { deleteSavedSpellbook } from "@/core/persistence/savedSpellbooks";
import { useSpellbookStore } from "@/store/useSpellbookStore";

/** Deleting one of the mage's saved spellbooks behind its confirm. `onDeleted` runs after each delete. */
export const useDeleteSavedSpellbook = (onDeleted: () => void) => {
  const spellbook = useSpellbookStore((state) => state.spellbook);
  const currentName = useSpellbookStore((state) => state.name);
  const loadSpellbook = useSpellbookStore((state) => state.loadSpellbook);

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (pendingDelete === null || spellbook.mageId === null) {
      return;
    }

    deleteSavedSpellbook(spellbook.mageId, pendingDelete);

    // The spellbook stays, as a draft that no longer comes from a saved spellbook.
    if (pendingDelete === currentName) {
      loadSpellbook(spellbook, null);
    }

    setPendingDelete(null);
    onDeleted();
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  return {
    pendingDelete,
    requestDelete: setPendingDelete,
    confirmDelete,
    cancelDelete,
  };
};
