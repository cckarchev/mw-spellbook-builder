import { useEffect } from 'react';
import styles from './Toast.module.css';
import { useToastStore } from './useToastStore';

export const TOAST_DURATION_MS = 2500;

/** Shows the toast message at the bottom of the screen for a moment. Mounted once, at the app root. */
export const Toast = () => {
  const message = useToastStore((state) => state.message);
  const showId = useToastStore((state) => state.showId);
  const hide = useToastStore((state) => state.hide);

  useEffect(() => {
    if (showId === 0) {
      return;
    }

    const timer = window.setTimeout(hide, TOAST_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showId, hide]);

  // The live region stays in the page while empty, so screen readers announce what lands in it.
  return (
    <div className={styles.region} role="status">
      {message === null ? null : <p className={styles.toast}>{message}</p>}
    </div>
  );
};
