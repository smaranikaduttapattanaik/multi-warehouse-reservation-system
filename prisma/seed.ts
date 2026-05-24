import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.idempotencyRecord.deleteMany();

  const warehouses = await prisma.warehouse.createManyAndReturn({
    data: [
      {
        name: "Mumbai Warehouse",
        city: "Mumbai",
      },
      {
        name: "Delhi Warehouse",
        city: "Delhi",
      },
      {
        name: "Bangalore Warehouse",
        city: "Bangalore",
      },
    ],
  });

  const products = await prisma.product.createManyAndReturn({
    data: [
      {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard",
        price: 4999,
      },
      {
        name: "Gaming Mouse",
        description: "Wireless gaming mouse",
        price: 2499,
      },
      {
        name: "Monitor",
        description: "27-inch 144Hz monitor",
        price: 18999,
      },
      {
        name: "Laptop Stand",
        description: "Adjustable aluminum stand",
        price: 1499,
      },
      {
        name: "USB-C Hub",
        description: "7-in-1 USB-C hub",
        price: 2999,
      },
    ],
  });

  const keyboard = products[0];
  const mouse = products[1];
  const monitor = products[2];
  const stand = products[3];
  const hub = products[4];

  const mumbai = warehouses[0];
  const delhi = warehouses[1];
  const bangalore = warehouses[2];

  await prisma.inventory.createMany({
    data: [
      {
        productId: keyboard.id,
        warehouseId: mumbai.id,
        totalUnits: 1,
      },
      {
        productId: keyboard.id,
        warehouseId: delhi.id,
        totalUnits: 5,
      },
      {
        productId: mouse.id,
        warehouseId: mumbai.id,
        totalUnits: 10,
      },
      {
        productId: mouse.id,
        warehouseId: bangalore.id,
        totalUnits: 3,
      },
      {
        productId: monitor.id,
        warehouseId: delhi.id,
        totalUnits: 2,
      },
      {
        productId: monitor.id,
        warehouseId: bangalore.id,
        totalUnits: 1,
      },
      {
        productId: stand.id,
        warehouseId: mumbai.id,
        totalUnits: 15,
      },
      {
        productId: stand.id,
        warehouseId: delhi.id,
        totalUnits: 12,
      },
      {
        productId: hub.id,
        warehouseId: bangalore.id,
        totalUnits: 0,
      },
    ],
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });