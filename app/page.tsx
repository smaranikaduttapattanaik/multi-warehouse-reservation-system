import ProductCard from "../components/ProductCard";

interface InventoryEntry {
  id: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
  warehouse: { id: string; name: string; city: string };
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  imageUrl: string | null;
  inventories: InventoryEntry[];
}

async function getProducts(): Promise<Product[]> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/products`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export default async function HomePage() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await getProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  const totalAvailable = products.reduce(
    (sum, p) => sum + p.inventories.reduce((s, inv) => s + inv.availableUnits, 0),
    0
  );

  return (
    <div>
      {/* Page header */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
          <h1 style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--text)",
            margin: 0,
          }}>
            Products
          </h1>
          {!error && (
            <span className="mono" style={{
              fontSize: 11,
              color: "var(--text-muted)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "2px 8px",
              borderRadius: 4,
            }}>
              {totalAvailable} units available
            </span>
          )}
        </div>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 13 }}>
          Reserve units to hold stock while your customer completes payment.
        </p>
      </div>

      {error && (
        <div style={{
          background: "var(--red-dim)",
          border: "1px solid var(--red)",
          borderRadius: 10,
          padding: "12px 16px",
          color: "var(--red)",
          fontSize: 13,
          marginBottom: 24,
        }}>
          {error}
        </div>
      )}

      {products.length === 0 && !error && (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
          No products found — run{" "}
          <span className="mono" style={{ color: "var(--text)" }}>npm run db:seed</span>
        </div>
      )}

      {/* Loading skeletons shown while hydrating */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 16,
      }}>
        {products.map((product, i) => (
          <div key={product.id} className={`fade-up fade-up-${Math.min(i + 1, 5)}`}>
            <ProductCard product={product as any} />
          </div>
        ))}
      </div>
    </div>
  );
}