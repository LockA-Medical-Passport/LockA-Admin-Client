import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../Modal";

describe("Modal", () => {
  it("renders nothing while closed", () => {
    render(
      <Modal open={false} onClose={jest.fn()} title="Approve provider">
        Body
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders title, content and footer when open", () => {
    render(
      <Modal
        open
        onClose={jest.fn()}
        title="Approve provider"
        footer={<button type="button">Confirm</button>}
      >
        <p>Body content</p>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Approve provider" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("closes on Escape and on the close button", async () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="Approve provider">
        Body
      </Modal>,
    );

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("moves focus into the dialog and restores it on close", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <Modal open onClose={jest.fn()} title="Details">
        <button type="button">Action</button>
      </Modal>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus();
    });

    rerender(
      <Modal open={false} onClose={jest.fn()} title="Details">
        <button type="button">Action</button>
      </Modal>,
    );

    await waitFor(() => expect(trigger).toHaveFocus());
    trigger.remove();
  });

  it("locks body scroll while open", () => {
    const { unmount } = render(
      <Modal open onClose={jest.fn()} title="Details">
        Body
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
