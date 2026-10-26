import type { GlossaryEntry } from "@/core/glossary/types";

// The Codex PDF cuts a few definitions short, and has the odd typo. These fixes
// are copied by hand from the Arena Rulebook glossary, or are the Codex text
// with the typo fixed.

export const GLOSSARY_CORRECTIONS: GlossaryEntry[] = [
  // The Codex stops at "See".
  {
    term: "Passage Attacks",
    definition:
      "All Creatures that move through this Wall are automatically attacked by the Wall. The attack occurs before the Creature moves. See “Walls” on page 17 of the Rulebook.",
  },
  // The Codex starts it with a lowercase "a".
  {
    term: "Stagger",
    definition:
      "A Condition that disorients or knocks a Creature off balance. Minor Creatures cannot attack or Guard while Staggered. If they have a Guard marker they lose it, and they cannot choose the Guard action. Major Creatures roll 2 less dice when they make any attack for each Stagger Condition on them (but never less than 1 die). Remove all Stagger Conditions at the end of the Creature’s next activation. If a Creature receives Stagger during its current activation, it must wait until the end of its next activation to remove it. Stagger has a Removal Cost of 2.",
  },
  // The Codex ends it without a period, and drops an "and" from Air.
  {
    term: "Elemental Glyphs (Elementalist)",
    definition:
      "When casting a spell with one of the below card types, he may flip over and Activate the matching Glyph. • Air: Once per round, when a Creature you control attacks, you may pay 1 mana to deactivate this Glyph and add +4 to that creature’s attack roll • Earth: Once per round, when a Creature you control is attacked, you may pay 1 mana to deactivate this Glyph and gain +2 armor for that attack • Fire: Once per round, when a Creature you control makes an attack, you may pay 1 mana to deactivate this Glyph and roll 2 additional dice • Water: Once per round, during the upkeep phase, you may pay 1 mana to deactivate this Glyph and heal 2 damage from your Mage.",
  },
  // The Codex writes "spell.The" and "and and".
  {
    term: "Familiar",
    definition:
      "This Object can cast spells. If you control a Familiar during the Planning phase, you may select a spell for it to cast during the round. The Familiar may have restrictions on the types of spells you may choose. Place the spell face down near your Familiar during the planning phase and tell your opponent that it is the Familiar’s spell. Only your Familiar may cast that spell during the round. When your Familiar takes its Action Phase, you may have it cast that spell. The Familiar must spend any mana that it has towards the casting cost first, with you making up the difference from your mana supply. The Familiar is treated as the spell caster for all purposes, such as range, etc. You control all spells your Familiar casts. If your Familiar does not cast its prepared spell, the spell returns to your spell book at the beginning of the next planning phase. If your Familiar is Destroyed before it casts the spell you assigned to it, the spell is also Destroyed.",
  },
  // The Codex ends it without a period.
  {
    term: "Flying",
    definition:
      "Creatures with the Flying trait ignore Walls and all non-Flying enemy Creatures when moving. Flying and non-Flying Creatures do not Hinder each other’s movement. Non-Flying Creatures cannot make a melee attack against a Flying Creature unless they have the Reach trait. Ranged attacks can target a Flying Creature normally. Any ranged attack can always target a Flying Creature in the same Zone, even if the minimum range for that attack is greater than 0. A Creature cannot gain or lose the Flying trait in the middle of an Attack Action. For example, if a Creature gains Flying in the middle of an Attack Action, the entire Attack Action is resolved as if the Creature did not have Flying, and the Flying trait is gained after that Attack Action is complete. A Flying Creature is affected by Guards when it makes a melee attack, but only if it is attacking a non-Flying Object in the Guard’s Zone. If a Flying Creature Guards, it loses, and cannot gain, the Flying trait for as long as it has the Guard marker. All Creatures always have Line of Sight to all Flying Creatures, and vice versa.",
  },
  // The Codex writes "Attack.Cannot".
  {
    term: "Intercept",
    definition:
      "If this Creature is Guarding, and if a ranged attack targets a non-Flying Object in the same Zone, this Creature may redirect that ranged attack to itself, as long as it can be a legal target for that attack. The Intercept is announced and occurs immediately after the Declare Attack Step (and before the Avoid Attack Step). It loses its Guard marker at the end of the attack which it Intercepts. Cannot Intercept a Zone Attack. Cannot Intercept if Restrained or Incapacitated.",
  },
  // The Codex writes "and and".
  {
    term: "Spawnpoint",
    definition:
      "This Object can cast spells during the Deployment Phase. If you control a Spawnpoint during the Planning phase, you may select a spell for it to cast during the Deployment Phase. The Spawnpoint may have restrictions on the types of spells you may choose. Place the spell face down near your Spawnpoint during the planning phase and tell your opponent that it is the Spawnpoint’s spell. Only your Spawnpoint may cast that spell during the Deployment Phase. The Spawnpoint must spend any mana that it has towards the casting cost first, with you making up the difference from your mana supply. The Spawnpoint is treated as the spell caster for all purposes, such as range, etc. You control all spells your Spawnpoint casts. If your Spawnpoint does not cast its prepared spell, the spell returns to your spell book at the end of the Deployment Phase.",
  },
  // The Codex leaves a parenthesis open, misspells card names such as
  // "Reupulse", and runs two card names together.
  {
    term: "Swarm",
    definition:
      "This Creature is made up of countless small Creatures. Swarm Creatures cannot Guard and cannot be targeted by non-attack spells that specifically target Swarm creatures. When attacking, Swarm Creatures make additional strikes equal to their remaining health. Swarm Creatures are immune to conditions and have the Finite Life trait. Non-zone attacks do a maximum of 1 damage to them per instance. • Spells that help Swarms - Etherian Lifetree, Straywood Scout, Dorseus, Hand of Bim-Shalla, Marked for Death, Sacrificial Altar, Bloodwave Warlord Veteran Marker, Symbiotic Orb, Rolling Fog, Azurean Genie, Summoning Circle. • Spells that are strong against Swarms – Gravikor (if flying), Defenses, especially those that attack back (Force Sword, Cobra Reflexes, Spiked Buckler, Dodge, Forcefield, Block, Mass Cowardice, Alluring Orchid, Altar of Infernia, Repulse). Zone attacks, Double/Triple attacks, Push attack spells into walls (basically two attacks) Tsunami, Swell, Jet Stream, Windstorm, Sandstorm, Gravikor+Surging Wave.",
  },
];

/**
 * The glossary with each corrected term's definition replaced. Throws on a
 * correction that matches no term.
 */
export const applyGlossaryCorrections = (
  entries: readonly GlossaryEntry[],
  corrections: readonly GlossaryEntry[],
): GlossaryEntry[] => {
  const byTerm = new Map(
    corrections.map((correction) => [correction.term, correction]),
  );
  const unmatched = corrections.filter(
    (correction) => !entries.some((entry) => entry.term === correction.term),
  );

  if (unmatched.length > 0) {
    const terms = unmatched.map((correction) => correction.term);

    throw new Error(`Glossary corrections match no term: ${terms.join(", ")}`);
  }

  return entries.map((entry) => byTerm.get(entry.term) ?? entry);
};
