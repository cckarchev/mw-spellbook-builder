import { schoolCharges, TRAINED_MULTIPLIER, totalLevel } from '@/core/rules/cardCost';
import type { Card, Mage, School, Spellbook } from '@/core/rules/types';
import { attackStatsOf } from './attackStats';
import { manaCurveOf, manaSourcesOf } from './manaCurve';
import { type CardCopies, rowsByCount, rowsInOrder, tally } from './rows';
import type { SchoolPoints, SpellbookStats } from './types';

const HIGHEST_SINGLE_LEVEL = 4;
const ACTION_ORDER = ['Quick', 'Full'];

const knownCopies = (spellbook: Spellbook, cardsById: ReadonlyMap<string, Card>): CardCopies[] => {
  const copies: CardCopies[] = [];

  for (const [cardId, count] of Object.entries(spellbook.counts)) {
    const card = cardsById.get(cardId);

    if (!card || count <= 0) {
      continue;
    }

    copies.push({ card, count });
  }

  return copies;
};

const levelLabel = (card: Card): string => {
  const level = totalLevel(card);

  if (level > HIGHEST_SINGLE_LEVEL) {
    return `Level ${HIGHEST_SINGLE_LEVEL + 1}+`;
  }

  return `Level ${level}`;
};

const levelOrder = (): string[] => {
  const singleLevels = Array.from(
    { length: HIGHEST_SINGLE_LEVEL },
    (_, index) => `Level ${index + 1}`,
  );

  return [...singleLevels, `Level ${HIGHEST_SINGLE_LEVEL + 1}+`];
};

const schoolPointsOf = (copies: CardCopies[], mage: Mage): SchoolPoints[] => {
  const bySchool = new Map<School, SchoolPoints>();

  for (const { card, count } of copies) {
    for (const charge of schoolCharges(card, mage)) {
      const row = bySchool.get(charge.school) ?? {
        school: charge.school,
        trainedPoints: 0,
        extraRatePoints: 0,
      };
      const points = charge.points * count;

      if (charge.multiplier > TRAINED_MULTIPLIER) {
        row.extraRatePoints += points;
      } else {
        row.trainedPoints += points;
      }

      bySchool.set(charge.school, row);
    }
  }

  const totalOf = (row: SchoolPoints): number => row.trainedPoints + row.extraRatePoints;

  return [...bySchool.values()]
    .filter((row) => totalOf(row) > 0)
    .sort((a, b) => totalOf(b) - totalOf(a) || a.school.localeCompare(b.school));
};

/** Every stat of the Stats view, per copy, skipping card ids the catalog does not have. */
export const spellbookStats = (
  spellbook: Spellbook,
  mage: Mage,
  cardsById: ReadonlyMap<string, Card>,
): SpellbookStats => {
  const copies = knownCopies(spellbook, cardsById);
  const costed = copies.map(({ card, count }) => ({
    name: card.name,
    manaCost: card.manaCost,
    count,
  }));
  const schools = schoolPointsOf(copies, mage);

  const cardCount = copies.reduce((sum, { count }) => sum + count, 0);
  const untrainedPoints = schools.reduce((sum, row) => sum + row.extraRatePoints, 0);

  return {
    cardCount,
    manaCurve: manaCurveOf(costed, mage.channeling),
    manaSources: manaSourcesOf(costed),
    types: rowsByCount(tally(copies, (card) => [card.type])),
    levels: rowsInOrder(
      tally(copies, (card) => [levelLabel(card)]),
      levelOrder(),
    ),
    actions: rowsInOrder(
      tally(copies, (card) => [card.action]),
      ACTION_ORDER,
    ),
    schools,
    untrainedPoints,
    attacks: attackStatsOf(copies),
  };
};
