import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { GlossaryEntry } from '@/core/glossary/types';
import { useDismiss } from '../useDismiss';
import styles from './GlossaryText.module.css';
import { useOpenTermStore } from './useOpenTermStore';
import { usePlacement } from './usePopover';

interface GlossaryTermProps {
  /** The words as the card prints them, such as "Aegis 2". */
  text: string;
  entry: GlossaryEntry;
}

/** A tappable glossary term. Tapping it shows its definition in a popover over the page. */
export const GlossaryTerm = ({ text, entry }: GlossaryTermProps) => {
  const id = useId();
  const isOpen = useOpenTermStore((state) => state.openId === id);
  const toggle = useOpenTermStore((state) => state.toggle);
  const close = useOpenTermStore((state) => state.close);
  const termRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const refs = useRef({ termRef, popoverRef }).current;
  const closeThis = useCallback(() => close(id), [close, id]);
  const placement = usePlacement(isOpen, refs);

  useDismiss(isOpen, { anchorRef: termRef, popupRef: popoverRef }, closeThis);

  // A term that goes away, such as when its card row closes, takes its popover with it.
  useEffect(() => closeThis, [closeThis]);

  const popoverStyle = placement ? { left: placement.left, top: placement.top } : undefined;

  return (
    <>
      <button
        ref={termRef}
        type="button"
        className={styles.term}
        aria-expanded={isOpen}
        aria-controls={isOpen ? id : undefined}
        onClick={() => toggle(id)}
      >
        {text}
      </button>
      {isOpen
        ? createPortal(
            <div
              ref={popoverRef}
              id={id}
              role="dialog"
              aria-label={entry.term}
              className={styles.popover}
              data-placed={placement !== null}
              style={popoverStyle}
            >
              <strong className={styles.popoverTerm}>{entry.term}</strong>
              <p>{entry.definition}</p>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
