import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/features/auth/session";
import { AdminSessionProvider } from "@/features/auth/AdminSessionContext";
import { WalletProvider } from "@/features/auth/WalletContext";
import { ProtectedShell } from "@/features/auth/ProtectedShell";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <AdminSessionProvider profile={session.admin}>
      <WalletProvider>
        <ProtectedShell>{children}</ProtectedShell>
      </WalletProvider>
    </AdminSessionProvider>
  );
}
