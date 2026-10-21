export type School =
  | 'Air'
  | 'Arcane'
  | 'Dark'
  | 'Earth'
  | 'Fire'
  | 'Holy'
  | 'Mind'
  | 'Nature'
  | 'War'
  | 'Water';

export type CardType =
  | 'Attack'
  | 'Conjuration'
  | 'Creature'
  | 'Enchantment'
  | 'Equipment'
  | 'Incantation';

export type Format = 'arena' | 'academy';

export interface SchoolPart {
  school: School;
  level: number;
}

export interface Card {
  /** OCTGN GUID. */
  id: string;
  /** First 8 hex chars of the id, unique across the catalog; used in share links. */
  code: string;
  name: string;
  type: CardType;
  subtypes: string[];
  /** `+` in the source data is "and" (every part counts), `/` is "or" (pick one). */
  schoolMode: 'and' | 'or';
  schools: SchoolPart[];
  traits: string[];
  /** From an "X Only" trait, such as 'Warlock' or 'Dark Mage'. */
  onlyFor: string | null;
  format: Format;
  /** 'Unknown' when the expansion could not be recovered. */
  expansion: string;
  manaCost: string;
  action: string;
  range: string;
  target: string;
  effect: string;
  /** The printed attack lines, such as 'Ranged | Flame | 6d6 | ...'. Empty when none. */
  attackBar: string;
  /** The printed ability lines of creatures and conjurations that have them. */
  abilityBar: string;
  /** Public path such as '/cards/<code>.webp'. */
  image: string | null;
  /** Printed wider than tall, as walls are. */
  landscape: boolean;
}

export interface PartialTraining {
  school: School;
  maxLevel: number;
}

export interface TrainedCombo {
  school: School;
  type: CardType;
}

export interface Training {
  full: School[];
  opposed: School[];
  partial: PartialTraining[];
  subtypes: string[];
  opposedTypes: CardType[];
  trainedCombos: TrainedCombo[];
}

export interface Mage {
  id: string;
  name: string;
  format: Format;
  budget: number;
  /** Mana the mage gains each round, from its stats card. */
  channeling: number;
  /** Names an "X Only" card can match, such as ['Priest', 'Priestess']. */
  onlyNames: string[];
  training: Training;
  imageCardId: string | null;
  /** The "<Name> Stats" card with the training and abilities. */
  statsCardId: string | null;
}

export interface Spellbook {
  mageId: string | null;
  /** Copies per card id. */
  counts: Record<string, number>;
}

export const SCHOOLS: readonly School[] = [
  'Air',
  'Arcane',
  'Dark',
  'Earth',
  'Fire',
  'Holy',
  'Mind',
  'Nature',
  'War',
  'Water',
];
