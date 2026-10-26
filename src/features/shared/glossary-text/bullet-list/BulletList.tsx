import type { ReactNode } from "react";
import styles from "./BulletList.module.css";

/**
 * The Codex's inline "•" bullets, as a list under a definition's intro. Takes
 * the list items.
 */
export const BulletList = ({ children }: { children: ReactNode }) => (
  <ul className={styles.list}>{children}</ul>
);
