import { call } from "./http.js";

// Raw rows of the last list() call. Fields that the admin forms do not show (note, goal, odds ...) are kept here
// so that saving a form never wipes them.
const cache = { streams: {}, channels: {}, categories: {}, events: {}, matches: {}, ticker: {} };

function remember(section, rows) {
  cache[section] = {};
  rows.forEach((r) => {
    cache[section][r.id] = r;
  });
}

const pad = (n) => String(n).padStart(2, "0");
const num = (v) => Number(v) || 0;

// ISO time from the server -> value for <input type="datetime-local"> (browser time)
function toLocalInput(iso) {
  const d = new Date(iso);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

// 148000 -> "148K"
function fmtCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n || 0);
}

// the stream form gives a channel NAME (or id); the server needs the id
async function channelIdOf(value) {
  const list = await call("get", "/admin/channels");
  const found = list.find((c) => c.name === value || c.id === value);
  return found ? found.id : null;
}

const sections = {
  streams: {
    url: "/admin/streams",
    fromApi: (s) => ({
      id: s.id, title: s.title, description: s.description || "", channel: s.channelName, cat: s.categorySlug,
      tags: (s.tags || []).join(", "), baseViewers: s.baseViewers ?? s.viewers, isLive: s.status === "live",
      published: s.published, videoSource: s.videoSource, videoUrl: s.videoUrl || "",
    }),
    async toApi(form, raw) {
      const channelId = (await channelIdOf(form.channel)) || form.channelId || (raw && raw.channelId);
      // not live: keep a scheduled stream scheduled, everything else counts as ended
      let phase = "ENDED";
      let scheduledAt = null;
      if (form.isLive) {
        phase = "LIVE";
      } else if (raw && raw.status === "soon" && raw.scheduledAt) {
        phase = "SOON";
        scheduledAt = raw.scheduledAt;
      }
      const tags = Array.isArray(form.tags) ? form.tags : String(form.tags || "").split(",");
      return {
        title: form.title, description: form.description || "", categorySlug: form.cat, channelId,
        videoSource: form.videoSource || "YOUTUBE", videoUrl: form.videoUrl || "", phase, scheduledAt,
        baseViewers: num(form.baseViewers), published: form.published !== false,
        featured: raw ? !!raw.featured : false,
        tags: tags.map((t) => t.trim()).filter(Boolean).slice(0, 8),
      };
    },
  },

  channels: {
    url: "/admin/channels",
    fromApi: (c) => ({
      id: c.id, name: c.name, followers: fmtCount(c.followersCount), verified: c.verified, pro: c.pro, live: c.live, note: c.note,
    }),
    toApi: (form, raw) => ({
      name: form.name, verified: !!form.verified, pro: !!form.pro, live: !!form.live,
      note: form.note ?? (raw ? raw.note : "") ?? "",
    }),
  },

  categories: {
    url: "/admin/categories",
    listUrl: "/categories", // the public list (the admin controller has no GET)
    fromApi: (c) => ({ id: c.id, name: c.name, slug: c.slug, icon: c.icon }),
    toApi: (form) => ({ name: form.name, slug: form.slug, icon: form.icon || "" }),
  },

  events: {
    url: "/admin/events",
    fromApi: (e) => ({
      id: e.id, title: e.title, cat: e.category, startsAt: toLocalInput(e.startsAt), note: e.note || "", badge: e.badge || "",
    }),
    toApi: (form, raw) => ({
      title: form.title, category: form.cat, startsAt: new Date(form.startsAt).toISOString(),
      note: form.note || "", badge: form.badge || "",
      goal: raw ? raw.goal : 0, raised: raw ? raw.raised : 0,
    }),
  },

  matches: {
    url: "/admin/matches",
    fromApi: (m) => ({
      id: m.id, teamA: m.teamA, teamB: m.teamB, scoreA: m.scoreA, scoreB: m.scoreB,
      status: String(m.status).replace("_", " "), info: m.info || "",
    }),
    toApi: (form, raw) => ({
      teamA: form.teamA, teamB: form.teamB, scoreA: num(form.scoreA), scoreB: num(form.scoreB),
      status: String(form.status).replace(" ", "_"), info: form.info || "",
      oddsA: raw ? raw.oddsA : null, oddsDraw: raw ? raw.oddsDraw : null, oddsB: raw ? raw.oddsB : null,
    }),
  },

  ticker: {
    url: "/admin/ticker",
    fromApi: (t) => ({ id: t.id, text: t.text, active: t.active }),
    toApi: (form) => ({ text: form.text, active: form.active !== false }),
  },

  users: {
    url: "/admin/users",
    fromApi: (u) => ({ id: u.id, username: u.username, email: u.email, role: u.role, country: u.country, banned: u.banned }),
    toApi: (form, raw) => ({ role: form.role || raw.role, country: form.country, banned: form.banned }),
  },

  orders: {
    url: "/admin/orders",
    fromApi: (o) => ({ id: o.id, user: o.user, plan: o.plan, amount: o.amount, status: o.status, date: new Date(o.createdAt).toLocaleDateString("en-GB") }),
  },

  plans: {
    url: "/admin/plans",
    fromApi: (p) => ({ id: p.id, name: p.name, days: p.days, price: p.priceBdt, tagline: p.tagline || "", bestValue: p.bestValue, active: p.active }),
    toApi: (form, raw) => ({
      name: form.name, days: num(form.days), priceBdt: num(form.price), tagline: form.tagline || "",
      // the admin form has no perks field, so keep the ones the plan already has
      perks: raw && Array.isArray(raw.perks) ? raw.perks : [],
      bestValue: !!form.bestValue, active: form.active !== false,
    }),
  },

  coupons: {
    url: "/admin/coupons",
    fromApi: (c) => ({ id: c.id, code: c.code, type: c.type, value: c.value, maxUses: c.maxUses, used: c.usedCount, expires: c.expiresAt || "", active: c.active }),
    toApi: (form) => ({ code: form.code, type: form.type, value: num(form.value), maxUses: num(form.maxUses), expiresAt: form.expires || null, active: form.active !== false }),
  },

  comments: {
    url: "/admin/comments",
    fromApi: (c) => ({ id: c.id, user: c.user, text: c.text, stream: c.stream, at: new Date(c.createdAt).toLocaleDateString("en-GB") }),
  },
};

// the admin sections that have a real backend now
export const REAL_SECTIONS = Object.keys(sections);

export async function adminList(section) {
  const s = sections[section];
  const rows = await call("get", s.listUrl || s.url);
  remember(section, rows);
  return rows.map(s.fromApi);
}

// id = null creates a new row, otherwise the row is updated
export async function adminSave(section, id, form) {
  const s = sections[section];
  const raw = id ? cache[section][id] : null;
  const body = await s.toApi(form, raw);
  return id ? call("put", s.url + "/" + id, body) : call("post", s.url, body);
}

export function adminDelete(section, id) {
  return call("delete", sections[section].url + "/" + id);
}

// the on/off switches inside the tables
export async function adminToggle(section, id, key, value) {
  if (section === "streams" && key === "isLive") return call("put", "/admin/streams/" + id + "/live", { enabled: value });
  if (section === "streams" && key === "published") return call("put", "/admin/streams/" + id + "/published", { enabled: value });
  const s = sections[section];
  const form = { ...s.fromApi(cache[section][id]), [key]: value };
  return adminSave(section, id, form);
}

export function adminBroadcast(type, title) {
  return call("post", "/admin/notifications/broadcast", { type, title });
}

export function getAdminStats() {
  return call("get", "/admin/stats");
}