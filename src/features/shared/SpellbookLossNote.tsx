import { copyCount } from "@/core/rules/spellbookChanges";
import type { Spellbook } from "@/core/rules/types";
import { plural } from "@/core/text/plural";
import { spellbookMage } from "@/data/catalog";

/** What a confirm calls a spellbook whose mage is unknown. */
export const CURRENT_MAGE_FALLBACK = "current";

/** How to keep a spellbook that a confirm is about to clear or replace. */
export const KEEP_SPELLBOOK_HINT = "To keep it, cancel and save it first.";

/** What a confirm says before the spellbook is cleared, and how to keep it. */
export const SpellbookLossNote = ({ spellbook }: { spellbook: Spellbook }) => {
  const mageName = spellbookMage(spellbook)?.name ?? CURRENT_MAGE_FALLBACK;
  const cardsLabel = plural(copyCount(spellbook), "card", "cards");

  return (
    <p>
      Your {mageName} spellbook has {cardsLabel}. It will be cleared.{" "}
      {KEEP_SPELLBOOK_HINT}
    </p>
  );
};
