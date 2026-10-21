import { Link, useLocation } from "react-router-dom";
import { REFERENCE_PATH, referenceState } from "@/core/routing/referencePath";
import styles from "./AppHeader.module.css";
import { BookIcon } from "./BookIcon";

const BRAND = "Mage Wars";
const PRODUCT = "Spellbook Builder";
const REFERENCE_LABEL = "Quick reference";

export const APP_NAME = `${BRAND} ${PRODUCT}`;

interface AppHeaderProps {
  /** The Quick reference button; left out inside the Quick reference, which has its own Back. */
  showReference?: boolean;
}

/**
 * The app name, which goes home to the mage picker; the spellbook stays as its mage's draft. And
 * the Quick reference button, which opens it over this screen.
 */
export const AppHeader = ({ showReference = true }: AppHeaderProps) => {
  const location = useLocation();

  return (
    <header className={styles.header}>
      <Link className={styles.name} to="/">
        <img className={styles.logo} src="/favicon.svg" alt="" />
        <span>
          <span className={styles.brand}>{BRAND}</span>{" "}
          <span className={styles.product}>{PRODUCT}</span>
        </span>
      </Link>
      {showReference ? (
        <Link
          className={styles.reference}
          to={REFERENCE_PATH}
          state={referenceState(location)}
        >
          <BookIcon />
          <span className={styles.referenceLabel}>{REFERENCE_LABEL}</span>
        </Link>
      ) : null}
    </header>
  );
};
