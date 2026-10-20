export type ManaCost = number | 'X';

const VARIABLE_MARK = 'X';
const COMPOUND_SEPARATOR = '+';
const DIGITS = /^\d+$/;

/** A card's printed mana cost: a number, 'X' for a variable cost, or null when it has none. */
export const parseManaCost = (cost: string): ManaCost | null => {
  const trimmed = cost.trim();

  if (trimmed.includes(VARIABLE_MARK)) {
    return VARIABLE_MARK;
  }

  const parts = trimmed.split(COMPOUND_SEPARATOR).map((part) => part.trim());

  if (!parts.every((part) => DIGITS.test(part))) {
    return null;
  }

  return parts.reduce((sum, part) => sum + Number(part), 0);
};
