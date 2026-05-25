import { ReservationCheckout } from "@/components/ReservationCheckout";

export interface ReservationDetail {
  id: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "RELEASED";
  expiresAt: string;
  createdAt: string;
  inventory: {
    id: string;
    product: { id: string; name: string; sku: string; imageUrl: string | null };
    warehouse: { id: string; name: string; city: string };
  };
}

async function getReservation(id: string): Promise<ReservationDetail | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/reservations/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load reservation");
  return res.json();
}

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let reservation: ReservationDetail | null = null;
  let fetchError: string | null = null;

  try {
    reservation = await getReservation(id);
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Unknown error";
  }

  if (fetchError) {
    return (
      <div style={{
        background: "var(--red-dim)",
        border: "1px solid var(--red)",
        borderRadius: 10,
        padding: "14px 18px",
        color: "var(--red)",
        fontSize: 13,
      }}>
        {fetchError}
      </div>
    );
  }

  if (!reservation) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
          Reservation not found
        </div>
        <a href="/" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>
          ← Back to products
        </a>
      </div>
    );
  }

  return <ReservationCheckout initialReservation={reservation} />;
}