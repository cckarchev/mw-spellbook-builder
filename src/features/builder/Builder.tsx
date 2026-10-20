import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { type Tab, Tabs, tabPanelProps } from '@/components/tabs/Tabs';
import { type BuilderTab, builderPath, PICKER_PATH } from '@/core/routing/builderPath';
import { summarizeBook } from '@/core/rules/validateBook';
import { bookMage, cardsById, magesBySlug } from '@/data/catalog';
import { BookActions } from '@/features/book-actions/BookActions';
import { BookHeader } from '@/features/book-header/BookHeader';
import { Catalog } from '@/features/catalog/Catalog';
import { ShareActions } from '@/features/share/share-actions/ShareActions';
import type { BookPanelProps } from '@/features/shared/bookPanelProps';
import { Spellbook } from '@/features/spellbook/Spellbook';
import { useBookStatus } from '@/store/useBookStatus';
import { useBookStore } from '@/store/useBookStore';
import styles from './Builder.module.css';
import { useRouteMage } from './useRouteMage';

const TAB_ID_PREFIX = 'builder-tab';

const TABS: Tab<BuilderTab>[] = [
  { id: 'cards', label: 'Cards' },
  { id: 'book', label: 'Spellbook' },
];

/** The build screen of the mage in the URL: a sticky header, book actions and tabs over the catalog or the book. */
export const Builder = ({ tab }: { tab: BuilderTab }) => {
  const { mageSlug = '' } = useParams();
  const navigate = useNavigate();
  const book = useBookStore((state) => state.book);
  const addCopy = useBookStore((state) => state.addCopy);
  const removeCopy = useBookStore((state) => state.removeCopy);

  const routeMage = magesBySlug.get(mageSlug);

  useRouteMage(routeMage);

  const { name, unsaved } = useBookStatus();

  const mage = bookMage(book);

  if (!routeMage) {
    return <Navigate to={PICKER_PATH} replace={true} />;
  }

  // The book follows the URL's mage in an effect, so for one render it is still the old mage's.
  if (mage?.id !== routeMage.id) {
    return null;
  }

  const summary = summarizeBook(book, mage, cardsById);

  const showTab = (next: BuilderTab) => {
    navigate(builderPath(mage.name, next), { replace: true });
  };

  const panelProps: BookPanelProps = { onAdd: addCopy, onRemove: removeCopy, book, mage };

  return (
    <div className={styles.builder}>
      <div className={styles.sticky}>
        <BookHeader mage={mage} summary={summary} name={name} unsaved={unsaved} />
        <div className={styles.actions}>
          <BookActions />
          <span className={styles.divider} aria-hidden="true" />
          <ShareActions book={book} mage={mage} summary={summary} />
        </div>
        <Tabs tabs={TABS} active={tab} onChange={showTab} idPrefix={TAB_ID_PREFIX} />
      </div>
      <main className={styles.panel} {...tabPanelProps(TAB_ID_PREFIX, tab)}>
        {tab === 'cards' ? (
          <Catalog {...panelProps} />
        ) : (
          <Spellbook {...panelProps} summary={summary} />
        )}
      </main>
    </div>
  );
};
