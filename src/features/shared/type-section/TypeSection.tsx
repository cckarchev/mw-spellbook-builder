import { type ReactNode, useId, useState } from 'react';
import { SectionHeader } from '@/components/section-header/SectionHeader';
import styles from './TypeSection.module.css';

interface TypeSectionProps {
  title: string;
  count: number;
  meta?: string;
  /** The rows, as list items. */
  children: ReactNode;
}

/** One card type's rows under a header that collapses them. */
export const TypeSection = ({ title, count, meta, children }: TypeSectionProps) => {
  const headingId = useId();
  const [expanded, setExpanded] = useState(true);

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <SectionHeader
        id={headingId}
        title={title}
        count={count}
        meta={meta}
        expanded={expanded}
        onToggle={() => setExpanded((isExpanded) => !isExpanded)}
      />
      {expanded ? <ul className={styles.rows}>{children}</ul> : null}
    </section>
  );
};
