/**
 * Minimal pilot loop: public quick appraisal (tenant-scoped) → deal desk close → Order + usage + RevenueEvent.
 * Complements e2e-dealer-integration (staff-created appraisal) by starting from createPublicQuickAppraisal.
 */
import { systemPrisma } from "../src/lib/tenant.js";
import { createPublicQuickAppraisal } from "../src/lib/appraisalService.js";
import { updateDealDeskStatus } from "../src/services/dealDeskService.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const suffix = Date.now();
  const tenantA = await systemPrisma.tenant.create({ data: { name: `e2e-pilot-loop-a-${suffix}` } });
  const tenantB = await systemPrisma.tenant.create({ data: { name: `e2e-pilot-loop-b-${suffix}` } });

  const staffA = await systemPrisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: `pilot-staff-${suffix}@vex.dev`,
      passwordHash: "not-used-in-e2e",
      role: "STAFF",
    },
  });

  const { appraisal } = await createPublicQuickAppraisal(tenantA.id, {
    make: "McLaren",
    model: "720S",
    year: 2021,
    mileage: 3200,
  });
  assert(appraisal.tenantId === tenantA.id, "E2E FAILED: public appraisal not tenant-scoped");

  const closeResult = await updateDealDeskStatus(systemPrisma, {
    tenantId: tenantA.id,
    appraisalId: appraisal.id,
    actorUserId: staffA.id,
    status: "CLOSED",
    note: "Pilot loop close",
  });

  assert(closeResult.inventoryId != null, "E2E FAILED: close did not create inventory");
  assert(closeResult.orderId != null, "E2E FAILED: close did not create order");

  const [usage, revenueEvent, order] = await Promise.all([
    systemPrisma.usageLog.findFirst({
      where: { tenantId: tenantA.id, kind: "deal_desk_close", meta: { path: ["appraisalId"], equals: appraisal.id } },
      orderBy: { createdAt: "desc" },
    }),
    systemPrisma.eventLog.findFirst({
      where: { tenantId: tenantA.id, type: "RevenueEvent", payload: { path: ["appraisalId"], equals: appraisal.id } },
      orderBy: { createdAt: "desc" },
    }),
    systemPrisma.order.findFirst({ where: { tenantId: tenantA.id, id: closeResult.orderId ?? undefined } }),
  ]);

  assert(Boolean(usage), "E2E FAILED: missing usage billing event (deal_desk_close)");
  assert(Boolean(revenueEvent), "E2E FAILED: missing immutable RevenueEvent");
  assert(Boolean(order), "E2E FAILED: missing Order");

  const leak = await systemPrisma.appraisal.findFirst({
    where: { id: appraisal.id, tenantId: tenantB.id },
  });
  assert(!leak, "E2E FAILED: appraisal visible in wrong tenant");

  await systemPrisma.order.deleteMany({ where: { tenantId: tenantA.id } });
  await systemPrisma.inventory.deleteMany({ where: { tenantId: tenantA.id } });
  await systemPrisma.appraisal.deleteMany({ where: { tenantId: tenantA.id } });
  await systemPrisma.usageLog.deleteMany({ where: { tenantId: tenantA.id } });
  await systemPrisma.eventLog.deleteMany({ where: { tenantId: tenantA.id } });
  await systemPrisma.auditLog.deleteMany({ where: { tenantId: tenantA.id } });
  await systemPrisma.notification.deleteMany({ where: { tenantId: tenantA.id } });
  await systemPrisma.user.deleteMany({ where: { tenantId: tenantA.id } });
  await systemPrisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });

  console.log("e2e-pilot-loop: OK");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => systemPrisma.$disconnect());
