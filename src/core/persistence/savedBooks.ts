import type { Book } from '@/core/rules/types';
import { decodeBook, encodeBook } from '@/core/share-link/bookCodec';
import { readStoredJson, removeStored, writeStored } from './storage';

export const SAVED_PREFIX = 'mw-spellbook-builder:saved:';

export interface SavedBook {
  name: string;
  book: Book;
}

/**
 * The mage's saved books as name to encodeBook string; empty when there are none or they
 * cannot be read. A Map rather than the stored object, because names are typed by the
 * player: on a plain object "constructor" would read as an inherited value.
 */
const readSavedMap = (mageId: string): Map<string, string> => {
  const parsed = readStoredJson(SAVED_PREFIX + mageId);
  const isObject = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);

  if (!isObject) {
    return new Map();
  }

  const entries = Object.entries(parsed);
  const textEntries = entries.filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );

  return new Map(textEntries);
};

const writeSavedMap = (mageId: string, saved: Map<string, string>): void => {
  const key = SAVED_PREFIX + mageId;

  if (saved.size === 0) {
    removeStored(key);

    return;
  }

  writeStored(key, JSON.stringify(Object.fromEntries(saved)));
};

/** The book an encodeBook string holds, when it decodes to a book of this mage. */
const decodeFor = (mageId: string, encoded: string): Book | null => {
  const book = decodeBook(encoded)?.book;

  if (book?.mageId !== mageId) {
    return null;
  }

  return book;
};

/** Case-insensitive alphabetical order for book names. */
const byName = (first: SavedBook, second: SavedBook): number =>
  first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });

/** The mage's saved books that can be read, sorted by name. */
export const savedBooks = (mageId: string): SavedBook[] => {
  const books: SavedBook[] = [];

  for (const [name, encoded] of readSavedMap(mageId)) {
    const book = decodeFor(mageId, encoded);

    if (book) {
      books.push({ name, book });
    }
  }

  return books.sort(byName);
};

export const loadSavedBook = (mageId: string, name: string): Book | null => {
  const encoded = readSavedMap(mageId).get(name);

  if (encoded === undefined) {
    return null;
  }

  return decodeFor(mageId, encoded);
};

/** Saves the book under the name for its mage, replacing a book with the same name. */
export const saveBook = (name: string, book: Book): void => {
  const { mageId } = book;

  if (mageId === null) {
    return;
  }

  const saved = readSavedMap(mageId);

  saved.set(name, encodeBook(book));
  writeSavedMap(mageId, saved);
};

export const deleteSavedBook = (mageId: string, name: string): void => {
  const saved = readSavedMap(mageId);

  if (!saved.delete(name)) {
    return;
  }

  writeSavedMap(mageId, saved);
};
