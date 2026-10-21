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
  // The Codex writes "teXt".
  {
    term: 'Conjuration Attack Actions',
    definition:
      'If a Conjuration has an attack bar, then once per round, before or after any Friendly Creature’s Action Phase, it can make that attack. Use a Ready Marker to keep track of making that attack. Unless the spell text says otherwise, you can make the attack once per round, and the Conjuration can make its attack the same round it comes into play.',
  },
  // The Codex writes "eXtra".
  {
    term: 'Corrode',
    definition:
      'An acid Condition which wears away Armor. For each Corrode Condition marker on a Creature or Conjuration, it receives Armor -1. Objects can never have Corrode markers on them which would reduce their Armor to below zero (any extra markers are immediately Destroyed). If an Object would receive Corrode Condition markers that would reduce its Armor to less than zero, instead it receives only enough Corrode markers to reduce its Armor to zero, and takes one point of direct acid damage for each excess marker. Corrode has no effect on Incorporeal Objects. Replacement Armor can be cast which will first Discard the old, worn Armor (and Corrode tokens) and replace with the new one. The marker has a Removal Cost of 2.',
  },
  // The Codex starts it with a lowercase "a".
  {
    term: 'Stagger',
    definition:
      'A Condition that disorients or knocks a Creature off balance. Minor Creatures cannot attack or Guard while Staggered. If they have a Guard marker they lose it, and they cannot choose the Guard action. Major Creatures roll 2 less dice when they make any attack for each Stagger Condition on them (but never less than 1 die). Remove all Stagger Conditions at the end of the Creature’s next activation. If a Creature receives Stagger during its current activation, it must wait until the end of its next activation to remove it. Stagger has a Removal Cost of 2.',
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
