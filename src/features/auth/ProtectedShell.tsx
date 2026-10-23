"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";
import { NotificationProvider } from "@/features/notifications/NotificationContext";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { RealtimeProvider } from "@/features/realtime/RealtimeContext";
import { useAdminSession } from "./AdminSessionContext";
import { useWallet } from "./WalletContext";
import { getNavItemsForRole } from "./nav-items";

export function ProtectedShell({ children }: { children: ReactNode }) {
  const session = useAdminSession();
  const wallet = useWallet();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      wallet.disconnect();
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <NotificationProvider adminId={session.id}>
      <RealtimeProvider>
        <AppShell
          navItems={getNavItemsForRole(session.role)}
          notificationsSlot={<NotificationBell />}
          adminName={session.name || session.email}
          walletAddress={wallet.publicKey ?? undefined}
          walletConnecting={wallet.status === "connecting"}
          onConnectWallet={wallet.connect}
          onDisconnectWallet={wallet.disconnect}
          onLogout={handleLogout}
        >
          {children}
        </AppShell>
      </RealtimeProvider>
    </NotificationProvider>
  );
}
