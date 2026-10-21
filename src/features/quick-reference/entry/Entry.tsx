import type { GlossaryEntry } from '@/core/glossary/types';
import { termAnchorId } from '@/core/reference/anchors';
import { markSegments } from '@/core/reference/markSegments';
import { matchRanges } from '@/core/reference/matchRanges';
import { MarkedText } from '../marked-text/MarkedText';
import { ReferenceText } from '../reference-text/ReferenceText';
import styles from './Entry.module.css';

interface EntryProps {
  entry: GlossaryEntry;
  /** The folded search query to highlight, or '' for none. */
  query: string;
  onJump: (term: string) => void;
}

/** One term and its whole definition, the target of jumps to that term. */
export const Entry = ({ entry, query, onJump }: EntryProps) => {
  const termSegment = { text: entry.term, entry: null };
  const [markedTerm] = markSegments([termSegment], matchRanges(entry.term, query));

  return (
    <div id={termAnchorId(entry.term)} className={styles.entry} tabIndex={-1}>
      <dt className={styles.term}>
        <MarkedText parts={markedTerm?.parts ?? []} />
      </dt>
      <dd className={styles.definition}>
        <ReferenceText entry={entry} query={query} onJump={onJump} />
      </dd>
    </div>
  );
};
