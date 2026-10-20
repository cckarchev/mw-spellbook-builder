import { type ReactNode, useEffect, useId, useRef } from 'react';
import { CloseIcon } from './CloseIcon';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  title: string;
  /** Called on Escape and on a tap outside the panel. */
  onClose: () => void;
  /** An X in the top right corner that closes the dialog, and takes the focus first unless there is a text field. */
  closeButton?: boolean;
  /** Extra class on the panel, such as one that sets --dialog-width. */
  className?: string;
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

/**
 * Focuses the first text field, its text selected so typing replaces it, or else the first button.
 * A field goes first so the player can type at once, and the phone keyboard opens.
 */
const focusFirst = (panel: HTMLElement) => {
  const field = panel.querySelector<HTMLInputElement>('input');

  if (field) {
    field.focus();
    field.select();

    return;
  }

  panel.querySelector<HTMLElement>('button')?.focus();
};

/** A modal panel over a dimmed page that keeps the focus inside. Renders nothing while closed. */
export const Dialog = ({
  open,
  title,
  onClose,
  closeButton = false,
  className,
  children,
}: DialogProps) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Read through a ref, so a new onClose from a re-render does not refocus the first button.
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (panelRef.current) {
      focusFirst(panelRef.current);
    }

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

  const panelClasses = [styles.panel, className].filter(Boolean).join(' ');

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
        className={panelClasses}
        role="dialog"
        aria-modal={true}
        aria-labelledby={titleId}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {closeButton ? (
            <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
              <CloseIcon />
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
};
