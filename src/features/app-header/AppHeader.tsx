import { Link } from 'react-router-dom';
import styles from './AppHeader.module.css';

const BRAND = 'Mage Wars';
const PRODUCT = 'Spellbook Builder';

export const APP_NAME = `${BRAND} ${PRODUCT}`;

/** The app name, which goes home to the mage picker; the book stays as its mage's draft. */
export const AppHeader = () => (
  <header className={styles.header}>
    <Link className={styles.name} to="/">
      <img className={styles.logo} src="/favicon.svg" alt="" />
      <span>
        <span className={styles.brand}>{BRAND}</span>{' '}
        <span className={styles.product}>{PRODUCT}</span>
      </span>
    </Link>
  </header>
);
