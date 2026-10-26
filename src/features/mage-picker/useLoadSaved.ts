import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasUnsavedDraft } from "@/core/persistence/drafts";
import {
  type SavedSpellbook,
  savedSpellbooks,
} from "@/core/persistence/savedSpellbooks";
import { builderPath } from "@/core/routing/builderPath";
import type { Mage } from "@/core/rules/types";
import { useSpellbookStore } from "@/store/useSpellbookStore";

/**
 * Loading a mage's saved spellbook straight from the picker: the list of one
 * mage's saved spellbooks, and a confirm when loading one would replace unsaved
 * work in that mage's draft. A loaded spellbook opens on the Spellbook tab.
 */
export const useLoadSaved = () => {
  const navigate = useNavigate();
  const loadSpellbook = useSpellbookStore((state) => state.loadSpellbook);

  const [mage, setMage] = useState<Mage | null>(null);
  const [saved, setSaved] = useState<SavedSpellbook[]>([]);
  const [pendingLoad, setPendingLoad] = useState<SavedSpellbook | null>(null);

  const open = (next: Mage) => {
    setMage(next);
    setSaved(savedSpellbooks(next.id));
    setPendingLoad(null);
  };

  const close = () => {
    setMage(null);
    setPendingLoad(null);
  };

  const load = (savedSpellbook: SavedSpellbook) => {
    if (mage === null) {
      return;
    }

    loadSpellbook(savedSpellbook.spellbook, savedSpellbook.name);
    close();
    navigate(builderPath(mage.name, "spellbook"));
  };

  const requestLoad = (savedSpellbook: SavedSpellbook) => {
    if (mage !== null && hasUnsavedDraft(mage.id)) {
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

  return {
    mage,
    saved,
    pendingLoad,
    open,
    close,
    requestLoad,
    confirmLoad,
    cancelLoad,
  };
};
