import { ConfirmDialog } from "@/components/confirm-dialog/ConfirmDialog";
import { spellbookGroups } from "@/core/catalog/spellbookGroups";
import type { SpellbookSummary } from "@/core/rules/validateSpellbook";
import { spellbookProblems } from "@/core/share-link/spellbookNotes";
import { cardsById } from "@/data/catalog";
import type { BuilderPanelProps } from "@/features/shared/builderPanelProps";
import { EmptyMessage } from "@/features/shared/empty-message/EmptyMessage";
import {
  useViewMode,
  type ViewMode,
} from "@/features/shared/view-switch/useViewMode";
import { ViewSwitch } from "@/features/shared/view-switch/ViewSwitch";
import { Groups } from "./Groups";
import styles from "./SpellbookPanel.module.css";
import { useLastCopyConfirm } from "./useLastCopyConfirm";

/** On its own tab, or as the column next to the catalog on desktop. */
export type SpellbookPanelVariant = "tab" | "column";

interface SpellbookPanelProps extends BuilderPanelProps {
  summary: SpellbookSummary;
  variant?: SpellbookPanelVariant;
}

const EMPTY_TEXT: Record<SpellbookPanelVariant, string> = {
  tab: "No cards yet. Add some from the Cards tab.",
  column: "No cards yet. Add some from the catalog.",
};

/**
 * The desktop column is too narrow for card images, so it always shows rows.
 */
const COLUMN_VIEW: ViewMode = "list";

/**
 * The spellbook's cards, grouped by type with copies and points per group, and
 * what is wrong.
 */
export const SpellbookPanel = ({
  spellbook,
  mage,
  summary,
  onAdd,
  onRemove,
  variant = "tab",
}: SpellbookPanelProps) => {
  const { view: storedView, setView } = useViewMode("spellbook");
  const groups = spellbookGroups(spellbook, mage, cardsById);
  const problems = spellbookProblems(
    summary.issues,
    mage,
    spellbook.counts,
    cardsById,
  );
  const { pendingCardId, requestRemove, confirmRemove, cancelRemove } =
    useLastCopyConfirm(spellbook, onRemove);
  const pendingCard = pendingCardId ? cardsById.get(pendingCardId) : undefined;

  const isColumn = variant === "column";
  const view = isColumn ? COLUMN_VIEW : storedView;

  // An empty spellbook has nothing to show either way, so it gets no view
  // switch.
  const isEmpty = groups.length === 0;
  const showViewSwitch = !isEmpty && !isColumn;

  return (
    <div className={styles.spellbook}>
      {isEmpty ? <EmptyMessage>{EMPTY_TEXT[variant]}</EmptyMessage> : null}
      {showViewSwitch ? (
        <div className={styles.toolbar}>
          <ViewSwitch view={view} onChange={setView} />
        </div>
      ) : null}
      {!isEmpty && problems.length > 0 ? (
        <ul className={styles.problems} aria-label="Problems">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}
      <Groups
        groups={groups}
        spellbook={spellbook}
        mage={mage}
        summary={summary}
        view={view}
        onAdd={onAdd}
        onRemove={requestRemove}
      />
      <ConfirmDialog
        open={pendingCard !== undefined}
        title={`Remove ${pendingCard?.name ?? "card"}?`}
        body={<p>It is the last copy, so the card leaves the spellbook.</p>}
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />
    </div>
  );
};
