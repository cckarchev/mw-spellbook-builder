import type { CSSProperties } from 'react';
import styles from './LetterGrid.module.css';
import { useLettersPerRow } from './useLettersPerRow';

interface LetterGridProps {
  letters: readonly string[];
  onJump: (letter: string) => void;
}

/** Large letter buttons that jump to the terms under each letter, in even, centered rows. */
export const LetterGrid = ({ letters, onJump }: LetterGridProps) => {
  const { ref: rowsRef, perRow } = useLettersPerRow(letters.length);
  const rowsStyle = { '--letters-per-row': perRow } as CSSProperties;

  return (
    <nav className={styles.grid} aria-label="Jump to letter">
      <div ref={rowsRef} className={styles.rows} style={rowsStyle}>
        {letters.map((letter) => (
          <button
            key={letter}
            type="button"
            className={styles.letter}
            onClick={() => onJump(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </nav>
  );
};
