import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  /** Id of the heading, so the section can be labelled by it. */
  id: string;
  title: string;
  count: number;
  /** Extra text on the right, such as a point subtotal. */
  meta?: string;
  expanded: boolean;
  onToggle: () => void;
}

/** A heading that collapses and expands the section under it. */
export const SectionHeader = ({
  id,
  title,
  count,
  meta,
  expanded,
  onToggle,
}: SectionHeaderProps) => (
  <h2 id={id} className={styles.heading}>
    <button type="button" className={styles.toggle} aria-expanded={expanded} onClick={onToggle}>
      <span className={styles.title}>
        {title} ({count})
      </span>
      {meta ? (
        <>
          {' '}
          <span className={styles.meta}>{meta}</span>
        </>
      ) : null}
    </button>
  </h2>
);
