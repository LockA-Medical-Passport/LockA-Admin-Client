import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_API_PORT ?? 4100);

const ADMIN = {
  id: "admin-1",
  email: "admin@locka.health",
  name: "E2E Admin",
  role: "reviewer",
};

const SEED_PROVIDERS = [
  {
    id: "provider-1",
    name: "Riverside General Hospital",
    type: "hospital",
    country: "Ghana",
    status: "pending",
    submittedAt: "2026-08-01T09:00:00.000Z",
    walletAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    licenseNumber: "LIC-000001",
    licenseHash: "d".repeat(64),
    contactEmail: "review@riverside.example",
    documents: [],
  },
  {
    id: "provider-2",
    name: "CarePlus Pharmacy",
    type: "pharmacy",
    country: "Nigeria",
    status: "pending",
    submittedAt: "2026-07-28T09:00:00.000Z",
    walletAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    licenseNumber: "LIC-000002",
    documents: [],
  },
];

let providers = structuredClone(SEED_PROVIDERS);
let history = [];

function resetState() {
  providers = structuredClone(SEED_PROVIDERS);
  history = [];
}

function send(response, status, body) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  response.end(payload);
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

const RESULT_STATUS = {
  approve: "verified",
  reject: "revoked",
  suspend: "suspended",
  revoke: "revoked",
};

function listProviders(searchParams) {
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const country = searchParams.get("country");
  const q = searchParams.get("q")?.toLowerCase() ?? "";
  const sort = searchParams.get("sort") ?? "submittedAt";
  const direction = searchParams.get("direction") === "asc" ? 1 : -1;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? 25));

  let items = providers.filter((provider) => {
    if (status && status !== "all" && provider.status !== status) return false;
    if (type && type !== "all" && provider.type !== type) return false;
    if (country && country !== "all" && provider.country !== country) return false;
    if (q && !`${provider.name} ${provider.licenseNumber}`.toLowerCase().includes(q)) return false;
    return true;
  });

  items = [...items].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name) * direction;
    if (sort === "status") return a.status.localeCompare(b.status) * direction;
    return a.submittedAt.localeCompare(b.submittedAt) * direction;
  });

  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
    countries: [...new Set(providers.map((provider) => provider.country))].sort(),
  };
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);
  const path = url.pathname;

  try {
    if (path === "/health") return send(response, 200, { ok: true });
    if (path === "/__reset") {
      resetState();
      return send(response, 200, { ok: true });
    }
    if (path === "/admin/auth/login" && request.method === "POST") {
      await readJson(request);
      return send(response, 200, { token: "e2e-token", admin: ADMIN });
    }
    if (path === "/admin/auth/logout" && request.method === "POST") {
      response.writeHead(204);
      return response.end();
    }
    if (path === "/admin/auth/session") {
      return send(response, 200, { admin: ADMIN });
    }
    if (path === "/admin/users") {
      return send(response, 200, [{ ...ADMIN, status: "active" }]);
    }
    if (path === "/admin/providers") {
      return send(response, 200, listProviders(url.searchParams));
    }

    const decisionMatch = path.match(/^\/admin\/providers\/([^/]+)\/decision$/);
    if (decisionMatch && request.method === "POST") {
      const body = (await readJson(request)) ?? {};
      const provider = providers.find((item) => item.id === decisionMatch[1]);
      if (!provider) return send(response, 404, { message: "Provider not found" });

      provider.status = RESULT_STATUS[body.action] ?? provider.status;
      provider.decidedAt = new Date().toISOString();
      provider.lastTxHash = body.txHash;
      provider.onChainStatus = provider.status;
      provider.onChainSyncedAt = provider.decidedAt;
      provider.decisionReason = body.reason;
      history = [
        ...history,
        {
          id: `history-${history.length + 1}`,
          providerId: provider.id,
          action: body.action === "approve" ? "approved" : body.action,
          occurredAt: provider.decidedAt,
          actorName: ADMIN.name,
          note: body.reason,
          txHash: body.txHash,
        },
      ];

      return send(response, 200, { provider, txHash: body.txHash });
    }

    const historyMatch = path.match(/^\/admin\/providers\/([^/]+)\/history$/);
    if (historyMatch) {
      const items = history.filter((entry) => entry.providerId === historyMatch[1]);
      return send(response, 200, historyMatch[1] === "provider-1" ? items : []);
    }

    const staffMatch = path.match(/^\/admin\/providers\/([^/]+)\/staff$/);
    if (staffMatch) return send(response, 200, []);

    const providerMatch = path.match(/^\/admin\/providers\/([^/]+)$/);
    if (providerMatch) {
      const provider = providers.find((item) => item.id === providerMatch[1]);
      if (!provider) return send(response, 404, { message: "Provider not found" });
      return send(response, 200, provider);
    }

    return send(response, 404, { message: `No mock route for ${request.method} ${path}` });
  } catch (error) {
    console.error(error);
    return send(response, 500, { message: "Mock API failure" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mock locka-api listening on http://127.0.0.1:${PORT}`);
});
