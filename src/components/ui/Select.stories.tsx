import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Select } from "./Select";

const meta = {
  title: "Design System/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    label: "Status",
    defaultValue: "pending",
    options: [
      { value: "all", label: "All statuses" },
      { value: "pending", label: "Pending" },
      { value: "verified", label: "Verified" },
      { value: "suspended", label: "Suspended" },
      { value: "revoked", label: "Revoked" },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: { error: "Choose a status to filter by." },
};

export const WithHelperText: Story = {
  args: { helperText: "Only approved providers can be suspended or revoked." },
};
