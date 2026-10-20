import { useState } from 'react';
import {
  deleteSavedSpellbook,
  type SavedSpellbook,
  savedSpellbooks,
} from '@/core/persistence/savedSpellbooks';
import { useSpellbookStatus } from '@/store/useSpellbookStatus';
import { useSpellbookStore } from '@/store/useSpellbookStore';

/**
 * The mage's saved spellbooks for the Load dialog, with loading and deleting them behind their
 * confirms. `onLoaded` runs after a saved spellbook replaces the current one.
 */
export const useSavedSpellbooks = (onLoaded: () => void) => {
  const spellbook = useSpellbookStore((state) => state.spellbook);
  const currentName = useSpellbookStore((state) => state.name);
  const loadSpellbook = useSpellbookStore((state) => state.loadSpellbook);
  const { unsaved } = useSpellbookStatus();

  const [saved, setSaved] = useState<SavedSpellbook[]>([]);
  const [pendingLoad, setPendingLoad] = useState<SavedSpellbook | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const readSaved = () => {
    setSaved(spellbook.mageId === null ? [] : savedSpellbooks(spellbook.mageId));
  };

  /** Re-reads the saved spellbooks and drops any pending confirm. */
  const refresh = () => {
    readSaved();
    setPendingLoad(null);
    setPendingDelete(null);
  };

  const load = (savedSpellbook: SavedSpellbook) => {
    loadSpellbook(savedSpellbook.spellbook, savedSpellbook.name);
    setPendingLoad(null);
    onLoaded();
  };

  const requestLoad = (savedSpellbook: SavedSpellbook) => {
    if (unsaved) {
      setPendingLoad(savedSpellbook);

      return;
    }

    load(savedSpellbook);
  };

  const confirmLoad = () => {
    if (pendingLoad === null) {
      return;
    }

    load(pendingLoad);
  };

  const cancelLoad = () => {
    setPendingLoad(null);
  };

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
    readSaved();
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  return {
    saved,
    pendingLoad,
    pendingDelete,
    refresh,
    requestLoad,
    confirmLoad,
    cancelLoad,
    requestDelete: setPendingDelete,
    confirmDelete,
    cancelDelete,
  };
};
