import type { Card, Mage, SchoolPart } from './types';

const TRAINED_MULTIPLIER = 1;
const UNTRAINED_MULTIPLIER = 2;
const OPPOSED_MULTIPLIER = 3;

const NOVICE_TRAIT = 'Novice';

/** Total level of a card: "and" cards add their parts, "or" cards use the highest. */
export const totalLevel = (card: Card): number => {
  const levels = card.schools.map((part) => part.level);

  if (card.schoolMode === 'or') {
    return Math.max(...levels);
  }

  return levels.reduce((sum, level) => sum + level, 0);
};

const isPartTrained = (part: SchoolPart, mage: Mage): boolean => {
  const { training } = mage;
  const isFull = training.full.includes(part.school);
  const isPartial = training.partial.some(
    (partial) => partial.school === part.school && part.level <= partial.maxLevel,
  );

  return isFull || isPartial;
};

/** Novice, a trained school and type combo, or a trained subtype make the whole card trained. */
const isWholeCardTrained = (card: Card, mage: Mage): boolean => {
  const { training } = mage;
  const isNovice = card.traits.includes(NOVICE_TRAIT);
  const matchesCombo = training.trainedCombos.some(
    (combo) =>
      combo.type === card.type && card.schools.some((part) => part.school === combo.school),
  );
  const matchesSubtype = card.subtypes.some((subtype) => training.subtypes.includes(subtype));

  return isNovice || matchesCombo || matchesSubtype;
};

/** Spellbook points for one copy of a card in this mage's book. */
export const cardCost = (card: Card, mage: Mage): number => {
  const wholeCardTrained = isWholeCardTrained(card, mage);
  const anyPartTrained = card.schools.some((part) => isPartTrained(part, mage));
  const isOpposedType = mage.training.opposedTypes.includes(card.type) && !anyPartTrained;

  const multiplierFor = (part: SchoolPart): number => {
    // An opposed school costs triple even on a Novice card.
    if (mage.training.opposed.includes(part.school)) {
      return OPPOSED_MULTIPLIER;
    }

    if (wholeCardTrained || isPartTrained(part, mage)) {
      return TRAINED_MULTIPLIER;
    }

    if (isOpposedType) {
      return OPPOSED_MULTIPLIER;
    }

    return UNTRAINED_MULTIPLIER;
  };

  const partCosts = card.schools.map((part) => part.level * multiplierFor(part));

  if (card.schoolMode === 'or') {
    return Math.min(...partCosts);
  }

  return partCosts.reduce((sum, cost) => sum + cost, 0);
};
