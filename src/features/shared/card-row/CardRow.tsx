import { memo, useState } from 'react';
import { Stepper } from '@/components/stepper/Stepper';
import { schoolSummary } from '@/core/catalog/schoolSummary';
import { maxCopies } from '@/core/rules/copyLimit';
import type { Card } from '@/core/rules/types';
import { CardDetails } from './CardDetails';
import styles from './CardRow.module.css';

interface CardRowProps {
  card: Card;
  count: number;
  /** Points shown on the row: one copy in the catalog, every copy in the book. */
  points: number;
  /** Why + is blocked, or null. */
  blockedReason: string | null;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

/** A card with its cost and a stepper. Tapping it opens the card image and text. */
export const CardRow = memo(
  ({ card, count, points, blockedReason, onAdd, onRemove }: CardRowProps) => {
    const [expanded, setExpanded] = useState(false);

    const details = [schoolSummary(card), ...card.subtypes].join(' · ');

    return (
      <li className={styles.row} data-in-book={count > 0}>
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
          </button>
          <span className={styles.points}>{points} pts</span>
          <Stepper
            value={count}
            max={maxCopies(card)}
            label={card.name}
            disabledReason={blockedReason}
            onIncrement={() => onAdd(card.id)}
            onDecrement={() => onRemove(card.id)}
          />
        </div>
        {expanded ? <CardDetails card={card} /> : null}
      </li>
    );
  },
);
