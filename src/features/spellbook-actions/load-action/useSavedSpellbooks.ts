import { useState } from 'react';
import { type SavedSpellbook, savedSpellbooks } from '@/core/persistence/savedSpellbooks';
import type { Spellbook } from '@/core/rules/types';
import { officialSpellbook } from '@/data/officialSpellbooks';
import { useSpellbookStatus } from '@/store/useSpellbookStatus';
import { useSpellbookStore } from '@/store/useSpellbookStore';
import { useDeleteSavedSpellbook } from './useDeleteSavedSpellbook';

/** A spellbook to load and the name it carries once loaded; null for the official spellbook. */
interface LoadChoice {
  spellbook: Spellbook;
  name: string | null;
}

/**
 * The mage's saved spellbooks and official spellbook for the Load dialog, with loading and
 * deleting them behind their confirms. `onLoaded` runs after a spellbook replaces the current one.
 */
export const useSavedSpellbooks = (onLoaded: () => void) => {
  const spellbook = useSpellbookStore((state) => state.spellbook);
  const loadSpellbook = useSpellbookStore((state) => state.loadSpellbook);
  const { unsaved } = useSpellbookStatus();

  const [saved, setSaved] = useState<SavedSpellbook[]>([]);
  const [official, setOfficial] = useState<Spellbook | null>(null);
  const [pendingLoad, setPendingLoad] = useState<LoadChoice | null>(null);

  const readSaved = () => {
    setSaved(spellbook.mageId === null ? [] : savedSpellbooks(spellbook.mageId));
  };

  const deletion = useDeleteSavedSpellbook(readSaved);

  /** Re-reads the saved and official spellbooks and drops any pending confirm. */
  const refresh = () => {
    readSaved();
    setOfficial(officialSpellbook(spellbook.mageId));
    setPendingLoad(null);
    deletion.cancelDelete();
  };

  const load = (choice: LoadChoice) => {
    loadSpellbook(choice.spellbook, choice.name);
    setPendingLoad(null);
    onLoaded();
  };

  const requestChoice = (choice: LoadChoice) => {
    if (unsaved) {
      setPendingLoad(choice);

      return;
    }

    load(choice);
  };

  const requestLoad = (savedSpellbook: SavedSpellbook) => {
    requestChoice({ spellbook: savedSpellbook.spellbook, name: savedSpellbook.name });
  };

  /** The official spellbook loads unnamed: saving it later makes the player's own copy. */
  const requestLoadOfficial = (officialToLoad: Spellbook) => {
    requestChoice({ spellbook: officialToLoad, name: null });
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

  return {
    saved,
    official,
    pendingLoad,
    refresh,
    requestLoad,
    requestLoadOfficial,
    confirmLoad,
    cancelLoad,
    ...deletion,
  };
};
