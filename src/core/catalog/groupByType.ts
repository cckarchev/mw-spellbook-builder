import type { CardType } from "@/core/rules/types";

export const TYPE_ORDER: CardType[] = [
  "Attack",
  "Conjuration",
  "Creature",
  "Enchantment",
  "Equipment",
  "Incantation",
];

interface TypeGroup<T> {
  type: CardType;
  items: T[];
}

/**
 * Groups items in TYPE_ORDER, dropping empty groups, with each group sorted by
 * name.
 */
export const groupByType = <T extends { type: CardType; name: string }>(
  items: T[],
): TypeGroup<T>[] => {
  const groups = TYPE_ORDER.map((type) => {
    const ofType = items.filter((item) => item.type === type);
    const sorted = [...ofType].sort((left, right) =>
      left.name.localeCompare(right.name),
    );

    return { type, items: sorted };
  });

  return groups.filter((group) => group.items.length > 0);
};
