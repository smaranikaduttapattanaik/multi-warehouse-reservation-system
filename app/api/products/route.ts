import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,

      inventories: product.inventories.map((inventory) => ({
        inventoryId: inventory.id,

        warehouse: {
          id: inventory.warehouse.id,
          name: inventory.warehouse.name,
          city: inventory.warehouse.city,
        },

        totalUnits: inventory.totalUnits,
        reservedUnits: inventory.reservedUnits,

        availableUnits:
          inventory.totalUnits - inventory.reservedUnits,
      })),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}