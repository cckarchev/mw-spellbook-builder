import { useState } from "react";
import { mageStatsImage } from "@/core/catalog/mageImage";
import type { Mage } from "@/core/rules/types";
import { CardZoom } from "@/features/shared/card-zoom/CardZoom";
import styles from "./MageStats.module.css";
import { StatsIcon } from "./StatsIcon";

interface MageStatsProps {
  mage: Mage;
  /** Text before the icon. Without it the button is the icon alone, named "<Mage> stats". */
  label?: string;
  className?: string;
}

/** A button that opens the mage stats card in a dialog. Without a stats card, just the label. */
export const MageStats = ({ mage, label, className }: MageStatsProps) => {
  const [open, setOpen] = useState(false);
  const image = mageStatsImage(mage);
  const title = `${mage.name} stats`;

  if (image === null) {
    return label ?? null;
  }

  const classes = [styles.trigger, className].filter(Boolean).join(" ");
  const openStats = () => {
    setOpen(true);
  };
  const closeStats = () => {
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={classes}
        aria-label={label ? undefined : title}
        aria-haspopup="dialog"
        title={title}
        onClick={openStats}
      >
        {label ? <span className={styles.label}>{label}</span> : null}
        <StatsIcon />
      </button>
      <CardZoom
        open={open}
        title={title}
        image={image}
        alt={`${mage.name} stats card`}
        onClose={closeStats}
      />
    </>
  );
};
