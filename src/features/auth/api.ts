import "server-only";
import { LockaApiError, lockaApiJson, withAuth, type LockaApiRequestInit } from "@/lib/locka-api";
import type { AdminProfile, AdminRole, AdminUser } from "./types";

/**
 * locka-api does not have a published auth contract yet. These endpoints/shapes are this
 * client's own assumption, isolated entirely behind this module so they're a one-file change
 * once the real contract lands:
 *
 *   POST   /admin/auth/login          { email, password }        -> { token, expiresInSeconds?, admin }
 *   POST   /admin/auth/logout         (Bearer token)              -> 204
 *   GET    /admin/auth/session        (Bearer token)              -> { admin }
 *   GET    /admin/users               (Bearer token)              -> AdminUser[]
 *   POST   /admin/users/invite        (Bearer token) { email, role } -> AdminUser
 *   PATCH  /admin/users/:id/status    (Bearer token) { status }   -> AdminUser
 *   PATCH  /admin/users/:id/role      (Bearer token) { role }     -> AdminUser
 */

/** Alias kept so auth callers keep catching an auth-named error (same class as everywhere else). */
export { LockaApiError as AuthApiError };

function lockaApiFetch<T>(path: string, init?: LockaApiRequestInit): Promise<T> {
  return lockaApiJson<T>(path, {
    ...init,
    unreachableMessage: "Unable to reach the authentication service",
  });
}

export interface LoginResult {
  token: string;
  expiresInSeconds?: number;
  admin: AdminProfile;
}

export function loginAdmin(email: string, password: string): Promise<LoginResult> {
  return lockaApiFetch<LoginResult>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutAdmin(token: string): Promise<void> {
  // Best-effort: the session cookie is cleared client-side regardless of whether locka-api
  // acknowledges the logout, so a transient failure here should never block sign-out.
  await lockaApiFetch<void>("/admin/auth/logout", withAuth(token, { method: "POST" })).catch(
    () => undefined,
  );
}

export function fetchCurrentAdmin(token: string): Promise<{ admin: AdminProfile }> {
  return lockaApiFetch<{ admin: AdminProfile }>("/admin/auth/session", withAuth(token));
}

export function listAdminUsers(token: string): Promise<AdminUser[]> {
  return lockaApiFetch<AdminUser[]>("/admin/users", withAuth(token));
}

export function inviteAdminUser(
  token: string,
  input: { email: string; role: AdminRole },
): Promise<AdminUser> {
  return lockaApiFetch<AdminUser>(
    "/admin/users/invite",
    withAuth(token, { method: "POST", body: JSON.stringify(input) }),
  );
}

export function updateAdminUserStatus(
  token: string,
  id: string,
  status: "active" | "deactivated",
): Promise<AdminUser> {
  return lockaApiFetch<AdminUser>(
    `/admin/users/${id}/status`,
    withAuth(token, { method: "PATCH", body: JSON.stringify({ status }) }),
  );
}

export function updateAdminUserRole(
  token: string,
  id: string,
  role: AdminRole,
): Promise<AdminUser> {
  return lockaApiFetch<AdminUser>(
    `/admin/users/${id}/role`,
    withAuth(token, { method: "PATCH", body: JSON.stringify({ role }) }),
  );
}
