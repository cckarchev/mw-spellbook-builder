import { memo } from "react";
import { CardStepper } from "../CardStepper";
import type { CardEntryProps } from "../cardEntryProps";
import { ZoomableImage } from "../zoomable-image/ZoomableImage";
import styles from "./CardTile.module.css";

/** A card image with its points and a stepper, for the grid view. Tapping the image enlarges it. */
export const CardTile = memo(
  ({
    card,
    count,
    points,
    blockedReason,
    problem = null,
    onAdd,
    onRemove,
  }: CardEntryProps) => (
    <li
      className={styles.tile}
      data-in-spellbook={count > 0}
      data-problem={problem !== null}
    >
      <div className={styles.art} data-landscape={card.landscape}>
        <div className={styles.frame}>
          {card.image ? (
            <ZoomableImage
              name={card.name}
              image={card.image}
              landscape={card.landscape}
              className={styles.image}
            />
          ) : (
            <span className={styles.placeholder}>{card.name}</span>
          )}
          <span className={styles.points}>{points} pts</span>
        </div>
      </div>
      <CardStepper
        card={card}
        count={count}
        blockedReason={blockedReason}
        onAdd={onAdd}
        onRemove={onRemove}
      />
      {problem === null ? null : (
        <span className={styles.problem}>{problem}</span>
      )}
    </li>
  ),
);
