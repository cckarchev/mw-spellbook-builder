import type { SpellbookGroup } from "@/core/catalog/spellbookGroups";
import {
  addCopyBlockedReason,
  type SpellbookSummary,
} from "@/core/rules/validateSpellbook";
import { cardProblems } from "@/core/share-link/spellbookNotes";
import type { BuilderPanelProps } from "@/features/shared/builderPanelProps";
import { CardItem } from "@/features/shared/card-item/CardItem";
import { TypeSection } from "@/features/shared/type-section/TypeSection";
import type { ViewMode } from "@/features/shared/view-switch/useViewMode";

interface GroupsProps extends BuilderPanelProps {
  groups: SpellbookGroup[];
  summary: SpellbookSummary;
  view: ViewMode;
}

/**
 * The spellbook's cards under one section per type, with the problem of each
 * card.
 */
export const Groups = ({
  groups,
  spellbook,
  mage,
  summary,
  view,
  onAdd,
  onRemove,
}: GroupsProps) => {
  const rowProblems = cardProblems(summary.issues, mage);

  return groups.map((group) => (
    <TypeSection
      key={group.type}
      title={group.type}
      count={group.copies}
      meta={`${group.points} pts`}
      layout={view}
    >
      {group.entries.map((entry) => (
        <CardItem
          key={entry.card.id}
          view={view}
          card={entry.card}
          count={entry.count}
          points={entry.points}
          blockedReason={addCopyBlockedReason(spellbook, entry.card, mage)}
          problem={rowProblems.get(entry.card.id) ?? null}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ))}
    </TypeSection>
  ));
};
