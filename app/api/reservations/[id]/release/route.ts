import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{
  id: string;
}>;

export async function POST(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(
      async (tx) => {
        const reservation =
          await tx.reservation.findUnique({
            where: {
              id,
            },
          });

        if (!reservation) {
          return {
            error: "Reservation not found",
            status: 404,
          };
        }

        if (reservation.status !== "PENDING") {
          return {
            error:
              "Only pending reservations can be released",
            status: 400,
          };
        }

        await tx.inventory.update({
          where: {
            id: reservation.inventoryId,
          },
          data: {
            reservedUnits: {
              decrement: reservation.quantity,
            },
          },
        });

        const updatedReservation =
          await tx.reservation.update({
            where: {
              id,
            },
            data: {
              status: "RELEASED",
            },
          });

        return {
          reservation: updatedReservation,
          status: 200,
        };
      }
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

    return NextResponse.json(result.reservation);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to release reservation",
      },
      {
        status: 500,
      }
    );
  }
}