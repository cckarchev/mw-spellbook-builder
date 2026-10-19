import { totalLevel } from '@/core/rules/cardCost';
import { isLegalFor } from '@/core/rules/legality';
import type { Card, CardType, Mage, School } from '@/core/rules/types';
import { matchesQuery } from './textSearch';

/** Each list is OR within itself; the query and the lists are ANDed. Empty means "any". */
export interface CatalogFilters {
  query: string;
  types: CardType[];
  schools: School[];
  subtypes: string[];
  expansions: string[];
  levels: number[];
}

export const EMPTY_FILTERS: CatalogFilters = {
  query: '',
  types: [],
  schools: [],
  subtypes: [],
  expansions: [],
  levels: [],
};

const allowsAny = <T>(selected: T[], values: T[]): boolean =>
  selected.length === 0 || values.some((value) => selected.includes(value));

const matchesFilters = (card: Card, filters: CatalogFilters): boolean => {
  const schools = card.schools.map((part) => part.school);
  const matchesType = allowsAny(filters.types, [card.type]);
  const matchesSchool = allowsAny(filters.schools, schools);
  const matchesSubtype = allowsAny(filters.subtypes, card.subtypes);
  const matchesExpansion = allowsAny(filters.expansions, [card.expansion]);
  const matchesLevel = allowsAny(filters.levels, [totalLevel(card)]);

  return (
    matchesType &&
    matchesSchool &&
    matchesSubtype &&
    matchesExpansion &&
    matchesLevel &&
    matchesQuery(card, filters.query)
  );
};

/** The catalog cards the mage can use that match the filters, in input order. */
export const filterCards = (
  cards: Card[],
  filters: CatalogFilters,
  mage: Mage,
  schoolChoice: School | null,
): Card[] => {
  const legalCards = cards.filter((card) => isLegalFor(card, mage, schoolChoice));

  return legalCards.filter((card) => matchesFilters(card, filters));
};
