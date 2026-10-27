import {
  readStored,
  readStoredJson,
  removeStored,
  writeStored,
} from "./storage";

const KEY = "test:key";

describe("storage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("reads back what it wrote", () => {
    writeStored(KEY, "hello");

    expect(readStored(KEY)).toBe("hello");
  });

  it("returns null for a missing key", () => {
    expect(readStored(KEY)).toBeNull();
  });

  it("returns null when localStorage.getItem throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(readStored(KEY)).toBeNull();
  });

  it("reports a write that worked", () => {
    expect(writeStored(KEY, "hello")).toBe(true);
  });

  it("does not throw when localStorage.setItem throws, and reports the failure", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });

    expect(writeStored(KEY, "hello")).toBe(false);
  });
});

describe("removeStored", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("removes the key", () => {
    writeStored(KEY, "hello");

    removeStored(KEY);

    expect(readStored(KEY)).toBeNull();
  });

  it("does not throw when localStorage.removeItem throws", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => {
      removeStored(KEY);
    }).not.toThrow();
  });
});

describe("readStoredJson", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("parses the stored JSON", () => {
    writeStored(KEY, '{"a":1}');

    expect(readStoredJson(KEY)).toEqual({ a: 1 });
  });

  it("returns null for a missing key or text that is not JSON", () => {
    expect(readStoredJson(KEY)).toBeNull();

    writeStored(KEY, "not json");

    expect(readStoredJson(KEY)).toBeNull();
  });
});
