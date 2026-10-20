import type { ReactNode } from 'react';
import styles from './StatNote.module.css';

/** A line of small text under a stat's chart. */
export const StatNote = ({ children }: { children: ReactNode }) => (
  <p className={styles.note}>{children}</p>
);
