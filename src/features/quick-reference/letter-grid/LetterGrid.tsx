import type { CSSProperties, Ref } from 'react';
import styles from './LetterGrid.module.css';
import { useLettersPerRow } from './useLettersPerRow';

interface LetterGridProps {
  letters: readonly string[];
  /** The letter at the top of the list. */
  current: string;
  /** Folded away while the player scrolls down. */
  folded: boolean;
  onJump: (letter: string) => void;
  ref?: Ref<HTMLElement>;
}

/** Large letter buttons that jump to the terms under each letter, in even, centered rows. */
export const LetterGrid = ({ letters, current, folded, onJump, ref }: LetterGridProps) => {
  const { ref: rowsRef, perRow } = useLettersPerRow(letters.length);
  const rowsStyle = { '--letters-per-row': perRow } as CSSProperties;

  return (
    <nav
      ref={ref}
      className={styles.grid}
      aria-label="Jump to letter"
      data-folded={folded ? '' : undefined}
    >
      <div ref={rowsRef} className={styles.rows} style={rowsStyle}>
        {letters.map((letter) => (
          <button
            key={letter}
            type="button"
            className={styles.letter}
            aria-current={letter === current ? 'true' : undefined}
            onClick={() => onJump(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </nav>
  );
};
