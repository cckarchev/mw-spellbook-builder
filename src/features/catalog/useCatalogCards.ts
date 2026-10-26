import { useMemo } from "react";
import {
  type CatalogFilters,
  EMPTY_FILTERS,
  filterCards,
} from "@/core/catalog/filterCards";
import { filterOptions } from "@/core/catalog/filterOptions";
import { groupByType } from "@/core/catalog/groupByType";
import { spellbookGroups } from "@/core/catalog/spellbookGroups";
import type { Mage, Spellbook } from "@/core/rules/types";
import { cards, cardsById } from "@/data/catalog";

/**
 * The cards the catalog shows: every card the mage can use, the ones the
 * filters leave, grouped by type, and what the spellbook already has of each
 * type.
 */
export const useCatalogCards = (
  spellbook: Spellbook,
  mage: Mage,
  filters: CatalogFilters,
) => {
  const legalCards = useMemo(
    () => filterCards(cards, EMPTY_FILTERS, mage),
    [mage],
  );
  const options = useMemo(() => filterOptions(legalCards), [legalCards]);
  const shownCards = useMemo(
    () => filterCards(cards, filters, mage),
    [filters, mage],
  );
  const groups = groupByType(shownCards);
  const spellbookGroupsByType = new Map(
    spellbookGroups(spellbook, mage, cardsById).map((spellbookGroup) => [
      spellbookGroup.type,
      spellbookGroup,
    ]),
  );

  return { legalCards, options, shownCards, groups, spellbookGroupsByType };
};
