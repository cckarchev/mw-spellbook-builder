import { hasCards, mageSwitchKind, sameBook } from './bookChanges';
import type { Book } from './types';

const TWO_COPIES = 2;
const THREE_COPIES = 3;

const wizardFire: Book = {
  mageId: 'wizard',
  counts: { fireball: TWO_COPIES, bolt: 1 },
};

describe('sameBook', () => {
  it('ignores the order of the cards', () => {
    const reordered: Book = { ...wizardFire, counts: { bolt: 1, fireball: TWO_COPIES } };

    expect(sameBook(wizardFire, reordered)).toBe(true);
  });

  it('tells apart a different count, card or mage', () => {
    expect(
      sameBook(wizardFire, { ...wizardFire, counts: { fireball: THREE_COPIES, bolt: 1 } }),
    ).toBe(false);
    expect(sameBook(wizardFire, { ...wizardFire, counts: { fireball: TWO_COPIES } })).toBe(false);
    expect(sameBook(wizardFire, { ...wizardFire, mageId: 'warlock' })).toBe(false);
  });
});

describe('hasCards', () => {
  it('is false for a book with a mage and no cards', () => {
    expect(hasCards({ ...wizardFire, counts: {} })).toBe(false);
    expect(hasCards(wizardFire)).toBe(true);
  });
});

describe('mageSwitchKind', () => {
  it('starts a new book for another mage when the book has cards', () => {
    expect(mageSwitchKind(wizardFire, 'warlock')).toBe('newBook');
  });

  it('switches straight away when the book has no cards', () => {
    expect(mageSwitchKind({ ...wizardFire, counts: {} }, 'warlock')).toBe('direct');
  });

  it('keeps the cards when the same mage changes school', () => {
    expect(mageSwitchKind(wizardFire, 'wizard')).toBe('sameMage');
  });
});
