import { useState } from "react";
import { readStored, writeStored } from "@/core/persistence/storage";

export type ViewMode = "list" | "grid";

/** A panel that remembers its own view mode. */
export type ViewPanel = "catalog" | "spellbook";

const STORAGE_PREFIX = "mw-spellbook-builder:view:";

const DEFAULT_MODE: ViewMode = "list";

/**
 * Where a panel's view mode is stored, such as
 * "mw-spellbook-builder:view:catalog".
 */
export const viewModeStorageKey = (panel: ViewPanel): string =>
  `${STORAGE_PREFIX}${panel}`;

const readMode = (panel: ViewPanel): ViewMode => {
  const stored = readStored(viewModeStorageKey(panel));

  if (stored === "grid" || stored === "list") {
    return stored;
  }

  return DEFAULT_MODE;
};

/**
 * Whether a panel shows card rows or card images, remembered per panel on this
 * device.
 */
export const useViewMode = (panel: ViewPanel) => {
  const [view, setViewState] = useState(() => readMode(panel));

  const setView = (next: ViewMode) => {
    setViewState(next);
    writeStored(viewModeStorageKey(panel), next);
  };

  return { view, setView };
};
