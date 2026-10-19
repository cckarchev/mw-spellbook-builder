/** Query param carrying an encoded book in a share link. */
export const BOOK_PARAM = 'b';

const BUILD_PATH = '/build';

interface ShareUrlInput {
  /** The book, already encoded with encodeBook. */
  encoded: string;
  /** The embedding club page, or null when the builder runs standalone. */
  embedBase: string | null;
  /** This app's own origin, such as window.location.origin. */
  origin: string;
}

/**
 * The link the Share button copies. Embedded, it points back at the club page, which
 * re-embeds the builder with the book. Standalone, it points at this app's builder.
 */
export const buildShareUrl = ({ encoded, embedBase, origin }: ShareUrlInput): string => {
  const url = new URL(embedBase ?? `${origin}${BUILD_PATH}`);

  url.searchParams.set(BOOK_PARAM, encoded);

  return url.toString();
};
