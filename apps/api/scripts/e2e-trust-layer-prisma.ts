/**
 * Trust Layer (Days 1–3): proves tenant-scoped Prisma client behavior from lib/tenant.ts
 * — no ALS → throws; findUnique blocked; cross-tenant id in where still returns no rows under correct tenant ALS.
 *
 * Requires `DATABASE_URL` and a reachable Postgres (same as `pnpm --filter @vex/api run test:e2e`).
 */
import { prisma, runWithTenant, systemPrisma } from "../src/lib/tenant.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const [noCtxResult] = await Promise.allSettled([prisma.vehicle.findMany({ take: 1 })]);
  assert(noCtxResult.status === "rejected", "E2E FAILED: prisma without ALS must reject");
  const err0 = noCtxResult.status === "rejected" ? noCtxResult.reason : null;
  const msg0 = err0 instanceof Error ? err0.message : String(err0);
  assert(
    msg0.includes("Tenant context missing"),
    `E2E FAILED: expected missing-tenant error, got: ${msg0}`
  );

  const suffix = Date.now();
  const tenantA = await systemPrisma.tenant.create({ data: { name: `trust-a-${suffix}` } });
  const tenantB = await systemPrisma.tenant.create({ data: { name: `trust-b-${suffix}` } });

  const vehicleB = await systemPrisma.vehicle.create({
    data: {
      tenantId: tenantB.id,
      make: "Iso",
      model: "B",
      trimLevel: "X",
      year: 2024,
      basePrice: 90000,
      bodyType: "COUPE",
      isActive: true,
    },
  });

  const scopedEmpty = await runWithTenant(tenantA.id, async () =>
    prisma.vehicle.findMany({ where: { id: vehicleB.id } })
  );
  assert(scopedEmpty.length === 0, "E2E FAILED: tenant A ALS must not return tenant B vehicle by id");

  const [uniqueResult] = await Promise.allSettled([
    runWithTenant(tenantA.id, async () => prisma.vehicle.findUnique({ where: { id: vehicleB.id } })),
  ]);
  assert(uniqueResult.status === "rejected", "E2E FAILED: findUnique must be rejected by tenant prisma middleware");
  const errU = uniqueResult.status === "rejected" ? uniqueResult.reason : null;
  const msgU = errU instanceof Error ? errU.message : String(errU);
  assert(msgU.includes("Unsafe Prisma action"), `E2E FAILED: findUnique block message wrong, got: ${msgU}`);

  await systemPrisma.vehicle.deleteMany({ where: { id: vehicleB.id } });
  await systemPrisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });

  console.log("e2e-trust-layer-prisma: OK");
}

main()
  .catch((e) => {
    const msg = e instanceof Error ? e.message : String(e);
    if (/P1001|ECONNREFUSED|connect/i.test(msg)) {
      console.error(
        "e2e-trust-layer-prisma: cannot reach Postgres at DATABASE_URL — start local Postgres or point DATABASE_URL at a running instance."
      );
    }
    console.error(e);
    process.exit(1);
  })
  .finally(() => systemPrisma.$disconnect());
