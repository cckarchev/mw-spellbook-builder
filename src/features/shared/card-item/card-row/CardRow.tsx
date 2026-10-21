import { memo, useState } from "react";
import { schoolSummary } from "@/core/catalog/schoolSummary";
import { CardStepper } from "../CardStepper";
import type { CardEntryProps } from "../cardEntryProps";
import { CardDetails } from "./CardDetails";
import styles from "./CardRow.module.css";

/** A card with its points and a stepper. Tapping it opens the card image and text. */
export const CardRow = memo(
  ({
    card,
    count,
    points,
    blockedReason,
    problem = null,
    onAdd,
    onRemove,
  }: CardEntryProps) => {
    const [expanded, setExpanded] = useState(false);

    const details = [schoolSummary(card), ...card.subtypes].join(" · ");

    return (
      <li
        className={styles.row}
        data-in-spellbook={count > 0}
        data-problem={problem !== null}
      >
        <div className={styles.main}>
          <button
            type="button"
            className={styles.summary}
            aria-expanded={expanded}
            onClick={() => setExpanded((isExpanded) => !isExpanded)}
          >
            <span className={styles.name} data-card-name={true}>
              {card.name}
            </span>
            <span className={styles.details}>{details}</span>
            {problem === null ? null : (
              <span className={styles.problem}>{problem}</span>
            )}
          </button>
          <span className={styles.points}>{points} pts</span>
          <CardStepper
            card={card}
            count={count}
            blockedReason={blockedReason}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </div>
        {expanded ? <CardDetails card={card} /> : null}
      </li>
    );
  },
);
