import { type InputHTMLAttributes, type KeyboardEvent, type RefObject, useRef } from 'react';
import { CloseIcon } from '@/components/dialog/CloseIcon';
import styles from './SearchInput.module.css';

type SearchInputSize = 'regular' | 'small';

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'size' | 'type'> {
  value: string;
  onChange: (next: string) => void;
  /** Small fields are as tall as a chip, for toolbars. */
  size?: SearchInputSize;
  inputRef?: RefObject<HTMLInputElement | null>;
}

/** A search field with a button inside it to clear the text. Escape clears it too. */
export const SearchInput = ({
  value,
  onChange,
  size = 'regular',
  inputRef,
  className,
  onKeyDown,
  ...rest
}: SearchInputProps) => {
  const ownRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? ownRef;
  const hasText = value !== '';
  const sizeClass = size === 'small' ? styles.small : undefined;
  const inputClasses = [styles.input, sizeClass].filter(Boolean).join(' ');
  const boxClasses = [styles.box, className].filter(Boolean).join(' ');

  const clear = () => {
    onChange('');
    ref.current?.focus();
  };

  // Escape empties a field with text, and is used up so nothing around it closes as well.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && hasText) {
      event.preventDefault();
      clear();
    }

    onKeyDown?.(event);
  };

  return (
    <div className={boxClasses}>
      <input
        ref={ref}
        className={inputClasses}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      {hasText ? (
        <button type="button" className={styles.clear} aria-label="Clear search" onClick={clear}>
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
};
