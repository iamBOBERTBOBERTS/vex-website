/**
 * Minimal pilot loop (data plane, mirrors CRM + API contract):
 * - Public intake: createPublicAppraisal → usage PUBLIC_APPRAISAL + RevenueEvent public_appraisal_submitted + audit PUBLIC_APPRAISAL_CREATED
 * - Dealer list semantics: newest row first, JSON notes carry VIN / mileage / condition / customer notes / image URLs for CRM columns + detail
 * - Dealer Close: POST /dealer/appraisals/:id/status equivalent → single DB transaction: ERP Order + Invoice + Inventory + erp_order_create usage
 *   + RevenueEvent + erp.invoice.issued + DEAL_DESK_UPDATE audit + DEAL_DESK notification + no cross-tenant leakage
 * (CRM UI: 15s poll, banner, skeletons — not driven by Playwright here.)
 */
import { systemPrisma } from "../src/lib/tenant.js";
import { createPublicQuickAppraisal } from "../src/lib/appraisalService.js";
import { updateDealDeskStatus } from "../src/services/dealDeskService.js";
import { listErpInvoices } from "../src/services/erpService.js";

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

  const pilotVin = "JM1BK32F581235892";
  const pilotNote = "Pilot list notes preview for CRM truncation/tooltip";
  const pilotImage = "https://example.com/e2e-pilot-photo.jpg";

  const { appraisal } = await createPublicQuickAppraisal(tenantA.id, {
    vin: pilotVin,
    mileage: 3200,
    condition: "good",
    notes: pilotNote,
    images: [pilotImage],
  });
  assert(appraisal.tenantId === tenantA.id, "E2E FAILED: public appraisal not tenant-scoped");

  const notesPayload = JSON.parse(appraisal.notes ?? "{}") as {
    source?: string;
    vin?: string;
    mileage?: number;
    condition?: string;
    notes?: string;
    images?: string[];
  };
  assert(notesPayload.source === "public_quick_appraisal", "E2E FAILED: CRM label source must be public_quick_appraisal");
  assert(notesPayload.mileage === 3200, "E2E FAILED: public notes mileage mismatch for list/detail labels");
  assert(notesPayload.condition === "good", "E2E FAILED: public notes condition mismatch");
  assert(notesPayload.vin === pilotVin, "E2E FAILED: VIN must round-trip in notes for deal desk VIN column");
  assert(notesPayload.notes === pilotNote, "E2E FAILED: customer notes must round-trip for CRM notes column");
  assert(Array.isArray(notesPayload.images) && notesPayload.images[0] === pilotImage, "E2E FAILED: image URLs must round-trip for CRM thumbnails");

  const publicUsage = await systemPrisma.usageLog.findFirst({
    where: {
      tenantId: tenantA.id,
      kind: "PUBLIC_APPRAISAL",
      meta: { path: ["appraisalId"], equals: appraisal.id },
    },
    orderBy: { createdAt: "desc" },
  });
  assert(Boolean(publicUsage), "E2E FAILED: PUBLIC_APPRAISAL usage log missing after public submit");

  const publicAudit = await systemPrisma.auditLog.findFirst({
    where: {
      tenantId: tenantA.id,
      action: "PUBLIC_APPRAISAL_CREATED",
      entityId: appraisal.id,
    },
    orderBy: { createdAt: "desc" },
  });
  assert(Boolean(publicAudit), "E2E FAILED: PUBLIC_APPRAISAL_CREATED audit missing after public submit");

  const submitRevenue = await systemPrisma.eventLog.findFirst({
    where: {
      tenantId: tenantA.id,
      type: "RevenueEvent",
      payload: { path: ["appraisalId"], equals: appraisal.id },
    },
    orderBy: { createdAt: "asc" },
  });
  const subPayload = submitRevenue?.payload as { event?: string } | null;
  assert(subPayload?.event === "public_appraisal_submitted", "E2E FAILED: public submit RevenueEvent missing or wrong shape");

  const listForTenant = await systemPrisma.appraisal.findMany({
    where: { tenantId: tenantA.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  assert(listForTenant.some((r) => r.id === appraisal.id), "E2E FAILED: CRM-style list must include public appraisal");
  assert(listForTenant[0]?.id === appraisal.id, "E2E FAILED: newest appraisal must sort first like GET /dealer/appraisals for immediate queue visibility");

  const closeResult = await updateDealDeskStatus(systemPrisma, {
    tenantId: tenantA.id,
    appraisalId: appraisal.id,
    actorUserId: staffA.id,
    status: "CLOSED",
    note: "Pilot loop close",
  });

  assert(closeResult.inventoryId != null, "E2E FAILED: close did not create inventory");
  assert(closeResult.orderId != null, "E2E FAILED: close did not create order");
  assert(closeResult.invoiceNumber != null && closeResult.invoiceNumber.length > 0, "E2E FAILED: invoice number missing from close");

  const [usageErp, revenueErp, invoiceIssued, order, inventoryRow] = await Promise.all([
    systemPrisma.usageLog.findFirst({
      where: { tenantId: tenantA.id, kind: "erp_order_create", meta: { path: ["appraisalId"], equals: appraisal.id } },
      orderBy: { createdAt: "desc" },
    }),
    systemPrisma.eventLog.findFirst({
      where: {
        tenantId: tenantA.id,
        type: "RevenueEvent",
        payload: { path: ["appraisalId"], equals: appraisal.id },
      },
      orderBy: { createdAt: "desc" },
    }),
    systemPrisma.eventLog.findFirst({
      where: {
        tenantId: tenantA.id,
        type: "erp.invoice.issued",
        payload: { path: ["appraisalId"], equals: appraisal.id },
      },
      orderBy: { createdAt: "desc" },
    }),
    systemPrisma.order.findFirst({ where: { tenantId: tenantA.id, id: closeResult.orderId ?? undefined } }),
    systemPrisma.inventory.findFirst({ where: { tenantId: tenantA.id, id: closeResult.inventoryId ?? undefined } }),
  ]);

  assert(Boolean(usageErp), "E2E FAILED: missing ERP usage billing (erp_order_create)");
  assert(Boolean(revenueErp), "E2E FAILED: missing RevenueEvent from ERP close");
  assert(Boolean(invoiceIssued), "E2E FAILED: missing erp.invoice.issued event");
  assert(Boolean(order), "E2E FAILED: missing Order");
  assert(Boolean(inventoryRow), "E2E FAILED: missing Inventory row");

  const dealDeskAudit = await systemPrisma.auditLog.findFirst({
    where: {
      tenantId: tenantA.id,
      action: "DEAL_DESK_UPDATE",
      entityId: appraisal.id,
    },
    orderBy: { createdAt: "desc" },
  });
  assert(Boolean(dealDeskAudit), "E2E FAILED: DEAL_DESK_UPDATE audit log missing after close");
  const deskPayload = dealDeskAudit?.payload as { note?: string } | null;
  assert(deskPayload?.note === "Pilot loop close", "E2E FAILED: close note not persisted on DEAL_DESK_UPDATE audit");

  const inAppNotify = await systemPrisma.notification.findFirst({
    where: { tenantId: tenantA.id, userId: staffA.id, type: "DEAL_DESK" },
    orderBy: { createdAt: "desc" },
  });
  assert(Boolean(inAppNotify), "E2E FAILED: DEAL_DESK in-app notification row missing after close");

  const invoices = await listErpInvoices(systemPrisma, tenantA.id);
  assert(invoices.some((inv) => inv.orderId === closeResult.orderId), "E2E FAILED: ERP invoice list missing closed order");

  const leak = await systemPrisma.appraisal.findFirst({
    where: { id: appraisal.id, tenantId: tenantB.id },
  });
  assert(!leak, "E2E FAILED: appraisal visible in wrong tenant");

  const leakOrder = await systemPrisma.order.findFirst({
    where: { id: closeResult.orderId ?? "", tenantId: tenantB.id },
  });
  assert(!leakOrder, "E2E FAILED: order leaked to wrong tenant");

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
