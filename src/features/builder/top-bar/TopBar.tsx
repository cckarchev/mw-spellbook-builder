import type { Mage, Spellbook } from "@/core/rules/types";
import type { SpellbookSummary } from "@/core/rules/validateSpellbook";
import { ShareActions } from "@/features/share/share-actions/ShareActions";
import { SpellbookActions } from "@/features/spellbook-actions/SpellbookActions";
import { SpellbookHeader } from "@/features/spellbook-header/SpellbookHeader";
import { useSpellbookStatus } from "@/store/useSpellbookStatus";
import styles from "./TopBar.module.css";

interface TopBarProps {
  spellbook: Spellbook;
  mage: Mage;
  summary: SpellbookSummary;
}

/** The spellbook's header, then its save, load and share actions. */
export const TopBar = ({ spellbook, mage, summary }: TopBarProps) => {
  const { name, unsaved } = useSpellbookStatus();

  return (
    <div className={styles.topBar}>
      <div className={styles.summary}>
        <SpellbookHeader
          mage={mage}
          summary={summary}
          name={name}
          unsaved={unsaved}
        />
      </div>
      <div className={styles.actions}>
        <SpellbookActions />
        <span className={styles.divider} aria-hidden="true" />
        <ShareActions spellbook={spellbook} mage={mage} summary={summary} />
      </div>
    </div>
  );
};
