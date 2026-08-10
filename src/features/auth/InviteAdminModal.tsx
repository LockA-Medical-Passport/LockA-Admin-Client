"use client";

import { useState, type FormEvent } from "react";
import { Button, Input, Modal, Select, toast } from "@/components/ui";
import type { AdminRole, AdminUser } from "./types";

export interface InviteAdminModalProps {
  open: boolean;
  onClose: () => void;
  onInvited: (admin: AdminUser) => void;
}

export function InviteAdminModal({ open, onClose, onInvited }: InviteAdminModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("reviewer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setEmail("");
    setRole("reviewer");
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin-users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.message ?? "Unable to send the invite");
        return;
      }

      const admin: AdminUser = await response.json();
      toast.success(`Invited ${email}`, { title: "Admin invited" });
      reset();
      onInvited(admin);
    } catch {
      setError("Unable to reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Invite an admin"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Select
          label="Role"
          value={role}
          onChange={(event) => setRole(event.target.value as AdminRole)}
          options={[
            { value: "reviewer", label: "Reviewer" },
            { value: "super_admin", label: "Super Admin" },
          ]}
        />
        {error && (
          <p role="alert" className="text-sm text-brand-red">
            {error}
          </p>
        )}
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Send invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}
