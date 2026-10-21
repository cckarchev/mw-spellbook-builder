import type { MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { REFERENCE_PATH, referenceState } from '@/core/routing/referencePath';
import { useReferenceRoute } from '@/features/shared/useReferenceRoute';
import styles from './AppHeader.module.css';
import { BookIcon } from './BookIcon';

const BRAND = 'Mage Wars';
const PRODUCT = 'Spellbook Builder';
const REFERENCE_LABEL = 'Quick reference';

export const APP_NAME = `${BRAND} ${PRODUCT}`;

/**
 * The app name, which goes home to the mage picker; the spellbook stays as its mage's draft. And
 * the Quick reference button, which opens it over this screen, or closes it when it is open.
 */
export const AppHeader = () => {
  const location = useLocation();
  const { isOpen, close } = useReferenceRoute();

  const handleReferenceClick = (event: MouseEvent) => {
    if (!isOpen) {
      return;
    }

    event.preventDefault();
    close();
  };

  return (
    <header className={styles.header}>
      <Link className={styles.name} to="/">
        <img className={styles.logo} src="/favicon.svg" alt="" />
        <span>
          <span className={styles.brand}>{BRAND}</span>{' '}
          <span className={styles.product}>{PRODUCT}</span>
        </span>
      </Link>
      <Link
        className={styles.reference}
        to={REFERENCE_PATH}
        state={referenceState(location)}
        aria-current={isOpen ? 'page' : undefined}
        onClick={handleReferenceClick}
      >
        <BookIcon />
        <span className={styles.referenceLabel}>{REFERENCE_LABEL}</span>
      </Link>
    </header>
  );
};
