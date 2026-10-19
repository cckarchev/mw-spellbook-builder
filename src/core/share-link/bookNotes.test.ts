import { makeCard, wizard } from '@/core/rules/fixtures';
import type { Card } from '@/core/rules/types';
import type { BookSummary } from '@/core/rules/validateBook';
import { incomingProblems, shareNote } from './bookNotes';

const BUDGET = 120;
const OVER_BY = 4;
const LEVEL_TWO_LIMIT = 4;

const fireball = makeCard({ id: 'fireball', name: 'Fireball' });
const warlockOnly = makeCard({ id: 'warlock-only', name: "Adramelech's Torment" });

const cardsById: ReadonlyMap<string, Card> = new Map(
  [fireball, warlockOnly].map((card) => [card.id, card]),
);

const summary = (overrides: Partial<BookSummary> = {}): BookSummary => ({
  points: BUDGET,
  budget: BUDGET,
  overBy: 0,
  cardCount: 1,
  issues: [],
  ...overrides,
});

describe('shareNote', () => {
  it('is null for a legal book', () => {
    expect(shareNote(summary())).toBeNull();
  });

  it('names the points over budget', () => {
    expect(shareNote(summary({ overBy: OVER_BY }))).toBe('Not a legal book yet: 4 points over');
  });

  it('counts the other problems', () => {
    const note = shareNote(
      summary({ overBy: 1, issues: [{ kind: 'illegalCard', cardId: 'warlock-only' }] }),
    );

    expect(note).toBe('Not a legal book yet: 1 point over, 1 problem');
  });
});

describe('incomingProblems', () => {
  it('describes unknown cards, extra copies, illegal cards and a missing school', () => {
    const problems = incomingProblems(
      ['deadbeef', 'cafebabe'],
      [
        { kind: 'unknownCard', code: 'ignored' },
        { kind: 'tooManyCopies', cardId: 'fireball', max: LEVEL_TWO_LIMIT },
        { kind: 'illegalCard', cardId: 'warlock-only' },
        { kind: 'missingSchoolChoice' },
      ],
      wizard,
      { fireball: 5 },
      cardsById,
    );

    expect(problems).toEqual([
      '2 cards in the link are not in the catalog and were left out',
      'Fireball: 5 copies, max 4',
      "Wizard cannot use Adramelech's Torment",
      'Wizard needs a school: choose one in the mage picker',
    ]);
  });

  it('uses the singular for one unknown card', () => {
    expect(incomingProblems(['deadbeef'], [], wizard, {}, cardsById)).toEqual([
      '1 card in the link is not in the catalog and was left out',
    ]);
  });
});
