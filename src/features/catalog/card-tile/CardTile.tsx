import { memo } from 'react';
import { Stepper } from '@/components/stepper/Stepper';
import { maxCopies } from '@/core/rules/copyLimit';
import type { Card } from '@/core/rules/types';
import { ZoomableImage } from '@/features/shared/card-zoom/ZoomableImage';
import styles from './CardTile.module.css';

interface CardTileProps {
  card: Card;
  count: number;
  /** The cost of one copy. */
  points: number;
  /** Why + is blocked, or null. */
  blockedReason: string | null;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

/** A card image with its cost and a stepper, for the catalog grid. Tapping the image enlarges it. */
export const CardTile = memo(
  ({ card, count, points, blockedReason, onAdd, onRemove }: CardTileProps) => (
    <li className={styles.tile} data-in-book={count > 0}>
      <div className={styles.art}>
        {card.image ? (
          <ZoomableImage name={card.name} image={card.image} className={styles.image} />
        ) : (
          <span className={styles.placeholder}>{card.name}</span>
        )}
        <span className={styles.points}>{points} pts</span>
      </div>
      <Stepper
        value={count}
        max={maxCopies(card)}
        label={card.name}
        disabledReason={blockedReason}
        onIncrement={() => onAdd(card.id)}
        onDecrement={() => onRemove(card.id)}
      />
    </li>
  ),
);
