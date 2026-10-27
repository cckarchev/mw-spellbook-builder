import type { MarkedPart } from "@/core/reference/markSegments";
import styles from "./MarkedText.module.css";

interface MarkedTextProps {
  parts: readonly MarkedPart[];
}

/** Text with the search matches highlighted. */
export const MarkedText = ({ parts }: MarkedTextProps) => {
  let offset = 0;

  return parts.map((part) => {
    const key = offset;

    offset += part.text.length;

    if (!part.marked) {
      return <span key={key}>{part.text}</span>;
    }

    return (
      <mark key={key} className={styles.mark}>
        {part.text}
      </mark>
    );
  });
};
