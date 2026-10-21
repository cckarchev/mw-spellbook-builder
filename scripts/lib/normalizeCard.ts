import { cardCode } from "@/core/catalog/cardImage";
import {
  type Card,
  type CardType,
  type Format,
  SCHOOLS,
  type School,
  type SchoolPart,
} from "@/core/rules/types";
import type { RawCard } from "./readModule";

const UNKNOWN_EXPANSION = "Unknown";
const MAGE_SUBTYPE = "Mage";

const TYPES = new Map<string, CardType>([
  ["Attack", "Attack"],
  ["Conjuration", "Conjuration"],
  ["Conjuration-Wall", "Conjuration"],
  ["Conjuration-Terrain", "Conjuration"],
  // Misspelled in the module data.
  ["Conjuration-Terrrain", "Conjuration"],
  ["Creature", "Creature"],
  ["Enchantment", "Enchantment"],
  ["Equipment", "Equipment"],
  ["Incantation", "Incantation"],
]);

const AND_SEPARATOR = "+";
const OR_SEPARATOR = "/";
const SCHOOL_SEPARATOR_PATTERN = /[+/]/;
// Bullets separate traits, but some cards break the line between two traits instead.
const TRAIT_SEPARATOR = /[•\n]/;
const SUBTYPE_SEPARATOR = ",";
const ONLY_TRAIT_PATTERN = /^(.+) Only$/;

const splitList = (text: string, separator: string | RegExp): string[] =>
  text
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const isSchool = (name: string): name is School =>
  (SCHOOLS as readonly string[]).includes(name);

const readSchools = (
  schoolText: string,
  levelText: string,
): SchoolPart[] | null => {
  const names = splitList(schoolText, SCHOOL_SEPARATOR_PATTERN);
  const levels = splitList(levelText, SCHOOL_SEPARATOR_PATTERN).map(Number);
  const hasParts = names.length > 0;
  const partsMatch = names.length === levels.length;

  if (!(hasParts && partsMatch && names.every(isSchool))) {
    return null;
  }

  // Spellbook cards are level 1 or more; level 0 entries are ability tokens.
  if (levels.some((level) => !Number.isInteger(level) || level < 1)) {
    return null;
  }

  return names.map((school, index) => ({ school, level: levels[index] ?? 0 }));
};

const readOnlyFor = (traits: readonly string[]): string | null => {
  for (const trait of traits) {
    const match = ONLY_TRAIT_PATTERN.exec(trait);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
};

/** A spell card for the catalog, or null for anything that does not go in a spellbook. */
export const normalizeCard = (
  raw: RawCard,
  format: Format,
  expansion: string | undefined,
): Card | null => {
  const property = (name: string): string => raw.properties[name] ?? "";
  const type = TYPES.get(property("Type"));
  const subtypes = splitList(property("Subtype"), SUBTYPE_SEPARATOR);

  if (!type || subtypes.includes(MAGE_SUBTYPE)) {
    return null;
  }

  const schoolText = property("School");
  const schools = readSchools(schoolText, property("Level"));

  if (!schools) {
    return null;
  }

  const isOrCard =
    schoolText.includes(OR_SEPARATOR) && !schoolText.includes(AND_SEPARATOR);
  const traits = splitList(property("Traits"), TRAIT_SEPARATOR);

  return {
    id: raw.id,
    code: cardCode(raw.id),
    name: raw.name,
    type,
    subtypes,
    schoolMode: isOrCard ? "or" : "and",
    schools,
    traits,
    onlyFor: readOnlyFor(traits),
    format,
    expansion: expansion ?? UNKNOWN_EXPANSION,
    manaCost: property("Cost"),
    action: property("Action"),
    range: property("Range"),
    target: property("Target"),
    effect: property("Effect"),
    attackBar: property("Attack Bar"),
    abilityBar: property("Ability Bar"),
    image: null,
    landscape: false,
  };
};
