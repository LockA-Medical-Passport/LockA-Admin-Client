import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Badge } from "./Badge";
import { EmptyState } from "./EmptyState";
import { Table, type TableColumn } from "./Table";

interface ProviderRow {
  id: string;
  name: string;
  type: string;
  country: string;
  status: "pending" | "verified";
}

const data: ProviderRow[] = [
  {
    id: "provider-1",
    name: "Riverside General Hospital",
    type: "Hospital",
    country: "Ghana",
    status: "pending",
  },
  {
    id: "provider-2",
    name: "CarePlus Pharmacy",
    type: "Pharmacy",
    country: "Nigeria",
    status: "verified",
  },
];

const columns: TableColumn<ProviderRow>[] = [
  {
    key: "name",
    header: "Provider",
    render: (row) => row.name,
    sortable: true,
    sortValue: (row) => row.name,
  },
  { key: "type", header: "Type", render: (row) => row.type },
  { key: "country", header: "Country", render: (row) => row.country },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge variant={row.status === "pending" ? "amber" : "green"}>
        {row.status === "pending" ? "Pending" : "Verified"}
      </Badge>
    ),
    sortable: true,
    sortValue: (row) => row.status,
  },
];

const meta = {
  title: "Design System/Table",
  component: Table<ProviderRow>,
  tags: ["autodocs"],
  args: { columns, data, getRowId: (row: ProviderRow) => row.id },
} satisfies Meta<typeof Table<ProviderRow>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function SelectableTable() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  return (
    <Table
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      selectable
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
    />
  );
}

export const Selectable: Story = {
  render: () => <SelectableTable />,
};

export const Loading: Story = {
  args: { loading: true },
};

export const Empty: Story = {
  args: {
    data: [],
    emptyState: (
      <EmptyState
        title="No applications found"
        description="Try changing the status filter or clearing your search."
      />
    ),
  },
};
