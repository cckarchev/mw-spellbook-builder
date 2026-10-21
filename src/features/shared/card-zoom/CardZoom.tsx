import { Dialog } from "@/components/dialog/Dialog";
import styles from "./CardZoom.module.css";

interface CardZoomProps {
  open: boolean;
  title: string;
  image: string;
  alt: string;
  /** A wall card, printed sideways. */
  landscape?: boolean;
  onClose: () => void;
}

/** A card image at its full size, in a dialog closed with the X in its corner. */
export const CardZoom = ({
  open,
  title,
  image,
  alt,
  landscape = false,
  onClose,
}: CardZoomProps) => (
  <Dialog
    open={open}
    title={title}
    onClose={onClose}
    closeButton={true}
    className={styles.dialog}
  >
    <img
      className={styles.image}
      src={image}
      alt={alt}
      data-landscape={landscape}
    />
  </Dialog>
);
