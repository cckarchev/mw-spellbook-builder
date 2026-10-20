import { CURRENT_MAGE_KEY, DRAFT_PREFIX, LEGACY_BOOK_KEY } from '@/core/persistence/drafts';
import { loadSavedBook } from '@/core/persistence/savedBooks';
import type { Book } from '@/core/rules/types';
import { canAddCopy } from '@/core/rules/validateBook';
import { encodeBook } from '@/core/share-link/bookCodec';
import { cards, magesById } from '@/data/catalog';
import { createBookStore } from './useBookStore';

const WIZARD_ID = 'wizard';
const WARLOCK_ID = 'warlock';
const NAME = 'Tourney';
const ADD_ATTEMPTS = 10;
const LOADED_COPIES = 2;

const EMPTY_BOOK: Book = { mageId: null, counts: {} };

const findCard = (onlyFor: string | null) => {
  const card = cards.find((candidate) => candidate.onlyFor === onlyFor);

  if (!card) {
    throw new Error(`No card with onlyFor ${onlyFor}`);
  }

  return card;
};

const anyMageCard = findCard(null);

const createWizardStore = () => {
  const store = createBookStore();

  store.getState().loadBook({ mageId: WIZARD_ID, counts: {} });

  return store;
};

beforeEach(() => {
  localStorage.clear();
});

describe('useBookStore copies', () => {
  it('adds copies until canAddCopy is false, then ignores addCopy', () => {
    const store = createWizardStore();
    const wizard = magesById.get(WIZARD_ID);

    for (let attempt = 0; attempt < ADD_ATTEMPTS; attempt++) {
      store.getState().addCopy(anyMageCard.id);
    }

    const { book } = store.getState();
    const count = book.counts[anyMageCard.id];

    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(ADD_ATTEMPTS);
    expect(wizard && canAddCopy(book, anyMageCard, wizard)).toBe(false);
  });

  it('ignores addCopy when no mage is chosen', () => {
    const store = createBookStore();

    store.getState().addCopy(anyMageCard.id);

    expect(store.getState().book.counts).toEqual({});
  });

  it('removeCopy at 1 deletes the key', () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);
    store.getState().removeCopy(anyMageCard.id);

    expect(store.getState().book.counts).toEqual({});
  });
});

describe('useBookStore book changes', () => {
  it('starts empty', () => {
    expect(createBookStore().getState().book).toEqual(EMPTY_BOOK);
  });

  it('loadBook replaces the book and its name', () => {
    const store = createBookStore();
    const loaded: Book = {
      mageId: WIZARD_ID,
      counts: { [anyMageCard.id]: LOADED_COPIES },
    };

    store.getState().loadBook(loaded, NAME);

    expect(store.getState().book).toEqual(loaded);
    expect(store.getState().name).toBe(NAME);

    store.getState().loadBook(loaded);

    expect(store.getState().name).toBeNull();
  });

  it('save stores the book under the name, names it, and bumps the saved revision', () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);

    const { book, savedRevision } = store.getState();

    store.getState().save(NAME);

    expect(loadSavedBook(WIZARD_ID, NAME)).toEqual(book);
    expect(store.getState().name).toBe(NAME);
    expect(store.getState().savedRevision).toBe(savedRevision + 1);
  });

  it('clear empties the book, keeps the mage and drops the name', () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);
    store.getState().save(NAME);
    store.getState().clear();

    expect(store.getState().book).toEqual({ mageId: WIZARD_ID, counts: {} });
    expect(store.getState().name).toBeNull();
  });
});

describe('useBookStore openMage', () => {
  it("keeps the previous mage's book as its draft and restores it on return", () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);
    store.getState().save(NAME);

    const wizardBook = store.getState().book;

    store.getState().openMage(WARLOCK_ID);

    expect(store.getState().book).toEqual({ mageId: WARLOCK_ID, counts: {} });
    expect(store.getState().name).toBeNull();

    store.getState().openMage(WIZARD_ID);

    expect(store.getState().book).toEqual(wizardBook);
    expect(store.getState().name).toBe(NAME);
  });

  it('keeps the book when the mage is the same', () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);

    const before = store.getState().book;

    store.getState().openMage(WIZARD_ID);

    expect(store.getState().book).toBe(before);
  });
});

describe('useBookStore persistence', () => {
  it("survives a store re-create through the mage's draft", () => {
    const first = createWizardStore();

    first.getState().addCopy(anyMageCard.id);
    first.getState().save(NAME);

    const second = createBookStore();

    expect(second.getState().book).toEqual(first.getState().book);
    expect(second.getState().name).toBe(NAME);
  });

  it('starts from the book kept before there was a draft per mage', () => {
    const legacy: Book = { mageId: WIZARD_ID, counts: { [anyMageCard.id]: 1 } };

    localStorage.setItem(LEGACY_BOOK_KEY, encodeBook(legacy));

    expect(createBookStore().getState().book).toEqual(legacy);
  });

  it('starts empty when storage holds garbage', () => {
    localStorage.setItem(LEGACY_BOOK_KEY, 'not a book');
    localStorage.setItem(CURRENT_MAGE_KEY, WIZARD_ID);
    localStorage.setItem(DRAFT_PREFIX + WIZARD_ID, 'not a draft');

    expect(createBookStore().getState().book).toEqual(EMPTY_BOOK);
  });
});
