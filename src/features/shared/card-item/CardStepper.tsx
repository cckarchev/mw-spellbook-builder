import { Stepper } from '@/components/stepper/Stepper';
import { maxCopies } from '@/core/rules/copyLimit';
import type { Card } from '@/core/rules/types';

interface CardStepperProps {
  card: Card;
  count: number;
  /** Why + is blocked, or null. */
  blockedReason: string | null;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}

/** The − copies + control of a card, capped at its copy limit. */
export const CardStepper = ({ card, count, blockedReason, onAdd, onRemove }: CardStepperProps) => (
  <Stepper
    value={count}
    max={maxCopies(card)}
    label={card.name}
    disabledReason={blockedReason}
    onIncrement={() => onAdd(card.id)}
    onDecrement={() => onRemove(card.id)}
  />
);
