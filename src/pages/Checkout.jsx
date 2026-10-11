import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import useNow from "../hooks/useNow.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useMock } from "../api/http.js";
import { getPlans, getQuote, checkout } from "../api/paymentApi.js";
import { alertBox } from "../utils/cdn.js";

// The gateway accepts every local method on one hosted page; we only show a logo strip here.
const methods = [
  { name: "bKash", color: "#E2136E" },
  { name: "Nagad", color: "#F58220" },
  { name: "Rocket", color: "#8C3494" },
  { name: "Upay", color: "#E4692A" },
  { name: "CARD", color: "#2563FF" },
];

const steps = ["Choose plan", "Pay securely", "Pro unlocked"];

export default function Checkout() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const now = useNow();
  const deadline = useRef(Date.now() + 10 * 60000);
  const [plan, setPlan] = useState(null); // null = loading, false = not found
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const [price, setPrice] = useState({ total: 0, off: 0 });
  const [agree, setAgree] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    getPlans()
      .then((rows) => {
        const found = rows.find((p) => String(p.id) === String(planId)) || false;
        setPlan(found);
        if (found) setPrice({ total: found.price, off: 0 });
      })
      .catch(() => setPlan(false));
  }, [planId]);

  if (plan === null) return <div className="panel shimmer min-h-[400px]" />;
  if (plan === false) return <Navigate to="/app/pro" replace />;

  const left = Math.max(0, Math.floor((deadline.current - now) / 1000));
  const ring = 2 * Math.PI * 26;

  async function applyCoupon() {
    if (useMock) {
      alertBox({ toast: true, position: "bottom-end", icon: "success", title: "Coupon applied (mock)", showConfirmButton: false, timer: 2000 });
      setApplied(code.trim().toUpperCase());
      setPrice({ total: plan.price, off: 0 });
      return;
    }
    try {
      const q = await getQuote(plan.id, code);
      setApplied(q.code);
      setPrice({ total: q.total, off: q.discount });
      alertBox({ toast: true, position: "bottom-end", icon: "success", title: "Coupon applied: -৳" + q.discount, showConfirmButton: false, timer: 2000 });
    } catch (err) {
      setApplied("");
      alertBox({ toast: true, position: "bottom-end", icon: "error", title: err.message, showConfirmButton: false, timer: 2500 });
    }
  }

  // Mock mode jumps straight to the (fake) receipt; real mode hands the browser to SSLCommerz.
  async function pay() {
    if (useMock) {
      try {
        const r = await checkout(plan.id, applied);
        navigate(r.gatewayUrl);
      } catch (err) {
        alertBox({ icon: "error", title: err.message });
      }
      return;
    }
    if (redirecting) return;
    try {
      setRedirecting(true);
      const r = await checkout(plan.id, applied);
      window.location.href = r.gatewayUrl;
    } catch (err) {
      setRedirecting(false);
      alertBox({ icon: "error", title: err.message });
    }
  }

  if (redirecting) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-line border-t-[#2563ff]" />
          <p className="font-head text-xl">Redirecting to SSLCommerz secure payment...</p>
          <p className="text-xs text-muted">Do not close this tab</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <ol className="flex items-center gap-2 text-xs sm:text-sm">
        {steps.map((t, i) => (
          <li key={t} className="flex flex-1 items-center gap-2">
            <span className={"grid h-7 w-7 shrink-0 place-items-center rounded-full font-bold " + (i === 0 ? "bg-brand text-white" : "border border-line text-muted")}>{i + 1}</span>
            <span className={i === 0 ? "text-white" : "text-muted"}>{t}</span>
            {i < 2 && <span className="h-px flex-1 bg-line" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
        <section className="panel space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="mono text-[11px] font-bold text-muted">Order summary</h2>
            <span className="tag tag-pro">SANDBOX</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-line bg-card p-3">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-[#f5b942] to-[#b3771a] text-xl text-[#241703]">★</span>
            <div><div className="font-head text-xl font-bold">{plan.name}</div><div className="text-xs text-muted">{plan.days} days · gold name, PRO badge, zero ads</div></div>
          </div>
          <div className="flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon (try GG10)" className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-sm uppercase outline-none focus:border-neon" />
            <button onClick={applyCoupon} className="btn-cut btn-sec px-4 text-xs">Apply</button>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>৳{plan.price}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd className="text-neon">-৳{applied ? price.off : 0}</dd></div>
            <div className="flex justify-between border-t border-line pt-3"><dt className="font-bold">Total payable</dt><dd className="font-display text-2xl text-gold">৳{applied ? price.total : plan.price}</dd></div>
          </dl>
          <div className="flex items-center gap-4 rounded-lg border border-gold/40 bg-gold/5 p-3">
            <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#24243a" strokeWidth="6" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="#f5b942" strokeWidth="6" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - left / 600)} />
            </svg>
            <div><div className="font-display text-2xl text-gold">{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</div><div className="text-xs text-muted">Your payment link expires in 10 minutes. The order price is then released.</div></div>
          </div>
        </section>

        <section className="panel space-y-3 p-5">
          <div className="flex items-center justify-between"><h2 className="mono text-[11px] font-bold text-muted">Payment method</h2><span className="mono text-[10px] text-muted">Prices in BDT</span></div>
          <div className="flex items-center gap-3 rounded-xl border-2 border-[#2563ff] bg-[#2563ff]/10 p-4">
            <span className="grid h-10 w-14 place-items-center rounded bg-gradient-to-br from-[#2563ff] to-[#12379c] text-[10px] font-black text-white">SSL</span>
            <div className="flex-1"><div className="font-bold">SSLCommerz Secure Checkout</div><div className="text-xs text-muted">bKash, Nagad, Rocket, Upay and cards on the next page</div></div>
            <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-[#2563ff]"><span className="h-2.5 w-2.5 rounded-full bg-[#2563ff]" /></span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {methods.map((m) => (
              <span key={m.name} className="flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[10px] text-muted">
                <span className="grid h-4 min-w-5 place-items-center rounded px-0.5 text-[8px] font-black text-white" style={{ background: m.color }}>{m.name.slice(0, Math.min(4, m.name.length))}</span>
                {m.name}
              </span>
            ))}
          </div>
          <div className="rounded-lg border border-neon/40 bg-neon/5 p-3 text-xs text-neon">Sandbox mode is on — you will be redirected to SSLCommerz. No real money moves.</div>
          <label className="flex items-start gap-2 text-sm text-muted"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[#a24bff]" />By paying you agree to the Terms of Service and Refund Policy. Pro is a one-time pass, not a subscription.</label>
          <button disabled={!agree || left === 0 || redirecting} onClick={pay} className="btn-cut btn-pri w-full py-3.5 disabled:opacity-40">{left === 0 ? "Order expired" : "Pay ৳" + (applied ? price.total : plan.price) + " securely"}</button>
          <Link to="/app/pro" className="mono block text-center text-[10px] text-muted hover:text-white">Back to plans</Link>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="flex items-center gap-1.5 text-[10px] text-muted">🔒 Secured by SSLCommerz · PCI-DSS</span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted">🛡 256-bit TLS</span>
          </div>
        </section>
      </div>
    </div>
  );
}