// Fake admin data (same shapes the backend will return later)
import { streams, channels, events } from "./mockData.js";
import { plans, orders } from "./mockPhase3.js";

const iso = (ms) => new Date(ms).toISOString().slice(0, 16);

export const adminData = {
  streams: streams.map((s) => ({ id: s.id, title: s.title, channel: s.channel, cat: s.cat, tags: s.tags.join(", "), baseViewers: s.viewers || 1000, isLive: s.status === "live", published: true, videoSource: "YOUTUBE", videoUrl: "", description: "" })),
  channels: channels.map((c) => ({ id: c.id, name: c.name, followers: c.followers, verified: !!c.verified, pro: !!c.pro, live: c.live })),
  categories: [
    { id: 1, name: "Esports", slug: "esports", icon: "🏆" },
    { id: 2, name: "FPS", slug: "fps", icon: "🎯" },
    { id: 3, name: "IRL", slug: "irl", icon: "🎤" },
    { id: 4, name: "MOBA", slug: "moba", icon: "⚔️" },
    { id: 5, name: "Speedrun", slug: "speedrun", icon: "⏱️" },
  ],
  events: events.map((e) => ({ id: e.id, title: e.title, cat: e.cat, startsAt: iso(e.at), note: e.note, badge: e.badge || "" })),
  matches: [
    { id: 1, teamA: "NightRaid", teamB: "Nova Ascent", scoreA: 1, scoreB: 2, status: "LIVE", info: "MAP 3 · 12:04" },
    { id: 2, teamA: "Dhaka Pulse", teamB: "Kazi Crew", scoreA: 9, scoreB: 9, status: "HALF TIME", info: "MAP 2 · 00:00" },
  ],
  users: [
    { id: 1, username: "admin", email: "admin@gamerift.tech", role: "ADMIN", country: "Bangladesh", banned: false },
    { id: 2, username: "gamer", email: "gamer@gamerift.tech", role: "VIEWER", country: "Bangladesh", banned: false },
    { id: 3, username: "arif_92", email: "arif@example.com", role: "VIEWER", country: "Bangladesh", banned: false },
    { id: 4, username: "nila", email: "nila@example.com", role: "VIEWER", country: "India", banned: false },
    { id: 5, username: "tanvir", email: "tanvir@example.com", role: "VIEWER", country: "Pakistan", banned: true },
    { id: 6, username: "sara", email: "sara@example.com", role: "VIEWER", country: "United Kingdom", banned: false },
  ],
  comments: [
    { id: 1, user: "arif_92", stream: "Grand Finals · Map 3", text: "The retake on B site was textbook.", at: "2 min ago" },
    { id: 2, user: "Rozu", stream: "Grand Finals · Map 3", text: "If they keep forcing eco it's over by round 20.", at: "11 min ago" },
    { id: 3, user: "nila", stream: "Late night chill", text: "Dhaka represent!", at: "35 min ago" },
    { id: 4, user: "tanvir", stream: "Aim lab bootcamp", text: "this is spam, click my link", at: "1 h ago" },
  ],
  orders: [
    ...orders.map((o) => ({ id: o.id, user: "gamer", plan: o.plan, amount: o.amount, status: o.status, date: new Date(o.at).toLocaleDateString("en-GB") })),
    { id: "GR-86512", user: "nila", plan: "Legend", amount: 899, status: "PAID", date: "28 Sep 2026" },
    { id: "GR-86201", user: "arif_92", plan: "Squad", amount: 249, status: "REFUNDED", date: "25 Sep 2026" },
  ],
  plans: plans.map((p) => ({ id: p.id, name: p.name, days: p.days, price: p.price, tagline: p.tagline, bestValue: !!p.best, active: true })),
  coupons: [
    { id: 1, code: "GG10", type: "PERCENT", value: 10, maxUses: 500, used: 42, expires: "2026-12-31", active: true },
    { id: 2, code: "WELCOME50", type: "FLAT", value: 50, maxUses: 1000, used: 120, expires: "2027-03-31", active: true },
    { id: 3, code: "EID25", type: "PERCENT", value: 25, maxUses: 200, used: 200, expires: "2026-11-01", active: false },
  ],
  ticker: [
    { id: 1, text: "Live now: Valorant Champions Finals", active: true },
    { id: 2, text: "Upcoming: Fastest Fingers in Gaming", active: true },
    { id: 3, text: "Go Pro for a gold chat name", active: true },
  ],
};

export const sampleClips = [
  ["Dog (Cloudinary demo)", "https://res.cloudinary.com/demo/video/upload/dog.mp4"],
  ["Elephants (Cloudinary demo)", "https://res.cloudinary.com/demo/video/upload/elephants.mp4"],
  ["Sea turtle (Cloudinary demo)", "https://res.cloudinary.com/demo/video/upload/sea-turtle.mp4"],
];

export const usersByCountry = [["Bangladesh", 412], ["India", 268], ["United States", 181], ["Pakistan", 143], ["UK", 96]];
export const revenue7 = [320, 540, 410, 760, 620, 980, 1240];
