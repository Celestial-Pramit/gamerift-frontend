import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useMock } from "../api/http.js";
import { getOrder, getMe } from "../api/paymentApi.js";

const colors = ["#a24bff", "#19e3d2", "#f5b942", "#ff3b5c", "#2563ff"];

// Success (with confetti + receipt), failed, or cancelled
export default function PaymentResult() {
  const { status } = useParams();
  const [params] = useSearchParams();
  const orderId = params.get("order");
  const planId = params.get("plan") || 1;
  const [order, setOrder] = useState(undefined);
  const { updateUser } = useAuth();

  useEffect(() => {
    if (status !== "success" || !orderId) return;
    getOrder(orderId).then(async (o) => {
      setOrder(o);
      if (!useMock && o) {
        try {
          const me = await getMe();
          updateUser({ isPro: !!(me.isPro ?? me.pro), proUntil: me.proUntil });
        } catch (err) {
          /* keep the local estimate */
        }
      }
    }).catch(() => setOrder(null));
  }, [status, orderId, useMock, updateUser]);

  if (status === "success") {
    if (useMock) return <MockSuccess order={orderMock(orderId)} />;
    if (order === undefined) return <div className="panel shimmer min-h-[400px]" />;
    if (!order) return <div className="panel p-10 text-center">Order not found. <Link to="/app/pro" className="text-neon">Back to Go Pro</Link></div>;
    return (
      <div className="mx-auto max-w-md space-y-4">
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 36 }).map((_, i) => <i key={i} style={{ left: (i * 2.8) % 100 + "%", background: colors[i % 5], animationDelay: (i % 9) * 0.12 + "s" }} />)}
        </div>
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full border-2 border-gold text-3xl text-gold">★</div>
          <h1 className="font-display text-3xl font-black">YOU'RE PRO. GG.</h1>
          <p className="text-sm text-muted">Level up complete: gold name unlocked in every chat.</p>
        </div>
        <div className="panel space-y-2 p-5 text-sm">
          <div className="mono flex justify-between text-[10px] text-muted"><span>Receipt</span><span className="tag tag-pro">PRO</span></div>
          {[["Transaction ID", order.id], ["Plan", order.plan], ["Amount", "৳" + order.amount], ["Method", order.method], ["Time", new Date(order.at).toLocaleString("en-GB")]].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-line pb-2"><span className="text-muted">{k}</span><b>{v}</b></div>
          ))}
        </div>
        <div className="no-print flex flex-wrap gap-3">
          <button onClick={() => window.print()} className="btn-cut btn-sec flex-1 px-4 py-3 text-xs">Print / Save PDF</button>
          <Link to="/app" className="btn-cut btn-pri flex-1 px-4 py-3 text-center text-xs">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const failed = status === "failed";
  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <div className={"mx-auto grid h-16 w-16 place-items-center rounded-full border-2 text-3xl " + (failed ? "border-live text-live" : "border-gold text-gold")}>{failed ? "!" : "–"}</div>
      <h1 className="font-display text-3xl font-black">{failed ? "PAYMENT FAILED" : "YOU CANCELLED"}</h1>
      <p className="text-sm text-muted">{failed ? "SSLCommerz could not complete the payment. Nothing was charged." : "No charge, no drama. Your plan stays on the free tier."}</p>
      <div className="flex flex-col gap-3">
        <Link to={"/app/pro/checkout/" + planId} className="btn-cut btn-pri px-4 py-3 text-sm">{failed ? "Try again" : "Resume checkout"}</Link>
        <Link to="/app/pro" className="mono text-[10px] text-muted hover:text-white">Back to Go Pro</Link>
      </div>
    </div>
  );
}

// mock mode reads the fake order list directly (kept in a tiny local helper)
function orderMock(orderId) {
  if (!orderId) return null;
  return { id: orderId, plan: "Squad", amount: 249, method: "SSLCommerz", at: Date.now() };
}

// tiny local success panel so the real receipt only appears in real mode
function MockSuccess({ order }) {
  if (!order) return <div className="panel p-10 text-center">Order not found. <Link to="/app/pro" className="text-neon">Back to Go Pro</Link></div>;
  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, i) => <i key={i} style={{ left: (i * 2.8) % 100 + "%", background: colors[i % 5], animationDelay: (i % 9) * 0.12 + "s" }} />)}
      </div>
      <div className="text-center">
        <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full border-2 border-gold text-3xl text-gold">★</div>
        <h1 className="font-display text-3xl font-black">YOU'RE PRO. GG.</h1>
        <p className="text-sm text-muted">Level up complete: gold name unlocked in every chat.</p>
      </div>
      <div className="panel space-y-2 p-5 text-sm">
        <div className="mono flex justify-between text-[10px] text-muted"><span>Receipt</span><span className="tag tag-pro">PRO</span></div>
        {[["Transaction ID", order.id], ["Plan", order.plan], ["Amount", "৳" + order.amount], ["Method", order.method], ["Time", new Date(order.at).toLocaleString("en-GB")]].map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-line pb-2"><span className="text-muted">{k}</span><b>{v}</b></div>
        ))}
      </div>
      <div className="no-print flex flex-wrap gap-3">
        <button onClick={() => window.print()} className="btn-cut btn-sec flex-1 px-4 py-3 text-xs">Print / Save PDF</button>
        <Link to="/app" className="btn-cut btn-pri flex-1 px-4 py-3 text-center text-xs">Back to dashboard</Link>
      </div>
    </div>
  );
}