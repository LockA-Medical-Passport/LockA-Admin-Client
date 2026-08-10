import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { fetchCurrentAdmin } from "./api";
import { SESSION_COOKIE_NAME } from "./session-cookie";
import type { AdminSession } from "./types";

/**
 * Resolves the current admin session by validating the session cookie against locka-api.
 * Cached per-request (React `cache`) so multiple server components/route handlers reading
 * the session in the same request only hit locka-api once.
 */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { admin } = await fetchCurrentAdmin(token);
    return { token, admin };
  } catch {
    // Covers both an expired/revoked token and locka-api being unreachable — either way
    // the caller should treat the session as invalid and send the admin back to /login.
    return null;
  }
});
