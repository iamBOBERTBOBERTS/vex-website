import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { app } from "../src/app.js";

const prisma = new PrismaClient();

/**
 * Proves a JWT for tenant A cannot read tenant B inventory by id (404, not data leak).
 */
async function main() {
  const jwtSecret = process.env.JWT_SECRET || "test-secret-for-e2e-isolation";
  process.env.JWT_SECRET = jwtSecret;

  const suffix = Date.now();
  const tenantA = await prisma.tenant.create({ data: { name: `iso-a-${suffix}` } });
  const tenantB = await prisma.tenant.create({ data: { name: `iso-b-${suffix}` } });

  const vehicleB = await prisma.vehicle.create({
    data: {
      tenantId: tenantB.id,
      make: "Other",
      model: "Car",
      trimLevel: "Base",
      year: 2024,
      basePrice: 50000,
    },
  });

  const invB = await prisma.inventory.create({
    data: {
      tenantId: tenantB.id,
      source: "COMPANY",
      vehicleId: vehicleB.id,
      listPrice: 50000,
      status: "AVAILABLE",
    },
  });

  const userA = await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      email: `iso-a-user-${suffix}@example.com`,
      passwordHash: "x",
      role: "CUSTOMER",
    },
  });

  const tokenA = jwt.sign(
    { userId: userA.id, email: userA.email, role: userA.role, tenantId: tenantA.id },
    jwtSecret,
    { expiresIn: "15m" }
  );

  const server = app.listen(0, "127.0.0.1");
  try {
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to bind test server");
    }
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const res = await fetch(`${baseUrl}/inventory/${invB.id}`, {
      headers: { authorization: `Bearer ${tokenA}`, accept: "application/json" },
    });
    if (res.status !== 404) {
      const text = await res.text();
      throw new Error(`Expected 404 for cross-tenant inventory read, got ${res.status}: ${text.slice(0, 200)}`);
    }

    console.log("e2e-tenant-isolation: OK");
  } finally {
    server.close();
    await prisma.inventory.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id] } } });
    await prisma.vehicle.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id] } } });
    await prisma.user.deleteMany({ where: { id: userA.id } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
