import { hasCards } from '@/core/rules/bookChanges';
import type { Book } from '@/core/rules/types';
import { decodeBook, encodeBook } from '@/core/share-link/bookCodec';
import { readStored, readStoredJson, removeStored, writeStored } from './storage';

export const DRAFT_PREFIX = 'mw-spellbook-builder:draft:';
export const CURRENT_MAGE_KEY = 'mw-spellbook-builder:current-mage';
/** Where the one book in progress lived before there was a draft per mage. */
export const LEGACY_BOOK_KEY = 'mw-spellbook-builder:current';

/** The book in progress for one mage, and the name of the saved book it came from. */
export interface Draft {
  book: Book;
  name: string | null;
}

/** What a draft key holds: the encodeBook string and the name. */
interface StoredDraft {
  b: string;
  n: string | null;
}

const isStoredDraft = (value: unknown): value is StoredDraft => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { b, n } = value as Record<string, unknown>;
  const hasValidName = typeof n === 'string' || n === null;

  return typeof b === 'string' && hasValidName;
};

/** The mage's draft, or null when there is none or it cannot be read. */
export const readDraft = (mageId: string): Draft | null => {
  const parsed = readStoredJson(DRAFT_PREFIX + mageId);

  if (!isStoredDraft(parsed)) {
    return null;
  }

  const decoded = decodeBook(parsed.b);

  if (decoded?.book.mageId !== mageId) {
    return null;
  }

  return { book: decoded.book, name: parsed.n };
};

/** Stores the draft under its book's mage; an empty unnamed book leaves nothing behind. */
export const writeDraft = ({ book, name }: Draft): void => {
  const { mageId } = book;

  if (mageId === null) {
    return;
  }

  const key = DRAFT_PREFIX + mageId;

  if (!hasCards(book) && name === null) {
    removeStored(key);

    return;
  }

  const stored: StoredDraft = { b: encodeBook(book), n: name };

  writeStored(key, JSON.stringify(stored));
};

export const readCurrentMageId = (): string | null => readStored(CURRENT_MAGE_KEY);

export const writeCurrentMageId = (mageId: string): void => {
  writeStored(CURRENT_MAGE_KEY, mageId);
};

/** Turns the old single book in progress into its mage's draft, once. */
export const migrateLegacyBook = (): void => {
  const legacy = readStored(LEGACY_BOOK_KEY);

  if (legacy === null) {
    return;
  }

  const book = decodeBook(legacy)?.book;

  if (book?.mageId) {
    writeDraft({ book, name: null });
    writeCurrentMageId(book.mageId);
  }

  removeStored(LEGACY_BOOK_KEY);
};
