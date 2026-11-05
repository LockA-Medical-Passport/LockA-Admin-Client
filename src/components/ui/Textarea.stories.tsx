import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Textarea } from "./Textarea";

const meta = {
  title: "Design System/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { label: "Reason", placeholder: "Why is this provider being rejected?" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: { helperText: "This reason is shown in the provider's decision history." },
};

export const WithError: Story = {
  args: { error: "A reason is required to reject a provider." },
};
