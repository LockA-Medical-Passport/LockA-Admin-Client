import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table, type TableColumn } from "../Table";

interface Row {
  id: string;
  name: string;
  score: number;
}

const rows: Row[] = [
  { id: "1", name: "Zeta", score: 2 },
  { id: "2", name: "Alpha", score: 3 },
  { id: "3", name: "Mike", score: 1 },
];

const columns: TableColumn<Row>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    sortValue: (row) => row.name,
    render: (row) => row.name,
  },
  { key: "score", header: "Score", render: (row) => row.score },
];

function bodyRows() {
  return screen.getAllByRole("row").slice(1);
}

describe("Table", () => {
  it("renders a row per record", () => {
    render(<Table columns={columns} data={rows} getRowId={(row) => row.id} />);

    expect(bodyRows()).toHaveLength(3);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("shows a skeleton while loading", () => {
    render(<Table columns={columns} data={[]} getRowId={(row) => row.id} loading />);

    expect(bodyRows()).toHaveLength(5);
    expect(screen.queryByText("No data")).not.toBeInTheDocument();
  });

  it("renders the supplied empty state", () => {
    render(
      <Table
        columns={columns}
        data={[]}
        getRowId={(row) => row.id}
        emptyState={<span>Nothing here yet</span>}
      />,
    );

    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("sorts locally when a sortable header is clicked", async () => {
    render(<Table columns={columns} data={rows} getRowId={(row) => row.id} />);

    await userEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(bodyRows().map((row) => within(row).getAllByRole("cell")[0].textContent)).toEqual([
      "Alpha",
      "Mike",
      "Zeta",
    ]);

    await userEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(bodyRows().map((row) => within(row).getAllByRole("cell")[0].textContent)).toEqual([
      "Zeta",
      "Mike",
      "Alpha",
    ]);
  });

  it("delegates sorting to the parent when controlled", async () => {
    const onSortChange = jest.fn();
    render(
      <Table
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        sortKey="name"
        sortDirection="asc"
        onSortChange={onSortChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /Name/ }));
    expect(onSortChange).toHaveBeenCalledWith("name", "desc");
  });

  it("calls onRowClick with the clicked record", async () => {
    const onRowClick = jest.fn();
    render(
      <Table columns={columns} data={rows} getRowId={(row) => row.id} onRowClick={onRowClick} />,
    );

    await userEvent.click(screen.getByText("Mike"));
    expect(onRowClick).toHaveBeenCalledWith(rows[2]);
  });

  it("selects rows and skips rows excluded by isRowSelectable", async () => {
    function Harness() {
      const [selected, setSelected] = useState<Set<string>>(new Set());
      return (
        <Table
          columns={columns}
          data={rows}
          getRowId={(row) => row.id}
          selectable
          selectedIds={selected}
          onSelectionChange={setSelected}
          isRowSelectable={(row) => row.id !== "2"}
        />
      );
    }

    render(<Harness />);

    await userEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    const rowCheckboxes = screen.getAllByRole("checkbox", { name: "Select row" });

    expect(rowCheckboxes[0]).toBeChecked();
    expect(rowCheckboxes[1]).toBeDisabled();
    expect(rowCheckboxes[1]).not.toBeChecked();
    expect(rowCheckboxes[2]).toBeChecked();
  });
});
