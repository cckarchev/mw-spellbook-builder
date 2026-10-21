import { type RefObject, useId } from 'react';
import { SearchInput } from '@/components/search-input/SearchInput';
import styles from './SearchField.module.css';

interface SearchFieldProps {
  value: string;
  onChange: (next: string) => void;
  /** The input, for the back to top button to focus. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** How many terms show, beside the label, announced to screen readers as it changes. */
  status: string;
}

const LABEL = 'Search terms and rules';
const PLACEHOLDER = 'Burn, Flying, Guard';

/** The Quick reference search, filtering as the player types, with a button to clear it. */
export const SearchField = ({ value, onChange, inputRef, status }: SearchFieldProps) => {
  const id = useId();

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id}>{LABEL}</label>
        <p className={styles.status} role="status">
          {status}
        </p>
      </div>
      <SearchInput
        inputRef={inputRef}
        id={id}
        value={value}
        placeholder={PLACEHOLDER}
        autoComplete="off"
        spellCheck={false}
        onChange={onChange}
      />
    </div>
  );
};
