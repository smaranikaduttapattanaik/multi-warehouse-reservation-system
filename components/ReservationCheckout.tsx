"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Reservation {
  id: string;
  quantity: number;
  status: string;
  expiresAt: string;

  inventory: {
    product: {
      name: string;
      description: string;
      price: number;
    };

    warehouse: {
      name: string;
      city: string;
    };
  };
}

interface Props {
  reservation: Reservation;
}

export default function ReservationCheckout({ reservation }: Props) {
  const router = useRouter();

  const [status, setStatus] = useState(reservation.status);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Countdown timer
  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const expiry = new Date(reservation.expiresAt).getTime();

      const diff = Math.max(0, Math.floor((expiry - now) / 1000));

      setSecondsLeft(diff);

      if (diff <= 0 && status === "PENDING") {
        setStatus("EXPIRED");

        fetch(`/api/reservations/${reservation.id}/release`, {
          method: "POST",
        })
          .then(() => {
            router.refresh();
          })
          .catch(console.error);
      }
    };

    calculateTime();

    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [reservation.expiresAt, status]);

  // Auto refresh every 5 sec
  useEffect(() => {
  if (status !== "PENDING") return;

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`);

      if (!res.ok) return;

      const data = await res.json();

      setStatus(data.status);

      router.refresh();
    } catch (err) {
      console.error(err);
    }
  }, 5000);

  return () => clearInterval(interval);
}, [reservation.id, router, status]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  async function confirmReservation() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/reservations/${reservation.id}/confirm`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        alert("Failed to confirm reservation");
        return;
      }

      setStatus("CONFIRMED");

      router.refresh();
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function cancelReservation() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/reservations/${reservation.id}/release`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        alert("Failed to cancel reservation");
        return;
      }

      setStatus("RELEASED");

      router.refresh();
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#05060a",
        color: "white",
        padding: 32,
      }}
    >
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          background: "#11131a",
          border: "1px solid #232533",
          borderRadius: 24,
          padding: 32,
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Reservation Checkout
        </h1>

        <p
          style={{
            color: "#8b90a7",
            marginBottom: 32,
          }}
        >
          Complete your reservation before expiry.
        </p>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>
            {reservation.inventory.product.name}
          </h2>

          <p
            style={{
              color: "#8b90a7",
              marginTop: 8,
            }}
          >
            {reservation.inventory.product.description}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <span style={{ color: "#8b90a7" }}>Warehouse:</span>{" "}
            {reservation.inventory.warehouse.name}
          </div>

          <div>
            <span style={{ color: "#8b90a7" }}>City:</span>{" "}
            {reservation.inventory.warehouse.city}
          </div>

          <div>
            <span style={{ color: "#8b90a7" }}>Quantity:</span>{" "}
            {reservation.quantity}
          </div>

          <div>
            <span style={{ color: "#8b90a7" }}>Price:</span> ₹
            {reservation.inventory.product.price}
          </div>

          <div>
            <span style={{ color: "#8b90a7" }}>Status:</span>{" "}
            <span
              style={{
                color:
                  status === "CONFIRMED"
                    ? "#22c55e"
                    : status === "EXPIRED"
                    ? "#ef4444"
                    : status === "RELEASED"
                    ? "#f97316"
                    : "#eab308",
                fontWeight: 700,
              }}
            >
              {status}
            </span>
          </div>
        </div>

        {status === "PENDING" && (
          <>
            <div
              style={{
                background: "#181c26",
                padding: 20,
                borderRadius: 16,
                marginBottom: 24,
                border: "1px solid #2a3040",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  color: "#8b90a7",
                  marginBottom: 8,
                }}
              >
                Reservation expires in
              </div>

              <div
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  color: "#facc15",
                }}
              >
                {formattedTime}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 16,
              }}
            >
              <button
                onClick={confirmReservation}
                disabled={loading}
                style={{
                  flex: 1,
                  background: "#6366f1",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  padding: "16px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {loading ? "Processing..." : "Confirm Reservation"}
              </button>

              <button
                onClick={cancelReservation}
                disabled={loading}
                style={{
                  flex: 1,
                  background: "#1f2937",
                  color: "white",
                  border: "1px solid #374151",
                  borderRadius: 14,
                  padding: "16px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel Reservation
              </button>
            </div>
          </>
        )}

        {status === "CONFIRMED" && (
          <div
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)",
              padding: 24,
              borderRadius: 16,
              color: "#22c55e",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            ✅ Reservation Confirmed Successfully
          </div>
        )}
        <div
          style={{
            marginTop: 32,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              background: "#1f2937",
              color: "white",
              border: "1px solid #374151",
              borderRadius: 14,
              padding: "14px 20px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ← Back to Products
          </button>
        </div>
        {status === "EXPIRED" && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              padding: 24,
              borderRadius: 16,
              color: "#ef4444",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            ❌ Reservation Expired
          </div>
        )}

        {status === "RELEASED" && (
          <div
            style={{
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.3)",
              padding: 24,
              borderRadius: 16,
              color: "#f97316",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            ↩ Reservation Cancelled & Stock Restored
          </div>
        )}
      </div>
    </div>
  );
}