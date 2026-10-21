import { bulletBlocks } from '@/core/glossary/bulletBlocks';
import type { GlossaryEntry } from '@/core/glossary/types';
import { type MarkedSegment, markSegments } from '@/core/reference/markSegments';
import { matchRanges } from '@/core/reference/matchRanges';
import { sliceSegments } from '@/core/reference/sliceSegments';
import { BulletList } from '@/features/shared/glossary-text/bullet-list/BulletList';
import { MarkedText } from '../marked-text/MarkedText';
import { linkedSegments } from './linkedSegments';
import styles from './ReferenceText.module.css';

interface ReferenceTextProps {
  entry: GlossaryEntry;
  /** The folded search query to highlight, or '' for none. */
  query: string;
  /** Called with the term the player tapped inside the definition. */
  onJump: (term: string) => void;
}

interface SegmentRunProps {
  segments: readonly MarkedSegment[];
  onJump: (term: string) => void;
}

/** A run of text whose terms are buttons that jump to their entries. */
const SegmentRun = ({ segments, onJump }: SegmentRunProps) => {
  let offset = 0;

  return segments.map((segment) => {
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

/**
 * A definition whose terms jump to their own entries, with the search matches highlighted. The
 * Codex's inline "•" bullets become a list under the intro.
 */
export const ReferenceText = ({ entry, query, onJump }: ReferenceTextProps) => {
  const segments = linkedSegments(entry);
  const marked = markSegments(segments, matchRanges(entry.definition, query));
  const { intro, items } = bulletBlocks(entry.definition);

  if (items.length === 0) {
    return <SegmentRun segments={marked} onJump={onJump} />;
  }

  return (
    <>
      <SegmentRun segments={sliceSegments(marked, intro)} onJump={onJump} />
      <BulletList>
        {items.map((item) => (
          <li key={item.start}>
            <SegmentRun segments={sliceSegments(marked, item)} onJump={onJump} />
          </li>
        ))}
      </BulletList>
    </>
  );
};
