import type { Mage, Spellbook } from "@/core/rules/types";

/** What the Cards and Spellbook tabs both get from the builder. */
export interface BuilderPanelProps {
  spellbook: Spellbook;
  mage: Mage;
  onAdd: (cardId: string) => void;
  onRemove: (cardId: string) => void;
}
