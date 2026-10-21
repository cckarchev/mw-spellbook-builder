import { type KeyboardEvent, type RefObject, useId } from 'react';
import { CloseIcon } from '@/components/dialog/CloseIcon';
import styles from './SearchField.module.css';

interface SearchFieldProps {
  value: string;
  onChange: (next: string) => void;
  /** The input, for the back to top button to focus. */
  inputRef: RefObject<HTMLInputElement | null>;
}

const LABEL = 'Search terms and rules';
const PLACEHOLDER = 'Burn, Flying, Guard';

/** The Quick reference search, filtering as the player types, with a button to clear it. */
export const SearchField = ({ value, onChange, inputRef }: SearchFieldProps) => {
  const id = useId();
  const hasText = value !== '';

  const clear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  // Escape empties a field with text before it closes the Quick reference.
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && hasText) {
      event.preventDefault();
      clear();
    }
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {LABEL}
      </label>
      <div className={styles.box}>
        <input
          ref={inputRef}
          id={id}
          className={styles.input}
          type="search"
          value={value}
          placeholder={PLACEHOLDER}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        {hasText ? (
          <button type="button" className={styles.clear} aria-label="Clear search" onClick={clear}>
            <CloseIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
};
