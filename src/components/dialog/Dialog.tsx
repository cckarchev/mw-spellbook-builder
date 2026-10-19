import { type ReactNode, useEffect, useId, useRef } from 'react';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  title: string;
  /** Called on Escape and on a tap outside the panel. */
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Moves Tab from the last focusable element to the first, and Shift+Tab the other way. */
const trapTab = (event: KeyboardEvent, panel: HTMLElement) => {
  const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const first = focusable[0];
  const last = focusable.at(-1);
  const active = document.activeElement;
  const isOutside = !panel.contains(active);

  if (!(first && last)) {
    return;
  }

  if (event.shiftKey && (active === first || isOutside)) {
    event.preventDefault();
    last.focus();

    return;
  }

  if (!event.shiftKey && (active === last || isOutside)) {
    event.preventDefault();
    first.focus();
  }
};

/** A modal panel over a dimmed page that keeps the focus inside. Renders nothing while closed. */
export const Dialog = ({ open, title, onClose, children }: DialogProps) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Read through a ref, so a new onClose from a re-render does not refocus the first button.
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }

    panelRef.current?.querySelector<HTMLElement>('button')?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }

      if (event.key === 'Tab' && panelRef.current) {
        trapTab(event, panelRef.current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.scrim}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal={true}
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};
