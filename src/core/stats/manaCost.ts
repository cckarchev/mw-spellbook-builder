type ManaCost = number | 'X';

const VARIABLE_MARK = 'X';
// Sentinel of V'Tar prints "2+3": cast for 2, reveal for 3. The curve counts the casting cost.
const REVEAL_SEPARATOR = '+';
const DIGITS = /^\d+$/;

/** A card's mana cost to cast it: a number, 'X' for a variable cost, or null when it has none. */
export const parseManaCost = (cost: string): ManaCost | null => {
  const trimmed = cost.trim();

  if (trimmed.includes(VARIABLE_MARK)) {
    return VARIABLE_MARK;
  }

  const [castingCost = ''] = trimmed.split(REVEAL_SEPARATOR).map((part) => part.trim());

  if (!DIGITS.test(castingCost)) {
    return null;
  }

  return Number(castingCost);
};
