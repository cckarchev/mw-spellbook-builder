// The builder is embedded as an iframe on the cckarchev site, which passes its own page
// URL as ?embed=<url-encoded>. It is captured once at startup (initEmbed in main.tsx)
// because in-app navigation drops query params. Share links then point back at that page.

const EMBED_PARAM = 'embed';

const ALLOWED_HOSTS = new Set(['cckarchev.ar', 'www.cckarchev.ar']);

/** The club site runs on http://localhost in local dev. */
const DEV_HOSTS = new Set(['localhost', '127.0.0.1']);

let embedBase: string | null = null;

const isAllowed = (url: URL): boolean => {
  if (url.protocol === 'http:') {
    return DEV_HOSTS.has(url.hostname);
  }

  return url.protocol === 'https:' && ALLOWED_HOSTS.has(url.hostname);
};

const validate = (raw: string): string | null => {
  if (!URL.canParse(raw)) {
    return null;
  }

  return isAllowed(new URL(raw)) ? raw : null;
};

export const initEmbed = (search: string = window.location.search): void => {
  const raw = new URLSearchParams(search).get(EMBED_PARAM);

  embedBase = raw ? validate(raw) : null;
};

/** The embedding club page, or null when the builder runs standalone. */
export const getEmbedBase = (): string | null => embedBase;
