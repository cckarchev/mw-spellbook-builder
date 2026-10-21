import { useState } from 'react';
import { CardZoom } from '../../card-zoom/CardZoom';
import styles from './ZoomableImage.module.css';

interface ZoomableImageProps {
  name: string;
  image: string;
  /** A wall card, printed sideways. */
  landscape: boolean;
  /** Sets the width; the image fills it. */
  className: string;
}

/** A card image; tapping it shows the image full size. */
export const ZoomableImage = ({ name, image, landscape, className }: ZoomableImageProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`${styles.button} ${className}`}
        aria-label={`Enlarge ${name}`}
        aria-haspopup="dialog"
        data-landscape={landscape}
        onClick={() => setOpen(true)}
      >
        <img className={styles.image} src={image} alt={name} loading="lazy" />
      </button>
      <CardZoom
        open={open}
        title={name}
        image={image}
        alt={name}
        landscape={landscape}
        onClose={() => setOpen(false)}
      />
    </>
  );
};
