import type { Book, Mage } from '@/core/rules/types';

/** What the Cards and Book tabs both get from the builder. */
export interface BookPanelProps {
  book: Book;
  mage: Mage;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}
