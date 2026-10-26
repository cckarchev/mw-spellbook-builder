import {
  type SpellbookGroup,
  spellbookGroups,
} from "@/core/catalog/spellbookGroups";
import type { Card, Mage, Spellbook } from "@/core/rules/types";
import type { SpellbookSummary } from "@/core/rules/validateSpellbook";

// Plain lines with no markdown, so the text reads the same pasted into WhatsApp
// on a phone.

const headerLine = (mage: Mage, summary: SpellbookSummary): string => {
  const over = summary.overBy > 0 ? ` (${summary.overBy} over)` : "";

  return `${mage.name} · ${summary.points}/${summary.budget} pts${over}`;
};

const groupBlock = (group: SpellbookGroup): string => {
  const heading = `${group.type.toUpperCase()} (${group.copies})`;
  const entries = group.entries.map(
    (entry) => `${entry.count}x ${entry.card.name}`,
  );

  return [heading, ...entries].join("\n");
};

/**
 * The spellbook as plain text for pasting into a chat, ending with its share
 * link.
 */
export const spellbookText = (
  spellbook: Spellbook,
  mage: Mage,
  summary: SpellbookSummary,
  cardsById: ReadonlyMap<string, Card>,
  shareUrl: string,
): string => {
  const blocks = spellbookGroups(spellbook, mage, cardsById).map(groupBlock);

  return [headerLine(mage, summary), ...blocks, shareUrl].join("\n\n");
};
