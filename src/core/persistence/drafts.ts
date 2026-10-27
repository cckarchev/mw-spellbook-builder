import { hasCards, hasUnsavedChanges } from "@/core/rules/spellbookChanges";
import type { Spellbook } from "@/core/rules/types";
import {
  decodeSpellbook,
  encodeSpellbook,
} from "@/core/share-link/spellbookCodec";
import { officialSpellbook } from "@/data/officialSpellbooks";
import { savedCopy } from "./savedSpellbooks";
import {
  readStored,
  readStoredJson,
  removeStored,
  writeStored,
} from "./storage";

export const DRAFT_PREFIX = "mw-spellbook-builder:draft:";
export const CURRENT_MAGE_KEY = "mw-spellbook-builder:current-mage";
/**
 * Where the one spellbook in progress lived before there was a draft per mage.
 */
export const LEGACY_SPELLBOOK_KEY = "mw-spellbook-builder:current";

/**
 * The spellbook in progress for one mage, and the name of the saved spellbook
 * it came from.
 */
export interface Draft {
  spellbook: Spellbook;
  name: string | null;
}

/** What a draft key holds: the encodeSpellbook string and the name. */
interface StoredDraft {
  b: string;
  n: string | null;
}

const isStoredDraft = (value: unknown): value is StoredDraft => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const { b, n } = value as Record<string, unknown>;
  const hasValidName = typeof n === "string" || n === null;

  return typeof b === "string" && hasValidName;
};

/** The mage's draft, or null when there is none or it cannot be read. */
export const readDraft = (mageId: string): Draft | null => {
  const parsed = readStoredJson(DRAFT_PREFIX + mageId);

  if (!isStoredDraft(parsed)) {
    return null;
  }

  const decoded = decodeSpellbook(parsed.b);

  if (decoded?.spellbook.mageId !== mageId) {
    return null;
  }

  return { spellbook: decoded.spellbook, name: parsed.n };
};

/**
 * Stores the draft under its spellbook's mage; an empty unnamed spellbook
 * leaves nothing behind.
 */
export const writeDraft = ({ spellbook, name }: Draft): void => {
  const { mageId } = spellbook;

  if (mageId === null) {
    return;
  }

  const key = DRAFT_PREFIX + mageId;

  if (!hasCards(spellbook) && name === null) {
    removeStored(key);

    return;
  }

  const stored: StoredDraft = { b: encodeSpellbook(spellbook), n: name };

  writeStored(key, JSON.stringify(stored));
};

/**
 * Whether the mage's draft holds work that neither its saved copy nor the
 * mage's official spellbook has, and would be lost if replaced.
 */
export const hasUnsavedDraft = (mageId: string): boolean => {
  const draft = readDraft(mageId);

  if (draft === null) {
    return false;
  }

  const saved = savedCopy(draft.spellbook, draft.name);

  return hasUnsavedChanges(draft.spellbook, saved, officialSpellbook(mageId));
};

export const readCurrentMageId = (): string | null =>
  readStored(CURRENT_MAGE_KEY);

export const writeCurrentMageId = (mageId: string): void => {
  writeStored(CURRENT_MAGE_KEY, mageId);
};

/** Turns the old single spellbook in progress into its mage's draft, once. */
export const migrateLegacySpellbook = (): void => {
  const legacy = readStored(LEGACY_SPELLBOOK_KEY);

  if (legacy === null) {
    return;
  }

  const spellbook = decodeSpellbook(legacy)?.spellbook;

  if (spellbook?.mageId) {
    writeDraft({ spellbook, name: null });
    writeCurrentMageId(spellbook.mageId);
  }

  removeStored(LEGACY_SPELLBOOK_KEY);
};
