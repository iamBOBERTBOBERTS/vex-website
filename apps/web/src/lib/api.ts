const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export interface InventoryItem {
  id: string;
  source: string;
  vehicleId: string;
  listedByUserId: string | null;
  location: string | null;
  listPrice: number;
  mileage: number | null;
  status: string;
  vin: string | null;
  verificationStatus: string | null;
  imageUrls: string[] | null;
  specs: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    trimLevel: string;
    year: number;
    basePrice: number;
    bodyType: string | null;
    imageUrls: unknown;
  };
}

export interface InventoryListResponse {
  items: InventoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  trimLevel: string;
  year: number;
  basePrice: number;
  bodyType: string | null;
  imageUrls: string[] | null;
  isActive: boolean;
}

export interface GetInventoryParams {
  source?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  make?: string;
  model?: string;
  year?: number;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function getInventory(params: GetInventoryParams = {}): Promise<InventoryListResponse> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") search.set(k, String(v));
  });
  const res = await fetch(`${API_BASE}/inventory?${search}`);
  if (!res.ok) throw new Error("Failed to fetch inventory");
  return res.json();
}

export async function getInventoryItem(id: string): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE}/inventory/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("Not found");
    throw new Error("Failed to fetch vehicle");
  }
  return res.json();
}

export async function getVehicles(params?: { make?: string }): Promise<Vehicle[]> {
  const search = params?.make ? `?make=${encodeURIComponent(params.make)}` : "";
  const res = await fetch(`${API_BASE}/vehicles${search}`);
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  return res.json();
}

export interface ConfigOption {
  id: string;
  vehicleId: string | null;
  category: string;
  name: string;
  priceDelta: number;
  isRequired: boolean;
}

export async function getVehicleOptions(vehicleId: string): Promise<ConfigOption[]> {
  const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/options`);
  if (!res.ok) throw new Error("Failed to fetch options");
  return res.json();
}

export interface CreateOrderPayload {
  type: "INVENTORY" | "CUSTOM_BUILD";
  inventoryId?: string;
  vehicleId?: string;
  configSnapshot?: Record<string, unknown>;
  depositAmount?: number;
  totalAmount?: number;
  financingSnapshot?: Record<string, unknown>;
  tradeInSnapshot?: Record<string, unknown>;
  shippingSnapshot?: Record<string, unknown>;
  stylingAddonsSnapshot?: Record<string, unknown>;
  status?: "DRAFT" | "DEPOSIT_PAID";
}

export async function createOrder(payload: CreateOrderPayload, token: string): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Failed to create order");
  }
  return res.json();
}

export interface ShippingQuotePayload {
  origin: string;
  destination: string;
  openEnclosed: "OPEN" | "ENCLOSED";
}

export async function getShippingQuote(payload: ShippingQuotePayload): Promise<{ amount: number; distance: number; breakdown: unknown }> {
  const res = await fetch(`${API_BASE}/shipping/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to get shipping quote");
  return res.json();
}

export interface FinancingCalculatePayload {
  price: number;
  termMonths: number;
  apr: number;
}

export async function getFinancingCalculate(payload: FinancingCalculatePayload): Promise<{
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}> {
  const res = await fetch(`${API_BASE}/financing/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to calculate financing");
  return res.json();
}

export interface CreateAppraisalPayload {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition?: string;
}

export async function createAppraisal(payload: CreateAppraisalPayload): Promise<{ id: string; estimatedValue: number; vehicleInfo: unknown }> {
  const res = await fetch(`${API_BASE}/appraisals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to get appraisal");
  return res.json();
}

export async function getAppraisal(id: string): Promise<{ id: string; estimatedValue: number | null; vehicleInfo: unknown }> {
  const res = await fetch(`${API_BASE}/appraisals/${id}`);
  if (!res.ok) throw new Error("Appraisal not found");
  return res.json();
}

export interface OrderItem {
  id: string;
  type: string;
  status: string;
  totalAmount: number | null;
  depositAmount: number | null;
  createdAt: string;
  shipments?: Array<{
    id: string;
    carrier: string | null;
    trackingUrl: string | null;
    status: string;
    estimatedDelivery: string | null;
    origin: string | null;
    destination: string | null;
  }>;
}

export async function getOrders(token: string): Promise<{ items: OrderItem[]; total: number }> {
  const res = await fetch(`${API_BASE}/orders?limit=50`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export interface SavedVehicleItem {
  id: string;
  inventoryId: string | null;
  configSnapshot: unknown;
  createdAt: string;
  inventory?: { id: string; listPrice: number; vehicle?: { make: string; model: string; year: number } };
}

export async function getSavedVehicles(token: string): Promise<SavedVehicleItem[]> {
  const res = await fetch(`${API_BASE}/saved-vehicles`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch saved vehicles");
  const data = await res.json();
  return Array.isArray(data) ? data : data.items ?? data;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export async function getNotifications(token: string): Promise<{ items: NotificationItem[]; total: number }> {
  const res = await fetch(`${API_BASE}/notifications?limit=20`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function markNotificationRead(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to mark read");
}

export interface SubscriptionItem {
  id: string;
  plan: string;
  status: string;
  billingInterval: string | null;
  amount: number | null;
  expiresAt: string | null;
  createdAt: string;
}

export async function getSubscriptions(token: string): Promise<SubscriptionItem[]> {
  const res = await fetch(`${API_BASE}/subscriptions/me`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch subscriptions");
  return res.json();
}

export async function createSubscription(
  payload: { plan: string; billingInterval?: string; amount?: number },
  token: string
): Promise<SubscriptionItem> {
  const res = await fetch(`${API_BASE}/subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to subscribe");
  return res.json();
}

export async function runDealAnalysis(
  payload: { vehicle?: unknown; financing?: unknown; shipping?: unknown; addOns?: unknown; totalAmount?: number },
  token: string
): Promise<{ recommendations: string[] }> {
  const res = await fetch(`${API_BASE}/deal-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Deal analysis failed");
  }
  return res.json();
}

export async function createLead(payload: { source?: string; email?: string; phone?: string; name?: string; vehicleInterest?: string; notes?: string }): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit");
  return res.json();
}
