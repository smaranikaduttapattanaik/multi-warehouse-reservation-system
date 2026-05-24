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

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id,
        },
      });

    if (!reservation) {
      return NextResponse.json(
        {
          error: "Reservation not found",
        },
        {
          status: 404,
        }
      );
    }

    if (reservation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: "Reservation cannot be confirmed",
        },
        {
          status: 400,
        }
      );
    }

    if (new Date() > reservation.expiresAt) {
      return NextResponse.json(
        {
          error: "Reservation expired",
        },
        {
          status: 400,
        }
      );
    }

    const updatedReservation =
      await prisma.reservation.update({
        where: {
          id,
        },
        data: {
          status: "CONFIRMED",
        },
      });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to confirm reservation",
      },
      {
        status: 500,
      }
    );
  }
}