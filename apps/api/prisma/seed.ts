import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_PASSWORD = "admin-vex-demo"; // Change in production

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@vex.demo" },
    update: {},
    create: {
      email: "admin@vex.demo",
      passwordHash: hash,
      role: "ADMIN",
      name: "VEX Admin",
    },
  });
  console.log("Admin user:", admin.email);

  const staff = await prisma.user.upsert({
    where: { email: "staff@vex.demo" },
    update: {},
    create: {
      email: "staff@vex.demo",
      passwordHash: hash,
      role: "STAFF",
      name: "Staff User",
    },
  });
  console.log("Staff user:", staff.email);

  const existingVehicles = await prisma.vehicle.count();
  if (existingVehicles >= 3) {
    console.log("Vehicles already seeded, skipping.");
  } else {
    const v1 = await prisma.vehicle.create({
      data: {
        make: "Ferrari",
        model: "488",
        trimLevel: "GTB",
        year: 2023,
        basePrice: 245_000,
        bodyType: "Coupe",
        isActive: true,
      },
    });
    const v2 = await prisma.vehicle.create({
      data: {
        make: "Lamborghini",
        model: "Huracán",
        trimLevel: "EVO",
        year: 2024,
        basePrice: 261_000,
        bodyType: "Coupe",
        isActive: true,
      },
    });
    const v3 = await prisma.vehicle.create({
      data: {
        make: "McLaren",
        model: "720S",
        trimLevel: "Coupe",
        year: 2023,
        basePrice: 285_000,
        bodyType: "Coupe",
        isActive: true,
      },
    });
    console.log("Vehicles:", v1.model, v2.model, v3.model);

    await prisma.configurationOption.createMany({
      data: [
        { vehicleId: v1.id, category: "PAINT", name: "Rosso Corsa", priceDelta: 0, isRequired: false },
        { vehicleId: v1.id, category: "PAINT", name: "Nero", priceDelta: 0, isRequired: false },
        { vehicleId: null, category: "TYRES", name: "Performance pack", priceDelta: 3_500, isRequired: false },
      ],
    });
    console.log("Configuration options created");

    await prisma.inventory.createMany({
      data: [
        { source: "COMPANY", vehicleId: v1.id, location: "London", listPrice: 248_000, mileage: 1200, status: "AVAILABLE", vin: "ZFF1234567890" },
        { source: "COMPANY", vehicleId: v2.id, location: "Manchester", listPrice: 265_000, mileage: 0, status: "AVAILABLE" },
        { source: "COMPANY", vehicleId: v3.id, location: "London", listPrice: 289_000, mileage: 500, status: "AVAILABLE" },
      ],
    });
    console.log("Inventory items created");
  }

  const leadCount = await prisma.lead.count();
  if (leadCount === 0) {
    const lead = await prisma.lead.create({
      data: {
        source: "WEBSITE",
        email: "prospect@example.com",
        name: "Sample Lead",
        vehicleInterest: "Ferrari 488",
        status: "NEW",
      },
    });
    console.log("Sample lead:", lead.id);
  } else {
    console.log("Leads already present, skipping sample lead.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
