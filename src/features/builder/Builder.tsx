import { useNavigate, useParams } from 'react-router-dom';
import { type Tab, Tabs, tabPanelProps } from '@/components/tabs/Tabs';
import { type BuilderTab, builderPath } from '@/core/routing/paths';
import { mageSwitchKind } from '@/core/rules/bookChanges';
import { summarizeBook } from '@/core/rules/validateBook';
import { bookMage, cardsById, magesBySlug } from '@/data/catalog';
import { BookHeader } from '@/features/book-header/BookHeader';
import { Catalog } from '@/features/catalog/Catalog';
import type { BookPanelProps } from '@/features/shared/bookPanelProps';
import { Spellbook } from '@/features/spellbook/Spellbook';
import { ToPicker } from '@/layout/ToPicker';
import { useBookStore } from '@/store/useBookStore';
import styles from './Builder.module.css';

const TAB_ID_PREFIX = 'builder-tab';

const TABS: Tab<BuilderTab>[] = [
  { id: 'cards', label: 'Cards' },
  { id: 'book', label: 'Book' },
];

/**
 * The build screen of the mage in the URL: a sticky header and tabs over the catalog or the book.
 * Until the book follows that mage, it shows the current book.
 */
export const Builder = ({ tab }: { tab: BuilderTab }) => {
  const { mageSlug = '' } = useParams();
  const navigate = useNavigate();
  const book = useBookStore((state) => state.book);
  const addCopy = useBookStore((state) => state.addCopy);
  const removeCopy = useBookStore((state) => state.removeCopy);

  const routeMage = magesBySlug.get(mageSlug);
  const mage = bookMage(book);

  if (!routeMage) {
    return <ToPicker />;
  }

  // A book with no cards is about to switch to the URL's mage, so the old mage is not drawn first.
  if (!mage || mageSwitchKind(book, routeMage.id) === 'direct') {
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
        <BookHeader mage={mage} summary={summary} />
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
