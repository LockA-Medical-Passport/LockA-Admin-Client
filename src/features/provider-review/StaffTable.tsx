"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  Table,
  Textarea,
  toast,
  type TableColumn,
} from "@/components/ui";
import { truncateMiddle } from "./format";
import { submitStaffRevocation, withPendingToast } from "./decisions";
import type { ProviderStaff } from "./types";

export interface StaffTableProps {
  providerId: string;
  staff: ProviderStaff[];
}

/**
 * Authorized staff under a verified provider organization. Revoking one staff member leaves
 * the organization itself verified — revoking the whole provider is a separate decision on
 * the application header.
 *
 * `staff` is rendered directly rather than mirrored into local state: this is a Server
 * Component prop, and mirroring it would go stale on a `router.refresh()` triggered by
 * something other than this table's own revoke action (e.g. reinstating the provider).
 */
export function StaffTable({ providerId, staff }: StaffTableProps) {
  const router = useRouter();
  const [target, setTarget] = useState<ProviderStaff | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function closeModal() {
    setTarget(null);
    setReason("");
    setError(null);
  }

  async function handleRevoke(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!target) return;

    setLoading(true);
    setError(null);

    const result = await withPendingToast(`Revoking ${target.name}'s authorization…`, () =>
      submitStaffRevocation(providerId, target.id, reason.trim() || undefined),
    );

    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      toast.error(result.message, { title: "Revoke failed" });
      return;
    }

    toast.success(`${result.data.staff.name} can no longer act for this provider`, {
      title: "Staff authorization revoked",
      txHash: result.data.txHash,
    });
    closeModal();
    // Re-fetches this Server Component's props so the table reflects the new status.
    router.refresh();
  }

  const columns: TableColumn<ProviderStaff>[] = [
    {
      key: "name",
      header: "Staff member",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.name}</span>
          {row.email && <span className="text-xs text-foreground/50">{row.email}</span>}
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <span className="text-foreground/80">{row.role ?? "—"}</span>,
    },
    {
      key: "wallet",
      header: "Wallet",
      render: (row) => (
        <span className="font-mono text-xs text-foreground/60">
          {row.walletAddress ? truncateMiddle(row.walletAddress) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "active" ? "green" : "red"}>
          {row.status === "active" ? "Authorized" : "Revoked"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) =>
        row.status === "active" ? (
          <Button variant="secondary" size="sm" onClick={() => setTarget(row)}>
            Revoke
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        data={staff}
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState
            title="No authorized staff"
            description="No staff members have been authorized under this provider yet."
          />
        }
      />

      {target && (
        <Modal open onClose={closeModal} title={`Revoke ${target.name}'s authorization?`}>
          <form onSubmit={handleRevoke} className="flex flex-col gap-4">
            <p className="text-sm text-foreground/70">
              They will no longer be able to request patient records or write to a passport on
              behalf of this provider. The provider organization stays verified.
            </p>

            <Textarea
              label="Reason (optional)"
              placeholder="Why this staff authorization is being revoked"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              error={error ?? undefined}
              rows={3}
            />

            <div className="mt-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeModal} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" loading={loading}>
                Revoke authorization
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
