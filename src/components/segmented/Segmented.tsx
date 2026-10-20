import type { ReactNode } from 'react';
import styles from './Segmented.module.css';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** Shown in place of the label, which becomes the name and the tooltip. */
  icon?: ReactNode;
}

interface SegmentedProps<T extends string> {
  /** Names the group for screen readers. */
  label: string;
  options: SegmentedOption<T>[];
  /** Null when no option matches, such as after picking chips by hand. */
  value: T | null;
  onChange: (value: T) => void;
}

/** A row of joined buttons where one at most is pressed. */
export const Segmented = <T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedProps<T>) => (
  <fieldset className={styles.segmented} aria-label={label}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={styles.segment}
        aria-pressed={option.value === value}
        aria-label={option.icon ? option.label : undefined}
        title={option.icon ? option.label : undefined}
        onClick={() => onChange(option.value)}
      >
        {option.icon ?? option.label}
      </button>
    ))}
  </fieldset>
);
