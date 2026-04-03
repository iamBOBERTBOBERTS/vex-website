import express, { type Express } from "express";
import cors from "cors";
import { metricsRegistry } from "./lib/metrics.js";
import { requestContextMiddleware } from "./middleware/requestContext.js";
import { metricsHttpMiddleware } from "./middleware/metricsHttp.js";
import { tenantRateLimitMiddleware } from "./middleware/rateLimitTenant.js";
import { rbacAnyAuthenticated } from "./middleware/rbac.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { vehiclesRouter } from "./routes/vehicles.js";
import { inventoryRouter } from "./routes/inventory.js";
import { ordersRouter } from "./routes/orders.js";
import { savedVehiclesRouter } from "./routes/savedVehicles.js";
import { shippingRouter } from "./routes/shipping.js";
import { financingRouter } from "./routes/financing.js";
import { appraisalsRouter } from "./routes/appraisals.js";
import { notificationsRouter } from "./routes/notifications.js";
import { subscriptionsRouter } from "./routes/subscriptions.js";
import { dealAnalysisRouter } from "./routes/dealAnalysis.js";
import { leadsRouter } from "./routes/leads.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { customersRouter } from "./routes/customers.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { tenantMiddleware } from "./middleware/tenant.js";
import { stripeRouter } from "./routes/stripe.js";
import { pricingRouter } from "./routes/pricing.js";
import { publicRouter } from "./routes/public.js";
import { analyticsRouter } from "./routes/analytics.js";
import { adminRouter } from "./routes/admin.js";
import { onboardRouter } from "./routes/onboard.js";
import { referralRouter } from "./routes/referral.js";
import { pilotRouter } from "./routes/pilot.js";
import { aiRouter } from "./routes/ai.js";
import { growthRouter } from "./routes/growth.js";
import { dmsRouter } from "./routes/dms.js";
import { complianceRouter } from "./routes/compliance.js";
import { retentionRouter } from "./routes/retention.js";
import { successRouter } from "./routes/success.js";
import { iterationRouter } from "./routes/iteration.js";
import { upsellRouter } from "./routes/upsell.js";
import { capitalRouter } from "./routes/capital.js";
import { marketingRouter } from "./routes/marketing.js";
import { partnersRouter } from "./routes/partners.js";
import { scalingRouter } from "./routes/scaling.js";
import { autonomousRouter } from "./routes/autonomous.js";
import { forecastingRouter } from "./routes/forecasting.js";
import { governanceRouter } from "./routes/governance.js";
import { accountingRouter } from "./routes/accounting.js";
import { liquidityRouter } from "./routes/liquidity.js";
import { billingRouter } from "./routes/billing.js";
import { dealerRouter } from "./routes/dealer.js";
import { integrationsInventoryRouter } from "./routes/integrations/inventory.js";
import { fortellisWebhookRouter } from "./routes/integrations/webhooks/fortellis.js";
import { tekionInventoryRouter } from "./routes/integrations/tekion-inventory.js";
import { tekionWebhookRouter } from "./routes/integrations/webhooks/tekion.js";
import { reynoldsInventoryRouter } from "./routes/integrations/reynolds-inventory.js";
import { reynoldsWebhookRouter } from "./routes/integrations/webhooks/reynolds.js";
import { erpRouter } from "./routes/erp.js";
import { flagsRouter } from "./routes/flags.js";
import { dealertrackFiRouter } from "./routes/integrations/dealertrack-fi.js";
import { dealertrackWebhookRouter } from "./routes/integrations/webhooks/dealertrack.js";
import { cdkDriveRouter } from "./routes/integrations/cdk-drive.js";
import { cdkNeuronWebhookRouter } from "./routes/integrations/webhooks/cdk-neuron.js";

const app: Express = express();

// Stripe needs raw body for signature verification.
app.use("/stripe/webhook", express.raw({ type: "application/json" }));
app.use("/integrations/webhooks/fortellis", express.raw({ type: "application/json" }));
app.use("/integrations/webhooks/tekion", express.raw({ type: "application/json" }));
app.use("/integrations/webhooks/reynolds", express.raw({ type: "application/json" }));
app.use("/integrations/webhooks/dealertrack", express.raw({ type: "application/json" }));
app.use("/integrations/webhooks/cdk-neuron", express.raw({ type: "application/json" }));

app.use(requestContextMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOrigin = process.env.CORS_ORIGIN;
const isProd = process.env.NODE_ENV === "production";
app.use(
  cors({
    origin: (origin, callback) => {
      if (!isProd) {
        callback(null, true);
        return;
      }
      const raw = (corsOrigin ?? "").trim();
      const list = raw.split(",").map((o) => o.trim()).filter(Boolean);
      if (!raw || raw === "*" || list.length === 0) {
        callback(null, false);
        return;
      }
      if (!origin || list.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  })
);

// Quick root route so the base URL actually responds with something useful
// White-label: resolve tenant theme by Host — no auth, before tenant middleware.
app.use("/public", publicRouter);
app.use("/onboard", onboardRouter);
app.use("/pilot", pilotRouter);

app.get("/", (_req, res) => {
  res.json({
    api: "@vex/api",
    status: "running hot 🔥",
    message: "VEX backend is live — luxury whips, no cap",
    endpoints: {
      health: "GET /health → server check",
      platformEngines: "GET /public/platform-engines → engine snapshot (public)",
      auth: [
        "POST /auth/register → create account",
        "POST /auth/login → get JWT",
        "GET /auth/me → current user (needs token)"
      ],
      note: "Hit /health to confirm everything's breathing"
    },
    timestamp: new Date().toISOString()
  });
});

app.use(tenantMiddleware);
app.use((req, res, next) => {
  if (
    req.path === "/health" ||
    req.path === "/" ||
    req.path === "/metrics" ||
    req.path.startsWith("/public/") ||
    req.path.startsWith("/onboard/") ||
    req.path.startsWith("/pilot/") ||
    (req.path === "/dealer/pilots" && req.method === "GET") ||
    req.path.startsWith("/stripe/webhook") ||
    req.path.startsWith("/integrations/webhooks/fortellis") ||
    req.path.startsWith("/integrations/webhooks/tekion") ||
    req.path.startsWith("/integrations/webhooks/reynolds") ||
    req.path.startsWith("/integrations/webhooks/dealertrack") ||
    req.path.startsWith("/integrations/webhooks/cdk-neuron") ||
    req.path.startsWith("/webhooks/") ||
    (req.path === "/pricing/plans" && req.method === "GET")
  ) {
    return next();
  }
  return rbacAnyAuthenticated()(req, res, next);
});
app.use(metricsHttpMiddleware);
app.use(tenantRateLimitMiddleware);

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/vehicles", vehiclesRouter);
app.use("/inventory", inventoryRouter);
app.use("/orders", ordersRouter);
app.use("/saved-vehicles", savedVehiclesRouter);
app.use("/shipping", shippingRouter);
app.use("/financing", financingRouter);
app.use("/appraisals", appraisalsRouter);
app.use("/notifications", notificationsRouter);
app.use("/subscriptions", subscriptionsRouter);
app.use("/deal-analysis", dealAnalysisRouter);
app.use("/leads", leadsRouter);
app.use("/dashboard", dashboardRouter);
app.use("/customers", customersRouter);
app.use("/webhooks", webhooksRouter);
app.use("/stripe", stripeRouter);
app.use("/pricing", pricingRouter);
app.use("/billing", billingRouter);
app.use("/dealer", dealerRouter);
app.use("/integrations/inventory", integrationsInventoryRouter);
app.use("/integrations/webhooks/fortellis", fortellisWebhookRouter);
app.use("/integrations/tekion-inventory", tekionInventoryRouter);
app.use("/integrations/webhooks/tekion", tekionWebhookRouter);
app.use("/integrations/reynolds-inventory", reynoldsInventoryRouter);
app.use("/integrations/webhooks/reynolds", reynoldsWebhookRouter);
app.use("/integrations/dealertrack-fi", dealertrackFiRouter);
app.use("/integrations/webhooks/dealertrack", dealertrackWebhookRouter);
app.use("/integrations/cdk-drive", cdkDriveRouter);
app.use("/integrations/webhooks/cdk-neuron", cdkNeuronWebhookRouter);
app.use("/erp", erpRouter);
app.use("/flags", flagsRouter);
app.use("/analytics", analyticsRouter);
app.use("/admin", adminRouter);
app.use("/referrals", referralRouter);
app.use("/ai", aiRouter);
app.use("/growth", growthRouter);
app.use("/dms", dmsRouter);
app.use("/compliance", complianceRouter);
app.use("/retention", retentionRouter);
app.use("/success", successRouter);
app.use("/iteration", iterationRouter);
app.use("/upsell", upsellRouter);
app.use("/capital", capitalRouter);
app.use("/marketing", marketingRouter);
app.use("/partners", partnersRouter);
app.use("/scaling", scalingRouter);
app.use("/autonomous", autonomousRouter);
app.use("/forecasting", forecastingRouter);
app.use("/governance", governanceRouter);
app.use("/accounting", accountingRouter);
app.use("/liquidity", liquidityRouter);

export { app };