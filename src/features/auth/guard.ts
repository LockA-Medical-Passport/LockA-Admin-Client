import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "./session";
import type { AdminRole, AdminSession } from "./types";

type GuardResult =
  { session: AdminSession; response: null } | { session: null; response: NextResponse };

/** Route-handler guard: rejects with 401 when there is no valid session. */
export async function requireSession(): Promise<GuardResult> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ message: "Not authenticated" }, { status: 401 }),
    };
  }
  return { session, response: null };
}

/**
 * Route-handler guard: rejects with 401/403. Client-side nav/UI hiding is not a security
 * boundary on its own — every mutation route that's role-gated must also call this.
 */
export async function requireRole(allowed: AdminRole[]): Promise<GuardResult> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ message: "Not authenticated" }, { status: 401 }),
    };
  }
  if (!allowed.includes(session.admin.role)) {
    return {
      session: null,
      response: NextResponse.json(
        { message: "You don't have permission to perform this action" },
        { status: 403 },
      ),
    };
  }
  return { session, response: null };
}
