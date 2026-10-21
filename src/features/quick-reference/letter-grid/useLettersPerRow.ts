import { useLayoutEffect, useState } from 'react';
import { lettersPerRow } from '@/core/reference/lettersPerRow';

// Read from the stylesheet: the narrowest a letter button gets, and the space between buttons.
const CELL_PROPERTY = '--touch-target';
const NO_LENGTH = 0;

const lengthOf = (value: string): number => {
  const length = Number.parseFloat(value);

  return Number.isNaN(length) ? NO_LENGTH : length;
};

/**
 * How many letters go in each row of the element given to `ref`, so the rows come out even at
 * its current width. Measured before paint, so the grid never shows uneven rows first.
 */
export const useLettersPerRow = (count: number) => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [perRow, setPerRow] = useState(count);

  useLayoutEffect(() => {
    if (!element) {
      return;
    }

    const measure = () => {
      const style = getComputedStyle(element);
      const cell = lengthOf(style.getPropertyValue(CELL_PROPERTY));
      const gap = lengthOf(style.columnGap);

      setPerRow(lettersPerRow(count, element.clientWidth, cell, gap));
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element, count]);

  return { ref: setElement, perRow };
};
