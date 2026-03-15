const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function login(email: string, password: string): Promise<{ user: { role: string }; token: string }> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    throw new Error("Cannot reach API. Is it running at " + API_BASE + "?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && typeof data.message === "string") ? data.message : "Login failed";
    throw new Error(msg);
  }
  return data;
}

export async function getMe(token: string): Promise<{ role: string }> {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function getDashboardStats(token: string) {
  const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export async function getLeads(token: string, params?: { status?: string }) {
  const q = params?.status ? `?status=${params.status}` : "";
  const res = await fetch(`${API_BASE}/leads${q}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load leads");
  return res.json();
}

export async function getLead(token: string, id: string) {
  const res = await fetch(`${API_BASE}/leads/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load lead");
  return res.json();
}

export async function updateLead(token: string, id: string, data: { status?: string; assignedToId?: string; notes?: string }) {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return res.json();
}

export async function getOrders(token: string, params?: { status?: string }) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  const res = await fetch(`${API_BASE}/orders?${q}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

export async function getOrder(token: string, id: string) {
  const res = await fetch(`${API_BASE}/orders/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load order");
  return res.json();
}

export async function updateOrderStatus(token: string, id: string, status: string) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update order");
  return res.json();
}

export async function getInventory(token: string, params?: { status?: string }) {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  const res = await fetch(`${API_BASE}/inventory?${q}&limit=100`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load inventory");
  return res.json();
}

export async function getCustomers(token: string) {
  const res = await fetch(`${API_BASE}/customers?limit=100`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load customers");
  return res.json();
}

export async function getCustomer(token: string, id: string) {
  const res = await fetch(`${API_BASE}/customers/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load customer");
  return res.json();
}
