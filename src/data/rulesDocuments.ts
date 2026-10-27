export interface RulesDocument {
  label: string;
  url: string;
}

const ARCANE_WONDERS_UPLOADS =
  "https://www.arcanewonders.com/wp-content/uploads/2021/05";

/**
 * The official rules PDFs, linked rather than copied so Arcane Wonders' site
 * stays the source.
 */
export const RULES_DOCUMENTS: RulesDocument[] = [
  {
    label: "Rulebook",
    url: `${ARCANE_WONDERS_UPLOADS}/Mage_Wars_Arena_Rulebook.pdf`,
  },
  {
    label: "Codex",
    url: `${ARCANE_WONDERS_UPLOADS}/Mage_Wars_Arena_Codex3.1.pdf`,
  },
  {
    label: "Rules supplement",
    url: `${ARCANE_WONDERS_UPLOADS}/Mage_Wars_Rules_Supplement.pdf`,
  },
];
