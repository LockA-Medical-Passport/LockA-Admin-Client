import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./Input";

const meta = {
  title: "Design System/Input",
  component: Input,
  tags: ["autodocs"],
  args: { label: "Email", placeholder: "admin@locka.health" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: { helperText: "Use the address tied to your admin account." },
};

export const WithError: Story = {
  args: { error: "Enter a valid email address." },
};

export const Required: Story = {
  args: { required: true },
};
