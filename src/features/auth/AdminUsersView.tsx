"use client";

import { useState } from "react";
import { Badge, Button, EmptyState, Table, toast, type TableColumn } from "@/components/ui";
import { InviteAdminModal } from "./InviteAdminModal";
import type { AdminUser } from "./types";

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  super_admin: "Super Admin",
  reviewer: "Reviewer",
};

const STATUS_VARIANT: Record<AdminUser["status"], "green" | "amber" | "gray"> = {
  active: "green",
  invited: "amber",
  deactivated: "gray",
};

export function AdminUsersView({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleStatus(user: AdminUser) {
    const nextStatus = user.status === "deactivated" ? "active" : "deactivated";
    setPendingId(user.id);
    try {
      const response = await fetch(`/api/admin-users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        toast.error(body?.message ?? "Unable to update this admin", { title: "Update failed" });
        return;
      }

      const updated: AdminUser = await response.json();
      setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(
        nextStatus === "active"
          ? `${user.name || user.email} reactivated`
          : `${user.name || user.email} deactivated`,
      );
    } catch {
      toast.error("Unable to reach the server", { title: "Update failed" });
    } finally {
      setPendingId(null);
    }
  }

  const columns: TableColumn<AdminUser>[] = [
    {
      key: "name",
      header: "Admin",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.name || row.email}</span>
          <span className="text-xs text-foreground/50">{row.email}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <Badge variant="cyan">{ROLE_LABEL[row.role]}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          loading={pendingId === row.id}
          onClick={() => toggleStatus(row)}
        >
          {row.status === "deactivated" ? "Reactivate" : "Deactivate"}
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Admin users</h1>
          <p className="text-sm text-foreground/60">
            Invite, deactivate, or reactivate admin accounts.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>Invite admin</Button>
      </div>

      <Table
        columns={columns}
        data={users}
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState
            title="No admin users yet"
            description="Invite your first admin to get started."
          />
        }
      />

      <InviteAdminModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={(admin) => {
          setUsers((current) => [...current, admin]);
          setInviteOpen(false);
        }}
      />
    </div>
  );
}
