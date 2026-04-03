/**
 * E2E: inventory row for tenant A must not be readable under tenant B's Prisma scope.
 * Run: pnpm --filter @vex/api run test:e2e:inventory
 */
import { PrismaClient } from "@prisma/client";
import { runWithTenant } from "../src/lib/tenant.js";

const prisma = new PrismaClient();
const rawPrisma = new PrismaClient();

async function main() {
  const suffix = Date.now();
  const tenantA = await prisma.tenant.create({ data: { name: `e2e-inv-a-${suffix}` } });
  const tenantB = await prisma.tenant.create({ data: { name: `e2e-inv-b-${suffix}` } });

  const vehicle = await runWithTenant(tenantA.id, async () =>
    prisma.vehicle.create({
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
    prisma.inventory.create({
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

  const cross = await rawPrisma.$queryRaw<Array<{ c: bigint }>>`
    SELECT COUNT(*)::bigint AS c FROM inventory WHERE id = ${inv.id} AND tenant_id = ${tenantB.id}
  `;
  if (Number(cross[0]?.c ?? 0) !== 0) {
    throw new Error("E2E FAILED: inventory id visible under wrong tenant_id");
  }

  const scoped = await runWithTenant(tenantB.id, async () => prisma.inventory.findFirst({ where: { id: inv.id } }));
  if (scoped != null) {
    throw new Error("E2E FAILED: tenant B Prisma scope returned tenant A inventory");
  }

  await prisma.inventory.deleteMany({ where: { id: inv.id } });
  await prisma.vehicle.deleteMany({ where: { id: vehicle.id } });
  await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });

  console.log("e2e-inventory-isolation: OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => Promise.all([prisma.$disconnect(), rawPrisma.$disconnect()]));
