import { useId, useState } from "react";
import { Chip } from "@/components/chip/Chip";
import { matchesText } from "@/core/catalog/textSearch";
import type { FilterValue } from "../../useCatalogFilters";
import styles from "./FilterGroup.module.css";

interface FilterGroupProps {
  title: string;
  options: FilterValue[];
  selected: FilterValue[];
  /**
   * Narrows the chips to the values that match it. Selected chips always show.
   */
  query: string;
  /** Whether the chips start shown. A query shows them anyway. */
  defaultExpanded?: boolean;
  onToggle: (value: FilterValue) => void;
}

/**
 * One filter's chips under a title that folds them away.
 * Renders nothing when no value is left to pick.
 */
export const FilterGroup = ({
  title,
  options,
  selected,
  query,
  defaultExpanded = true,
  onToggle,
}: FilterGroupProps) => {
  const chipsId = useId();
  const [open, setOpen] = useState(defaultExpanded);

  const searching = query.trim().length > 0;
  const shown = options.filter(
    (option) => selected.includes(option) || matchesText(String(option), query),
  );

  if (shown.length === 0) {
    return null;
  }

  const expanded = searching || open;
  const selectedNote = selected.length > 0 ? ` (${selected.length})` : "";

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={chipsId}
          onClick={() => setOpen(!open)}
        >
          {title}
          {selectedNote}
        </button>
      </legend>
      {expanded ? (
        <div id={chipsId} className={styles.chips}>
          {shown.map((option) => (
            <Chip
              key={option}
              selected={selected.includes(option)}
              onToggle={() => onToggle(option)}
            >
              {option}
            </Chip>
          ))}
        </div>
      ) : null}
    </fieldset>
  );
};
