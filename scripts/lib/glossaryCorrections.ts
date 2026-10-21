import type { GlossaryEntry } from '@/core/glossary/types';

// The Codex PDF cuts a few definitions short. These fixes are copied by hand from the
// Arena Rulebook glossary.

export const GLOSSARY_CORRECTIONS: GlossaryEntry[] = [
  // The Codex stops at "See".
  {
    term: 'Passage Attacks',
    definition:
      'All Creatures that move through this Wall are automatically attacked by the Wall. The attack occurs before the Creature moves. See “Walls” on page 17 of the Rulebook.',
  },
];

/** The glossary with each corrected term's definition replaced. Throws on a correction that matches no term. */
export const applyGlossaryCorrections = (
  entries: readonly GlossaryEntry[],
  corrections: readonly GlossaryEntry[],
): GlossaryEntry[] => {
  const byTerm = new Map(corrections.map((correction) => [correction.term, correction]));
  const unmatched = corrections.filter(
    (correction) => !entries.some((entry) => entry.term === correction.term),
  );

  if (unmatched.length > 0) {
    const terms = unmatched.map((correction) => correction.term);

    throw new Error(`Glossary corrections match no term: ${terms.join(', ')}`);
  }

  return entries.map((entry) => byTerm.get(entry.term) ?? entry);
};
