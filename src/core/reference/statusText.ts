const ONE = 1;

/** What the Quick reference status line says, and screen readers announce, about the list. */
export const statusText = (total: number, hasQuery: boolean, matches: number): string => {
  if (!hasQuery) {
    return `${total} terms`;
  }

  if (matches === 0) {
    return 'No matches';
  }

  if (matches === ONE) {
    return '1 match';
  }

  return `${matches} matches`;
};
