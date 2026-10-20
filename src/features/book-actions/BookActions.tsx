import styles from './BookActions.module.css';
import { ClearAction } from './clear-action/ClearAction';
import { LoadAction } from './load-action/LoadAction';
import { SaveAction } from './save-action/SaveAction';

/** Save the book under a name, load a saved one, or clear it. */
export const BookActions = () => (
  <section className={styles.actions} aria-label="Save and load">
    <SaveAction />
    <LoadAction />
    <ClearAction />
  </section>
);
