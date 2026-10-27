import { useEffect, useState } from "react";

const NO_HEIGHT = 0;

/**
 * The height of the element given to `ref`, kept current as it changes, such as
 * the sticky header when its actions wrap. A callback ref, so an element that
 * mounts after the first render is still measured.
 */
export const useStickyHeight = () => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(NO_HEIGHT);

  useEffect(() => {
    if (!element) {
      return;
    }

    const measure = () => {
      setHeight(element.offsetHeight);
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element]);

  return { ref: setElement, height };
};
