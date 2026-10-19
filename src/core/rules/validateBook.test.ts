import { makeCard, warlock, wizard } from './fixtures';
import type { Book, Card } from './types';
import { addCopyBlockedReason, canAddCopy, cardsIllegalFor, summarizeBook } from './validateBook';

const LEVEL_TWO = 2;
const LEVEL_TWO_LIMIT = 4;
const OVER_LIMIT = 5;
const FIRE_COPIES = 3;
const ARCANE_COPIES = 2;
const POINTS_OF_FIRE_AND_ARCANE = 14;

// A level 2 Fire card costs 4 points for a Wizard who chose Air.
const UNTRAINED_FIRE_COST = 4;
const OVER_BUDGET_POINTS = 124;
const OVER_BY = 4;

const fire = makeCard({ id: 'fire', schools: [{ school: 'Fire', level: LEVEL_TWO }] });
const arcane = makeCard({ id: 'arcane', schools: [{ school: 'Arcane', level: 1 }] });
const warlockOnly = makeCard({ id: 'warlock-only', onlyFor: 'Warlock' });

const indexCards = (cards: Card[]): ReadonlyMap<string, Card> =>
  new Map(cards.map((card) => [card.id, card]));

const cardsById = indexCards([fire, arcane, warlockOnly]);

const wizardBook = (counts: Record<string, number>): Book => ({
  mageId: wizard.id,
  counts,
});

describe('summarizeBook', () => {
  it('reports an empty book as zero points', () => {
    const summary = summarizeBook(wizardBook({}), wizard, cardsById);

    expect(summary.points).toBe(0);
    expect(summary.overBy).toBe(0);
    expect(summary.cardCount).toBe(0);
    expect(summary.issues).toEqual([]);
  });

  it('adds up the cost of every copy', () => {
    const book = wizardBook({ fire: FIRE_COPIES, arcane: ARCANE_COPIES });
    const summary = summarizeBook(book, wizard, cardsById);

    expect(summary.points).toBe(POINTS_OF_FIRE_AND_ARCANE);
    expect(summary.cardCount).toBe(FIRE_COPIES + ARCANE_COPIES);
  });

  it('reports going over budget as overBy, not as an issue', () => {
    const copyCount = OVER_BUDGET_POINTS / UNTRAINED_FIRE_COST;
    const cards = Array.from({ length: copyCount }, (_, index) =>
      makeCard({ id: `fire-${index}`, schools: [{ school: 'Fire', level: LEVEL_TWO }] }),
    );
    const counts = Object.fromEntries(cards.map((card) => [card.id, 1]));
    const book: Book = { mageId: wizard.id, counts };
    const summary = summarizeBook(book, wizard, indexCards(cards));

    expect(summary.points).toBe(OVER_BUDGET_POINTS);
    expect(summary.overBy).toBe(OVER_BY);
    expect(summary.issues).toEqual([]);
  });

  it('reports too many copies of a card', () => {
    const summary = summarizeBook(wizardBook({ fire: OVER_LIMIT }), wizard, cardsById);

    expect(summary.issues).toEqual([
      { kind: 'tooManyCopies', cardId: 'fire', max: LEVEL_TWO_LIMIT },
    ]);
  });

  it('reports a card that is not in the catalog', () => {
    const summary = summarizeBook(wizardBook({ missing: 1 }), wizard, cardsById);

    expect(summary.issues).toEqual([{ kind: 'unknownCard', code: 'missing' }]);
  });

  it('reports a card the mage cannot use', () => {
    const summary = summarizeBook(wizardBook({ 'warlock-only': 1 }), wizard, cardsById);

    expect(summary.issues).toEqual([{ kind: 'illegalCard', cardId: 'warlock-only' }]);
  });
});

describe('canAddCopy', () => {
  it('allows a copy below the limit', () => {
    expect(canAddCopy(wizardBook({ fire: 1 }), fire, wizard)).toBe(true);
  });

  it('refuses a copy at the limit', () => {
    expect(canAddCopy(wizardBook({ fire: LEVEL_TWO_LIMIT }), fire, wizard)).toBe(false);
  });

  it('refuses a card the mage cannot use', () => {
    expect(canAddCopy(wizardBook({}), warlockOnly, wizard)).toBe(false);
  });

  it('allows a copy while over budget', () => {
    const book = wizardBook({ fire: 1 });
    const overBudgetMage = { ...wizard, budget: 0 };

    expect(canAddCopy(book, fire, overBudgetMage)).toBe(true);
  });
});

describe('addCopyBlockedReason', () => {
  it('is null when a copy can be added', () => {
    expect(addCopyBlockedReason(wizardBook({ fire: 1 }), fire, wizard)).toBeNull();
  });

  it('names the copy limit', () => {
    const book = wizardBook({ fire: LEVEL_TWO_LIMIT });

    expect(addCopyBlockedReason(book, fire, wizard)).toBe('Max 4 copies');
  });

  it('uses the singular for an Epic card', () => {
    const epic = makeCard({ id: 'epic', traits: ['Epic'] });

    expect(addCopyBlockedReason(wizardBook({ epic: 1 }), epic, wizard)).toBe('Max 1 copy');
  });

  it('names a card the mage cannot use', () => {
    expect(addCopyBlockedReason(wizardBook({}), warlockOnly, wizard)).toBe(
      'Wizard cannot use this card',
    );
  });
});

describe('cardsIllegalFor', () => {
  it('lists the cards a new mage cannot use', () => {
    const book: Book = {
      mageId: warlock.id,
      counts: { 'warlock-only': 1, fire: 1 },
    };

    expect(cardsIllegalFor(book, wizard, cardsById)).toEqual([warlockOnly]);
  });
});
