"use client";

import { useState, useEffect, useCallback } from "react";

interface ReservationDetail {
  id: string;
  quantity: number;
  status: "PENDING" | "CONFIRMED" | "RELEASED";
  expiresAt: string;
  createdAt: string;
  inventory: {
    id: string;
    product: {
      id: string;
      name: string;
      sku: string;
      imageUrl: string | null;
    };
    warehouse: {
      id: string;
      name: string;
      city: string;
    };
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${pad(s)}`;
}

export function ReservationCheckout({
  initialReservation,
}: {
  initialReservation: ReservationDetail;
}) {
  const [reservation, setReservation] = useState(initialReservation);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(
      0,
      Math.floor(
        (new Date(initialReservation.expiresAt).getTime() - Date.now()) / 1000
      )
    )
  );
  const [loading, setLoading] = useState<"confirm" | "cancel" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (reservation.status !== "PENDING") return;
    const iv = setInterval(() => {
      const s = Math.max(
        0,
        Math.floor(
          (new Date(reservation.expiresAt).getTime() - Date.now()) / 1000
        )
      );
      setSecondsLeft(s);
      if (s === 0) {
        setReservation((r) => ({ ...r, status: "RELEASED" }));
        clearInterval(iv);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [reservation.expiresAt, reservation.status]);

  const confirm = useCallback(async () => {
    setLoading("confirm");
    setActionError(null);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}/confirm`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.status === 410) {
        setActionError(data.error ?? "Reservation has expired");
        setReservation((r) => ({ ...r, status: "RELEASED" }));
        return;
      }
      if (!res.ok) {
        setActionError(data.error ?? "Something went wrong");
        return;
      }
      setReservation((r) => ({ ...r, status: data.status }));
    } catch {
      setActionError("Network error — please try again");
    } finally {
      setLoading(null);
    }
  }, [reservation.id]);

  const cancel = useCallback(async () => {
    setLoading("cancel");
    setActionError(null);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}/release`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Something went wrong");
        return;
      }
      setReservation((r) => ({ ...r, status: data.status }));
    } catch {
      setActionError("Network error — please try again");
    } finally {
      setLoading(null);
    }
  }, [reservation.id]);

  const isPending = reservation.status === "PENDING";
  const isConfirmed = reservation.status === "CONFIRMED";
  const isReleased = reservation.status === "RELEASED";

  const urgency =
    secondsLeft < 60 ? "red" : secondsLeft < 180 ? "amber" : "green";
  const urgencyColor =
    urgency === "red"
      ? "var(--red)"
      : urgency === "amber"
      ? "var(--amber)"
      : "var(--green)";
  const pct = Math.min(100, Math.round((secondsLeft / 600) * 100));

  return (
    <div className="fade-up" style={{ maxWidth: 480, margin: "0 auto" }}>
      
      <a
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--text-muted)",
          textDecoration: "none",
          fontSize: 13,
          marginBottom: 24,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.color =
            "var(--text-muted)")
        }
      >
        ← Products
      </a>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {reservation.inventory.product.imageUrl && (
          <div style={{ height: 180, background: "var(--surface-2)" }}>
            <img
              src={reservation.inventory.product.imageUrl}
              alt={reservation.inventory.product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div style={{ padding: "22px 24px" }}>
          <StatusBadge status={reservation.status} />

          <h1>{reservation.inventory.product.name}</h1>

          {isPending && (
            <div>
              <div>{formatTime(secondsLeft)}</div>
            </div>
          )}

          {isPending && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={confirm}>
                {loading === "confirm" ? "Confirming…" : "Confirm purchase"}
              </button>

              <button onClick={cancel}>
                {loading === "cancel" ? "Cancelling…" : "Cancel"}
              </button>
            </div>
          )}

          {(isConfirmed || isReleased) && (
            <a href="/">Browse products</a>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "PENDING" | "CONFIRMED" | "RELEASED";
}) {
  return <span>{status}</span>;
}