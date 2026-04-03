/**
 * E2E: inventory row for tenant A must not be readable under tenant B's scoped Prisma client.
 * Run: pnpm --filter @vex/api run test:e2e:inventory
 */
import { prisma as tenantPrisma, runWithTenant, systemPrisma } from "../src/lib/tenant.js";

async function main() {
  const suffix = Date.now();
  const tenantA = await systemPrisma.tenant.create({ data: { name: `e2e-inv-a-${suffix}` } });
  const tenantB = await systemPrisma.tenant.create({ data: { name: `e2e-inv-b-${suffix}` } });

  const vehicle = await runWithTenant(tenantA.id, async () =>
    tenantPrisma.vehicle.create({
      data: {
        tenantId: tenantA.id,
        make: "Test",
        model: "Isolation",
        trimLevel: "Base",
        year: 2024,
        basePrice: 100000,
        bodyType: "COUPE",
        isActive: true,
      },
    })
  );

  const inv = await runWithTenant(tenantA.id, async () =>
    tenantPrisma.inventory.create({
      data: {
        tenantId: tenantA.id,
        source: "COMPANY",
        vehicleId: vehicle.id,
        listPrice: 99000,
        mileage: 100,
        status: "AVAILABLE",
      },
    })
  );

  const cross = await systemPrisma.$queryRaw<Array<{ c: bigint }>>`
    SELECT COUNT(*)::bigint AS c FROM inventory WHERE id = ${inv.id} AND tenant_id = ${tenantB.id}
  `;
  if (Number(cross[0]?.c ?? 0) !== 0) {
    throw new Error("E2E FAILED: inventory id visible under wrong tenant_id");
  }

  const scoped = await runWithTenant(tenantB.id, async () =>
    tenantPrisma.inventory.findFirst({ where: { id: inv.id } })
  );
  if (scoped != null) {
    throw new Error("E2E FAILED: tenant B Prisma scope returned tenant A inventory");
  }

  await systemPrisma.inventory.deleteMany({ where: { id: inv.id } });
  await systemPrisma.vehicle.deleteMany({ where: { id: vehicle.id } });
  await systemPrisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });

  console.log("e2e-inventory-isolation: OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => Promise.all([tenantPrisma.$disconnect(), systemPrisma.$disconnect()]));
