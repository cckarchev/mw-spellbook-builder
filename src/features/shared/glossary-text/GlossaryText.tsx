import { memo, useMemo } from 'react';
import { splitByTerms } from '@/core/glossary/findTerms';
import { glossaryIndex } from '@/data/glossary';
import { GlossaryTerm } from './GlossaryTerm';

/** Card text with every Codex term in it tappable, to show what the term means. */
export const GlossaryText = memo(({ text }: { text: string }) => {
  const segments = useMemo(() => splitByTerms(text, glossaryIndex), [text]);

  return segments.map((segment, position) => {
    // Segments never change order for a text, so their position is a stable key.
    const key = `${position}-${segment.text}`;

    if (segment.entry === null) {
      return <span key={key}>{segment.text}</span>;
    }

    return <GlossaryTerm key={key} text={segment.text} entry={segment.entry} />;
  });
});
