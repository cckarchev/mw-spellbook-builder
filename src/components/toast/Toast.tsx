import { useEffect } from "react";
import styles from "./Toast.module.css";
import { useToastStore } from "./useToastStore";

/** Shows the toast message at the bottom of the screen for a moment. Mounted once, at the app root. */
export const Toast = () => {
  const message = useToastStore((state) => state.message);
  const durationMs = useToastStore((state) => state.durationMs);
  const showId = useToastStore((state) => state.showId);
  const hide = useToastStore((state) => state.hide);

  useEffect(() => {
    // Nothing has been shown yet.
    if (showId === 0) {
      return;
    }

    const timer = window.setTimeout(hide, durationMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showId, durationMs, hide]);

  // The live region stays in the page while empty, so screen readers announce what lands in it.
  // Keyed by showId, a repeated message is new content and gets announced again.
  return (
    <div className={styles.region} role="status">
      {message === null ? null : (
        <p key={showId} className={styles.toast}>
          {message}
        </p>
      )}
    </div>
  );
};
