import { memo, useState } from 'react';
import { schoolSummary } from '@/core/catalog/schoolSummary';
import type { Card } from '@/core/rules/types';
import { CardStepper } from '../CardStepper';
import { CardDetails } from './CardDetails';
import styles from './CardRow.module.css';

interface CardRowProps {
  card: Card;
  count: number;
  /** Points shown on the row: one copy in the catalog, every copy in the book. */
  points: number;
  /** Why + is blocked, or null. */
  blockedReason: string | null;
  /** What is wrong with this card in the book, or null. */
  problem?: string | null;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

/** A card with its cost and a stepper. Tapping it opens the card image and text. */
export const CardRow = memo(
  ({ card, count, points, blockedReason, problem = null, onAdd, onRemove }: CardRowProps) => {
    const [expanded, setExpanded] = useState(false);

    const details = [schoolSummary(card), ...card.subtypes].join(' · ');

    return (
      <li className={styles.row} data-in-book={count > 0} data-problem={problem !== null}>
        <div className={styles.main}>
          <button
            type="button"
            className={styles.summary}
            aria-expanded={expanded}
            onClick={() => setExpanded((isExpanded) => !isExpanded)}
          >
            <span className={styles.name} data-card-name={true}>
              {card.name}
            </span>
            <span className={styles.details}>{details}</span>
            {problem === null ? null : <span className={styles.problem}>{problem}</span>}
          </button>
          <span className={styles.points}>{points} pts</span>
          <CardStepper
            card={card}
            count={count}
            blockedReason={blockedReason}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </div>
        {expanded ? <CardDetails card={card} /> : null}
      </li>
    );
  },
);
