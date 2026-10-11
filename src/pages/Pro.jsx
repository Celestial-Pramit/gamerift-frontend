import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import OrdersTable from "../components/OrdersTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getPlans } from "../api/paymentApi.js";

export default function Pro() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [name, setName] = useState(user?.username || "gamer");

  useEffect(() => {
    getPlans().then(setPlans).catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <span className="tag tag-pro">GAMERIFT PRO</span>
        <h1 className="mt-3 font-display text-3xl font-black sm:text-5xl">PICK YOUR <span className="gradtext">POWER-UP</span></h1>
        <p className="mt-2 text-muted">Gold name in chat, PRO badge, zero ads. Pay securely with SSLCommerz.</p>
        {user?.isPro && <p className="mt-3 text-sm text-gold">You are Pro until {new Date(user.proUntil).toLocaleDateString("en-GB")}. Thanks for the support!</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className={"panel flex flex-col gap-3 p-5 " + (p.best ? "gradborder md:-translate-y-3" : "")} style={p.best ? { "--gb-fill": "#11111a" } : undefined}>
            {p.best && <span className="tag tag-pro self-start">BEST VALUE</span>}
            <h2 className="font-head text-2xl font-bold">{p.name}</h2>
            <div><span className="font-display text-4xl font-black text-gold">৳{p.price}</span><span className="text-sm text-muted"> / {p.days} days</span></div>
            <p className="text-sm text-muted">{p.tagline}</p>
            <ul className="flex-1 space-y-2 text-sm">{p.perks.map((x) => <li key={x} className="flex items-center gap-2"><span className="text-neon"><Icon name="check" size={14} /></span>{x}</li>)}</ul>
            <Link to={"/app/pro/checkout/" + p.id} className={"btn-cut px-4 py-3 text-center text-sm " + (p.best ? "btn-pri" : "btn-sec")}>Choose {p.name}</Link>
          </div>
        ))}
      </div>

      <section className="panel p-5">
        <h2 className="mono mb-3 text-[11px] font-bold text-muted">Your gold name in chat (live preview)</h2>
        <input value={name} maxLength={16} onChange={(e) => setName(e.target.value)} className="mb-4 h-11 w-full rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-gold sm:max-w-xs" />
        <div className="space-y-2 rounded-lg border border-line bg-card p-4 text-sm">
          <div><b className="text-neon">nila</b> <span className="text-[#c9c9de]">Dhaka represent!</span></div>
          <div><b className="goldname">{name || "you"}</b> <span className="tag tag-pro">PRO</span> <span className="text-[#c9c9de]">GG, calling map 4 already</span></div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <h2 className="mono border-b border-line px-4 py-3 text-[11px] font-bold text-muted">Payment history</h2>
        <OrdersTable />
      </section>
    </div>
  );
}