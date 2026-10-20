import { Dialog } from '@/components/dialog/Dialog';
import styles from './CardZoom.module.css';

interface CardZoomProps {
  open: boolean;
  title: string;
  image: string;
  alt: string;
  onClose: () => void;
}

/** A card image at its full size, in a dialog closed with the X in its corner. */
export const CardZoom = ({ open, title, image, alt, onClose }: CardZoomProps) => (
  <Dialog open={open} title={title} onClose={onClose} closeButton={true} className={styles.dialog}>
    <img className={styles.image} src={image} alt={alt} />
  </Dialog>
);
