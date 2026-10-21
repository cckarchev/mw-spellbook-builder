import type { GlossaryEntry } from '@/core/glossary/types';

// The Codex PDF cuts a few definitions short, and has the odd typo. These fixes are copied by
// hand from the Arena Rulebook glossary, or are the Codex text with the typo fixed.

export const GLOSSARY_CORRECTIONS: GlossaryEntry[] = [
  // The Codex stops at "See".
  {
    term: 'Passage Attacks',
    definition:
      'All Creatures that move through this Wall are automatically attacked by the Wall. The attack occurs before the Creature moves. See “Walls” on page 17 of the Rulebook.',
  },
  // The Codex writes "eXplode".
  {
    term: 'Destroyed',
    definition:
      'When an Object is Destroyed, everything attached to it is Destroyed and Discarded. This includes damage, Condition markers, tokens, Enchantments, and Conjurations. Ability markers are returned to the Mage. Then, the Object is placed in its owner’s Discard pile. The Object may then resolve a “Destroyed” effect. For example, a Plague Zombie will explode. Some effects replace being Discarded such as Cantrip or Obliterate.',
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
