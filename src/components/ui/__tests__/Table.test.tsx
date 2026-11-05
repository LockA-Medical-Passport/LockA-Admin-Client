import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table, type TableColumn } from "../Table";

interface Row {
  id: string;
  name: string;
  status: string;
}

const ROWS: Row[] = [
  { id: "1", name: "Clinic Beta", status: "pending" },
  { id: "2", name: "Hospital Alpha", status: "verified" },
  { id: "3", name: "Lab Gamma", status: "pending" },
];

const COLUMNS: TableColumn<Row>[] = [
  {
    key: "name",
    header: "Provider",
    sortable: true,
    sortValue: (row) => row.name,
    render: (row) => row.name,
  },
  { key: "status", header: "Status", render: (row) => row.status },
];

function rowNames() {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0].textContent);
}

describe("Table", () => {
  it("renders the supplied rows", () => {
    render(<Table columns={COLUMNS} data={ROWS} getRowId={(row) => row.id} />);

    expect(screen.getByText("Clinic Beta")).toBeInTheDocument();
    expect(screen.getByText("Hospital Alpha")).toBeInTheDocument();
    expect(screen.getByText("Lab Gamma")).toBeInTheDocument();
  });

  it("sorts a sortable column both ways", async () => {
    const user = userEvent.setup();
    render(<Table columns={COLUMNS} data={ROWS} getRowId={(row) => row.id} />);

    await user.click(screen.getByRole("button", { name: /provider/i }));
    expect(rowNames()).toEqual(["Clinic Beta", "Hospital Alpha", "Lab Gamma"]);

    await user.click(screen.getByRole("button", { name: /provider/i }));
    expect(rowNames()).toEqual(["Lab Gamma", "Hospital Alpha", "Clinic Beta"]);
  });

  it("renders the empty state when there is no data", () => {
    render(
      <Table
        columns={COLUMNS}
        data={[]}
        getRowId={(row) => row.id}
        emptyState={<p>No pending applications</p>}
      />,
    );

    expect(screen.getByText("No pending applications")).toBeInTheDocument();
  });

  it("renders skeleton rows instead of data while loading", () => {
    const { container } = render(
      <Table columns={COLUMNS} data={ROWS} getRowId={(row) => row.id} loading />,
    );

    expect(screen.queryByText("Clinic Beta")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("supports select-all and individual row selection", async () => {
    const user = userEvent.setup();
    const onSelectionChange = jest.fn();
    render(
      <Table
        columns={COLUMNS}
        data={ROWS}
        getRowId={(row) => row.id}
        selectable
        selectedIds={new Set()}
        onSelectionChange={onSelectionChange}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["1", "2", "3"]));

    await user.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["1"]));
  });

  it("calls onRowClick when a row is clicked", async () => {
    const user = userEvent.setup();
    const onRowClick = jest.fn();
    render(
      <Table columns={COLUMNS} data={ROWS} getRowId={(row) => row.id} onRowClick={onRowClick} />,
    );

    await user.click(screen.getByText("Hospital Alpha"));

    expect(onRowClick).toHaveBeenCalledWith(ROWS[1]);
  });
});
