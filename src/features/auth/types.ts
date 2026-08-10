export type AdminRole = "super_admin" | "reviewer";

export type AdminUserStatus = "active" | "invited" | "deactivated";

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface AdminSession {
  /** locka-api bearer token. Server-side only — never pass this to a Client Component. */
  token: string;
  admin: AdminProfile;
}

export interface AdminUser extends AdminProfile {
  status: AdminUserStatus;
  invitedAt?: string;
}
