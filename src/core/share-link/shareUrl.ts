/** Query param carrying an encoded book in a share link. */
export const BOOK_PARAM = 'b';

interface ShareUrlInput {
  /** The book, already encoded with encodeBook. */
  encoded: string;
  /** The embedding club page, or null when the builder runs standalone. */
  embedBase: string | null;
  /** This app's own origin, such as window.location.origin. */
  origin: string;
  /** The book's mage in this app, such as "/wizard". */
  magePath: string;
}

/**
 * The link the Share button copies. Embedded, it points back at the club page, which
 * re-embeds the builder with the book. Standalone, it points at the book's mage in this app's builder.
 */
export const buildShareUrl = ({ encoded, embedBase, origin, magePath }: ShareUrlInput): string => {
  const url = new URL(embedBase ?? `${origin}${magePath}`);

  url.searchParams.set(BOOK_PARAM, encoded);

  return url.toString();
};
