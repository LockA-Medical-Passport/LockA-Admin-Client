import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "../Toast";
import { dismissToast, getToastSnapshot, toast } from "../toast-store";

afterEach(() => {
  act(() => {
    getToastSnapshot().forEach((item) => dismissToast(item.id));
  });
});

describe("Toaster", () => {
  it("renders success, error and pending notifications", () => {
    render(<Toaster />);

    act(() => {
      toast.success("Provider approved");
    });
    act(() => {
      toast.error("Decision failed");
    });
    act(() => {
      toast.pending("Submitting to Stellar");
    });

    expect(screen.getByText("Provider approved")).toBeInTheDocument();
    expect(screen.getByText("Decision failed")).toBeInTheDocument();
    expect(screen.getByText("Submitting to Stellar")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
  });

  it("links a transaction hash to the Stellar explorer", () => {
    render(<Toaster />);

    act(() => {
      toast.success("Approved on-chain", { txHash: "abcdef0123456789abcdef0123456789" });
    });

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://stellar.expert/explorer/testnet/tx/abcdef0123456789abcdef0123456789",
    );
  });

  it("can be dismissed by the user", async () => {
    render(<Toaster />);

    let id = "";
    act(() => {
      id = toast.pending("Submitting to Stellar");
    });

    await userEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));

    expect(screen.queryByText("Submitting to Stellar")).not.toBeInTheDocument();
    expect(id).not.toBe("");
    act(() => dismissToast(id));
  });
});
