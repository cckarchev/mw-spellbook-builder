import { useState } from 'react';
import { CardZoom } from './CardZoom';
import styles from './ZoomableImage.module.css';

interface ZoomableImageProps {
  name: string;
  image: string;
  /** Sets the width; the image fills it. */
  className?: string;
}

/** A card image; tapping it shows the image full size. */
export const ZoomableImage = ({ name, image, className }: ZoomableImageProps) => {
  const [open, setOpen] = useState(false);

  const buttonClassName = className ? `${styles.button} ${className}` : styles.button;

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        aria-label={`Enlarge ${name}`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <img className={styles.image} src={image} alt={name} loading="lazy" />
      </button>
      <CardZoom open={open} title={name} image={image} alt={name} onClose={() => setOpen(false)} />
    </>
  );
};
