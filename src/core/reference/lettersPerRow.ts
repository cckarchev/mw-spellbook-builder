const AT_LEAST_ONE = 1;

/**
 * How many letter buttons go in each row so the rows come out even: 26 letters
 * that do not fit in one row go 13 and 13, not 20 and 6; in three rows, 9, 9
 * and 8.
 */
export const lettersPerRow = (
  count: number,
  width: number,
  cell: number,
  gap: number,
): number => {
  const fitting = Math.floor((width + gap) / (cell + gap));
  const maxPerRow = Math.max(AT_LEAST_ONE, fitting);
  const rows = Math.ceil(count / maxPerRow);

  return Math.ceil(count / rows);
};
