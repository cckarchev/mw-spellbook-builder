import styles from './Segmented.module.css';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
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
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </fieldset>
);
