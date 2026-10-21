import { memo } from "react";
import { isFiltering } from "@/core/catalog/filterCards";
import { scopeOf } from "@/core/catalog/filterScope";
import type { SpellbookGroup } from "@/core/catalog/spellbookGroups";
import { cardCost } from "@/core/rules/cardCost";
import { addCopyBlockedReason } from "@/core/rules/validateSpellbook";
import { plural } from "@/core/text/plural";
import type { BuilderPanelProps } from "@/features/shared/builderPanelProps";
import { CardItem } from "@/features/shared/card-item/CardItem";
import { TypeSection } from "@/features/shared/type-section/TypeSection";
import { useViewMode } from "@/features/shared/view-switch/useViewMode";
import { ViewSwitch } from "@/features/shared/view-switch/ViewSwitch";
import styles from "./Catalog.module.css";
import { FilterBar } from "./filter-bar/FilterBar";
import { useCatalogCards } from "./useCatalogCards";
import { useCatalogFilters } from "./useCatalogFilters";

/** What the spellbook already has of one type, such as "5 in spellbook · 16 pts". Nothing when it has none. */
const inSpellbookLabel = (
  spellbookGroup: SpellbookGroup | undefined,
): string | undefined => {
  if (!spellbookGroup) {
    return undefined;
  }

  return `${spellbookGroup.copies} in spellbook · ${spellbookGroup.points} pts`;
};

/**
 * Every card the mage can use, filtered and grouped by type, each with its cost and a stepper.
 * Memoized so the builder can render again under the Quick reference without redoing the list.
 */
export const Catalog = memo(
  ({ spellbook, mage, onAdd, onRemove }: BuilderPanelProps) => {
    const { filters, setQuery, toggle, setScope, clearChips } =
      useCatalogFilters(mage);
    const { view, setView } = useViewMode("catalog");
    const { legalCards, options, shownCards, groups, spellbookGroupsByType } =
      useCatalogCards(spellbook, mage, filters);

    // Collapsed to browse by type; open while searching or filtering, so the matches show.
    const filtering = isFiltering(filters);

    return (
      <div className={styles.catalog}>
        <FilterBar
          filters={filters}
          options={options}
          onQueryChange={setQuery}
          onToggle={toggle}
          scope={scopeOf(filters, mage)}
          onScopeChange={setScope}
          onClearChips={clearChips}
        >
          <ViewSwitch view={view} onChange={setView} />
        </FilterBar>
        {filtering ? (
          <p className={styles.count} data-empty={shownCards.length === 0}>
            Showing {shownCards.length} of{" "}
            {plural(legalCards.length, "card", "cards")}
          </p>
        ) : null}
        {groups.map((group) => (
          <TypeSection
            key={`${group.type}:${filtering}`}
            title={group.type}
            count={group.items.length}
            meta={inSpellbookLabel(spellbookGroupsByType.get(group.type))}
            defaultExpanded={filtering}
            layout={view}
          >
            {group.items.map((card) => (
              <CardItem
                key={card.id}
                view={view}
                card={card}
                count={spellbook.counts[card.id] ?? 0}
                points={cardCost(card, mage)}
                blockedReason={addCopyBlockedReason(spellbook, card, mage)}
                onAdd={onAdd}
                onRemove={onRemove}
              />
            ))}
          </TypeSection>
        ))}
      </div>
    );
  },
);
