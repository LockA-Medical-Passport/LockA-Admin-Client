import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui";
import { listAdminUsers } from "@/features/auth/api";
import { getSession } from "@/features/auth/session";
import { AdminUsersView } from "@/features/auth/AdminUsersView";

export const metadata = {
  title: "Admin Users — LockA Admin",
};

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.admin.role !== "super_admin") {
    return (
      <EmptyState
        title="You don't have access to this page"
        description="Admin user management is limited to super-admins."
      />
    );
  }

  const users = await listAdminUsers(session.token).catch(() => []);

  return <AdminUsersView initialUsers={users} />;
}
