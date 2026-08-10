"use client";

import { type ReactNode, useState } from "react";
import { AppShell } from "@/components/layout";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  Select,
  Skeleton,
  Spinner,
  Table,
  Textarea,
  toast,
  type TableColumn,
} from "@/components/ui";

interface DemoApplication {
  id: string;
  name: string;
  type: string;
  status: "green" | "amber" | "red" | "gray";
  submitted: string;
}

const DEMO_ROWS: DemoApplication[] = [
  {
    id: "1",
    name: "Riverside General Hospital",
    type: "Hospital",
    status: "amber",
    submitted: "2026-08-01",
  },
  { id: "2", name: "Dr. Amara Osei", type: "Doctor", status: "green", submitted: "2026-07-28" },
  { id: "3", name: "CarePlus Pharmacy", type: "Pharmacy", status: "red", submitted: "2026-07-20" },
  {
    id: "4",
    name: "Metro Diagnostics Lab",
    type: "Laboratory",
    status: "gray",
    submitted: "2026-07-15",
  },
];

const STATUS_LABEL: Record<DemoApplication["status"], string> = {
  green: "Verified",
  amber: "Pending",
  red: "Revoked",
  gray: "Suspended",
};

const COLUMNS: TableColumn<DemoApplication>[] = [
  {
    key: "name",
    header: "Provider",
    sortable: true,
    sortValue: (row) => row.name,
    render: (row) => <span className="font-medium text-foreground">{row.name}</span>,
  },
  { key: "type", header: "Type", render: (row) => row.type },
  {
    key: "status",
    header: "Status",
    render: (row) => <Badge variant={row.status}>{STATUS_LABEL[row.status]}</Badge>,
  },
  {
    key: "submitted",
    header: "Submitted",
    sortable: true,
    sortValue: (row) => row.submitted,
    render: (row) => <span className="text-foreground/60">{row.submitted}</span>,
  },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass flex flex-col gap-4 rounded-xl p-6">
      <h2 className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPreview() {
  const [modalOpen, setModalOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableEmpty, setTableEmpty] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function simulateLoad() {
    setTableLoading(true);
    setTimeout(() => setTableLoading(false), 1200);
  }

  return (
    <AppShell
      adminName="reviewer@locka.health"
      onLogout={() => {
        toast.success("Logged out");
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-16">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Design System Preview</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Living reference for the components built in the Design System &amp; UI Components epic.
          </p>
        </div>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Approve</Button>
            <Button variant="danger">Reject</Button>
            <Button variant="amber">Pending</Button>
            <Button variant="primary" loading>
              Submitting
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-3">
            <Badge variant="green">Verified</Badge>
            <Badge variant="amber">Pending</Badge>
            <Badge variant="red">Revoked</Badge>
            <Badge variant="gray">Suspended</Badge>
            <Badge variant="cyan">Syncing</Badge>
          </div>
        </Section>

        <Section title="Form fields">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Organization name" placeholder="Riverside General Hospital" />
            <Input
              label="License number"
              placeholder="LIC-000000"
              error="License number is required"
            />
            <Select
              label="Provider type"
              placeholder="Select a type"
              options={[
                { value: "hospital", label: "Hospital" },
                { value: "clinic", label: "Clinic" },
                { value: "doctor", label: "Doctor" },
                { value: "pharmacy", label: "Pharmacy" },
              ]}
              helperText="Matches the ProviderType enum on ProviderRegistry"
            />
            <Textarea label="Rejection reason" placeholder="Explain what the provider should fix" />
          </div>
        </Section>

        <Section title="Modal">
          <div>
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open confirmation modal
            </Button>
          </div>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Approve this provider?"
            footer={
              <>
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    setModalOpen(false);
                    toast.success("Provider approved", {
                      title: "Approved",
                      txHash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
                    });
                  }}
                >
                  Approve
                </Button>
              </>
            }
          >
            <p className="text-sm text-foreground/70">
              This will move Riverside General Hospital from Pending to Verified on-chain.
            </p>
          </Modal>
        </Section>

        <Section title="Table">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="secondary" onClick={simulateLoad}>
              Simulate loading
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setTableEmpty((v) => !v)}>
              Toggle empty state
            </Button>
            <span className="text-xs text-foreground/50">{selectedIds.size} selected</span>
          </div>
          <Table
            columns={COLUMNS}
            data={tableEmpty ? [] : DEMO_ROWS}
            getRowId={(row) => row.id}
            loading={tableLoading}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowClick={(row) => toast.success(`Opened ${row.name}`)}
            emptyState={
              <EmptyState
                title="No pending applications"
                description="New provider submissions will show up here."
              />
            }
          />
        </Section>

        <Section title="Toasts">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="success"
              onClick={() =>
                toast.success("Provider verification submitted on-chain", {
                  title: "Transaction confirmed",
                  txHash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
                })
              }
            >
              Trigger success toast
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                toast.error("Freighter rejected the transaction request", {
                  title: "Transaction failed",
                })
              }
            >
              Trigger error toast
            </Button>
          </div>
        </Section>

        <Section title="Loading skeletons &amp; spinners">
          <div className="flex flex-wrap items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton shape="text" className="w-1/3" />
            <Skeleton shape="text" className="w-2/3" />
            <Skeleton shape="block" className="h-24 w-full" />
          </div>
        </Section>

        <Section title="Empty state">
          <EmptyState
            title="No results match your filters"
            description="Try adjusting the status or provider type filters."
            action={
              <Button variant="secondary" size="sm">
                Clear filters
              </Button>
            }
          />
        </Section>
      </div>
    </AppShell>
  );
}
