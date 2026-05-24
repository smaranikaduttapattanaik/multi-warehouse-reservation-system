import { prisma } from "@/lib/prisma";

export async function releaseExpiredReservations() {
  const expiredReservations =
    await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
    });

  for (const reservation of expiredReservations) {
    await prisma.$transaction(async (tx) => {
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

      await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "EXPIRED",
        },
      });
    });
  }

  return {
    releasedCount: expiredReservations.length,
  };
}