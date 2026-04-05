import { Redis } from "ioredis";
import { Queue, Worker, type Job } from "bullmq";
import { runWithTenant } from "./tenant.js";
import { prisma } from "./tenant.js";
import { provisionTenantDemo } from "./provision.js";
import { sendLifecycleNotification } from "./notify.js";
import { PilotAnalyticsService } from "./iteration.js";
import { fortellisRequest } from "./fortellis.js";
import { cdkDriveRequest } from "./cdk.js";
import { tekionRequest } from "./tekion.js";
import { reynoldsRequest } from "./reynolds.js";
import { dealertrackRequest } from "./dealertrack.js";

const QUEUE_NAME = "vex-main";
const pilotAnalyticsService = new PilotAnalyticsService();

function newConnection(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  return new Redis(url, { maxRetriesPerRequest: null });
}

let queueInstance: Queue | null = null;
let queueConn: Redis | null = null;

function getQueue(): Queue | null {
  if (!process.env.REDIS_URL) return null;
  if (!queueInstance) {
    queueConn = newConnection();
    if (!queueConn) return null;
    queueInstance = new Queue(QUEUE_NAME, {
      connection: queueConn,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 2000 },
        removeOnFail: { count: 5000 },
      },
    });
  }
  return queueInstance;
}

export async function enqueueAppraisalPdfGenerate(data: {
  tenantId: string;
  appraisalId: string;
  requestedByUserId?: string;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "appraisal-pdf-generate",
    data,
    { jobId: `pdf:${data.tenantId}:${data.appraisalId}` }
  );
}

export async function enqueueValuationCacheWarm(data: { tenantId: string; cacheKeyHint?: string }): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "valuation-cache-warm",
    data,
    { jobId: `warm:${data.tenantId}:${data.cacheKeyHint ?? "all"}` }
  );
}

export async function enqueueStripeSync(data: { tenantId: string; stripeCustomerId?: string }): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add("stripe-sync", data, { jobId: `stripe:${data.tenantId}:${data.stripeCustomerId ?? "default"}` });
}

export async function enqueueAnalyticsRollup(data: { tenantId: string; window?: "hour" | "day" }): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "analytics-rollup",
    { tenantId: data.tenantId, window: data.window ?? "day" },
    { jobId: `rollup:${data.tenantId}:${data.window ?? "day"}` }
  );
}

export async function enqueueProvisionTenant(data: { tenantId: string; tier: string; email: string }): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add("provision-tenant", data, { jobId: `provision:${data.tenantId}` });
}

export async function enqueueDmsSync(data: { tenantId: string; vendor: string; mode?: "full" | "delta" }): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add("dms-sync", data, { jobId: `dms:${data.tenantId}:${data.vendor}:${data.mode ?? "delta"}` });
}

export async function enqueueFortellisInventorySync(data: {
  tenantId: string;
  externalId?: string;
  vin?: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "fortellis-inventory-sync",
    data,
    { jobId: `fortellis-inventory-sync:${data.tenantId}:${data.vin ?? data.externalId ?? "unknown"}` }
  );
}

export async function enqueueFortellisAppraisalPush(data: {
  tenantId: string;
  externalId: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "fortellis-appraisal-push",
    data,
    { jobId: `fortellis-appraisal-push:${data.tenantId}:${data.externalId}` }
  );
}

export async function enqueueCdkInventorySync(data: {
  tenantId: string;
  externalId: string;
  vin?: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "cdk-inventory-sync",
    data,
    { jobId: `cdk-inventory-sync:${data.tenantId}:${data.vin ?? data.externalId}` }
  );
}

export async function enqueueCdkValuationPush(data: {
  tenantId: string;
  externalId: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "cdk-valuation-push",
    data,
    { jobId: `cdk-valuation-push:${data.tenantId}:${data.externalId}` }
  );
}

export async function enqueueTekionInventorySync(data: {
  tenantId: string;
  externalId?: string;
  vin?: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "tekion-inventory-sync",
    data,
    { jobId: `tekion-inventory-sync:${data.tenantId}:${data.vin ?? data.externalId ?? "unknown"}` }
  );
}

export async function enqueueTekionAppraisalPush(data: {
  tenantId: string;
  externalId: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "tekion-appraisal-push",
    data,
    { jobId: `tekion-appraisal-push:${data.tenantId}:${data.externalId}` }
  );
}

export async function enqueueReynoldsInventorySync(data: {
  tenantId: string;
  externalId?: string;
  vin?: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "reynolds-inventory-sync",
    data,
    { jobId: `reynolds-inventory-sync:${data.tenantId}:${data.vin ?? data.externalId ?? "unknown"}` }
  );
}

export async function enqueueReynoldsAppraisalPush(data: {
  tenantId: string;
  externalId: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "reynolds-appraisal-push",
    data,
    { jobId: `reynolds-appraisal-push:${data.tenantId}:${data.externalId}` }
  );
}

export async function enqueueDealertrackCreditAppSync(data: {
  tenantId: string;
  externalId: string;
  vin?: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "dealertrack-credit-app-sync",
    data,
    { jobId: `dealertrack-credit-app-sync:${data.tenantId}:${data.vin ?? data.externalId}` }
  );
}

export async function enqueueDealertrackFinanceQuoteSync(data: {
  tenantId: string;
  externalId: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "dealertrack-finance-quote-sync",
    data,
    { jobId: `dealertrack-finance-quote-sync:${data.tenantId}:${data.externalId}` }
  );
}

export async function enqueueRetentionScore(data: { tenantId: string }): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add("retention-score", data, { jobId: `retention:${data.tenantId}` });
}

export async function enqueuePilotSuccessNudge(data: {
  tenantId: string;
  userId: string;
  email?: string;
  phone?: string;
  step: "welcome" | "first_appraisal_24h" | "nps_7d";
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "pilot-success-nudge",
    data,
    { jobId: `pilot-nudge:${data.tenantId}:${data.userId}:${data.step}` }
  );
}

export async function enqueueIterationAnalysis(data: { tenantId: string }): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add("iteration-analysis", data, { jobId: `iteration:${data.tenantId}` });
}

export async function enqueueMarketingCampaignRun(data: { tenantId: string; campaignId: string }): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add("marketing-campaign-run", data, { jobId: `marketing:${data.tenantId}:${data.campaignId}` });
}

export async function enqueuePartnerPayout(data: {
  tenantId: string;
  idempotencyKey: string;
  payoutUsd: number;
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add("partner-payout-run", data, { jobId: `partner-payout:${data.tenantId}:${data.idempotencyKey}` });
}

/** Dealer DMS-style automation: chains to valuation warm, analytics rollup, or iteration backlog depending on workflow type. */
export async function enqueueAutonomousWorkflow(data: {
  tenantId: string;
  id: string;
  workflowType: string;
  enabled: boolean;
  maxParallelRuns: number;
  tenantDailyCostCapUsd: number;
  correlationId: string;
}): Promise<boolean> {
  const q = getQueue();
  if (!q) return false;
  await q.add("autonomous-workflow", data, {
    jobId: `autonomous:${data.tenantId}:${data.id}:${data.workflowType}`,
  });
  return true;
}

/** Luxury moat: valuation warm → PDF job → Stripe hook (stub) — tenant-scoped, idempotent job id. */
export async function enqueueDealOrchestration(data: {
  tenantId: string;
  appraisalId: string;
  requestedByUserId?: string;
  correlationId?: string;
}): Promise<string | null> {
  const q = getQueue();
  const correlationId = data.correlationId ?? globalThis.crypto.randomUUID();
  if (!q) return correlationId;
  await q.add(
    "deal-orchestration",
    {
      tenantId: data.tenantId,
      appraisalId: data.appraisalId,
      requestedByUserId: data.requestedByUserId,
      correlationId,
    },
    { jobId: `deal:${data.tenantId}:${data.appraisalId}:${correlationId}` }
  );
  return correlationId;
}

/** Apex Studio — queue 360° spin export (stub worker logs until render pipeline ships). */
export async function enqueueApexStudio360Export(data: {
  tenantId: string;
  buildSnapshotId: string;
  format?: "gif" | "mp4";
}): Promise<void> {
  const q = getQueue();
  if (!q) return;
  await q.add(
    "apex-studio-360-export",
    {
      tenantId: data.tenantId,
      buildSnapshotId: data.buildSnapshotId,
      format: data.format ?? "mp4",
    },
    { jobId: `apex360:${data.tenantId}:${data.buildSnapshotId}` }
  );
}

let workerInstance: Worker | null = null;

async function processJob(job: Job): Promise<void> {
  const name = job.name;
  const data = job.data as Record<string, unknown>;
  const tenantId = data.tenantId as string;
  if (!tenantId) throw new Error("missing tenantId on job");

  await runWithTenant(tenantId, async () => {
    if (name === "appraisal-pdf-generate") {
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.appraisal_pdf_generate",
          payload: {
            appraisalId: String(data.appraisalId ?? ""),
            requestedByUserId: data.requestedByUserId != null ? String(data.requestedByUserId) : null,
            note: "PDF generation is async; CRM may still render client-side PDF for instant UX.",
          },
        },
      });
      return;
    }
    if (name === "valuation-cache-warm") {
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.valuation_cache_warm",
          payload: { cacheKeyHint: data.cacheKeyHint != null ? String(data.cacheKeyHint) : null },
        },
      });
      return;
    }
    if (name === "stripe-sync") {
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.stripe_sync",
          payload: { stripeCustomerId: data.stripeCustomerId != null ? String(data.stripeCustomerId) : null },
        },
      });
      return;
    }
    if (name === "analytics-rollup") {
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.analytics_rollup",
          payload: { window: String(data.window ?? "day") },
        },
      });
      return;
    }
    if (name === "provision-tenant") {
      await provisionTenantDemo({
        tenantId,
        tier: String(data.tier ?? "STARTER"),
        email: String(data.email ?? ""),
      });
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.provision_tenant",
          payload: { tier: String(data.tier ?? "STARTER"), email: String(data.email ?? "") },
        },
      });
      return;
    }
    if (name === "dms-sync") {
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.dms_sync",
          payload: { vendor: String(data.vendor ?? ""), mode: String(data.mode ?? "delta") },
        },
      });
      return;
    }
    if (name === "fortellis-inventory-sync") {
      const externalId = String(data.externalId ?? data.vin ?? "");
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      await fortellisRequest("POST", process.env.FORTELLIS_INVENTORY_SYNC_ENDPOINT ?? "/cdkdrive/inventory/v1/vehicles", payload);
      await prisma.externalSync.upsert({
        where: {
          tenantId_externalId_entityType: {
            tenantId,
            externalId,
            entityType: "vehicle",
          },
        },
        create: {
          tenantId,
          vendor: "FORTELLIS",
          entityType: "vehicle",
          externalId,
          direction: "OUTBOUND",
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
        update: {
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
      });
      await prisma.integrationLog.create({
        data: {
          tenantId,
          vendor: "FORTELLIS",
          eventType: "inventory.sync",
          externalId,
          status: "PROCESSED",
          payload: payload as unknown as object,
          processedAt: new Date(),
        },
      });
      return;
    }
    if (name === "fortellis-appraisal-push") {
      const externalId = String(data.externalId ?? "");
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      await fortellisRequest("POST", process.env.FORTELLIS_APPRAISAL_PUSH_ENDPOINT ?? "/cdkdrive/sales/v1/appraisals", payload);
      await prisma.externalSync.upsert({
        where: {
          tenantId_externalId_entityType: {
            tenantId,
            externalId,
            entityType: "appraisal",
          },
        },
        create: {
          tenantId,
          vendor: "FORTELLIS",
          entityType: "appraisal",
          externalId,
          direction: "OUTBOUND",
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
        update: {
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
      });
      await prisma.integrationLog.create({
        data: {
          tenantId,
          vendor: "FORTELLIS",
          eventType: "appraisal.push",
          externalId,
          status: "PROCESSED",
          payload: payload as unknown as object,
          processedAt: new Date(),
        },
      });
      return;
    }
    if (name === "cdk-inventory-sync") {
      const externalId = String(data.externalId ?? data.vin ?? "");
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      await cdkDriveRequest("POST", process.env.CDK_INVENTORY_SYNC_ENDPOINT ?? "/inventory/v1/vehicles", payload);
      await prisma.externalSync.upsert({
        where: {
          tenantId_externalId_entityType: {
            tenantId,
            externalId,
            entityType: "cdk_vehicle",
          },
        },
        create: {
          tenantId,
          vendor: "CDK",
          entityType: "cdk_vehicle",
          externalId,
          direction: "OUTBOUND",
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
        update: {
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
      });
      await prisma.integrationLog.create({
        data: {
          tenantId,
          vendor: "CDK",
          eventType: "cdk.drive.inventory.sync",
          externalId,
          status: "PROCESSED",
          payload: payload as unknown as object,
          processedAt: new Date(),
        },
      });
      return;
    }
    if (name === "cdk-valuation-push") {
      const externalId = String(data.externalId ?? "");
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      await cdkDriveRequest("POST", process.env.CDK_VALUATION_PUSH_ENDPOINT ?? "/sales/v1/valuations", payload);
      await prisma.externalSync.upsert({
        where: {
          tenantId_externalId_entityType: {
            tenantId,
            externalId,
            entityType: "cdk_valuation",
          },
        },
        create: {
          tenantId,
          vendor: "CDK",
          entityType: "cdk_valuation",
          externalId,
          direction: "OUTBOUND",
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
        update: {
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
      });
      await prisma.integrationLog.create({
        data: {
          tenantId,
          vendor: "CDK",
          eventType: "cdk.drive.valuation.push",
          externalId,
          status: "PROCESSED",
          payload: payload as unknown as object,
          processedAt: new Date(),
        },
      });
      return;
    }
    if (name === "tekion-inventory-sync") {
      const externalId = String(data.externalId ?? data.vin ?? "");
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      await tekionRequest("POST", process.env.TEKION_INVENTORY_SYNC_ENDPOINT ?? "/arc/inventory/v1/vehicles", payload);
      await prisma.externalSync.upsert({
        where: {
          tenantId_externalId_entityType: {
            tenantId,
            externalId,
            entityType: "vehicle",
          },
        },
        create: {
          tenantId,
          vendor: "TEKION",
          entityType: "vehicle",
          externalId,
          direction: "OUTBOUND",
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
        update: {
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
      });
      await prisma.integrationLog.create({
        data: {
          tenantId,
          vendor: "TEKION",
          eventType: "inventory.sync",
          externalId,
          status: "PROCESSED",
          payload: payload as unknown as object,
          processedAt: new Date(),
        },
      });
      return;
    }
    if (name === "tekion-appraisal-push") {
      const externalId = String(data.externalId ?? "");
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      await tekionRequest("POST", process.env.TEKION_APPRAISAL_PUSH_ENDPOINT ?? "/arc/sales/v1/appraisals", payload);
      await prisma.externalSync.upsert({
        where: {
          tenantId_externalId_entityType: {
            tenantId,
            externalId,
            entityType: "appraisal",
          },
        },
        create: {
          tenantId,
          vendor: "TEKION",
          entityType: "appraisal",
          externalId,
          direction: "OUTBOUND",
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
        update: {
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
      });
      await prisma.integrationLog.create({
        data: {
          tenantId,
          vendor: "TEKION",
          eventType: "appraisal.push",
          externalId,
          status: "PROCESSED",
          payload: payload as unknown as object,
          processedAt: new Date(),
        },
      });
      return;
    }
    if (name === "reynolds-inventory-sync") {
      const externalId = String(data.externalId ?? data.vin ?? "");
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      await reynoldsRequest("POST", process.env.REYNOLDS_INVENTORY_SYNC_ENDPOINT ?? "/spark/inventory/v1/vehicles", payload);
      await prisma.externalSync.upsert({
        where: {
          tenantId_externalId_entityType: {
            tenantId,
            externalId,
            entityType: "vehicle",
          },
        },
        create: {
          tenantId,
          vendor: "REYNOLDS",
          entityType: "vehicle",
          externalId,
          direction: "OUTBOUND",
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
        update: {
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
      });
      await prisma.integrationLog.create({
        data: {
          tenantId,
          vendor: "REYNOLDS",
          eventType: "inventory.sync",
          externalId,
          status: "PROCESSED",
          payload: payload as unknown as object,
          processedAt: new Date(),
        },
      });
      return;
    }
    if (name === "reynolds-appraisal-push") {
      const externalId = String(data.externalId ?? "");
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      await reynoldsRequest("POST", process.env.REYNOLDS_APPRAISAL_PUSH_ENDPOINT ?? "/spark/sales/v1/appraisals", payload);
      await prisma.externalSync.upsert({
        where: {
          tenantId_externalId_entityType: {
            tenantId,
            externalId,
            entityType: "appraisal",
          },
        },
        create: {
          tenantId,
          vendor: "REYNOLDS",
          entityType: "appraisal",
          externalId,
          direction: "OUTBOUND",
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
        update: {
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
      });
      await prisma.integrationLog.create({
        data: {
          tenantId,
          vendor: "REYNOLDS",
          eventType: "appraisal.push",
          externalId,
          status: "PROCESSED",
          payload: payload as unknown as object,
          processedAt: new Date(),
        },
      });
      return;
    }
    if (name === "dealertrack-credit-app-sync") {
      const externalId = String(data.externalId ?? data.vin ?? "");
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      await dealertrackRequest(
        "POST",
        process.env.DEALERTRACK_CREDIT_APP_SYNC_ENDPOINT ?? "/digital-retailing/v1/credit-applications",
        payload
      );
      await prisma.externalSync.upsert({
        where: {
          tenantId_externalId_entityType: {
            tenantId,
            externalId,
            entityType: "fi_credit_application",
          },
        },
        create: {
          tenantId,
          vendor: "DEALERTRACK",
          entityType: "fi_credit_application",
          externalId,
          direction: "OUTBOUND",
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
        update: {
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
      });
      await prisma.integrationLog.create({
        data: {
          tenantId,
          vendor: "DEALERTRACK",
          eventType: "fi.credit_application.sync",
          externalId,
          status: "PROCESSED",
          payload: payload as unknown as object,
          processedAt: new Date(),
        },
      });
      return;
    }
    if (name === "dealertrack-finance-quote-sync") {
      const externalId = String(data.externalId ?? "");
      const payload = (data.payload ?? {}) as Record<string, unknown>;
      await dealertrackRequest(
        "POST",
        process.env.DEALERTRACK_FINANCE_QUOTE_SYNC_ENDPOINT ?? "/digital-retailing/v1/finance-quotes",
        payload
      );
      await prisma.externalSync.upsert({
        where: {
          tenantId_externalId_entityType: {
            tenantId,
            externalId,
            entityType: "fi_finance_quote",
          },
        },
        create: {
          tenantId,
          vendor: "DEALERTRACK",
          entityType: "fi_finance_quote",
          externalId,
          direction: "OUTBOUND",
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
        update: {
          status: "SUCCESS",
          payload: payload as unknown as object,
          syncedAt: new Date(),
        },
      });
      await prisma.integrationLog.create({
        data: {
          tenantId,
          vendor: "DEALERTRACK",
          eventType: "fi.finance_quote.sync",
          externalId,
          status: "PROCESSED",
          payload: payload as unknown as object,
          processedAt: new Date(),
        },
      });
      return;
    }
    if (name === "retention-score") {
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.retention_score",
          payload: { status: "queued" },
        },
      });
      return;
    }
    if (name === "pilot-success-nudge") {
      const step = String(data.step ?? "welcome");
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.pilot_success_nudge",
          payload: { userId: String(data.userId ?? ""), step },
        },
      });
      const toEmail = typeof data.email === "string" ? data.email : null;
      const smsTo = typeof data.phone === "string" ? data.phone : null;
      const msgByStep: Record<string, { subject: string; message: string }> = {
        welcome: {
          subject: "Welcome to Vex pilot",
          message: "Welcome aboard. Your pilot tenant is ready; run your first appraisal to unlock the dashboard.",
        },
        first_appraisal_24h: {
          subject: "Run your first appraisal",
          message: "Quick nudge: teams that run one appraisal in day one convert at much higher rates.",
        },
        nps_7d: {
          subject: "How is your first week?",
          message: "Share feedback and NPS so we can tailor workflows for your dealership.",
        },
      };
      const copy = msgByStep[step] ?? msgByStep.welcome;
      await sendLifecycleNotification({
        type: "ONBOARDING_COMPLETE",
        toEmail,
        smsTo,
        subject: copy.subject,
        message: copy.message,
      });
      return;
    }
    if (name === "iteration-analysis") {
      const metric = await pilotAnalyticsService.buildCohortMetric(tenantId);
      await pilotAnalyticsService.upsertBacklogFromMetric(metric);
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.iteration_analysis",
          payload: metric,
        },
      });
      return;
    }
    if (name === "marketing-campaign-run") {
      await prisma.usageLog.create({
        data: {
          tenantId,
          kind: "marketing_send",
          quantity: 100,
          amountUsd: 0,
          meta: { campaignId: String(data.campaignId ?? "") },
        },
      });
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.marketing_campaign_run",
          payload: { campaignId: String(data.campaignId ?? "") },
        },
      });
      return;
    }
    if (name === "partner-payout-run") {
      await prisma.usageLog.create({
        data: {
          tenantId,
          kind: "partner_payout",
          quantity: 1,
          amountUsd: Number(data.payoutUsd ?? 0),
          meta: { idempotencyKey: String(data.idempotencyKey ?? "") },
        },
      });
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.partner_payout_run",
          payload: {
            idempotencyKey: String(data.idempotencyKey ?? ""),
            payoutUsd: Number(data.payoutUsd ?? 0),
          },
        },
      });
      return;
    }
    if (name === "autonomous-workflow") {
      const workflowType = String(data.workflowType ?? "");
      const correlationId = String(data.correlationId ?? "");
      const wfId = String(data.id ?? "");
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "dealer.automation.dispatched",
          payload: {
            correlationId,
            workflowType,
            workflowId: wfId,
            tenantDailyCostCapUsd: Number(data.tenantDailyCostCapUsd ?? 0),
            schemaVersion: 1,
          },
        },
      });
      if (workflowType === "valuation_sweep") {
        await enqueueValuationCacheWarm({ tenantId, cacheKeyHint: `autonomous:${correlationId}` });
      } else if (workflowType === "lead_nurture") {
        await enqueueAnalyticsRollup({ tenantId, window: "day" });
      } else if (workflowType === "appraisal_marketplace_push") {
        await enqueueIterationAnalysis({ tenantId });
      }
      return;
    }
    if (name === "deal-orchestration") {
      const appraisalId = String(data.appraisalId ?? "");
      const correlationId = String(data.correlationId ?? "");
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.deal_orchestration",
          payload: {
            appraisalId,
            correlationId,
            phases: ["valuation_cache_warm", "appraisal_pdf", "stripe_session_stub"],
            note: "External valuation spend capped in ValuationService / POST /appraisals/valuate",
          },
        },
      });
      await enqueueValuationCacheWarm({ tenantId, cacheKeyHint: `appraisal:${appraisalId}` });
      await enqueueAppraisalPdfGenerate({
        tenantId,
        appraisalId,
        requestedByUserId: data.requestedByUserId != null ? String(data.requestedByUserId) : undefined,
      });
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.deal_orchestration_stripe",
          payload: {
            appraisalId,
            correlationId,
            note: "Stripe Checkout session creation integrates with billing routes",
          },
        },
      });
      return;
    }
    if (name === "apex-studio-360-export") {
      await prisma.eventLog.create({
        data: {
          tenantId,
          type: "job.apex_studio_360_export",
          payload: {
            buildSnapshotId: String(data.buildSnapshotId ?? ""),
            format: String(data.format ?? "mp4"),
            note: "Stub — wire headless Three/ffmpeg exporter; idempotent job id per snapshot",
          },
        },
      });
      return;
    }
    throw new Error(`unknown job name: ${name}`);
  });
}

/**
 * Starts BullMQ workers (single cluster mode). Idempotent processors write to `EventLog` for audit.
 * Per-tenant concurrency cap: 50 concurrent jobs globally (tune in ops).
 */
export function startQueueWorkers(): void {
  if (!process.env.REDIS_URL) {
    console.warn(JSON.stringify({ queues: "disabled", reason: "REDIS_URL not set" }));
    return;
  }
  if (workerInstance) return;

  const conn = newConnection();
  if (!conn) return;

  workerInstance = new Worker(
    QUEUE_NAME,
    async (job) => {
      await processJob(job);
    },
    {
      connection: conn,
      concurrency: Number(process.env.QUEUE_WORKER_CONCURRENCY ?? 50),
    }
  );

  workerInstance.on("failed", (job, err) => {
    console.error(
      JSON.stringify({
        queue: "job_failed",
        id: job?.id,
        name: job?.name,
        message: err instanceof Error ? err.message : String(err),
      })
    );
  });
}
