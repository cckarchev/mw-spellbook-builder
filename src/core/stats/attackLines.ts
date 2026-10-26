type Reach = "Melee" | "Ranged";

export const DAMAGE_TYPES = [
  "Flame",
  "Lightning",
  "Acid",
  "Hydro",
  "Wind",
  "Poison",
  "Psychic",
  "Light",
  "Frost",
] as const;

type DamageType = (typeof DAMAGE_TYPES)[number] | "Physical";

interface AttackLine {
  reach: Reach | null;
  damageType: DamageType;
}

const FIELD_SEPARATOR = "|";
const MELEE = "Melee";
// Most cards print "Ranged 0-1"; Stormfront Elemental prints "Range 0-2".
const RANGED_PREFIX = "Range";

const isDamageType = (field: string): field is (typeof DAMAGE_TYPES)[number] =>
  (DAMAGE_TYPES as readonly string[]).includes(field);

const reachOf = (fields: string[]): Reach | null => {
  for (const field of fields) {
    if (field === MELEE) {
      return "Melee";
    }

    if (field.startsWith(RANGED_PREFIX)) {
      return "Ranged";
    }
  }

  return null;
};

/**
 * The attacks printed on a card's attack bar. Lines without a "|" name an
 * attack and are skipped.
 */
export const parseAttackLines = (attackBar: string): AttackLine[] =>
  attackBar
    .split("\n")
    .filter((line) => line.includes(FIELD_SEPARATOR))
    .map((line) => {
      const fields = line.split(FIELD_SEPARATOR).map((field) => field.trim());
      const damageType = fields.find(isDamageType) ?? "Physical";

      return { reach: reachOf(fields), damageType };
    });
