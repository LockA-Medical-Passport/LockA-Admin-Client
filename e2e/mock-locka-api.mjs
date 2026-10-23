import { createServer } from "node:http";

/**
 * Minimal in-memory stand-in for locka-api, used by the Playwright suite so E2E never needs
 * real credentials, a provider queue, or a deployed backend. It implements only the endpoints
 * the admin client actually calls, with the same shapes documented in the feature `api.ts`
 * modules. State resets whenever the process starts (one run of `npm run test:e2e`).
 */

const PORT = Number(process.env.PORT ?? 4000);

const admin = {
  id: "admin-1",
  email: "admin@locka.io",
  name: "Amina Reviewer",
  role: "super_admin",
};

const now = Date.now();
const iso = (minutesAgo) => new Date(now - minutesAgo * 60_000).toISOString();

const initialProviders = [
  {
    id: "p-1",
    name: "Nairobi Community Hospital",
    type: "hospital",
    country: "Kenya",
    status: "pending",
    submittedAt: iso(120),
    walletAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    licenseNumber: "KE-HOSP-00421",
    licenseHash: "9f2c8c7e5b1d4a3f8e6c0b2d7a1f4e9c3b6d8a0f2e5c7b9d1a3f6e8c0b2d4a6f",
    contactEmail: "admin@nairobi-community.example",
    contactPhone: "+254 700 000 001",
    website: "https://nairobi-community.example",
    addressLine: "12 Hospital Road, Nairobi",
    documents: [],
  },
  {
    id: "p-2",
    name: "Dr. Amina Yusuf",
    type: "doctor",
    country: "Nigeria",
    status: "pending",
    submittedAt: iso(240),
    walletAddress: "GCDDT7IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    licenseNumber: "NG-DOC-11882",
    contactEmail: "amina@example.com",
    documents: [],
  },
  {
    id: "p-3",
    name: "Lagos Central Clinic",
    type: "clinic",
    country: "Nigeria",
    status: "verified",
    submittedAt: iso(1440),
    walletAddress: "GDEFG7IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    licenseNumber: "NG-CLIN-00982",
    documents: [],
    onChainStatus: "verified",
    onChainSyncedAt: iso(1430),
    lastTxHash: "cd".repeat(32),
  },
];

const initialHistory = [
  {
    id: "h-1",
    action: "submitted",
    occurredAt: iso(120),
    actorName: "Nairobi Community Hospital",
    note: "Initial application submitted",
  },
  {
    id: "h-2",
    action: "submitted",
    occurredAt: iso(240),
    actorName: "Dr. Amina Yusuf",
    note: "Initial application submitted",
  },
  {
    id: "h-3",
    action: "approved",
    occurredAt: iso(1430),
    actorName: "Amina Reviewer",
    actorEmail: "admin@locka.io",
    txHash: "cd".repeat(32),
  },
];

const initialAuditLog = [
  {
    id: "a-1",
    action: "approved",
    occurredAt: iso(1430),
    actorName: "Amina Reviewer",
    actorEmail: "admin@locka.io",
    targetProviderId: "p-3",
    targetProviderName: "Lagos Central Clinic",
    txHash: "cd".repeat(32),
  },
];

let providers = structuredClone(initialProviders);
let history = structuredClone(initialHistory);
let auditLog = structuredClone(initialAuditLog);

function resetState() {
  providers = structuredClone(initialProviders);
  history = structuredClone(initialHistory);
  auditLog = structuredClone(initialAuditLog);
}

const STATUS_FOR_ACTION = {
  approve: "verified",
  reject: "revoked",
  suspend: "suspended",
  revoke: "revoked",
};

const HISTORY_FOR_ACTION = {
  approve: "approved",
  reject: "rejected",
  suspend: "suspended",
  revoke: "revoked",
};

const AUDIT_FOR_ACTION = {
  approve: "approved",
  reject: "rejected",
  suspend: "suspended",
  revoke: "revoked",
};

function send(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
  if (status === 204 || body === undefined) {
    response.end();
    return;
  }
  response.end(JSON.stringify(body));
}

function authorized(request) {
  return (request.headers.authorization ?? "").startsWith("Bearer ");
}

function pageOf(items, url) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? "25"));
  const total = items.length;
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
  };
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function queueFor(url) {
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  const country = url.searchParams.get("country");
  const q = (url.searchParams.get("q") ?? "").toLowerCase();
  const sort = url.searchParams.get("sort") ?? "submittedAt";
  const direction = url.searchParams.get("direction") === "asc" ? 1 : -1;

  const filtered = providers.filter((provider) => {
    if (status && status !== "all" && provider.status !== status) return false;
    if (type && type !== "all" && provider.type !== type) return false;
    if (country && country !== "all" && provider.country !== country) return false;
    if (
      q &&
      ![provider.name, provider.licenseNumber, provider.country].join(" ").toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    const av = String(a[sort] ?? "");
    const bv = String(b[sort] ?? "");
    return av.localeCompare(bv) * direction;
  });

  return {
    ...pageOf(filtered, url),
    countries: [...new Set(providers.map((provider) => provider.country))].sort(),
  };
}

function summary() {
  const counts = { pending: 0, verified: 0, suspended: 0, revoked: 0 };
  providers.forEach((provider) => {
    counts[provider.status] += 1;
  });
  return {
    counts,
    recentActivity: [...auditLog]
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, 5),
  };
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);
  const path = url.pathname;
  const method = request.method ?? "GET";

  if (path === "/health") {
    send(response, 200, { ok: true });
    return;
  }

  if (path === "/__reset" && (method === "POST" || method === "GET")) {
    resetState();
    send(response, 200, { ok: true });
    return;
  }

  if (method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    });
    response.end();
    return;
  }

  if (path === "/admin/auth/login" && method === "POST") {
    const body = await readBody(request);
    if (!body?.email || !body?.password) {
      send(response, 400, { message: "Email and password are required" });
      return;
    }
    send(response, 200, { token: "e2e-session-token", expiresInSeconds: 3600, admin });
    return;
  }

  if (!authorized(request)) {
    send(response, 401, { message: "Not authenticated" });
    return;
  }

  if (path === "/admin/auth/session" && method === "GET") {
    send(response, 200, { admin });
    return;
  }

  if (path === "/admin/auth/logout" && method === "POST") {
    send(response, 204);
    return;
  }

  if (path === "/admin/dashboard/summary" && method === "GET") {
    send(response, 200, summary());
    return;
  }

  if (path === "/admin/users" && method === "GET") {
    send(response, 200, [
      { ...admin, status: "active", invitedAt: iso(10000) },
      {
        id: "admin-2",
        email: "invited@locka.io",
        name: "Invited Reviewer",
        role: "reviewer",
        status: "invited",
        invitedAt: iso(500),
      },
    ]);
    return;
  }

  if (path === "/admin/providers" && method === "GET") {
    send(response, 200, queueFor(url));
    return;
  }

  if (path === "/admin/audit-log" && method === "GET") {
    const action = url.searchParams.get("action");
    const actor = url.searchParams.get("actor");
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const filtered = auditLog.filter((entry) => {
      if (action && action !== "all" && entry.action !== action) return false;
      if (actor && actor !== "all" && entry.actorName !== actor) return false;
      if (q && !`${entry.targetProviderName ?? ""} ${entry.actorName}`.toLowerCase().includes(q)) {
        return false;
      }
      const date = entry.occurredAt.slice(0, 10);
      if (from && date < from) return false;
      if (to && date > to) return false;
      return true;
    });

    send(response, 200, {
      ...pageOf(filtered, url),
      actors: [...new Set(auditLog.map((entry) => entry.actorName))].map((name) => ({ name })),
    });
    return;
  }

  const providerMatch = path.match(/^\/admin\/providers\/([^/]+)$/);
  if (providerMatch) {
    const provider = providers.find((item) => item.id === decodeURIComponent(providerMatch[1]));
    if (!provider) {
      send(response, 404, { message: "Provider application not found" });
      return;
    }

    if (method === "GET") {
      send(response, 200, provider);
      return;
    }

    if (method === "POST" && path.endsWith("/decision")) {
      send(response, 405, { message: "Use the decision endpoint" });
      return;
    }
  }

  const historyMatch = path.match(/^\/admin\/providers\/([^/]+)\/history$/);
  if (historyMatch && method === "GET") {
    send(response, 200, history);
    return;
  }

  const staffMatch = path.match(/^\/admin\/providers\/([^/]+)\/staff$/);
  if (staffMatch && method === "GET") {
    send(response, 200, []);
    return;
  }

  const decisionMatch = path.match(/^\/admin\/providers\/([^/]+)\/decision$/);
  if (decisionMatch && method === "POST") {
    const provider = providers.find((item) => item.id === decodeURIComponent(decisionMatch[1]));
    if (!provider) {
      send(response, 404, { message: "Provider application not found" });
      return;
    }

    const body = await readBody(request);
    const nextStatus = STATUS_FOR_ACTION[body?.action];
    if (!nextStatus) {
      send(response, 400, { message: "Unknown decision action" });
      return;
    }
    if ((body.action === "reject" || body.action === "revoke") && !body.reason) {
      send(response, 400, { message: `A reason is required to ${body.action} a provider` });
      return;
    }

    const txHash = body.txHash;
    const decidedAt = new Date().toISOString();
    provider.status = nextStatus;
    provider.onChainStatus = nextStatus;
    provider.onChainSyncedAt = decidedAt;
    provider.lastTxHash = txHash;
    provider.decidedAt = decidedAt;
    provider.decisionReason = body.reason;

    history = [
      {
        id: `h-${history.length + 1}`,
        action: HISTORY_FOR_ACTION[body.action],
        occurredAt: decidedAt,
        actorName: admin.name,
        actorEmail: admin.email,
        note: body.reason,
        txHash,
      },
      ...history,
    ];

    auditLog = [
      {
        id: `a-${auditLog.length + 1}`,
        action: AUDIT_FOR_ACTION[body.action],
        occurredAt: decidedAt,
        actorName: admin.name,
        actorEmail: admin.email,
        targetProviderId: provider.id,
        targetProviderName: provider.name,
        reason: body.reason,
        txHash,
      },
      ...auditLog,
    ];

    send(response, 200, { provider, txHash });
    return;
  }

  send(response, 404, { message: `No mock handler for ${method} ${path}` });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`mock locka-api listening on http://127.0.0.1:${PORT}`);
});
