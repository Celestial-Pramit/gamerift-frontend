import { useEffect, useState } from "react";
import { getOrders } from "../api/paymentApi.js";

const badge = { PAID: "tag", FAILED: "tag tag-end", REFUNDED: "tag tag-pro", PENDING: "tag tag-mute", CANCELLED: "tag tag-end" };
const fmt = (ms) => new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// Payment history: table on desktop, cards on phones (mock or real backend)
export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-center text-sm text-muted">Loading payments...</p>;
  if (orders.length === 0) return <p className="p-6 text-center text-sm text-muted">No payments yet.</p>;

  return (
    <>
      <table className="hidden w-full text-sm md:table">
        <thead className="mono text-[10px] text-muted"><tr>{["Transaction", "Plan", "Method", "Date", "Amount", "Status"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o.id}><td className="mono px-4 py-3 text-xs">{o.id}</td><td className="px-4">{o.plan}</td><td className="px-4">{o.method}</td><td className="px-4 text-muted">{fmt(o.at)}</td><td className="px-4 font-display text-neon">৳{o.amount}</td><td className="px-4"><span className={badge[o.status]}>{o.status}</span></td></tr>
          ))}
        </tbody>
      </table>
      <div className="divide-y divide-line md:hidden">
        {orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-3 p-4">
            <div><div className="font-bold">{o.plan} · {o.method}</div><div className="mono text-[10px] text-muted">{o.id} · {fmt(o.at)}</div></div>
            <div className="text-right"><div className="font-display text-neon">৳{o.amount}</div><span className={badge[o.status]}>{o.status}</span></div>
          </div>
        ))}
      </div>
    </>
  );
}