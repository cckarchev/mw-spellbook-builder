import { fireEvent, renderHook } from "@testing-library/react";
import { useEscapeKey } from "./useEscapeKey";

const pressEscape = () => {
  fireEvent.keyDown(document, { key: "Escape" });
};

describe("useEscapeKey", () => {
  it("calls the handler on Escape while active", () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(true, onEscape));

    pressEscape();

    expect(onEscape).toHaveBeenCalledOnce();
  });

  it("ignores Escape while inactive", () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(false, onEscape));

    pressEscape();

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("only reaches the handler activated last", () => {
    const closePopover = vi.fn();
    const closeDialog = vi.fn();
    renderHook(() => useEscapeKey(true, closePopover));
    renderHook(() => useEscapeKey(true, closeDialog));

    pressEscape();

    expect(closeDialog).toHaveBeenCalledOnce();
    expect(closePopover).not.toHaveBeenCalled();
  });

  it("hands Escape back to the earlier handler once the later one closes", () => {
    const closePopover = vi.fn();
    const closeDialog = vi.fn();
    renderHook(() => useEscapeKey(true, closePopover));
    const dialog = renderHook(() => useEscapeKey(true, closeDialog));

    dialog.unmount();
    pressEscape();

    expect(closePopover).toHaveBeenCalledOnce();
  });

  it("ignores other keys", () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(true, onEscape));

    fireEvent.keyDown(document, { key: "Enter" });

    expect(onEscape).not.toHaveBeenCalled();
  });
});
