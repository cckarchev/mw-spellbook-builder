import { useId, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/button/Button';
import { foldQuery } from '@/core/reference/foldText';
import { searchGlossary } from '@/core/reference/searchGlossary';
import { statusText } from '@/core/reference/statusText';
import { AppHeader } from '@/features/app-header/AppHeader';
import { useReferenceRoute } from '@/features/shared/useReferenceRoute';
import { ArrowLeftIcon } from './ArrowLeftIcon';
import { BackToTop } from './back-to-top/BackToTop';
import { EntryList } from './entry-list/EntryList';
import { LetterGrid } from './letter-grid/LetterGrid';
import styles from './QuickReference.module.css';
import { LETTERS, useReferenceScroll } from './reference-scroll/useReferenceScroll';
import { ResultList } from './result-list/ResultList';
import { SearchField } from './search-field/SearchField';
import { letterGroups, sortedGlossary } from './sortedGlossary';
import { useModalFocus } from './useModalFocus';
import { useReferenceQuery } from './useReferenceQuery';
import { useTermJump } from './useTermJump';

const TITLE = 'Quick reference';

/**
 * Every glossary term on a full screen layer over the screen the player was on. Focus starts on
 * the title rather than the search, so the phone keyboard does not cover the list.
 */
export const QuickReference = () => {
  const { close } = useReferenceRoute();
  const [typed, setTyped] = useReferenceQuery();
  const query = foldQuery(typed);
  const hasQuery = query !== '';
  const results = useMemo(() => searchGlossary(sortedGlossary, query), [query]);
  const matches = results.byName.length + results.byDefinition.length;
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const scroll = useReferenceScroll(panelRef, searchRef, query);
  const jumpToTerm = useTermJump(hasQuery, setTyped);

  useModalFocus(panelRef, titleRef, close);

  // On the body, above everything the inert app holds.
  return createPortal(
    <div
      ref={panelRef}
      className={styles.overlay}
      style={scroll.style}
      role="dialog"
      aria-modal={true}
      aria-labelledby={titleId}
    >
      <div className={styles.page}>
        <AppHeader />
        <div ref={scroll.toolbarRef} className={styles.toolbar}>
          <div className={styles.titleRow}>
            <Button size="small" className={styles.back} onClick={close}>
              <ArrowLeftIcon />
              Back
            </Button>
            <h1 ref={titleRef} id={titleId} className={styles.title} tabIndex={-1}>
              {TITLE}
            </h1>
          </div>
          <SearchField value={typed} onChange={setTyped} inputRef={searchRef} />
          <p className={styles.status} role="status">
            {statusText(sortedGlossary.length, hasQuery, matches)}
          </p>
          {hasQuery ? null : (
            <LetterGrid
              ref={scroll.lettersRef}
              letters={LETTERS}
              current={scroll.currentLetter}
              folded={scroll.folded}
              onJump={scroll.jumpToLetter}
            />
          )}
        </div>
        <div className={styles.list}>
          {hasQuery ? (
            <ResultList results={results} typed={typed} query={query} onJump={jumpToTerm} />
          ) : (
            <EntryList groups={letterGroups} onJump={jumpToTerm} />
          )}
        </div>
      </div>
      <BackToTop visible={scroll.showBackToTop} onClick={scroll.backToTop} />
    </div>,
    document.body,
  );
};
