import { systemPrisma } from "../src/lib/tenant.js";
import { addAppraisalToInventory, updateDealDeskStatus } from "../src/services/dealDeskService.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  await systemPrisma.$executeRawUnsafe(
    "ALTER TYPE \"InventorySource\" ADD VALUE IF NOT EXISTS 'APPRAISAL'"
  );

  const suffix = Date.now();
  const tenantA = await systemPrisma.tenant.create({ data: { name: `e2e-dealer-a-${suffix}` } });
  const tenantB = await systemPrisma.tenant.create({ data: { name: `e2e-dealer-b-${suffix}` } });

  const [staffA, staffB] = await Promise.all([
    systemPrisma.user.create({
      data: {
        tenantId: tenantA.id,
        email: `staff-a-${suffix}@vex.dev`,
        passwordHash: "not-used-in-e2e",
        role: "STAFF",
      },
    }),
    systemPrisma.user.create({
      data: {
        tenantId: tenantB.id,
        email: `staff-b-${suffix}@vex.dev`,
        passwordHash: "not-used-in-e2e",
        role: "STAFF",
      },
    }),
  ]);

  const customerA = await systemPrisma.customer.create({
    data: {
      tenantId: tenantA.id,
      name: "Dealer Customer",
      email: `customer-${suffix}@vex.dev`,
    },
  });

  const appraisalA = await systemPrisma.appraisal.create({
    data: {
      tenantId: tenantA.id,
      customerId: customerA.id,
      status: "open",
      value: 125000,
      notes: JSON.stringify({ make: "Porsche", model: "911 Turbo S", year: 2022 }),
    },
  });

  const inventory = await addAppraisalToInventory(systemPrisma, {
    tenantId: tenantA.id,
    appraisalId: appraisalA.id,
    actorUserId: staffA.id,
  });
  assert(inventory.tenantId === tenantA.id, "E2E FAILED: inventory tenant mismatch");
  assert(inventory.source === "APPRAISAL", "E2E FAILED: appraisal inventory source not set");

  const closeResult = await updateDealDeskStatus(systemPrisma, {
    tenantId: tenantA.id,
    appraisalId: appraisalA.id,
    actorUserId: staffA.id,
    status: "CLOSED",
    note: "Closed as a dealer deal",
  });

  assert(closeResult.inventoryId != null, "E2E FAILED: close did not return inventoryId");
  assert(closeResult.orderId != null, "E2E FAILED: close did not create deal order");

  const [usage, revenueEvent, order, closedAppraisal] = await Promise.all([
    systemPrisma.usageLog.findFirst({
      where: { tenantId: tenantA.id, kind: "erp_order_create", meta: { path: ["appraisalId"], equals: appraisalA.id } },
      orderBy: { createdAt: "desc" },
    }),
    systemPrisma.eventLog.findFirst({
      where: { tenantId: tenantA.id, type: "RevenueEvent", payload: { path: ["appraisalId"], equals: appraisalA.id } },
      orderBy: { createdAt: "desc" },
    }),
    systemPrisma.order.findFirst({
      where: { tenantId: tenantA.id, id: closeResult.orderId ?? undefined },
    }),
    systemPrisma.appraisal.findFirst({
      where: { tenantId: tenantA.id, id: appraisalA.id },
      select: { status: true },
    }),
  ]);

  assert(Boolean(usage), "E2E FAILED: missing usage billing event for close");
  assert(Boolean(revenueEvent), "E2E FAILED: missing immutable RevenueEvent");
  assert(Boolean(order), "E2E FAILED: missing deal order");
  assert(closedAppraisal?.status === "closed", "E2E FAILED: appraisal not set to closed");

  const tenantBLeak = await systemPrisma.inventory.findFirst({
    where: { tenantId: tenantB.id, id: closeResult.inventoryId ?? undefined },
  });
  assert(!tenantBLeak, "E2E FAILED: cross-tenant inventory leakage detected");

  await systemPrisma.order.deleteMany({ where: { tenantId: tenantA.id, id: closeResult.orderId ?? undefined } });
  await systemPrisma.inventory.deleteMany({ where: { tenantId: tenantA.id, id: closeResult.inventoryId ?? undefined } });
  await systemPrisma.appraisal.deleteMany({ where: { tenantId: tenantA.id, id: appraisalA.id } });
  await systemPrisma.customer.deleteMany({ where: { id: customerA.id } });
  await systemPrisma.user.deleteMany({ where: { id: { in: [staffA.id, staffB.id] } } });
  await systemPrisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });

  console.log("e2e-dealer-integration: OK");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => systemPrisma.$disconnect());
