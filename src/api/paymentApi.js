import { call, useMock } from "./http.js";
import { plans, orders, priceWith } from "../mock/mockPhase3.js";

// Backend DTOs -> the shapes Pro / Checkout / PaymentResult / OrdersTable already use
export function normalizePlan(p) {
  return {
    id: p.id,
    name: p.name,
    days: p.days,
    price: p.priceBdt,
    tagline: p.tagline || "",
    perks: p.perks || [],
    best: p.bestValue,
  };
}

export function normalizeOrder(o) {
  return {
    id: o.id,
    plan: o.planName,
    method: o.method,
    amount: o.total,
    status: o.status,
    at: Date.parse(o.createdAt),
  };
}

export async function getPlans() {
  if (useMock) return plans;
  const data = await call("get", "/payment/plans");
  return data.map(normalizePlan);
}

export async function getQuote(planId, code) {
  if (useMock) return priceWith(plans.find((p) => p.id === Number(planId)), code);
  return call("post", "/payment/quote", { planId: String(planId), code: code || null });
}

// Starts a real payment: the backend creates a PENDING order and returns the gateway URL.
// In mock mode we fake the gateway URL and the paid order so the demo still runs end to end.
export async function checkout(planId, code) {
  if (useMock) {
    const plan = plans.find((p) => p.id === Number(planId));
    if (!plan) throw new Error("Plan not found");
    const r = priceWith(plan, code);
    const order = { id: "GR-" + Math.floor(10000 + Math.random() * 89999), plan: plan.name, method: "SSLCommerz", amount: r.total, status: "PAID", at: Date.now() };
    orders.unshift(order);
    return { orderId: order.id, amount: r.total, gatewayUrl: "/app/pro/result/success?order=" + order.id };
  }
  const r = await call("post", "/payment/checkout", { planId: String(planId), code: code || null });
  return { orderId: r.orderId, amount: r.amount, gatewayUrl: r.gatewayUrl };
}

// Save interest in a payment method that the backend does not support yet.
export async function notifyMe(method) {
  if (useMock) return { message: "saved (mock)" };
  return call("post", "/payment/notify-me", { method });
}

// Re-export so consumers can import everything from one file.
export { getMe } from "./authApi.js";

export async function getOrders() {
  if (useMock) return orders;
  const data = await call("get", "/payment/orders");
  return data.map(normalizeOrder);
}

export async function getOrder(id) {
  if (useMock) return orders.find((o) => o.id === id);
  return normalizeOrder(await call("get", "/payment/orders/" + id));
}