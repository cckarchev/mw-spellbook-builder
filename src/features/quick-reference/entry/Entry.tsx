import type { MouseEvent } from "react";
import type { GlossaryEntry } from "@/core/glossary/types";
import { termAnchorId, termPath } from "@/core/reference/anchors";
import { markSegments } from "@/core/reference/markSegments";
import { matchRanges } from "@/core/reference/matchRanges";
import { MarkedText } from "../marked-text/MarkedText";
import { ReferenceText } from "../reference-text/ReferenceText";
import { CopyLinkButton } from "./CopyLinkButton";
import styles from "./Entry.module.css";

const MAIN_BUTTON = 0;

interface EntryProps {
  entry: GlossaryEntry;
  /** The folded search query to highlight, or '' for none. */
  query: string;
  onJump: (term: string) => void;
}

/**
 * A plain click stays in the app; a click asking for a new tab or window keeps
 * the browser's own.
 */
const isPlainClick = (event: MouseEvent): boolean => {
  const withModifier =
    event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

  return event.button === MAIN_BUTTON && !withModifier;
};

/**
 * One term and its whole definition, the target of jumps and shared links to
 * that term.
 */
export const Entry = ({ entry, query, onJump }: EntryProps) => {
  const termSegment = { text: entry.term, entry: null };
  const [markedTerm] = markSegments(
    [termSegment],
    matchRanges(entry.term, query),
  );

  const jumpHere = (event: MouseEvent) => {
    if (!isPlainClick(event)) {
      return;
    }

    event.preventDefault();
    onJump(entry.term);
  };

  return (
    <div id={termAnchorId(entry.term)} className={styles.entry} tabIndex={-1}>
      <dt className={styles.term}>
        <a
          href={termPath(entry.term)}
          className={styles.anchor}
          onClick={jumpHere}
        >
          <MarkedText parts={markedTerm?.parts ?? []} />
        </a>
        <CopyLinkButton term={entry.term} />
      </dt>
      <dd className={styles.definition}>
        <ReferenceText entry={entry} query={query} onJump={onJump} />
      </dd>
    </div>
  );
};
