import { useState } from 'react';
import styles from './Stepper.module.css';

interface StepperProps {
  value: number;
  max: number;
  /** What is being counted, such as the card name; used in the button labels. */
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Why + is blocked, such as an untrained school. Null when + is allowed. */
  disabledReason: string | null;
}

const LIMIT_REASON = 'Copy limit reached';

/**
 * A − value + control. A blocked + stays tappable (aria-disabled, not disabled),
 * so a tap on a phone can show why it is blocked.
 */
export const Stepper = ({
  value,
  max,
  label,
  onIncrement,
  onDecrement,
  disabledReason,
}: StepperProps) => {
  const [showReason, setShowReason] = useState(false);

  const isAtLimit = value >= max;
  const blockedReason = disabledReason ?? (isAtLimit ? LIMIT_REASON : null);
  const isBlocked = blockedReason !== null;

  const handleIncrement = () => {
    if (isBlocked) {
      setShowReason(true);

      return;
    }

    onIncrement();
  };

  return (
    <div className={styles.stepper}>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.step}
          aria-label={`Remove one ${label}`}
          disabled={value === 0}
          onClick={onDecrement}
        >
          −
        </button>
        <span className={styles.value}>{value}</span>
        <button
          type="button"
          className={styles.step}
          aria-label={`Add one ${label}`}
          aria-disabled={isBlocked}
          title={blockedReason ?? undefined}
          onClick={handleIncrement}
        >
          +
        </button>
      </div>
      {isBlocked && showReason ? (
        <span role="status" className={styles.reason}>
          {blockedReason}
        </span>
      ) : null}
    </div>
  );
};
