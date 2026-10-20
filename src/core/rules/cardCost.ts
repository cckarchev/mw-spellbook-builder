import type { Card, Mage, School, SchoolPart } from './types';

export const TRAINED_MULTIPLIER = 1;
const UNTRAINED_MULTIPLIER = 2;
const OPPOSED_MULTIPLIER = 3;

const NOVICE_TRAIT = 'Novice';

// Talos says it costs no spellpoints; the module matches it by name too.
const FREE_CARD_NAMES = new Set(['Talos']);

/** Total level of a card: "and" cards add their parts, "or" cards use the highest. */
export const totalLevel = (card: Card): number => {
  const levels = card.schools.map((part) => part.level);

  if (card.schoolMode === 'or') {
    return Math.max(...levels);
  }

  return levels.reduce((sum, level) => sum + level, 0);
};

const isWithinPartialTraining = (part: SchoolPart, mage: Mage): boolean =>
  mage.training.partial.some(
    (partial) => partial.school === part.school && part.level <= partial.maxLevel,
  );

const isPartTrained = (part: SchoolPart, mage: Mage): boolean =>
  mage.training.full.includes(part.school) || isWithinPartialTraining(part, mage);

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

/** Points one school part of a card is charged: its level times the mage's rate for it. */
export interface SchoolCharge {
  school: School;
  level: number;
  multiplier: number;
  points: number;
}

/**
 * The school parts a card is charged for, following the module's SpellbookValidator: Novice,
 * combo and subtype training beat an opposed school. Unlike the module, each part of an "and"
 * card is charged its own multiplier, as the players confirmed. An "or" card is charged only
 * at its cheapest part, the first listed on a tie.
 */
export const schoolCharges = (card: Card, mage: Mage): SchoolCharge[] => {
  if (FREE_CARD_NAMES.has(card.name)) {
    return [];
  }

  const wholeCardTrained = isWholeCardTrained(card, mage);
  const anyPartTrained = card.schools.some((part) => isPartTrained(part, mage));
  const isOpposedType = mage.training.opposedTypes.includes(card.type) && !anyPartTrained;

  const multiplierFor = (part: SchoolPart): number => {
    if (wholeCardTrained || isPartTrained(part, mage)) {
      return TRAINED_MULTIPLIER;
    }

    if (mage.training.opposed.includes(part.school)) {
      return OPPOSED_MULTIPLIER;
    }

    if (isOpposedType) {
      return OPPOSED_MULTIPLIER;
    }

    return UNTRAINED_MULTIPLIER;
  };

  const charges = card.schools.map((part): SchoolCharge => {
    const multiplier = multiplierFor(part);

    return { school: part.school, level: part.level, multiplier, points: part.level * multiplier };
  });

  if (card.schoolMode === 'or') {
    const cheapest = charges.reduce((best, charge) =>
      charge.points < best.points ? charge : best,
    );

    return [cheapest];
  }

  return charges;
};

/** Spellbook points for one copy of a card in this mage's spellbook. */
export const cardCost = (card: Card, mage: Mage): number =>
  schoolCharges(card, mage).reduce((sum, charge) => sum + charge.points, 0);
