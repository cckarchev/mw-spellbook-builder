import { parseAttackLines } from "./attackLines";
import { type CardCopies, rowsByCount, tally } from "./rows";
import type { AttackStats } from "./types";

/** Copies per reach and per damage type; a card counts once in each it has. */
export const attackStatsOf = (copies: CardCopies[]): AttackStats => {
  const reaches = tally(copies, (card) =>
    parseAttackLines(card.attackBar).flatMap((line) =>
      line.reach ? [line.reach] : [],
    ),
  );
  const damageTypes = tally(copies, (card) =>
    parseAttackLines(card.attackBar).map((line) => line.damageType),
  );

  return {
    melee: reaches.get("Melee") ?? 0,
    ranged: reaches.get("Ranged") ?? 0,
    damageTypes: rowsByCount(damageTypes),
  };
};
