import type { School } from '@/core/rules/types';

export interface CountRow {
  label: string;
  count: number;
}

export interface ManaCurve {
  /** The seven cost buckets in order, zeros included. */
  buckets: CountRow[];
  /** Copies with a variable (X) cost. */
  variable: number;
  channeling: number;
  /** Copies with a fixed cost at or below the channeling. */
  atOrBelow: number;
  /** Copies with a fixed cost above the channeling. */
  above: number;
}

export interface ManaSource {
  name: string;
  count: number;
}

export interface ManaSources {
  cards: ManaSource[];
  /** Channeling the sources would add once all of them are in play. */
  total: number;
}

export interface SchoolPoints {
  school: School;
  trainedPoints: number;
  /** Points charged above the trained rate (untrained or opposed). */
  extraRatePoints: number;
}

export interface AttackStats {
  melee: number;
  ranged: number;
  damageTypes: CountRow[];
}

export interface SpellbookStats {
  cardCount: number;
  manaCurve: ManaCurve;
  manaSources: ManaSources;
  types: CountRow[];
  levels: CountRow[];
  actions: CountRow[];
  schools: SchoolPoints[];
  /** Points charged above the trained rate, across every school. */
  untrainedPoints: number;
  attacks: AttackStats;
}
