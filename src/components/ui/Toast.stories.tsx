import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./Button";
import { Toaster } from "./Toast";
import { toast } from "./toast-store";

const meta = {
  title: "Design System/Toast",
  component: Toaster,
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="success"
        onClick={() =>
          toast.success("Provider approved", {
            title: "Recorded on-chain",
            duration: 60_000,
          })
        }
      >
        Success toast
      </Button>
      <Button
        variant="danger"
        onClick={() =>
          toast.error("The transaction was rejected in Freighter.", { duration: 60_000 })
        }
      >
        Error toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast.pending("Waiting for signature…", { title: "Submitting" })}
      >
        Pending toast
      </Button>
    </div>
  ),
};
