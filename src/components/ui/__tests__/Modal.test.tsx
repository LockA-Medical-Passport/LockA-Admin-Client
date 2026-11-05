import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Modal } from "../Modal";

function ControlledModal({ onClose = jest.fn() }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Approve this provider?"
        footer={<button type="button">Approve</button>}
      >
        <p>This moves the provider to Verified.</p>
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("renders nothing while closed", () => {
    render(<Modal open={false} onClose={jest.fn()} title="Hidden" />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders an accessible dialog with its title and content", () => {
    render(
      <Modal open onClose={jest.fn()} title="Approve this provider?">
        <p>Confirmation copy</p>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Approve this provider?" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Confirmation copy")).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<Modal open onClose={onClose} title="Close me" />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from the close button and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<ControlledModal onClose={onClose} />);

    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
