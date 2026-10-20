import { memo } from 'react';
import type { Card } from '@/core/rules/types';
import { ZoomableImage } from '@/features/shared/zoomable-image/ZoomableImage';
import { CardStepper } from '../CardStepper';
import styles from './CardTile.module.css';

interface CardTileProps {
  card: Card;
  count: number;
  /** Points shown on the card: one copy in the catalog, every copy in the book. */
  points: number;
  /** Why + is blocked, or null. */
  blockedReason: string | null;
  /** What is wrong with this card in the book, or null. */
  problem?: string | null;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

/** A card image with its points and a stepper, for the grid view. Tapping the image enlarges it. */
export const CardTile = memo(
  ({ card, count, points, blockedReason, problem = null, onAdd, onRemove }: CardTileProps) => (
    <li className={styles.tile} data-in-book={count > 0} data-problem={problem !== null}>
      <div className={styles.art}>
        {card.image ? (
          <ZoomableImage name={card.name} image={card.image} className={styles.image} />
        ) : (
          <span className={styles.placeholder}>{card.name}</span>
        )}
        <span className={styles.points}>{points} pts</span>
      </div>
      <CardStepper
        card={card}
        count={count}
        blockedReason={blockedReason}
        onAdd={onAdd}
        onRemove={onRemove}
      />
      {problem === null ? null : <span className={styles.problem}>{problem}</span>}
    </li>
  ),
);
