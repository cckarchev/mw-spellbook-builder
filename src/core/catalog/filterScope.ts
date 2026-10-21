import { trainedSchools } from "@/core/rules/legality";
import type { Mage } from "@/core/rules/types";
import type { CatalogFilters } from "./filterCards";

/** A quick pick over the catalog: every card, the mage's schools, or the mage's "Only" cards. */
export type FilterScope = "all" | "trained" | "only";

const sameSchools = (left: string[], right: string[]): boolean => {
  const sameSize = left.length === right.length;

  return sameSize && left.every((school) => right.includes(school));
};

/** Which quick pick the filters match. Null for school chips picked by hand. */
export const scopeOf = (
  filters: CatalogFilters,
  mage: Mage,
): FilterScope | null => {
  if (filters.onlyCards) {
    return "only";
  }

  if (filters.schools.length === 0) {
    return "all";
  }

  if (sameSchools(filters.schools, trainedSchools(mage))) {
    return "trained";
  }

  return null;
};

/** The filters with a quick pick applied. Only the school chips and the "Only" filter change. */
export const withScope = (
  filters: CatalogFilters,
  scope: FilterScope,
  mage: Mage,
): CatalogFilters => {
  if (scope === "trained") {
    return { ...filters, onlyCards: false, schools: trainedSchools(mage) };
  }

  return { ...filters, onlyCards: scope === "only", schools: [] };
};
