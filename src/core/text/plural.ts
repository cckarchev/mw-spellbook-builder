/** A count with its noun, such as '1 card' or '4 copies'. */
export const plural = (
  count: number,
  singular: string,
  pluralForm: string,
): string => `${count} ${count === 1 ? singular : pluralForm}`;
