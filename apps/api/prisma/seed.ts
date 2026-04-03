import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_PASSWORD = "admin-vex-demo"; // Change in production

/**
 * US-market exotic inventory: list prices reflect typical low-mile used asking prices
 * (ballpark for private/dealer listings; not live market data). MSRP/base where noted is
 * manufacturer US MSRP when new for that model year.
 *
 * Images: Unsplash (stable CDN URLs). Photos are representative of each marque/body style;
 * they are not VIN-specific photography.
 */

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1920&q=82`;

const IMAGE = {
  ferrariRed: unsplash("photo-1542282088-fe8426682b8f"),
  ferrariRed2: unsplash("photo-1525609004556-c46c7d6cf023"),
  ferrariRed3: unsplash("photo-1492144534655-ae79c964c9d7"),
  lamboHuracan: unsplash("photo-1544636331-e34879a32020"),
  lamboHuracan2: unsplash("photo-1568605117036-5fe5e7bab0b7"),
  mclaren720: unsplash("photo-1549317661-bd32c8ce0db2"),
  mclaren720b: unsplash("photo-1552519507-da3b142c6e3d"),
  porsche911ts: unsplash("photo-1503376780353-7e6692767b70"),
  porsche911b: unsplash("photo-1580273916550-e323be2ae537"),
  astonDb11: unsplash("photo-1618843479313-40f8afb4b4d8"),
  audiR8: unsplash("photo-1605559424843-9e4c228bf1c2"),
  amgGtBlack: unsplash("photo-1592198084033-aade902d1aae"),
} as const;

/** glTF demo for 3D viewer — replace per listing with photogrammetry output URL when ready */
const LIBRARY_DEMO_GLB =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb";

type VehicleSeed = {
  make: string;
  model: string;
  trimLevel: string;
  year: number;
  /** Approximate US MSRP when new (reference) */
  basePrice: number;
  bodyType: string;
  imageUrls: string[];
};

type InventorySeed = {
  listPrice: number;
  mileage: number;
  location: string;
  vin: string;
  specs: Record<string, string | number>;
  imageUrls?: string[];
};

const CATALOG: { vehicle: VehicleSeed; inventory: InventorySeed }[] = [
  {
    vehicle: {
      make: "Ferrari",
      model: "488",
      trimLevel: "GTB",
      year: 2019,
      basePrice: 262_647,
      bodyType: "Coupe",
      imageUrls: [IMAGE.ferrariRed, IMAGE.ferrariRed2, IMAGE.ferrariRed3],
    },
    inventory: {
      listPrice: 269_900,
      mileage: 2_450,
      location: "Miami, FL",
      vin: "ZFF79ALA0K0248912",
      specs: {
        Engine: "3.9L twin-turbo V8",
        Power: "661 hp @ 8,000 rpm",
        Torque: "561 lb-ft @ 3,000 rpm",
        "0–60 mph": "3.0 s",
        Transmission: "7-speed dual-clutch",
        Drivetrain: "RWD",
        "EPA combined (ref.)": "18 mpg",
      },
    },
  },
  {
    vehicle: {
      make: "Lamborghini",
      model: "Huracán",
      trimLevel: "EVO RWD",
      year: 2022,
      basePrice: 208_571,
      bodyType: "Coupe",
      imageUrls: [IMAGE.lamboHuracan, IMAGE.lamboHuracan2],
    },
    inventory: {
      listPrice: 284_500,
      mileage: 3_180,
      location: "Los Angeles, CA",
      vin: "ZHWUF4ZF1NLA12345",
      specs: {
        Engine: "5.2L naturally aspirated V10",
        Power: "610 hp @ 8,000 rpm",
        Torque: "413 lb-ft @ 6,500 rpm",
        "0–60 mph": "3.1 s",
        Transmission: "7-speed dual-clutch",
        Drivetrain: "RWD",
      },
    },
  },
  {
    vehicle: {
      make: "McLaren",
      model: "720S",
      trimLevel: "Coupe",
      year: 2020,
      basePrice: 299_000,
      bodyType: "Coupe",
      imageUrls: [IMAGE.mclaren720, IMAGE.mclaren720b],
    },
    inventory: {
      listPrice: 264_950,
      mileage: 5_420,
      location: "Scottsdale, AZ",
      vin: "SBM14DCA5LW008421",
      specs: {
        Engine: "4.0L twin-turbo V8",
        Power: "710 hp @ 7,500 rpm",
        Torque: "568 lb-ft @ 5,500 rpm",
        "0–60 mph": "2.8 s",
        Transmission: "7-speed dual-clutch",
        Drivetrain: "RWD",
        "Dry weight (mfr.)": "~2,829 lb",
      },
    },
  },
  {
    vehicle: {
      make: "Porsche",
      model: "911",
      trimLevel: "Turbo S",
      year: 2023,
      basePrice: 230_400,
      bodyType: "Coupe",
      imageUrls: [IMAGE.porsche911ts, IMAGE.porsche911b],
    },
    inventory: {
      listPrice: 218_900,
      mileage: 1_890,
      location: "Greenwich, CT",
      vin: "WP0AB2A9XPS123456",
      specs: {
        Engine: "3.7L twin-turbo flat-6",
        Power: "640 hp",
        Torque: "590 lb-ft",
        "0–60 mph": "2.6 s (mfr.)",
        Transmission: "8-speed PDK",
        Drivetrain: "AWD",
      },
    },
  },
  {
    vehicle: {
      make: "Aston Martin",
      model: "DB11",
      trimLevel: "V12",
      year: 2021,
      basePrice: 220_000,
      bodyType: "Coupe",
      imageUrls: [IMAGE.astonDb11],
    },
    inventory: {
      listPrice: 169_500,
      mileage: 9_200,
      location: "Dallas, TX",
      vin: "SCFRMF1A1MGK11223",
      specs: {
        Engine: "5.2L twin-turbo V12",
        Power: "630 hp",
        Torque: "516 lb-ft",
        "0–60 mph": "3.5 s",
        Transmission: "8-speed automatic",
        Drivetrain: "RWD",
      },
    },
  },
  {
    vehicle: {
      make: "Audi",
      model: "R8",
      trimLevel: "V10 performance",
      year: 2022,
      basePrice: 158_600,
      bodyType: "Coupe",
      imageUrls: [IMAGE.audiR8],
    },
    inventory: {
      listPrice: 182_400,
      mileage: 3_050,
      location: "Houston, TX",
      vin: "WUAAUAFG8N7901234",
      specs: {
        Engine: "5.2L V10",
        Power: "602 hp",
        Torque: "413 lb-ft",
        "0–60 mph": "3.1 s",
        Transmission: "7-speed dual-clutch",
        Drivetrain: "AWD",
      },
    },
  },
  {
    vehicle: {
      make: "Mercedes-AMG",
      model: "GT",
      trimLevel: "Black Series",
      year: 2022,
      basePrice: 325_000,
      bodyType: "Coupe",
      imageUrls: [IMAGE.amgGtBlack],
    },
    inventory: {
      listPrice: 419_000,
      mileage: 890,
      location: "Newport Beach, CA",
      vin: "WDDYJ7KA9NA001122",
      specs: {
        Engine: "4.0L twin-turbo V8",
        Power: "720 hp",
        Torque: "590 lb-ft",
        "0–60 mph": "3.1 s",
        Transmission: "7-speed dual-clutch",
        Drivetrain: "RWD",
      },
    },
  },
  {
    vehicle: {
      make: "Ferrari",
      model: "488",
      trimLevel: "Pista",
      year: 2020,
      basePrice: 331_000,
      bodyType: "Coupe",
      imageUrls: [IMAGE.ferrariRed, IMAGE.ferrariRed2],
    },
    inventory: {
      listPrice: 438_500,
      mileage: 2_050,
      location: "Monterey, CA",
      vin: "ZFF90HJA0L0208841",
      specs: {
        Engine: "3.9L twin-turbo V8",
        Power: "710 hp @ 8,000 rpm",
        Torque: "568 lb-ft @ 3,000 rpm",
        "0–60 mph": "2.85 s",
        Transmission: "7-speed dual-clutch",
        Drivetrain: "RWD",
        "Dry weight (mfr.)": "~2,822 lb",
      },
    },
  },
];

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const demoTenant = await prisma.tenant.create({
    data: { name: "VEX Demo Tenant" },
  });

  const admin = await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: "admin@vex.demo",
      passwordHash: hash,
      role: "ADMIN",
      name: "VEX Admin",
    },
  });
  console.log("Admin user:", admin.email);

  const staff = await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: "staff@vex.demo",
      passwordHash: hash,
      role: "STAFF",
      name: "Staff User",
    },
  });
  console.log("Staff user:", staff.email);

  const reset = process.env.SEED_INVENTORY_RESET === "1";
  if (reset) {
    await prisma.savedVehicle.deleteMany();
    await prisma.shipment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.configurationOption.deleteMany();
    await prisma.vehicle.deleteMany();
    console.log("Cleared vehicles & inventory (SEED_INVENTORY_RESET=1).");
  }

  const vehicleCount = await prisma.vehicle.count();
  if (!reset && vehicleCount >= CATALOG.length) {
    console.log(
      `Vehicles already seeded (${vehicleCount}). Set SEED_INVENTORY_RESET=1 to replace catalog.`,
    );
  } else if (!reset && vehicleCount > 0) {
    console.log(
      `Found ${vehicleCount} vehicle(s) but catalog expects ${CATALOG.length}. Set SEED_INVENTORY_RESET=1 to replace without duplicating rows.`,
    );
  } else {
    for (const row of CATALOG) {
      const vehicle = await prisma.vehicle.create({
        data: {
          tenantId: demoTenant.id,
          make: row.vehicle.make,
          model: row.vehicle.model,
          trimLevel: row.vehicle.trimLevel,
          year: row.vehicle.year,
          basePrice: row.vehicle.basePrice,
          bodyType: row.vehicle.bodyType,
          imageUrls: row.vehicle.imageUrls,
          isActive: true,
        },
      });

      const invImages = row.inventory.imageUrls ?? row.vehicle.imageUrls;

      await prisma.inventory.create({
        data: {
          tenantId: demoTenant.id,
          source: "COMPANY",
          vehicleId: vehicle.id,
          location: row.inventory.location,
          listPrice: row.inventory.listPrice,
          mileage: row.inventory.mileage,
          status: "AVAILABLE",
          vin: row.inventory.vin,
          verificationStatus: "APPROVED",
          imageUrls: invImages,
          specs: row.inventory.specs as object,
          modelGlbUrl: LIBRARY_DEMO_GLB,
          modelSource: "LIBRARY",
        },
      });
    }

    const globalOptionCount = await prisma.configurationOption.count({ where: { vehicleId: null } });
    if (globalOptionCount === 0) {
      await prisma.configurationOption.createMany({
        data: [
          { tenantId: demoTenant.id, vehicleId: null, category: "TIRES", name: "Performance tire package", priceDelta: 3500, isRequired: false },
          { tenantId: demoTenant.id, vehicleId: null, category: "ACCESSORIES", name: "Ceramic coating (full body)", priceDelta: 4200, isRequired: false },
        ],
      });
    }

    console.log(`Seeded ${CATALOG.length} vehicles with US-market inventory, specs, and images.`);
  }

  const appraisalCount = await prisma.appraisal.count();
  if (appraisalCount === 0) {
    const firstInventory = await prisma.inventory.findFirst({ where: { tenantId: demoTenant.id }, orderBy: { createdAt: "asc" } });
    await prisma.appraisal.create({
      data: {
        tenantId: demoTenant.id,
        vehicleId: firstInventory?.vehicleId ?? null,
        value: 38900,
        notes: "Seeded sample valuation",
        status: "completed",
        valuationSource: "fallback",
        valuationFetchedAt: new Date(),
        valuationData: { low: 36000, avg: 38900, high: 42500, source: "seed" },
      },
    });
    console.log("Sample appraisal valuation seeded.");
  }

  const leadCount = await prisma.lead.count();
  if (leadCount === 0) {
    const lead = await prisma.lead.create({
      data: {
        tenantId: demoTenant.id,
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

  const paintOptCount = await prisma.configurationOption.count({
    where: { tenantId: demoTenant.id, category: "PAINT" },
  });
  if (paintOptCount === 0) {
    await prisma.configurationOption.createMany({
      data: [
        { tenantId: demoTenant.id, vehicleId: null, category: "PAINT", name: "Rosso corsa", priceDelta: 0, isRequired: false },
        { tenantId: demoTenant.id, vehicleId: null, category: "PAINT", name: "Nero metallic", priceDelta: 2500, isRequired: false },
        { tenantId: demoTenant.id, vehicleId: null, category: "PAINT", name: "Oro champagne", priceDelta: 4500, isRequired: false },
      ],
    });
    console.log("Seeded PAINT configuration options.");
  }

  console.log(
    "\nPilot / CI (repo root):  pnpm run ship:gate     # needs DATABASE_URL — runs test:e2e (appraisal + inventory)\n" +
      "Deployed API smoke:      PILOT_VERIFY_API_URL=https://… pnpm run pilot:verify\n" +
      "Tenant/RBAC notes:       docs/TENANT_RBAC.md\n" +
      "Ordered runbook:           docs/PILOT_SHIP.md\n",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
