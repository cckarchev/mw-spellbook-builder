import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { BookLossNote } from '@/features/shared/BookLossNote';
import styles from './AppHeader.module.css';
import { useGoHome } from './useGoHome';

const BRAND = 'Mage Wars';
const PRODUCT = 'Spellbook Builder';

export const APP_NAME = `${BRAND} ${PRODUCT}`;

/** The app name, which goes home and starts a new book, after a confirm if cards would be lost. */
export const AppHeader = () => {
  const { book, askingToClear, requestHome, confirmHome, cancelHome } = useGoHome();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    requestHome();
  };

  return (
    <header className={styles.header}>
      <Link className={styles.name} to="/" onClick={handleClick}>
        <span className={styles.brand}>{BRAND}</span>{' '}
        <span className={styles.product}>{PRODUCT}</span>
      </Link>
      <ConfirmDialog
        open={askingToClear}
        title="Discard this book?"
        body={<BookLossNote book={book} />}
        confirmLabel="Discard and go home"
        onConfirm={confirmHome}
        onCancel={cancelHome}
      />
    </header>
  );
};
