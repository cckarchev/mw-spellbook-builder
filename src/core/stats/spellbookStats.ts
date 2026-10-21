import {
  schoolCharges,
  TRAINED_MULTIPLIER,
  totalLevel,
} from "@/core/rules/cardCost";
import type { Card, Mage, School, Spellbook } from "@/core/rules/types";
import { attackStatsOf } from "./attackStats";
import { manaCurveOf, manaSourcesOf } from "./manaCurve";
import { type CardCopies, rowsByCount, rowsInOrder, tally } from "./rows";
import type { BookStats, SchoolPoints } from "./types";

const HIGHEST_SINGLE_LEVEL = 4;
const TOP_LEVEL_LABEL = `Level ${HIGHEST_SINGLE_LEVEL + 1}+`;

const levelName = (level: number): string => `Level ${level}`;

const LEVEL_ORDER = [
  ...Array.from({ length: HIGHEST_SINGLE_LEVEL }, (_, index) =>
    levelName(index + 1),
  ),
  TOP_LEVEL_LABEL,
];
const ACTION_ORDER = ["Quick", "Full"];

const knownCopies = (
  spellbook: Spellbook,
  cardsById: ReadonlyMap<string, Card>,
): CardCopies[] => {
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
    return TOP_LEVEL_LABEL;
  }

  return levelName(level);
};

/** All the points a school was charged, at the trained rate and above it. */
export const schoolTotal = (row: SchoolPoints): number =>
  row.trainedPoints + row.extraRatePoints;

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

  return [...bySchool.values()]
    .filter((row) => schoolTotal(row) > 0)
    .sort(
      (a, b) =>
        schoolTotal(b) - schoolTotal(a) || a.school.localeCompare(b.school),
    );
};

/** Every stat of the Stats view, per copy, skipping card ids the catalog does not have. */
export const spellbookStats = (
  spellbook: Spellbook,
  mage: Mage,
  cardsById: ReadonlyMap<string, Card>,
): BookStats => {
  const copies = knownCopies(spellbook, cardsById);
  const costed = copies.map(({ card, count }) => ({
    name: card.name,
    manaCost: card.manaCost,
    count,
  }));
  const schools = schoolPointsOf(copies, mage);

  const cardCount = copies.reduce((sum, { count }) => sum + count, 0);
  const untrainedPoints = schools.reduce(
    (sum, row) => sum + row.extraRatePoints,
    0,
  );

  return {
    cardCount,
    manaCurve: manaCurveOf(costed, mage.channeling),
    manaSources: manaSourcesOf(costed),
    types: rowsByCount(tally(copies, (card) => [card.type])),
    levels: rowsInOrder(
      tally(copies, (card) => [levelLabel(card)]),
      LEVEL_ORDER,
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
