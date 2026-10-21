import { useMemo } from 'react';
import { splitByTerms } from '@/core/glossary/findTerms';
import type { GlossaryEntry } from '@/core/glossary/types';
import { linkOnce } from '@/core/reference/linkOnce';
import { markSegments } from '@/core/reference/markSegments';
import { matchRanges } from '@/core/reference/matchRanges';
import { glossaryIndex } from '@/data/glossary';
import { MarkedText } from '../marked-text/MarkedText';
import styles from './ReferenceText.module.css';

interface ReferenceTextProps {
  entry: GlossaryEntry;
  /** The folded search query to highlight, or '' for none. */
  query: string;
  /** Called with the term the player tapped inside the definition. */
  onJump: (term: string) => void;
}

/** A definition whose terms jump to their own entries, with the search matches highlighted. */
export const ReferenceText = ({ entry, query, onJump }: ReferenceTextProps) => {
  const segments = useMemo(
    () => linkOnce(splitByTerms(entry.definition, glossaryIndex), entry),
    [entry],
  );
  const marked = markSegments(segments, matchRanges(entry.definition, query));
  let offset = 0;

  return marked.map((segment) => {
    const key = offset;
    const target = segment.entry;
    const text = <MarkedText parts={segment.parts} />;

    offset += segment.parts.reduce((length, part) => length + part.text.length, 0);

    if (!target) {
      return <span key={key}>{text}</span>;
    }

    return (
      <button key={key} type="button" className={styles.term} onClick={() => onJump(target.term)}>
        {text}
      </button>
    );
  });
};
