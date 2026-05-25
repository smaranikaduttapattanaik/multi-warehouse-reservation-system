"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface InventoryEntry {
  inventoryId: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
  warehouse: {
    id: string;
    name: string;
    city: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  imageUrl: string | null;
  inventories: InventoryEntry[];
}

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalAvailable = product.inventories.reduce(
    (sum, inv) => sum + inv.availableUnits,
    0
  );

  const stockStatus =
    totalAvailable === 0
      ? "out"
      : totalAvailable <= 3
      ? "low"
      : "ok";

  async function reserve(inv: InventoryEntry) {
    if (inv.availableUnits === 0 || loadingId) return;

    setLoadingId(inv.inventoryId);
    setError(null);

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventoryId: inv.inventoryId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setError(data.error ?? "Not enough stock available");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push(`/reservations/${data.id}`);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div
      style={{
        background: "#12121a",
        border: "1px solid #26263a",
        borderRadius: 20,
        padding: 22,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "white",
              marginBottom: 8,
            }}
          >
            {product.name}
          </h2>

          <p
            style={{
              color: "#8b8ba7",
              fontSize: 15,
            }}
          >
            {product.description}
          </p>
        </div>

        <div
          style={{
            background:
              stockStatus === "ok"
                ? "rgba(34,197,94,0.12)"
                : stockStatus === "low"
                ? "rgba(251,191,36,0.12)"
                : "rgba(239,68,68,0.12)",

            color:
              stockStatus === "ok"
                ? "#22c55e"
                : stockStatus === "low"
                ? "#fbbf24"
                : "#ef4444",

            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {totalAvailable > 0
            ? `${totalAvailable} avail.`
            : "out of stock"}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444",
            padding: "10px 14px",
            borderRadius: 12,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Warehouses */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {product.inventories.map((inv) => (
          <div
            key={inv.inventoryId}
            style={{
              border: "1px solid #2a2a3d",
              borderRadius: 16,
              padding: 16,
              background: "#171722",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    color: "white",
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  {inv.warehouse.name}
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: 120,
                    height: 6,
                    background: "#2f2f46",
                    borderRadius: 999,
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width:
                        inv.totalUnits > 0
                          ? `${
                              (inv.availableUnits / inv.totalUnits) * 100
                            }%`
                          : "0%",

                      height: "100%",
                      background:
                        inv.availableUnits > 3
                          ? "#22c55e"
                          : inv.availableUnits > 0
                          ? "#fbbf24"
                          : "#ef4444",
                    }}
                  />
                </div>

                <div
                  style={{
                    color: "#8d8dac",
                    fontSize: 14,
                  }}
                >
                  {inv.availableUnits}/{inv.totalUnits}{" "}
                  {inv.warehouse.city}
                </div>
              </div>

              {inv.availableUnits > 0 ? (
                <button
                  onClick={() => reserve(inv)}
                  disabled={loadingId === inv.inventoryId}
                  style={{
                    background: "#6366f1",
                    color: "white",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity:
                      loadingId === inv.inventoryId ? 0.7 : 1,
                  }}
                >
                  {loadingId === inv.inventoryId
                    ? "Loading..."
                    : "Reserve"}
                </button>
              ) : (
                <button
                  disabled
                  style={{
                    background: "#232334",
                    color: "#6b6b80",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: 12,
                    fontWeight: 600,
                  }}
                >
                  N/A
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}