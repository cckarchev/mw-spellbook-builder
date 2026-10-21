import { FaIcon } from '@/components/fa-icon/FaIcon';
import styles from './BackToTop.module.css';

const ARROW_UP_WIDTH = 384;
const ARROW_UP_PATH =
  'M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z';

interface BackToTopProps {
  visible: boolean;
  onClick: () => void;
}

/** A round button at the bottom right, shown far down the list, back to the top and the search. */
export const BackToTop = ({ visible, onClick }: BackToTopProps) => {
  if (!visible) {
    return null;
  }

  return (
    <button type="button" className={styles.button} aria-label="Back to top" onClick={onClick}>
      {/* Font Awesome "arrow-up". */}
      <FaIcon width={ARROW_UP_WIDTH} path={ARROW_UP_PATH} />
    </button>
  );
};
