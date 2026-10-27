import type { ReactNode } from "react";
import styles from "./Chip.module.css";

interface ChipProps {
  selected: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** A toggle button, such as one value in a filter group. */
export const Chip = ({ selected, onToggle, children }: ChipProps) => (
  <button
    type="button"
    className={styles.chip}
    aria-pressed={selected}
    onClick={onToggle}
  >
    {children}
  </button>
);
