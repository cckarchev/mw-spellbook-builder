import { memo } from "react";
import { letterAnchorId } from "@/core/reference/anchors";
import type { LetterGroup } from "@/core/reference/letterGroups";
import { Entry } from "../entry/Entry";
import styles from "./EntryList.module.css";

interface EntryListProps {
  groups: readonly LetterGroup[];
  onJump: (term: string) => void;
}

/**
 * Every term at rest, under a heading per first letter. Memoized, since its
 * hundreds of entries would otherwise render again whenever the back to top
 * button comes or goes.
 */
export const EntryList = memo(({ groups, onJump }: EntryListProps) =>
  groups.map((group) => {
    const headingId = letterAnchorId(group.letter);

    return (
      <section
        key={group.letter}
        className={styles.group}
        aria-labelledby={headingId}
      >
        <h2 id={headingId} className={styles.letter} tabIndex={-1}>
          {group.letter}
        </h2>
        <dl>
          {group.entries.map((entry) => (
            <Entry key={entry.term} entry={entry} query="" onJump={onJump} />
          ))}
        </dl>
      </section>
    );
  }),
);
