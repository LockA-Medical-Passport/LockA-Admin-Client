import "server-only";
import { config } from "@/lib/config";

/**
 * Shared transport for every locka-api call. Feature modules (`features/auth/api.ts`,
 * `features/provider-review/api.ts`) own their endpoint contracts and payload shapes; this
 * module only owns how a request is sent and how a failure is represented.
 *
 * Server-only by design: the locka-api bearer token lives in an httpOnly cookie and must
 * never reach the browser, so client components talk to this app's own route handlers
 * instead, and those handlers call in here.
 */

/** `status` is the upstream HTTP status, or 502 when locka-api could not be reached at all. */
export class LockaApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "LockaApiError";
    this.status = status;
  }
}

export interface LockaApiRequestInit extends RequestInit {
  /** Message surfaced when the request never reaches locka-api (DNS/connection failure). */
  unreachableMessage?: string;
}

/** Raw request: use for non-JSON responses (e.g. streaming a credential document). */
export async function lockaApiRequest(path: string, init?: LockaApiRequestInit): Promise<Response> {
  const { unreachableMessage, ...requestInit } = init ?? {};

  let response: Response;
  try {
    response = await fetch(`${config.lockaApiUrl}${path}`, { ...requestInit, cache: "no-store" });
  } catch {
    throw new LockaApiError(unreachableMessage ?? "Unable to reach the LockA API", 502);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new LockaApiError(
      body?.message ?? `locka-api request failed with status ${response.status}`,
      response.status,
    );
  }

  return response;
}

export async function lockaApiJson<T>(path: string, init?: LockaApiRequestInit): Promise<T> {
  const response = await lockaApiRequest(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function withAuth(token: string, init?: LockaApiRequestInit): LockaApiRequestInit {
  return { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } };
}
