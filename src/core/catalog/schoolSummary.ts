import type { Card } from '@/core/rules/types';

const AND_SEPARATOR = ' + ';
const OR_SEPARATOR = ' / ';

/** A card's schools and levels in one short line, such as 'Fire 1 + Air 1'. */
export const schoolSummary = (card: Card): string => {
  const parts = card.schools.map((part) => `${part.school} ${part.level}`);
  const separator = card.schoolMode === 'or' ? OR_SEPARATOR : AND_SEPARATOR;

  return parts.join(separator);
};
