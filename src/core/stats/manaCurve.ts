import { parseManaCost } from './manaCost';
import type { CountRow, ManaCurve, ManaSources } from './types';

interface CostBucket {
  label: string;
  max: number;
}

const COST_BUCKETS: CostBucket[] = [
  { label: '0-2', max: 2 },
  { label: '3-4', max: 4 },
  { label: '5-6', max: 6 },
  { label: '7-8', max: 8 },
  { label: '9-10', max: 10 },
  { label: '11-12', max: 12 },
  { label: '13+', max: Number.POSITIVE_INFINITY },
];

// Cards that add a flat +1 channeling per copy once in play, in display order.
const FLAT_MANA_SOURCES = ['Mana Crystal', 'Mana Flower', 'Harmonize'];
const CHANNELING_PER_SOURCE = 1;

export interface CostedCopies {
  manaCost: string;
  name: string;
  count: number;
}

export const manaCurveOf = (copies: CostedCopies[], channeling: number): ManaCurve => {
  const buckets: CountRow[] = COST_BUCKETS.map((bucket) => ({ label: bucket.label, count: 0 }));
  let variable = 0;
  let atOrBelow = 0;
  let above = 0;

  for (const { manaCost, count } of copies) {
    const cost = parseManaCost(manaCost);

    if (cost === null) {
      continue;
    }

    if (cost === 'X') {
      variable += count;
      continue;
    }

    const bucketIndex = COST_BUCKETS.findIndex((bucket) => cost <= bucket.max);
    const bucket = buckets[bucketIndex];

    if (bucket) {
      bucket.count += count;
    }

    if (cost <= channeling) {
      atOrBelow += count;
    } else {
      above += count;
    }
  }

  return { buckets, variable, channeling, atOrBelow, above };
};

export const manaSourcesOf = (copies: CostedCopies[]): ManaSources => {
  const cards = FLAT_MANA_SOURCES.map((name) => {
    const count = copies
      .filter((copy) => copy.name === name)
      .reduce((sum, copy) => sum + copy.count, 0);

    return { name, count };
  }).filter((source) => source.count > 0);

  const total = cards.reduce((sum, source) => sum + source.count * CHANNELING_PER_SOURCE, 0);

  return { cards, total };
};
