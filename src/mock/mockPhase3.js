// Fake data for Phase 3 (plans, coupons, orders, chat lines). Same shapes as the future API.
export const plans = [
  { id: 1, name: "Player One", days: 30, price: 99, tagline: "Try the gold life. Cancel anytime.", perks: ["Gold name in chat", "PRO badge", "Zero ads"] },
  { id: 2, name: "Squad", days: 90, price: 249, best: true, tagline: "Most popular with streamers and grinders.", perks: ["Everything in Player One", "Pro-only workshops and events", "Early access to new features"] },
  { id: 3, name: "Legend", days: 365, price: 899, tagline: "For the ones who already know.", perks: ["Everything in Squad", "Custom chat colour", "Priority support queue"] },
];

// Demo coupons (the real ones will be validated by the backend)
const coupons = { GG10: { type: "PERCENT", value: 10 }, WELCOME50: { type: "FLAT", value: 50 } };

export function priceWith(plan, code) {
  const c = coupons[(code || "").trim().toUpperCase()];
  if (!c) return { total: plan.price, off: 0, ok: false };
  const off = c.type === "PERCENT" ? Math.round((plan.price * c.value) / 100) : Math.min(c.value, plan.price - 1);
  return { total: plan.price - off, off, ok: true };
}

const DAY = 86400000;
export const orders = [
  { id: "GR-88213", plan: "Squad", method: "SSLCommerz", amount: 249, status: "PAID", at: Date.now() - DAY },
  { id: "GR-87104", plan: "Player One", method: "SSLCommerz", amount: 99, status: "PAID", at: Date.now() - 30 * DAY },
  { id: "GR-86990", plan: "Player One", method: "SSLCommerz", amount: 99, status: "FAILED", at: Date.now() - 31 * DAY },
];

export const chatBots = [
  { user: "tania_k", text: "insane retake" },
  { user: "msi_gamer", text: "he's on 40 kills already 💀" },
  { user: "xenon_bd", text: "my wifi died at the worst time" },
  { user: "saha", pro: true, text: "defense was NASTY" },
  { user: "bot", text: "1,204 comments tonight. This channel is officially unhinged." },
  { user: "arif_92", text: "who else is here from the trending tab?" },
  { user: "nila", text: "Dhaka represent! 🔥" },
  { user: "Rozu", pro: true, text: "calling map 4 already, GG" },
  { user: "kazi", text: "that eco round was a gamble" },
  { user: "tanvir", text: "chat is moving too fast" },
  { user: "mim", text: "where is my hype toast 😮" },
  { user: "bot", pro: false, text: "Tap the reactions to fill the hype meter" },
  { user: "xenon_bd", pro: true, text: "Nova Ascent needs a timeout" },
  { user: "sara", text: "first time here, love the vibe" },
];

export const seedComments = [
  { id: 1, user: "NightRaid", pro: false, text: "Pinned: finals schedule is on the Events page. Be nice in chat!", likes: 210, pinned: true },
  { id: 2, user: "arif_92", pro: false, text: "The retake on B site was textbook. Watched it back twice already.", likes: 42 },
  { id: 3, user: "Rozu", pro: true, text: "If they keep forcing eco like that it's over by round 20. Calling it now.", likes: 128 },
];
