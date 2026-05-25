import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createReservationSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = createReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const { inventoryId, quantity } = parsed.data;

    const result = await prisma.$transaction(
      async (tx) => {
        const inventoryRows = await tx.$queryRaw<
          {
            id: string;
            totalUnits: number;
            reservedUnits: number;
          }[]
        >`
          SELECT *
          FROM "Inventory"
          WHERE id = ${inventoryId}
          FOR UPDATE
        `;

        const inventory = inventoryRows[0];

        if (!inventory) {
          throw new Error("Inventory not found");
        }

        const availableUnits =
          inventory.totalUnits - inventory.reservedUnits;

        if (availableUnits < quantity) {
          return {
            error: "Not enough stock available",
            status: 409,
          };
        }

        await tx.inventory.update({
          where: {
            id: inventoryId,
          },
          data: {
            reservedUnits: {
              increment: quantity,
            },
          },
        });

        const expiresAt = new Date(
          Date.now() + 2 * 60 * 1000
        );

        const reservation =
          await tx.reservation.create({
            data: {
              inventoryId,
              quantity,
              expiresAt,
            },
          });

        return {
          reservation,
          status: 201,
        };
      },
    );

    if ("error" in result) {
      return NextResponse.json(
        {
          error: result.error,
        },
        {
          status: result.status,
        }
      );
    }

    return NextResponse.json(result.reservation, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create reservation",
      },
      {
        status: 500,
      }
    );
  }
}