import type { Book } from '@/core/rules/types';
import { canAddCopy } from '@/core/rules/validateBook';
import { cards, magesById } from '@/data/catalog';
import { BOOK_STORAGE_KEY, createBookStore } from './useBookStore';

const WIZARD_ID = 'wizard';
const NECROMANCER_ID = 'necromancer';
const ADD_ATTEMPTS = 10;
const LOADED_COPIES = 2;

const EMPTY_BOOK: Book = { mageId: null, schoolChoice: null, counts: {} };

const findCard = (onlyFor: string | null) => {
  const card = cards.find((candidate) => candidate.onlyFor === onlyFor);

  if (!card) {
    throw new Error(`No card with onlyFor ${onlyFor}`);
  }

  return card;
};

const anyMageCard = findCard(null);
const wizardOnlyCard = findCard('Wizard');

const createWizardStore = () => {
  const store = createBookStore();

  store.getState().chooseMage(WIZARD_ID, 'Fire');

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

  it('chooseMage removes cards illegal for the new mage', () => {
    const store = createWizardStore();

    store.getState().addCopy(anyMageCard.id);
    store.getState().addCopy(wizardOnlyCard.id);
    store.getState().chooseMage(NECROMANCER_ID, null);

    const { book } = store.getState();

    expect(book.mageId).toBe(NECROMANCER_ID);
    expect(book.counts).toEqual({ [anyMageCard.id]: 1 });
  });

  it('loadBook replaces the book and clear empties it', () => {
    const store = createBookStore();
    const loaded: Book = {
      mageId: WIZARD_ID,
      schoolChoice: 'Water',
      counts: { [anyMageCard.id]: LOADED_COPIES },
    };

    store.getState().loadBook(loaded);

    expect(store.getState().book).toEqual(loaded);

    store.getState().clear();

    expect(store.getState().book).toEqual(EMPTY_BOOK);
  });
});

describe('useBookStore persistence', () => {
  it('survives a store re-create through localStorage', () => {
    const first = createWizardStore();

    first.getState().addCopy(anyMageCard.id);

    const second = createBookStore();

    expect(second.getState().book).toEqual(first.getState().book);
  });

  it('starts empty when localStorage holds garbage', () => {
    localStorage.setItem(BOOK_STORAGE_KEY, 'not a book');

    expect(createBookStore().getState().book).toEqual(EMPTY_BOOK);
  });
});
