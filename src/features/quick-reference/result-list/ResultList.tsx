import { memo, useId } from 'react';
import type { GlossaryEntry } from '@/core/glossary/types';
import type { GlossarySearch } from '@/core/reference/searchGlossary';
import { resultCountText } from '@/core/reference/statusText';
import { Entry } from '../entry/Entry';
import styles from './ResultList.module.css';

interface ResultListProps {
  results: GlossarySearch;
  /** The search as typed, to name it when nothing matches. */
  typed: string;
  /** The folded search, to highlight. */
  query: string;
  onJump: (term: string) => void;
}

interface ResultGroupProps {
  title: string;
  entries: readonly GlossaryEntry[];
  query: string;
  onJump: (term: string) => void;
}

const ResultGroup = ({ title, entries, query, onJump }: ResultGroupProps) => {
  const headingId = useId();

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        <span>{title}</span> <span className={styles.count}>{resultCountText(entries.length)}</span>
      </h2>
      <dl>
        {entries.map((entry) => (
          <Entry key={entry.term} entry={entry} query={query} onJump={onJump} />
        ))}
      </dl>
    </section>
  );
};

/**
 * Search results: terms matching by name, then by definition, or a way out when none do.
 * Memoized, so the back to top button coming or going does not render the results again.
 */
export const ResultList = memo(({ results, typed, query, onJump }: ResultListProps) => {
  const { byName, byDefinition } = results;

  if (byName.length === 0 && byDefinition.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No term matches “{typed.trim()}”.</p>
        <p>Try a shorter word, or clear the search to see every term.</p>
      </div>
    );
  }

  return (
    <>
      <ResultGroup title="In the name" entries={byName} query={query} onJump={onJump} />
      <ResultGroup title="In the definition" entries={byDefinition} query={query} onJump={onJump} />
    </>
  );
});
