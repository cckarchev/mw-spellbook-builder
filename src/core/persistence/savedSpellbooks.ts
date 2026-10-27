import type { Spellbook } from "@/core/rules/types";
import {
  decodeSpellbook,
  encodeSpellbook,
} from "@/core/share-link/spellbookCodec";
import { readStoredJson, removeStored, writeStored } from "./storage";

export const SAVED_PREFIX = "mw-spellbook-builder:saved:";

export interface SavedSpellbook {
  name: string;
  spellbook: Spellbook;
}

/**
 * The mage's saved spellbooks as name to encodeSpellbook string; empty when
 * there are none or they cannot be read. A Map rather than the stored object,
 * because names are typed by the player: on a plain object "constructor" would
 * read as an inherited value.
 */
const readSavedMap = (mageId: string): Map<string, string> => {
  const parsed = readStoredJson(SAVED_PREFIX + mageId);
  const isObject =
    typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);

  if (!isObject) {
    return new Map();
  }

  const entries = Object.entries(parsed);
  const textEntries = entries.filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return new Map(textEntries);
};

/** Stores the saved spellbooks; false when storage is unavailable. */
const writeSavedMap = (mageId: string, saved: Map<string, string>): boolean => {
  const key = SAVED_PREFIX + mageId;

  if (saved.size === 0) {
    removeStored(key);

    return true;
  }

  return writeStored(key, JSON.stringify(Object.fromEntries(saved)));
};

/**
 * The spellbook an encodeSpellbook string holds, when it decodes to a spellbook
 * of this mage.
 */
const decodeFor = (mageId: string, encoded: string): Spellbook | null => {
  const spellbook = decodeSpellbook(encoded)?.spellbook;

  if (spellbook?.mageId !== mageId) {
    return null;
  }

  return spellbook;
};

/** Case-insensitive alphabetical order for spellbook names. */
const byName = (first: SavedSpellbook, second: SavedSpellbook): number =>
  first.name.localeCompare(second.name, undefined, { sensitivity: "base" });

/** The mage's saved spellbooks that can be read, sorted by name. */
export const savedSpellbooks = (mageId: string): SavedSpellbook[] => {
  const spellbooks: SavedSpellbook[] = [];

  for (const [name, encoded] of readSavedMap(mageId)) {
    const spellbook = decodeFor(mageId, encoded);

    if (spellbook) {
      spellbooks.push({ name, spellbook });
    }
  }

  return spellbooks.sort(byName);
};

export const loadSavedSpellbook = (
  mageId: string,
  name: string,
): Spellbook | null => {
  const encoded = readSavedMap(mageId).get(name);

  if (encoded === undefined) {
    return null;
  }

  return decodeFor(mageId, encoded);
};

/**
 * The saved copy of a spellbook under its name, null when it has no name or the
 * copy is gone.
 */
export const savedCopy = (
  spellbook: Spellbook,
  name: string | null,
): Spellbook | null => {
  const { mageId } = spellbook;

  if (mageId === null || name === null) {
    return null;
  }

  return loadSavedSpellbook(mageId, name);
};

/**
 * Saves the spellbook under the name for its mage, replacing a spellbook with
 * the same name. False when it was not stored: the spellbook has no mage, or
 * storage is unavailable.
 */
export const saveSpellbook = (name: string, spellbook: Spellbook): boolean => {
  const { mageId } = spellbook;

  if (mageId === null) {
    return false;
  }

  const saved = readSavedMap(mageId);

  saved.set(name, encodeSpellbook(spellbook));

  return writeSavedMap(mageId, saved);
};

export const deleteSavedSpellbook = (mageId: string, name: string): void => {
  const saved = readSavedMap(mageId);

  if (!saved.delete(name)) {
    return;
  }

  writeSavedMap(mageId, saved);
};
