import ReservationCheckout from "@/components/ReservationCheckout";

async function getReservation(id: string) {
  const base =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${base}/api/reservations/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Reservation not found");
  }

  return res.json();
}

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const reservation = await getReservation(id);

  return <ReservationCheckout reservation={reservation} />;
}