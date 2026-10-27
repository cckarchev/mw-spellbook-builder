import { useCallback, useEffect, useId, useRef } from "react";
import { Popover } from "@/components/popover/Popover";
import type { GlossaryEntry } from "@/core/glossary/types";
import { Definition } from "./Definition";
import styles from "./GlossaryText.module.css";
import { useOpenTermStore } from "./useOpenTermStore";

interface GlossaryTermProps {
  /** The words as the card prints them, such as "Aegis 2". */
  text: string;
  entry: GlossaryEntry;
}

/**
 * A tappable glossary term. Tapping it shows its definition in a popover over
 * the page.
 */
export const GlossaryTerm = ({ text, entry }: GlossaryTermProps) => {
  const id = useId();
  const isOpen = useOpenTermStore((state) => state.openId === id);
  const toggle = useOpenTermStore((state) => state.toggle);
  const close = useOpenTermStore((state) => state.close);
  const termRef = useRef<HTMLButtonElement>(null);
  const closeThis = useCallback(() => close(id), [close, id]);

  // A term that goes away, such as when its card row closes, takes its popover
  // with it.
  useEffect(() => closeThis, [closeThis]);

  return (
    <>
      <button
        ref={termRef}
        type="button"
        className={styles.term}
        aria-expanded={isOpen}
        aria-controls={isOpen ? id : undefined}
        // The popover renders at the end of the page, far from the term, so a
        // screen reader reads the definition as the term's description.
        aria-describedby={isOpen ? id : undefined}
        onClick={() => toggle(id)}
      >
        {text}
      </button>
      <Popover
        id={id}
        isOpen={isOpen}
        anchorRef={termRef}
        role="dialog"
        label={entry.term}
        onClose={closeThis}
      >
        <strong className={styles.popoverTerm}>{entry.term}</strong>
        <Definition text={entry.definition} />
      </Popover>
    </>
  );
};
