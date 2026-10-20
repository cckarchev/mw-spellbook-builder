import { type Tab, Tabs, tabPanelProps } from '@/components/tabs/Tabs';
import type { BuilderTab } from '@/core/routing/builderPath';
import type { SpellbookSummary } from '@/core/rules/validateSpellbook';
import type { BuilderPanelProps } from '@/features/shared/builderPanelProps';
import { SpellbookPanel } from '@/features/spellbook-panel/SpellbookPanel';
import { SpellbookStats } from '@/features/spellbook-stats/SpellbookStats';
import styles from './SpellbookColumn.module.css';

type ColumnTab = Extract<BuilderTab, 'spellbook' | 'stats'>;

const TAB_ID_PREFIX = 'spellbook-column-tab';

const TABS: Tab<ColumnTab>[] = [
  { id: 'spellbook', label: 'Spellbook' },
  { id: 'stats', label: 'Stats' },
];

interface SpellbookColumnProps extends BuilderPanelProps {
  tab: BuilderTab;
  summary: SpellbookSummary;
  onShowTab: (tab: ColumnTab) => void;
}

/** The desktop column beside the catalog: the spellbook, or its stats, under their own tabs. */
export const SpellbookColumn = ({
  tab,
  summary,
  onShowTab,
  ...panelProps
}: SpellbookColumnProps) => {
  const activeTab: ColumnTab = tab === 'stats' ? 'stats' : 'spellbook';

  return (
    <aside className={styles.column} aria-label="Spellbook">
      <div className={styles.tabs}>
        <Tabs tabs={TABS} active={activeTab} onChange={onShowTab} idPrefix={TAB_ID_PREFIX} />
      </div>
      <div className={styles.panel} {...tabPanelProps(TAB_ID_PREFIX, activeTab)}>
        {activeTab === 'stats' ? (
          <SpellbookStats spellbook={panelProps.spellbook} mage={panelProps.mage} />
        ) : (
          <SpellbookPanel {...panelProps} summary={summary} variant="column" />
        )}
      </div>
    </aside>
  );
};
