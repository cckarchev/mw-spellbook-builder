import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { type Tab, Tabs, tabPanelProps } from '@/components/tabs/Tabs';
import { type BuilderTab, builderPath, PICKER_PATH } from '@/core/routing/builderPath';
import { summarizeSpellbook } from '@/core/rules/validateSpellbook';
import { cardsById, magesBySlug, spellbookMage } from '@/data/catalog';
import { Catalog } from '@/features/catalog/Catalog';
import { ShareActions } from '@/features/share/share-actions/ShareActions';
import type { BuilderPanelProps } from '@/features/shared/builderPanelProps';
import { SpellbookActions } from '@/features/spellbook-actions/SpellbookActions';
import { SpellbookHeader } from '@/features/spellbook-header/SpellbookHeader';
import { SpellbookPanel } from '@/features/spellbook-panel/SpellbookPanel';
import { useSpellbookStatus } from '@/store/useSpellbookStatus';
import { useSpellbookStore } from '@/store/useSpellbookStore';
import styles from './Builder.module.css';
import { useRouteMage } from './useRouteMage';

const TAB_ID_PREFIX = 'builder-tab';

const TABS: Tab<BuilderTab>[] = [
  { id: 'cards', label: 'Cards' },
  { id: 'spellbook', label: 'Spellbook' },
];

/** The build screen of the mage in the URL: a sticky header, spellbook actions and tabs over the catalog or the spellbook. */
export const Builder = ({ tab }: { tab: BuilderTab }) => {
  const { mageSlug = '' } = useParams();
  const navigate = useNavigate();
  const spellbook = useSpellbookStore((state) => state.spellbook);
  const addCopy = useSpellbookStore((state) => state.addCopy);
  const removeCopy = useSpellbookStore((state) => state.removeCopy);

  const routeMage = magesBySlug.get(mageSlug);

  useRouteMage(routeMage);

  const { name, unsaved } = useSpellbookStatus();

  const mage = spellbookMage(spellbook);

  if (!routeMage) {
    return <Navigate to={PICKER_PATH} replace={true} />;
  }

  // The spellbook follows the URL's mage in an effect, so for one render it is still the old mage's.
  if (mage?.id !== routeMage.id) {
    return null;
  }

  const summary = summarizeSpellbook(spellbook, mage, cardsById);

  const showTab = (next: BuilderTab) => {
    navigate(builderPath(mage.name, next), { replace: true });
  };

  const panelProps: BuilderPanelProps = { onAdd: addCopy, onRemove: removeCopy, spellbook, mage };

  return (
    <div className={styles.builder}>
      <div className={styles.sticky}>
        <SpellbookHeader mage={mage} summary={summary} name={name} unsaved={unsaved} />
        <div className={styles.actions}>
          <SpellbookActions />
          <span className={styles.divider} aria-hidden="true" />
          <ShareActions spellbook={spellbook} mage={mage} summary={summary} />
        </div>
        <Tabs tabs={TABS} active={tab} onChange={showTab} idPrefix={TAB_ID_PREFIX} />
      </div>
      <main className={styles.panel} {...tabPanelProps(TAB_ID_PREFIX, tab)}>
        {tab === 'cards' ? (
          <Catalog {...panelProps} />
        ) : (
          <SpellbookPanel {...panelProps} summary={summary} />
        )}
      </main>
    </div>
  );
};
