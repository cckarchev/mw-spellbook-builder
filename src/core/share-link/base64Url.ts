/** Base64 encodes in 4-character blocks; the url-safe form drops the padding. */
const BASE64_BLOCK_LENGTH = 4;

const bytesToBinary = (bytes: Uint8Array): string => {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return binary;
};

const binaryToBytes = (binary: string): Uint8Array =>
  Uint8Array.from(binary, (char) => char.charCodeAt(0));

/** Encodes text as UTF-8, then as url-safe base64 without padding. */
export const toBase64Url = (text: string): string => {
  const base64 = btoa(bytesToBinary(new TextEncoder().encode(text)));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/** The inverse of toBase64Url. Throws when the input is not url-safe base64. */
export const fromBase64Url = (encoded: string): string => {
  const overflow = encoded.length % BASE64_BLOCK_LENGTH;
  const missing = overflow === 0 ? 0 : BASE64_BLOCK_LENGTH - overflow;
  const base64 =
    encoded.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(missing);

  return new TextDecoder("utf-8", { fatal: true }).decode(
    binaryToBytes(atob(base64)),
  );
};
