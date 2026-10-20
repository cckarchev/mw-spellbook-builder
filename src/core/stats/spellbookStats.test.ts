import { makeCard, wizard } from '@/core/rules/fixtures';
import type { Card, Spellbook } from '@/core/rules/types';
import { summarizeSpellbook } from '@/core/rules/validateSpellbook';
import { spellbookStats } from './spellbookStats';

type Entry = [Card, number];

let nextId = 0;

const card = (overrides: Partial<Card>): Card => {
  nextId += 1;

  return makeCard({ id: `card-${nextId}`, ...overrides });
};

const bookOf = (...entries: Entry[]): { spellbook: Spellbook; cardsById: Map<string, Card> } => {
  const counts = Object.fromEntries(entries.map(([entryCard, count]) => [entryCard.id, count]));
  const cardsById = new Map(entries.map(([entryCard]) => [entryCard.id, entryCard]));

  return { spellbook: { mageId: wizard.id, counts }, cardsById };
};

const statsOf = (...entries: Entry[]) => {
  const { spellbook, cardsById } = bookOf(...entries);

  return spellbookStats(spellbook, wizard, cardsById);
};

const bucketCount = (stats: ReturnType<typeof statsOf>, label: string): number =>
  stats.manaCurve.buckets.find((bucket) => bucket.label === label)?.count ?? -1;

const THREE_COPIES = 3;
const FOUR_POINTS = 4;

describe('spellbookStats mana', () => {
  it('buckets fixed costs and counts X apart', () => {
    const stats = statsOf(
      [card({ manaCost: '2' }), 2],
      [card({ manaCost: '4' }), 1],
      [card({ manaCost: '13' }), 1],
      [card({ manaCost: 'X' }), 1],
    );

    expect(stats.manaCurve.buckets.map((bucket) => bucket.label)).toEqual([
      '0-2',
      '3-4',
      '5-6',
      '7-8',
      '9-10',
      '11-12',
      '13+',
    ]);
    expect(bucketCount(stats, '0-2')).toBe(2);
    expect(bucketCount(stats, '3-4')).toBe(1);
    expect(bucketCount(stats, '13+')).toBe(1);
    expect(bucketCount(stats, '5-6')).toBe(0);
    expect(bucketCount(stats, '7-8')).toBe(0);
    expect(bucketCount(stats, '9-10')).toBe(0);
    expect(bucketCount(stats, '11-12')).toBe(0);
    expect(stats.manaCurve.variable).toBe(1);
  });

  it('compares fixed costs with the channeling', () => {
    const stats = statsOf(
      [card({ manaCost: '10' }), 1],
      [card({ manaCost: '11' }), 1],
      [card({ manaCost: 'X' }), 1],
    );

    expect(stats.manaCurve).toMatchObject({ atOrBelow: 1, above: 1, channeling: 10 });
  });

  it('points at the bucket that holds the channeling', () => {
    const nineToTen = 4;

    expect(statsOf().manaCurve.channelingBucket).toBe(nineToTen);
  });

  it('lists flat mana sources with their total', () => {
    const stats = statsOf(
      [card({ name: 'Harmonize' }), 1],
      [card({ name: 'Mana Crystal' }), 2],
      [card({ name: 'Mana Shard' }), 1],
    );

    expect(stats.manaSources).toEqual({
      cards: [
        { name: 'Mana Crystal', count: 2 },
        { name: 'Harmonize', count: 1 },
      ],
      total: 3,
    });
  });
});

describe('spellbookStats counts', () => {
  it('counts types, levels and actions per copy', () => {
    const levelFive = 5;
    const stats = statsOf(
      [card({ type: 'Creature', action: 'Quick', schools: [{ school: 'Arcane', level: 1 }] }), 2],
      [
        card({ type: 'Attack', action: 'Full', schools: [{ school: 'Arcane', level: levelFive }] }),
        1,
      ],
    );

    expect(stats.cardCount).toBe(THREE_COPIES);
    expect(stats.types).toEqual([
      { label: 'Creature', count: 2 },
      { label: 'Attack', count: 1 },
    ]);
    expect(stats.levels).toEqual([
      { label: 'Level 1', count: 2 },
      { label: 'Level 5+', count: 1 },
    ]);
    expect(stats.actions).toEqual([
      { label: 'Quick', count: 2 },
      { label: 'Full', count: 1 },
    ]);
  });

  it('splits school points at the trained rate and above it', () => {
    const stats = statsOf(
      [card({ schools: [{ school: 'Arcane', level: 2 }] }), 2],
      [card({ schools: [{ school: 'Fire', level: 2 }] }), 1],
    );

    expect(stats.schools).toEqual([
      { school: 'Arcane', trainedPoints: 4, extraRatePoints: 0 },
      { school: 'Fire', trainedPoints: 0, extraRatePoints: 4 },
    ]);
    expect(stats.untrainedPoints).toBe(FOUR_POINTS);
  });
});

describe('spellbookStats edge cases', () => {
  it('adds up to the summary points', () => {
    const { spellbook, cardsById } = bookOf(
      [card({ schools: [{ school: 'Arcane', level: 3 }] }), 2],
      [
        card({
          schoolMode: 'and',
          schools: [
            { school: 'Fire', level: 1 },
            { school: 'Air', level: 2 },
          ],
        }),
        1,
      ],
      [
        card({
          schoolMode: 'or',
          schools: [
            { school: 'Dark', level: 2 },
            { school: 'Holy', level: 2 },
          ],
        }),
        2,
      ],
      [card({ name: 'Talos', schools: [{ school: 'War', level: 7 }] }), 1],
    );
    const stats = spellbookStats(spellbook, wizard, cardsById);
    const schoolTotal = stats.schools.reduce(
      (sum, row) => sum + row.trainedPoints + row.extraRatePoints,
      0,
    );

    expect(schoolTotal).toBe(summarizeSpellbook(spellbook, wizard, cardsById).points);
  });

  it('skips cards the catalog does not have', () => {
    const known = card({});
    const { spellbook, cardsById } = bookOf([known, 1]);
    const withUnknown = { ...spellbook, counts: { ...spellbook.counts, 'missing-card': 2 } };

    expect(spellbookStats(withUnknown, wizard, cardsById).cardCount).toBe(1);
  });

  it('is all zeros for an empty spellbook', () => {
    const stats = statsOf();

    expect(stats.cardCount).toBe(0);
    expect(stats.manaCurve.buckets.every((bucket) => bucket.count === 0)).toBe(true);
    expect(stats.types).toEqual([]);
    expect(stats.schools).toEqual([]);
  });
});

describe('spellbookStats attacks', () => {
  it('counts each card once per reach and per damage type', () => {
    const attackBar =
      'Bite\nQuick | Melee | 4d6\nSpit\nFull | Ranged 0-1 | Acid | 3d6\nClaw\nQuick | Melee | 2d6';
    const stats = statsOf([card({ attackBar }), 2]);

    expect(stats.attacks).toEqual({
      melee: 2,
      ranged: 2,
      damageTypes: [
        { label: 'Acid', count: 2 },
        { label: 'Physical', count: 2 },
      ],
    });
  });

  it('leaves walls out of reach but counts their damage', () => {
    const attackBar =
      'Searing Flame\nPassage Attacks | Flame | 5d6 | d12 5-9 = Burn, 10+ = 2 Burn | Unavoidable, Defrost';
    const stats = statsOf([card({ name: 'Wall of Fire', attackBar }), 1]);

    expect(stats.attacks).toEqual({
      melee: 0,
      ranged: 0,
      damageTypes: [{ label: 'Flame', count: 1 }],
    });
  });
});
