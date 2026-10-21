import { type ReactNode, useId, useState } from "react";
import { SectionHeader } from "@/components/section-header/SectionHeader";
import type { ViewMode } from "../view-switch/useViewMode";
import styles from "./TypeSection.module.css";

interface TypeSectionProps {
  title: string;
  count: number;
  meta?: string;
  /** Whether the rows start shown. */
  defaultExpanded?: boolean;
  /** Rows one under another, or card tiles side by side. */
  layout: ViewMode;
  /** The rows, as list items. */
  children: ReactNode;
}

/** One card type's rows under a header that collapses them. */
export const TypeSection = ({
  title,
  count,
  meta,
  defaultExpanded = true,
  layout,
  children,
}: TypeSectionProps) => {
  const headingId = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);

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
      {expanded ? (
        <ul className={styles.rows} data-layout={layout}>
          {children}
        </ul>
      ) : null}
    </section>
  );
};
