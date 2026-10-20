import type { Card } from '@/core/rules/types';

/** What a card row and a card tile both show of one card, and how they change its copies. */
export interface CardEntryProps {
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
