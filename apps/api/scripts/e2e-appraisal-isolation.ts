/**
 * End-to-end: create appraisal for tenant A; verify no DB row exists with same id scoped to tenant B.
 * Run: pnpm --filter @vex/api run test:e2e:appraisal
 *
 * Uses `systemPrisma` for bootstrap + raw SQL; `prisma` (tenant-scoped) inside `runWithTenant` for app paths.
 */
import { prisma as tenantPrisma, runWithTenant, systemPrisma } from "../src/lib/tenant.js";

async function main() {
  const suffix = Date.now();
  const tenantA = await systemPrisma.tenant.create({ data: { name: `e2e-a-${suffix}` } });
  const tenantB = await systemPrisma.tenant.create({ data: { name: `e2e-b-${suffix}` } });

  const appraisal = await runWithTenant(tenantA.id, async () =>
    tenantPrisma.appraisal.create({
      data: {
        tenantId: tenantA.id,
        status: "pending",
      },
    })
  );

  const row = await systemPrisma.appraisal.findUnique({ where: { id: appraisal.id } });
  if (row?.tenantId !== tenantA.id) {
    throw new Error(`E2E: expected appraisal tenant ${tenantA.id}, got ${row?.tenantId ?? "null"}`);
  }

  const cross = await systemPrisma.$queryRaw<Array<{ c: bigint }>>`
    SELECT COUNT(*)::bigint AS c FROM appraisals WHERE id = ${appraisal.id} AND tenant_id = ${tenantB.id}
  `;
  if (Number(cross[0]?.c ?? 0) !== 0) {
    throw new Error("E2E FAILED: SQL found appraisal id under wrong tenant");
  }

  const sameTenant = await systemPrisma.$queryRaw<Array<{ c: bigint }>>`
    SELECT COUNT(*)::bigint AS c FROM appraisals WHERE id = ${appraisal.id} AND tenant_id = ${tenantA.id}
  `;
  if (Number(sameTenant[0]?.c ?? 0) !== 1) {
    throw new Error("E2E FAILED: appraisal row missing for owning tenant");
  }

  await systemPrisma.appraisal.deleteMany({ where: { id: appraisal.id } });
  await systemPrisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });

  console.log("e2e-appraisal-isolation: OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => Promise.all([tenantPrisma.$disconnect(), systemPrisma.$disconnect()]));
