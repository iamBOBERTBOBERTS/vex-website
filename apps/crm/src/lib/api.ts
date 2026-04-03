import type { AnalyticsResponse, AppraisalOutput, CreateAppraisalInput, UpdateAppraisalInput, ValuationInput, AppraisalValuateResponse } from "@vex/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function unwrap(payload: unknown): any {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return (payload as { data: any }).data;
  }
  return payload as any;
}

async function readApiErrorMessage(res: Response, fallback: string): Promise<string> {
  const raw = await res.json().catch(() => ({}));
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  if (typeof o.message === "string" && o.message.length) return o.message;
  if (typeof o.code === "string" && o.code.length) return o.code;
  return fallback;
}

export async function login(
  email: string,
  password: string
): Promise<{ user: { role: string }; token: string; refreshToken: string }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("Cannot reach API. Is it running at " + API_BASE + "?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data && typeof data.message === "string" ? data.message : "Login failed";
    throw new Error(msg);
  }
  return data as { user: { role: string }; token: string; refreshToken: string };
}

export async function refreshSession(
  refreshToken: string
): Promise<{ token: string; refreshToken: string } | null> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { token: string; refreshToken: string };
  if (!data.token || !data.refreshToken) return null;
  return data;
}

export async function getMe(token: string): Promise<{ role: string } | null> {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders(token) });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function getDashboardStats(token: string) {
  const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export async function getAnalytics(token: string): Promise<AnalyticsResponse> {
  const res = await fetch(`${API_BASE}/analytics`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load analytics");
  return unwrap(await res.json()) as AnalyticsResponse;
}

export async function getLeads(token: string, params?: { status?: string }) {
  const q = params?.status ? `?status=${params.status}` : "";
  const res = await fetch(`${API_BASE}/leads${q}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load leads");
  return unwrap(await res.json());
}

export async function getLead(token: string, id: string) {
  const res = await fetch(`${API_BASE}/leads/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load lead");
  return unwrap(await res.json());
}

export async function createLead(
  token: string,
  data: { source?: string; name?: string; email?: string; phone?: string; vehicleInterest?: string; notes?: string }
) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.message === "string" ? err.message : "Failed to create lead");
  }
  return unwrap(await res.json());
}

export async function updateLead(token: string, id: string, data: { status?: string; assignedToId?: string; notes?: string }) {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return unwrap(await res.json());
}

export async function getOrders(token: string, params?: { status?: string }) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  const res = await fetch(`${API_BASE}/orders?${q}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load orders");
  return unwrap(await res.json());
}

export async function getOrder(token: string, id: string) {
  const res = await fetch(`${API_BASE}/orders/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load order");
  return unwrap(await res.json());
}

export async function updateOrderStatus(token: string, id: string, status: string) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return unwrap(await res.json());
}

export async function getInventory(token: string, params?: { status?: string }) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  const res = await fetch(`${API_BASE}/inventory?${q}&limit=100`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load inventory");
  return unwrap(await res.json());
}

export async function getCustomers(token: string) {
  const res = await fetch(`${API_BASE}/customers?limit=100`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load customers");
  return unwrap(await res.json());
}

export async function getCustomer(token: string, id: string) {
  const res = await fetch(`${API_BASE}/customers/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load customer");
  return unwrap(await res.json());
}

export async function getCurrentTenantBilling(token: string) {
  const res = await fetch(`${API_BASE}/pricing/current`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load billing tier");
  return unwrap(await res.json());
}

export async function createCustomer(
  token: string,
  data: { name?: string; email?: string; phone?: string }
) {
  const res = await fetch(`${API_BASE}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create customer");
  return unwrap(await res.json());
}

export async function createInventoryItem(
  token: string,
  data: { source: "COMPANY" | "PRIVATE_SELLER"; vehicleId: string; listPrice: number; location?: string; mileage?: number; vin?: string }
) {
  const res = await fetch(`${API_BASE}/inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create inventory item");
  return unwrap(await res.json());
}

export async function createOrder(
  token: string,
  data: { type: "INVENTORY" | "CUSTOM_BUILD"; userId?: string; inventoryId?: string; vehicleId?: string; totalAmount?: number }
) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return unwrap(await res.json());
}

export async function listAppraisals(token: string) {
  const res = await fetch(`${API_BASE}/dealer/appraisals`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readApiErrorMessage(res, "Failed to load appraisals"));
  return unwrap(await res.json()) as { items: AppraisalOutput[]; total: number; limit: number; offset: number };
}

export async function createAppraisalRecord(token: string, data: CreateAppraisalInput) {
  const res = await fetch(`${API_BASE}/appraisals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create appraisal");
  return unwrap(await res.json()) as AppraisalOutput;
}

export async function getAppraisalById(token: string, id: string) {
  const res = await fetch(`${API_BASE}/dealer/appraisals/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readApiErrorMessage(res, "Failed to load appraisal"));
  return unwrap(await res.json()) as AppraisalOutput;
}

export async function updateAppraisalRecord(token: string, id: string, data: UpdateAppraisalInput) {
  const res = await fetch(`${API_BASE}/appraisals/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update appraisal");
  return unwrap(await res.json()) as AppraisalOutput;
}

export async function openAppraisalDealDesk(
  token: string,
  id: string,
  data: { status: "OPEN" | "ACCEPTED" | "REJECTED" | "NEGOTIATING" | "CLOSED"; note?: string }
) {
  const res = await fetch(`${API_BASE}/dealer/appraisals/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res, "Failed to update deal desk"));
  return unwrap(await res.json());
}

export async function addAppraisalToInventory(
  token: string,
  id: string,
  data?: { listPrice?: number; location?: string }
) {
  const res = await fetch(`${API_BASE}/dealer/appraisals/${id}/add-to-inventory`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data ?? {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.message === "string" ? err.message : "Failed to add appraisal to inventory");
  }
  return unwrap(await res.json()) as { appraisalId: string; inventoryId: string; source: string };
}

export async function createErpOrder(
  token: string,
  data: { appraisalId: string; listPrice?: number; location?: string }
) {
  const res = await fetch(`${API_BASE}/erp/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.message === "string" ? err.message : "Failed to create ERP order");
  }
  return unwrap(await res.json()) as {
    order: { id: string; status: string; totalAmount: number | null; createdAt: string };
    invoice: { invoiceNumber: string; orderId: string; amountUsd: number | null; issuedAt: string };
    inventoryId: string;
  };
}

export async function listErpOrders(token: string) {
  const res = await fetch(`${API_BASE}/erp/orders`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load ERP orders");
  return unwrap(await res.json()) as {
    items: Array<{
      id: string;
      appraisalId: string;
      inventoryId: string | null;
      vehicleId: string | null;
      status: string;
      totalAmount: number | null;
      createdAt: string;
    }>;
    total: number;
  };
}

export async function listErpInvoices(token: string) {
  const res = await fetch(`${API_BASE}/erp/invoices`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load ERP invoices");
  return unwrap(await res.json()) as {
    items: Array<{
      invoiceNumber: string;
      orderId: string;
      appraisalId: string;
      status: string;
      amountUsd: number | null;
      issuedAt: string;
    }>;
    total: number;
  };
}

export async function deleteAppraisalRecord(token: string, id: string) {
  const res = await fetch(`${API_BASE}/appraisals/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to delete appraisal");
  return unwrap(await res.json());
}

export async function completeOnboarding(token: string) {
  const res = await fetch(`${API_BASE}/auth/onboarding/complete`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to complete onboarding");
  return unwrap(await res.json());
}


export async function valuateAppraisal(
  token: string,
  data: Omit<ValuationInput, "tenantId"> & { tenantId: string }
): Promise<AppraisalValuateResponse> {
  const res = await fetch(`${API_BASE}/appraisals/valuate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body && typeof body.error?.message === "string") ? body.error.message : "Valuation failed";
    throw new Error(msg);
  }
  return unwrap(body) as AppraisalValuateResponse;
}

export async function getIterationBacklog(token: string) {
  const res = await fetch(`${API_BASE}/iteration/backlog`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load iteration backlog");
  return unwrap(await res.json());
}

export async function submitPilotFeedback(
  token: string,
  data: { rating: number; message: string; channel?: "in_app" | "email" | "sms" }
) {
  const res = await fetch(`${API_BASE}/success/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ ...data, channel: data.channel ?? "in_app" }),
  });
  if (!res.ok) throw new Error("Failed to submit feedback");
  return unwrap(await res.json());
}

export async function getFlags(token: string) {
  const res = await fetch(`${API_BASE}/flags`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readApiErrorMessage(res, "Failed to load feature flags"));
  return unwrap(await res.json()) as { items: Array<{ id: string; key: string; enabled: boolean; updatedAt: string }>; total: number };
}

export async function setFlag(token: string, body: { key: string; enabled: boolean }) {
  const res = await fetch(`${API_BASE}/flags`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res, "Failed to update flag"));
  return unwrap(await res.json()) as { id: string; key: string; enabled: boolean; updatedAt: string };
}

/** POST /autonomous/workflow — returns `{ queued, correlationId }` (queued is false when Redis is unavailable). */
export async function submitAutonomousWorkflow(
  token: string,
  body: {
    id: string;
    workflowType: "valuation_sweep" | "lead_nurture" | "appraisal_marketplace_push";
    enabled?: boolean;
    maxParallelRuns?: number;
    tenantDailyCostCapUsd?: number;
  }
) {
  const res = await fetch(`${API_BASE}/autonomous/workflow`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readApiErrorMessage(res, "Failed to queue workflow"));
  return unwrap(await res.json()) as { queued: boolean; correlationId: string };
}
