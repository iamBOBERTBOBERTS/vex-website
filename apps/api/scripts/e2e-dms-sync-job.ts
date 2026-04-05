/**
 * Runs `dms-sync` job handler (simulated DMS import) without Redis — same path as BullMQ worker.
 */
import { systemPrisma } from "../src/lib/tenant.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const suffix = Date.now();
  const tenant = await systemPrisma.tenant.create({
    data: { name: `e2e-dms-sync-${suffix}` },
  });

  const { runQueuedJobHandlerForTests } = await import("../src/lib/queue.js");

  await runQueuedJobHandlerForTests({
    name: "dms-sync",
    data: { tenantId: tenant.id, vendor: "cdk", mode: "delta" },
  });

  const audit = await systemPrisma.auditLog.findFirst({
    where: { tenantId: tenant.id, action: "DMS_SYNC", entity: "DMS" },
    orderBy: { createdAt: "desc" },
  });
  assert(audit, "E2E FAILED: missing DMS_SYNC AuditLog");

  const usage = await systemPrisma.usageLog.findFirst({
    where: { tenantId: tenant.id, kind: "DMS_SYNC" },
    orderBy: { createdAt: "desc" },
  });
  assert(usage, "E2E FAILED: missing DMS_SYNC UsageLog");

  const event = await systemPrisma.eventLog.findFirst({
    where: { tenantId: tenant.id, type: "job.dms_sync" },
    orderBy: { createdAt: "desc" },
  });
  assert(event, "E2E FAILED: missing job.dms_sync EventLog");

  await systemPrisma.eventLog.deleteMany({ where: { tenantId: tenant.id, type: "job.dms_sync" } });
  await systemPrisma.usageLog.deleteMany({ where: { tenantId: tenant.id, kind: "DMS_SYNC" } });
  await systemPrisma.auditLog.deleteMany({ where: { tenantId: tenant.id, action: "DMS_SYNC" } });
  await systemPrisma.tenant.deleteMany({ where: { id: tenant.id } });

  console.log("e2e-dms-sync-job: OK");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => systemPrisma.$disconnect());
