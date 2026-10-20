import {
  copyCount,
  emptyBook,
  hasCards,
  hasUnsavedChanges,
  mageSwitchKind,
  sameBook,
} from './bookChanges';
import type { Book } from './types';

const TWO_COPIES = 2;
const THREE_COPIES = 3;

const wizardBook: Book = {
  mageId: 'wizard',
  counts: { fireball: TWO_COPIES, bolt: 1 },
};

describe('sameBook', () => {
  it('ignores the order of the cards', () => {
    const reordered: Book = { ...wizardBook, counts: { bolt: 1, fireball: TWO_COPIES } };

    expect(sameBook(wizardBook, reordered)).toBe(true);
  });

  it('tells apart a different count, card or mage', () => {
    expect(
      sameBook(wizardBook, { ...wizardBook, counts: { fireball: THREE_COPIES, bolt: 1 } }),
    ).toBe(false);
    expect(sameBook(wizardBook, { ...wizardBook, counts: { fireball: TWO_COPIES } })).toBe(false);
    expect(sameBook(wizardBook, { ...wizardBook, mageId: 'warlock' })).toBe(false);
  });
});

describe('hasCards', () => {
  it('is false for a book with a mage and no cards', () => {
    expect(hasCards({ ...wizardBook, counts: {} })).toBe(false);
    expect(hasCards(wizardBook)).toBe(true);
  });
});

describe('copyCount', () => {
  it('adds up the copies of every card', () => {
    expect(copyCount(wizardBook)).toBe(THREE_COPIES);
  });

  it('is 0 for a book with no cards', () => {
    expect(copyCount({ ...wizardBook, counts: {} })).toBe(0);
  });
});

describe('mageSwitchKind', () => {
  it('starts a new book for another mage when the book has cards', () => {
    expect(mageSwitchKind(wizardBook, 'warlock')).toBe('newBook');
  });

  it('switches straight away when the book has no cards', () => {
    expect(mageSwitchKind({ ...wizardBook, counts: {} }, 'warlock')).toBe('direct');
  });

  it('keeps the book when the same mage is picked again', () => {
    expect(mageSwitchKind(wizardBook, 'wizard')).toBe('sameMage');
  });
});

describe('emptyBook', () => {
  it('starts a book for the mage with no cards', () => {
    expect(emptyBook('wizard')).toEqual({ mageId: 'wizard', counts: {} });
  });
});

describe('hasUnsavedChanges', () => {
  it('is false for an unnamed empty book', () => {
    expect(hasUnsavedChanges(emptyBook('wizard'), null)).toBe(false);
  });

  it('is true for an unnamed book with cards', () => {
    expect(hasUnsavedChanges(wizardBook, null)).toBe(true);
  });

  it('is false when the book equals its saved copy', () => {
    expect(hasUnsavedChanges(wizardBook, { ...wizardBook })).toBe(false);
  });

  it('is true when a count differs from the saved copy', () => {
    const saved: Book = { ...wizardBook, counts: { fireball: THREE_COPIES, bolt: 1 } };

    expect(hasUnsavedChanges(wizardBook, saved)).toBe(true);
  });
});
