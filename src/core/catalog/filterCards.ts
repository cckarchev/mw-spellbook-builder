import { totalLevel } from "@/core/rules/cardCost";
import { isLegalFor } from "@/core/rules/legality";
import type { Card, CardType, Mage, School } from "@/core/rules/types";
import { matchesQuery } from "./textSearch";

/**
 * Each list is OR within itself; the query and the lists are ANDed. Empty means
 * "any".
 */
export interface CatalogFilters {
  query: string;
  types: CardType[];
  schools: School[];
  subtypes: string[];
  expansions: string[];
  levels: number[];
  /** Only the "X Only" cards, which the mage can use and most others cannot. */
  onlyCards: boolean;
}

export const EMPTY_FILTERS: CatalogFilters = {
  query: "",
  types: [],
  schools: [],
  subtypes: [],
  expansions: [],
  levels: [],
  onlyCards: false,
};

/** Selects a value that is not selected, and unselects one that is. */
export const toggleValue = <T>(selected: T[], value: T): T[] =>
  selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];

/**
 * How many chips are selected across the groups, plus one for the "Only"
 * filter. The search query is not counted.
 */
export const activeFilterCount = (filters: CatalogFilters): number => {
  const { types, schools, subtypes, expansions, levels, onlyCards } = filters;
  const chipCount =
    types.length +
    schools.length +
    subtypes.length +
    expansions.length +
    levels.length;
  const onlyCount = onlyCards ? 1 : 0;

  return chipCount + onlyCount;
};

/** Whether the player is searching or has any filter set. */
export const isFiltering = (filters: CatalogFilters): boolean => {
  const hasQuery = filters.query.trim().length > 0;

  return hasQuery || activeFilterCount(filters) > 0;
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
  const matchesOnly = !filters.onlyCards || card.onlyFor !== null;

  return (
    matchesType &&
    matchesSchool &&
    matchesSubtype &&
    matchesExpansion &&
    matchesLevel &&
    matchesOnly &&
    matchesQuery(card, filters.query)
  );
};

/**
 * The catalog cards the mage can use that match the filters, in input order.
 */
export const filterCards = (
  cards: Card[],
  filters: CatalogFilters,
  mage: Mage,
): Card[] => {
  const legalCards = cards.filter((card) => isLegalFor(card, mage));

  return legalCards.filter((card) => matchesFilters(card, filters));
};
