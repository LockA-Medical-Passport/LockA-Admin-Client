import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "./Button";
import { Modal, type ModalProps } from "./Modal";

const meta = {
  title: "Design System/Modal",
  component: Modal,
  tags: ["autodocs"],
  args: {
    open: true,
    onClose: () => {},
    title: "Approve Riverside General Hospital?",
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function ModalDemo(args: ModalProps) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Approve</Button>
          </>
        }
      >
        <p className="text-sm text-foreground/70">
          This records the provider as Verified in the ProviderRegistry contract. You&apos;ll be
          asked to sign the transaction in Freighter.
        </p>
      </Modal>
    </>
  );
}

export const Default: Story = {
  render: (args) => <ModalDemo {...args} />,
};

export const WithoutTitle: Story = {
  args: { title: undefined },
  render: (args) => <ModalDemo {...args} />,
};
