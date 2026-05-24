import { NextRequest, NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/expiry";

export async function GET(req: NextRequest) {
  try {
    const authHeader =
      req.headers.get("authorization");

    const expected =
      `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expected) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const result =
      await releaseExpiredReservations();

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to release expired reservations",
      },
      {
        status: 500,
      }
    );
  }
}