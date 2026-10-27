import { useCallback, useId, useRef, useState } from "react";
import { Popover } from "@/components/popover/Popover";
import styles from "./Stepper.module.css";

interface StepperProps {
  value: number;
  max: number;
  /**
   * What is being counted, such as the card name; used in the button labels.
   */
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Why + is blocked, such as an untrained school. Null when + is allowed. */
  disabledReason: string | null;
}

const LIMIT_REASON = "Copy limit reached";

/**
 * A − value + control. A blocked + stays tappable (aria-disabled, not
 * disabled), so a tap on a phone can show why it is blocked, in a popover that
 * leaves the page in place.
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
  const reasonId = useId();
  const incrementRef = useRef<HTMLButtonElement>(null);
  const hideReason = useCallback(() => setShowReason(false), []);

  const isAtLimit = value >= max;
  const blockedReason = disabledReason ?? (isAtLimit ? LIMIT_REASON : null);
  const isBlocked = blockedReason !== null;
  const isReasonShown = isBlocked && showReason;

  const handleIncrement = () => {
    if (isBlocked) {
      setShowReason(true);

      return;
    }

    onIncrement();
  };

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.step}
        aria-label={`Remove one ${label}`}
        disabled={value === 0}
        onClick={onDecrement}
      >
        −
      </button>
      {/* An <output> is a status, so a screen reader reads each new value. */}
      <output className={styles.value}>{value}</output>
      <button
        ref={incrementRef}
        type="button"
        className={styles.step}
        aria-label={`Add one ${label}`}
        aria-disabled={isBlocked}
        aria-describedby={isReasonShown ? reasonId : undefined}
        title={blockedReason ?? undefined}
        onClick={handleIncrement}
      >
        +
      </button>
      <Popover
        id={reasonId}
        isOpen={isReasonShown}
        anchorRef={incrementRef}
        role="status"
        onClose={hideReason}
      >
        {blockedReason}
      </Popover>
    </div>
  );
};
