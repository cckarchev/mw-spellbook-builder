import type { ReactNode } from 'react';
import styles from './EmptyMessage.module.css';

/** The centered, dimmed line a panel shows while it has nothing to list. */
export const EmptyMessage = ({ children }: { children: ReactNode }) => (
  <p className={styles.empty}>{children}</p>
);
