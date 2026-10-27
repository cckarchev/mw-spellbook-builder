import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Dialog } from "./Dialog";

const renderDialog = () => {
  render(
    <>
      <button type="button">Behind</button>
      <Dialog open={true} title="Pick one" onClose={() => undefined}>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Dialog>
    </>,
  );
};

/** A button that opens a Dialog, which holds its own open state. */
const OpenerAndDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Dialog open={open} title="Pick one" onClose={() => setOpen(false)}>
        <button type="button">First</button>
      </Dialog>
    </>
  );
};

describe("Dialog", () => {
  it("focuses its first button when it opens", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  });

  it("keeps Tab inside the dialog, wrapping from the last button to the first", async () => {
    renderDialog();

    await userEvent.tab();
    await userEvent.tab();

    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  });

  it("keeps Shift+Tab inside the dialog, wrapping from the first button to the last", async () => {
    renderDialog();

    await userEvent.tab({ shift: true });

    expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
  });

  it("gives the focus back to the button that opened it when it closes", async () => {
    render(<OpenerAndDialog />);

    const opener = screen.getByRole("button", { name: "Open" });

    await userEvent.click(opener);
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});

describe("Dialog close button", () => {
  it("closes from the X in the corner and takes the focus first", async () => {
    const onClose = vi.fn();

    render(
      <Dialog open={true} title="Card" onClose={onClose} closeButton={true}>
        <button type="button">Inside</button>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "Card" });
    const close = within(dialog).getByRole("button", { name: "Close" });

    expect(close).toHaveFocus();

    await userEvent.click(close);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("focuses a text field before the X, with its text selected", () => {
    render(
      <Dialog
        open={true}
        title="Save"
        onClose={() => undefined}
        closeButton={true}
      >
        <input aria-label="Name" defaultValue="Aggro" />
      </Dialog>,
    );

    const field = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Name",
    });

    expect(field).toHaveFocus();
    expect(field.selectionStart).toBe(0);
    expect(field.selectionEnd).toBe("Aggro".length);
  });

  it("has no X by default", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog", { name: "Pick one" });

    expect(
      within(dialog).queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });

  it("renders over the whole page, outside the element that opened it", () => {
    const { container } = render(
      <div style={{ position: "sticky" }}>
        <Dialog open={true} title="Pick one" onClose={() => undefined}>
          <button type="button">First</button>
        </Dialog>
      </div>,
    );

    // A positioned parent would trap the scrim under the sticky header.
    expect(container).not.toContainElement(screen.getByRole("dialog"));
  });
});
