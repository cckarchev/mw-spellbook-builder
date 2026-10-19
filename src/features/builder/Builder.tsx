import { Navigate, useSearchParams } from 'react-router-dom';
import { type Tab, Tabs, tabPanelProps } from '@/components/tabs/Tabs';
import { summarizeBook } from '@/core/rules/validateBook';
import { cardsById, magesById } from '@/data/catalog';
import { BookHeader } from '@/features/book-header/BookHeader';
import { Catalog } from '@/features/catalog/Catalog';
import { ShareActions } from '@/features/share/ShareActions';
import { Spellbook } from '@/features/spellbook/Spellbook';
import { useBookStore } from '@/store/useBookStore';
import styles from './Builder.module.css';

type BuilderTab = 'cards' | 'book';

const TAB_PARAM = 'tab';
const TAB_ID_PREFIX = 'builder-tab';

const TABS: Tab<BuilderTab>[] = [
  { id: 'cards', label: 'Cards' },
  { id: 'book', label: 'Book' },
];

/** The build screen: a sticky header and tabs over the catalog or the book. */
export const Builder = () => {
  const book = useBookStore((state) => state.book);
  const addCopy = useBookStore((state) => state.addCopy);
  const removeCopy = useBookStore((state) => state.removeCopy);
  const [searchParams, setSearchParams] = useSearchParams();

  const mage = book.mageId === null ? undefined : magesById.get(book.mageId);

  if (!mage) {
    return <Navigate to="/" replace={true} />;
  }

  const activeTab: BuilderTab = searchParams.get(TAB_PARAM) === 'book' ? 'book' : 'cards';
  const summary = summarizeBook(book, mage, cardsById);

  // Cards is the default tab, so it keeps the URL free of the param.
  const showTab = (tab: BuilderTab) => {
    setSearchParams(
      (params) => {
        if (tab === 'cards') {
          params.delete(TAB_PARAM);
        } else {
          params.set(TAB_PARAM, tab);
        }

        return params;
      },
      { replace: true },
    );
  };

  const panelProps = { onAdd: addCopy, onRemove: removeCopy, book, mage };

  return (
    <div className={styles.builder}>
      <div className={styles.sticky}>
        <BookHeader mage={mage} summary={summary} />
        <Tabs tabs={TABS} active={activeTab} onChange={showTab} idPrefix={TAB_ID_PREFIX} />
      </div>
      <main className={styles.panel} {...tabPanelProps(TAB_ID_PREFIX, activeTab)}>
        {activeTab === 'cards' ? (
          <Catalog {...panelProps} />
        ) : (
          <>
            <ShareActions book={book} mage={mage} summary={summary} />
            <Spellbook {...panelProps} summary={summary} />
          </>
        )}
      </main>
    </div>
  );
};
