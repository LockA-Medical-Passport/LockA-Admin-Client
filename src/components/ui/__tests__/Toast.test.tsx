import { act, fireEvent, render, screen } from "@testing-library/react";
import { Toaster } from "../Toast";
import { dismissToast, getToastSnapshot, toast } from "../toast-store";

const TX_HASH = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0a1b2c3d4e5f6a7b8c9d0e1f2";

function clearToasts() {
  act(() => {
    for (const item of getToastSnapshot()) dismissToast(item.id);
  });
}

describe("Toast", () => {
  afterEach(() => {
    clearToasts();
    jest.useRealTimers();
  });

  it("renders a success toast with its title and transaction link", () => {
    render(<Toaster />);

    act(() => {
      toast.success("Provider approved", { title: "Approved", txHash: TX_HASH, duration: 0 });
    });

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Approved");
    expect(status).toHaveTextContent("Provider approved");
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `https://stellar.expert/explorer/testnet/tx/${TX_HASH}`,
    );
  });

  it("renders an error toast", () => {
    render(<Toaster />);

    act(() => {
      toast.error("Freighter rejected the transaction", { duration: 0 });
    });

    expect(screen.getByRole("status")).toHaveTextContent("Freighter rejected the transaction");
  });

  it("dismisses a toast from its close button", () => {
    render(<Toaster />);

    act(() => {
      toast.success("Dismiss me", { duration: 0 });
    });

    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("auto-dismisses after the default duration", () => {
    jest.useFakeTimers();
    render(<Toaster />);

    act(() => {
      toast.success("Temporary");
    });
    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps pending toasts until explicitly dismissed", () => {
    jest.useFakeTimers();
    render(<Toaster />);

    act(() => {
      toast.pending("Submitting to ProviderRegistry…");
    });

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(screen.getByText("Submitting to ProviderRegistry…")).toBeInTheDocument();
  });
});
