import {
  copyCount,
  emptySpellbook,
  hasCards,
  hasUnsavedChanges,
  sameSpellbook,
} from './spellbookChanges';
import type { Spellbook } from './types';

const TWO_COPIES = 2;
const THREE_COPIES = 3;

const wizardSpellbook: Spellbook = {
  mageId: 'wizard',
  counts: { fireball: TWO_COPIES, bolt: 1 },
};

describe('sameSpellbook', () => {
  it('ignores the order of the cards', () => {
    const reordered: Spellbook = { ...wizardSpellbook, counts: { bolt: 1, fireball: TWO_COPIES } };

    expect(sameSpellbook(wizardSpellbook, reordered)).toBe(true);
  });

  it('tells apart a different count, card or mage', () => {
    expect(
      sameSpellbook(wizardSpellbook, {
        ...wizardSpellbook,
        counts: { fireball: THREE_COPIES, bolt: 1 },
      }),
    ).toBe(false);
    expect(
      sameSpellbook(wizardSpellbook, { ...wizardSpellbook, counts: { fireball: TWO_COPIES } }),
    ).toBe(false);
    expect(sameSpellbook(wizardSpellbook, { ...wizardSpellbook, mageId: 'warlock' })).toBe(false);
  });
});

describe('hasCards', () => {
  it('is false for a spellbook with a mage and no cards', () => {
    expect(hasCards({ ...wizardSpellbook, counts: {} })).toBe(false);
    expect(hasCards(wizardSpellbook)).toBe(true);
  });
});

describe('copyCount', () => {
  it('adds up the copies of every card', () => {
    expect(copyCount(wizardSpellbook)).toBe(THREE_COPIES);
  });

  it('is 0 for a spellbook with no cards', () => {
    expect(copyCount({ ...wizardSpellbook, counts: {} })).toBe(0);
  });
});

describe('emptySpellbook', () => {
  it('starts a spellbook for the mage with no cards', () => {
    expect(emptySpellbook('wizard')).toEqual({ mageId: 'wizard', counts: {} });
  });
});

describe('hasUnsavedChanges', () => {
  it('is false for an unnamed empty spellbook', () => {
    expect(hasUnsavedChanges(emptySpellbook('wizard'), null)).toBe(false);
  });

  it('is true for an unnamed spellbook with cards', () => {
    expect(hasUnsavedChanges(wizardSpellbook, null)).toBe(true);
  });

  it('is false when the spellbook equals its saved copy', () => {
    expect(hasUnsavedChanges(wizardSpellbook, { ...wizardSpellbook })).toBe(false);
  });

  it('is true when a count differs from the saved copy', () => {
    const saved: Spellbook = { ...wizardSpellbook, counts: { fireball: THREE_COPIES, bolt: 1 } };

    expect(hasUnsavedChanges(wizardSpellbook, saved)).toBe(true);
  });

  it('is false for an unnamed spellbook equal to the official one', () => {
    expect(hasUnsavedChanges(wizardSpellbook, null, { ...wizardSpellbook })).toBe(false);
  });

  it('is true for an unnamed spellbook that differs from the official one', () => {
    const official: Spellbook = { ...wizardSpellbook, counts: { fireball: THREE_COPIES } };

    expect(hasUnsavedChanges(wizardSpellbook, null, official)).toBe(true);
  });

  it('is false for a named spellbook equal to the official one even when its saved copy differs', () => {
    const saved = emptySpellbook('wizard');

    expect(hasUnsavedChanges(wizardSpellbook, saved, { ...wizardSpellbook })).toBe(false);
  });

  it('is false for an empty unnamed spellbook when an official one exists', () => {
    expect(hasUnsavedChanges(emptySpellbook('wizard'), null, wizardSpellbook)).toBe(false);
  });
});
