import { sameBook } from '@/core/rules/bookChanges';
import type { Book } from '@/core/rules/types';
import { encodeBook } from '@/core/share-link/bookCodec';
import {
  deleteSavedBook,
  loadSavedBook,
  SAVED_PREFIX,
  saveBook,
  savedBooks,
  savedCopy,
} from './savedBooks';

const FIREBALL = 'd8562a1d-6a95-4ca4-99aa-91c5ca769a33';
const WIZARD_ID = 'wizard';
const WARLOCK_ID = 'warlock';
const NAME = 'Tourney';

const wizardBook = (copies: number): Book => ({
  mageId: WIZARD_ID,
  counts: { [FIREBALL]: copies },
});

const savedNames = (mageId: string) => savedBooks(mageId).map(({ name }) => name);

beforeEach(() => {
  localStorage.clear();
});

describe('savedBooks', () => {
  it('saveBook then loadSavedBook returns the book', () => {
    saveBook(NAME, wizardBook(1));

    const loaded = loadSavedBook(WIZARD_ID, NAME);

    expect(loaded && sameBook(loaded, wizardBook(1))).toBe(true);
  });

  it('loadSavedBook is null for an unknown name', () => {
    expect(loadSavedBook(WIZARD_ID, NAME)).toBeNull();
  });

  it('saveBook under an existing name replaces it', () => {
    saveBook(NAME, wizardBook(1));
    saveBook(NAME, wizardBook(2));

    const books = savedBooks(WIZARD_ID);

    expect(books).toHaveLength(1);
    expect(books[0]?.book.counts[FIREBALL]).toBe(2);
  });

  it('sorts by name ignoring case', () => {
    saveBook('gamma', wizardBook(1));
    saveBook('Beta', wizardBook(1));
    saveBook('alpha', wizardBook(1));

    expect(savedNames(WIZARD_ID)).toEqual(['alpha', 'Beta', 'gamma']);
  });

  it('keeps the books of each mage apart', () => {
    saveBook(NAME, wizardBook(1));

    expect(savedNames(WARLOCK_ID)).toEqual([]);
  });

  it('saves, lists and loads names like __proto__ and constructor', () => {
    saveBook('__proto__', wizardBook(1));
    saveBook('constructor', wizardBook(2));

    expect(savedNames(WIZARD_ID)).toEqual(['__proto__', 'constructor']);
    expect(loadSavedBook(WIZARD_ID, '__proto__')?.counts[FIREBALL]).toBe(1);
    expect(loadSavedBook(WIZARD_ID, 'constructor')?.counts[FIREBALL]).toBe(2);
  });

  it('treats names as case sensitive', () => {
    saveBook('Tourney', wizardBook(1));
    saveBook('tourney', wizardBook(2));

    expect(savedNames(WIZARD_ID)).toHaveLength(2);
  });

  it('saveBook of a book with no mage stores nothing', () => {
    saveBook(NAME, { mageId: null, counts: {} });

    expect(localStorage.length).toBe(0);
  });
});

describe('deleteSavedBook', () => {
  it('removes one, and the key after the last', () => {
    saveBook('one', wizardBook(1));
    saveBook('two', wizardBook(1));

    deleteSavedBook(WIZARD_ID, 'one');

    expect(savedNames(WIZARD_ID)).toEqual(['two']);

    deleteSavedBook(WIZARD_ID, 'two');

    expect(localStorage.getItem(SAVED_PREFIX + WIZARD_ID)).toBeNull();
  });

  it('of an unknown name changes nothing', () => {
    saveBook(NAME, wizardBook(1));

    deleteSavedBook(WIZARD_ID, 'other');

    expect(savedNames(WIZARD_ID)).toEqual([NAME]);
  });
});

describe('unreadable saved books', () => {
  it.each(['nope', '[]', 'null', '"text"'])('is empty when the stored value is %s', (stored) => {
    localStorage.setItem(SAVED_PREFIX + WIZARD_ID, stored);

    expect(savedBooks(WIZARD_ID)).toEqual([]);
  });

  it('skips entries that do not decode or name another mage', () => {
    const warlockBook: Book = { mageId: WARLOCK_ID, counts: {} };
    const stored = {
      [NAME]: encodeBook(wizardBook(1)),
      broken: '!!!',
      other: encodeBook(warlockBook),
      number: 3,
    };

    localStorage.setItem(SAVED_PREFIX + WIZARD_ID, JSON.stringify(stored));

    expect(savedNames(WIZARD_ID)).toEqual([NAME]);
  });
});

describe('savedCopy', () => {
  it("is the saved book with the book's name", () => {
    saveBook(NAME, wizardBook(1));

    expect(savedCopy(wizardBook(2), NAME)).toEqual(wizardBook(1));
  });

  it('is null for a book with no name', () => {
    saveBook(NAME, wizardBook(1));

    expect(savedCopy(wizardBook(1), null)).toBeNull();
  });

  it('is null for a book with no mage', () => {
    expect(savedCopy({ mageId: null, counts: {} }, NAME)).toBeNull();
  });

  it('is null when the saved book is gone', () => {
    expect(savedCopy(wizardBook(1), NAME)).toBeNull();
  });
});
