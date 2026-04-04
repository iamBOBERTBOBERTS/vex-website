import type { RaisePackage } from "@vex/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function errorMessageFromBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const msg = (body as { message?: unknown }).message;
  return typeof msg === "string" ? msg : null;
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
  modelGlbUrl: string | null;
  modelSource: string | null;
  modelSourcePhotoIds: string[] | null;
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
  return unwrap(await res.json());
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
  vin?: string;
  mileage?: number;
  condition?: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  images?: string[];
}

function publicAppraisalTenantQuery(): string {
  const id = process.env.NEXT_PUBLIC_PUBLIC_APPRAISAL_TENANT_ID;
  return id ? `?tenantId=${encodeURIComponent(id)}` : "";
}

function quickAppraisalQuery(tenantIdOverride?: string | null): string {
  if (tenantIdOverride) return `?tenantId=${encodeURIComponent(tenantIdOverride)}`;
  return publicAppraisalTenantQuery();
}

/** Public appraisal (no auth) — POST /public/quick-appraisal + tenant resolution. */
export async function createAppraisal(
  payload: CreateAppraisalPayload,
  opts?: { tenantId?: string | null }
): Promise<{
  id: string;
  status: string;
  estimatedValue: number | null;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/public/quick-appraisal${quickAppraisalQuery(opts?.tenantId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error("Failed to parse appraisal response");
  }
  if (!res.ok) throw new Error(errorMessageFromBody(body) ?? "Failed to submit appraisal");
  return unwrap(body) as {
    id: string;
    status: string;
    estimatedValue: number | null;
    message: string;
  };
}

export async function getAppraisal(
  id: string,
  opts?: { tenantId?: string | null }
): Promise<{ id: string; value: number | null; notes: string | null }> {
  const res = await fetch(
    `${API_BASE}/public/quick-appraisal/${encodeURIComponent(id)}${quickAppraisalQuery(opts?.tenantId)}`
  );
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error("Failed to parse appraisal response");
  }
  if (!res.ok) throw new Error("Appraisal not found");
  return unwrap<{ id: string; value: number | null; notes: string | null }>(body);
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

export async function createStripeCheckoutSession(
  payload: { plan: string; billingInterval?: "monthly" | "yearly" },
  token: string
): Promise<{ id: string; url: string | null }> {
  const res = await fetch(`${API_BASE}/subscriptions/stripe/checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Failed to start Stripe checkout");
  }
  return res.json();
}

export async function getPricingPlans(): Promise<{
  plans: Array<{ tier: "STARTER" | "PRO" | "ENTERPRISE"; name: string; monthly: number; yearly: number; features: string[] }>;
}> {
  const res = await fetch(`${API_BASE}/pricing/plans`);
  if (!res.ok) throw new Error("Failed to fetch pricing plans");
  return unwrap(await res.json());
}

export type PlatformEngine = {
  id: string;
  name: string;
  layer: string;
  detail: string;
  status: "operational" | "degraded" | "standby";
};

export type PlatformEnginesPayload = {
  headline: string;
  engines: PlatformEngine[];
  signals: {
    database: string;
    redis: string;
    stripeConfigured: boolean;
    valuationProvidersConfigured: boolean;
    erpConnectorsConfigured: boolean;
  };
  generatedAt: string;
};

/** Server-only: live multi-engine snapshot for marketing (ISR). */
export async function fetchPlatformEnginesPublic(): Promise<PlatformEnginesPayload | null> {
  try {
    const res = await fetch(`${API_BASE}/public/platform-engines`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) return null;
    return unwrap(await res.json());
  } catch {
    return null;
  }
}

export async function createTierCheckoutSession(
  payload: { tier: "STARTER" | "PRO" | "ENTERPRISE"; interval?: "monthly" | "yearly" },
  token: string
): Promise<{ id: string; url: string | null }> {
  const res = await fetch(`${API_BASE}/stripe/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ planId: payload.tier, interval: payload.interval ?? "monthly" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Failed to start tier checkout");
  }
  return unwrap(await res.json());
}

export async function createBillingPortalSession(
  payload: { returnUrl?: string },
  token: string
): Promise<{ url: string }> {
  const res = await fetch(`${API_BASE}/pricing/portal/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Failed to create billing portal session");
  }
  return unwrap(await res.json());
}

export async function getCurrentTenantBilling(token: string): Promise<{
  id: string;
  name: string;
  billingTier: string;
  stripeSubscriptionStatus: string | null;
  customDomain: string | null;
  themeJson: Record<string, unknown> | null;
  onboardedAt: string | null;
}> {
  const res = await fetch(`${API_BASE}/pricing/current`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch tenant billing");
  return unwrap(await res.json());
}

export async function completeOnboarding(token: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/auth/onboarding/complete`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to complete onboarding");
  return unwrap(await res.json());
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


export async function getOwnerAdminOverview(token: string): Promise<{
  mrr: number;
  activeTenants: number;
  tenants: Array<{
    id: string;
    name: string;
    billingTier: string;
    stripeSubscriptionStatus: string | null;
    customDomain: string | null;
    createdAt: string;
  }>;
}> {
  const res = await fetch(`${API_BASE}/admin/overview`, { headers: authHeaders(token) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Failed to load admin overview");
  }
  return unwrap(await res.json());
}

export async function getOwnerMrrDashboard(token: string): Promise<{
  totalMrr: number;
  activeTenants: number;
  usageByKind: Array<{ kind: string; quantity: number; amountUsd: number }>;
  generatedAt: string;
}> {
  const res = await fetch(`${API_BASE}/admin/mrr`, { headers: authHeaders(token) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Failed to load MRR dashboard");
  }
  return unwrap(await res.json());
}

export async function getRaisePackage(token: string): Promise<{
  generatedAt: string;
  tenantCount: number;
  activeTenantCount: number;
  mrr: number;
  usageRevenueUsd: number;
  highlights: string[];
}> {
  const res = await fetch(`${API_BASE}/capital/package`, { headers: authHeaders(token) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Failed to load raise package");
  }
  return unwrap(await res.json());
}

export async function getInvestorPackageByToken(token: string): Promise<RaisePackage> {
  const res = await fetch(`${API_BASE}/capital/investor/${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error("Investor link expired or invalid");
  return unwrap(await res.json());
}

export async function getScalingOverview(token: string): Promise<{
  mrr: number;
  targetMrr: number;
  marketingConversionUsd: number;
  partnerSpendUsd: number;
  partnerSpendPctOfMrr: number;
  projectionTo100kMonths: number;
  generatedAt: string;
}> {
  const res = await fetch(`${API_BASE}/scaling/overview`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load scaling overview");
  return unwrap(await res.json());
}

export async function createMarketingCampaign(
  payload: {
    name: string;
    audience: "new_leads" | "trial" | "at_risk" | "all";
    channels: Array<"email" | "sms">;
    seoLandingSlug: string;
    requireDoubleOptIn?: boolean;
    variants: Array<{ id: string; name: string; channel: "email" | "sms"; weight: number; subject?: string; body: string }>;
  },
  token: string
): Promise<{ campaignId: string; status: "draft" }> {
  const res = await fetch(`${API_BASE}/marketing/campaigns`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(errorMessageFromBody(err) ?? "Failed to create campaign");
  }
  return unwrap(await res.json());
}

export async function runMarketingCampaign(campaignId: string, token: string): Promise<{ queued: boolean }> {
  const res = await fetch(`${API_BASE}/marketing/campaigns/${encodeURIComponent(campaignId)}/run`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to queue campaign");
  return unwrap(await res.json());
}

export async function getSeriesADataRoom(token: string): Promise<{
  generatedAt: string;
  mrr: number;
  growthMoM: number;
  burnMonthlyUsd: number;
  runwayMonths: number;
  highlights: string[];
}> {
  const res = await fetch(`${API_BASE}/capital/series-a/data-room`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load data room");
  return unwrap(await res.json());
}

export async function simulateTermSheet(
  payload: { valuationPreMoneyUsd: number; raiseAmountUsd: number; optionPoolPct: number },
  token: string
): Promise<{
  valuationPreMoneyUsd: number;
  raiseAmountUsd: number;
  optionPoolPct: number;
  investorOwnershipPct: number;
  founderDilutionPct: number;
}> {
  const res = await fetch(`${API_BASE}/capital/series-a/term-sheet`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to simulate term sheet");
  return unwrap(await res.json());
}

export async function getForecastingMrr(token: string): Promise<{
  generatedAt: string;
  currentMrr: number;
  projectedMrr90d: number;
  projectedMrr180d: number;
  confidence: number;
}> {
  const res = await fetch(`${API_BASE}/forecasting/mrr`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load forecast");
  return unwrap(await res.json());
}

export async function getInvestorLiveV2(token: string): Promise<{
  room: { mrr: number; growthMoM: number; runwayMonths: number };
  liveMetrics: { mrr: number; ltvProxy: number; churnPct: number; growthMoM: number };
  generatedAt: string;
}> {
  const res = await fetch(`${API_BASE}/capital/investor-v2/live`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load investor v2 data");
  return unwrap(await res.json());
}

export async function getBoardPack(token: string): Promise<{
  generatedAt: string;
  quarter: string;
  mrr: number;
  burnUsd: number;
  keyRisks: string[];
}> {
  const res = await fetch(`${API_BASE}/governance/board-pack`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load board pack");
  return unwrap(await res.json());
}

export async function getLiquiditySimulation(token: string): Promise<{
  generatedAt: string;
  acquisition: { estimatedEnterpriseValue: number; monthsToTarget: number };
  ipo: { estimatedEnterpriseValue: number; monthsToTarget: number };
}> {
  const res = await fetch(`${API_BASE}/liquidity/simulate`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load liquidity simulation");
  return unwrap(await res.json());
}

export async function onboardingStart(input: { email: string; dealerName: string; password: string; captchaToken: string }) {
  const res = await fetch(`${API_BASE}/onboard/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message || "Failed to start onboarding");
  return unwrap<{ tenantId: string; userId: string; onboardingToken: string }>(body);
}

export async function onboardingStripe(
  input: { tenantId: string; tier: "STARTER" | "PRO" | "ENTERPRISE"; interval?: "monthly" | "yearly" },
  onboardingToken: string
) {
  const res = await fetch(`${API_BASE}/onboard/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${onboardingToken}` },
    body: JSON.stringify({ ...input, interval: input.interval ?? "monthly" }),
  });
  if (!res.ok) throw new Error("Failed onboarding billing step");
}

export async function onboardingTheme(
  input: { tenantId: string; customDomain?: string; themeJson?: Record<string, unknown> },
  onboardingToken: string
) {
  const res = await fetch(`${API_BASE}/onboard/theme`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${onboardingToken}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed onboarding theme step");
}

export async function onboardingSeed(input: { tenantId: string; enableDemoData: boolean }, onboardingToken: string) {
  const res = await fetch(`${API_BASE}/onboard/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${onboardingToken}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed onboarding seed step");
}

export async function onboardingConfirm(input: { tenantId: string }, onboardingToken: string) {
  const res = await fetch(`${API_BASE}/onboard/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${onboardingToken}` },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error("Failed onboarding confirm step");
  return unwrap<{ magicLink: string }>(body);
}

export async function applyPilot(input: { name: string; email: string; dealership: string; phone?: string }) {
  const res = await fetch(`${API_BASE}/pilot/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message || "Pilot application failed");
  return unwrap<{ leadId: string; status: string; autoApprove: boolean }>(body);
}

export async function requestPilotEmailVerificationCode(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/onboard/pilot/email-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message || "Failed to send verification code");
}

export async function onboardPilotSelfServe(input: {
  email: string;
  dealerName: string;
  password: string;
  businessSize?: "1_5" | "6_20" | "21_50" | "51_PLUS";
  expectedMonthlyVolume?: "UNDER_10" | "UNDER_50" | "UNDER_200" | "OVER_200";
  tier: "STARTER" | "PRO" | "ENTERPRISE";
  interval: "monthly" | "yearly";
  captchaToken: string;
  customDomain?: string;
  enableDemoData: boolean;
  emailVerificationCode?: string;
}): Promise<{
  tenantId: string;
  userId: string;
  billingStatus: string;
  checkout: { id: string; url: string | null } | null;
  pilotSubdomain?: string;
  demoAppraisalUrl?: string;
}> {
  const res = await fetch(`${API_BASE}/onboard/pilot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message || "Pilot onboarding failed");
  return unwrap(body);
}

export async function getBillingUsage(token: string): Promise<{
  tenantId: string;
  pilot?: {
    pilotSubdomain: string | null;
    appraisalCount: number;
    inviteCustomerUrl: string;
    showNpsAfterFirstAppraisalClose: boolean;
  };
  valuation: {
    dailyCapUsd: number;
    spentTodayUsd: number;
    remainingTodayUsd: number;
    callsToday: number;
    projectedSpendEodUsd: number;
    projectedRemainingEodUsd: number;
    publicIntakeToday?: number;
  };
  activity?: {
    appraisals: Array<{ id: string; status: string; updatedAt: string; value: number | null }>;
    closedDeals: Array<{ id: string; status: string; updatedAt: string; totalAmount: number | null }>;
    usageEvents: Array<{ id: string; kind: string; createdAt: string; amountUsd: number | null; quantity: number }>;
  };
  usageMonth: { quantity: number; amountUsd: number };
  overage: { amountUsdToday: number };
}> {
  const res = await fetch(`${API_BASE}/billing/usage`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to load billing usage");
  return unwrap(await res.json());
}

export async function inviteFirstCustomer(token: string, input: { name?: string; email: string; phone?: string }) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({
      source: "PILOT_DASHBOARD",
      name: input.name,
      email: input.email,
      phone: input.phone,
      notes: "Invite first customer from dealer pilot dashboard",
      status: "NEW",
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message || "Failed to invite customer");
  return unwrap(body);
}

export async function submitPilotNps(
  token: string,
  input: { rating: number; message: string; channel?: "in_app" | "email" | "sms" }
) {
  const res = await fetch(`${API_BASE}/success/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({
      rating: input.rating,
      message: input.message,
      channel: input.channel ?? "in_app",
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message || "Failed to submit NPS");
  return unwrap(body);
}
