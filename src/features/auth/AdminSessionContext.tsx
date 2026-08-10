"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AdminProfile, AdminRole } from "./types";

const AdminSessionContext = createContext<AdminProfile | null>(null);

export function AdminSessionProvider({
  profile,
  children,
}: {
  profile: AdminProfile;
  children: ReactNode;
}) {
  return <AdminSessionContext.Provider value={profile}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession(): AdminProfile {
  const profile = useContext(AdminSessionContext);
  if (!profile) throw new Error("useAdminSession must be used within an AdminSessionProvider");
  return profile;
}

export function useAdminRole(): AdminRole {
  return useAdminSession().role;
}

export function useHasRole(allowed: AdminRole[]): boolean {
  return allowed.includes(useAdminRole());
}
