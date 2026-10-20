import { type ReactNode, useId } from 'react';
import styles from './StatSection.module.css';

interface StatSectionProps {
  title: string;
  children: ReactNode;
}

/** A titled box holding one stat. */
export const StatSection = ({ title, children }: StatSectionProps) => {
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
};
