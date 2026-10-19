// localStorage can throw (private mode, blocked site data, quota), so every access is
// guarded and a failure reads as "nothing stored".

/** The stored string, or null when there is none or storage is unavailable. */
export const readStored = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

/** Stores the string, silently doing nothing when storage is unavailable. */
export const writeStored = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Persistence is a convenience; the book still lives in memory.
  }
};
