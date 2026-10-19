import { totalLevel } from '@/core/rules/cardCost';
import { type Card, type CardType, SCHOOLS, type School } from '@/core/rules/types';
import { TYPE_ORDER } from './groupByType';

/** The values a filter group can offer: only those some card in the list has. */
export interface FilterOptions {
  types: CardType[];
  schools: School[];
  subtypes: string[];
  expansions: string[];
  levels: number[];
}

const sortedUnique = (values: string[]): string[] =>
  [...new Set(values)].sort((left, right) => left.localeCompare(right));

export const filterOptions = (cards: Card[]): FilterOptions => {
  const types = new Set(cards.map((card) => card.type));
  const schools = new Set(cards.flatMap((card) => card.schools.map((part) => part.school)));
  const levels = [...new Set(cards.map(totalLevel))].sort((left, right) => left - right);

  return {
    types: TYPE_ORDER.filter((type) => types.has(type)),
    schools: SCHOOLS.filter((school) => schools.has(school)),
    subtypes: sortedUnique(cards.flatMap((card) => card.subtypes)),
    expansions: sortedUnique(cards.map((card) => card.expansion)),
    levels,
  };
};
