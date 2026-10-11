// Fake data for the Phase 2 screens (same shapes the real API will return later)
export const games = {
  esports: ["#7c3aed", "#2563ff"],
  fps: ["#ff3b5c", "#f5b942"],
  irl: ["#19e3d2", "#a24bff"],
  moba: ["#2563ff", "#19e3d2"],
  speedrun: ["#f5b942", "#ff3b5c"],
};

export const channels = [
  { id: 1, name: "NightRaid", followers: "148K", verified: true, live: true, note: "GRAND FINALS · MAP 3", following: true },
  { id: 2, name: "Rozu", followers: "42.1K", pro: true, live: true, note: "RANKED GRIND", following: true },
  { id: 3, name: "MimSays", followers: "9.6K", live: true, note: "LATE NIGHT CHILL", following: true },
  { id: 4, name: "SahaGaming", followers: "18.2K", verified: true, live: false, note: "LAST LIVE 2 DAYS AGO", following: false },
  { id: 5, name: "KaziPlays", followers: "31.4K", live: false, soon: true, note: "STARTS IN 1H 10M", following: false },
];

// s(id, title, channel, category, label, viewers, trend, minutes, tags, status, pro)
const s = (id, title, channel, cat, label, viewers, trend, mins, tags, status, pro = false) => ({ id, title, channel, cat, label, viewers, trend, mins, tags, status, pro });

export const streams = [
  s(1, "Grand Finals · Map 3 — NightRaid vs Nova Ascent", "NightRaid", "esports", "ESPORTS", 156421, 92, 72, ["tournament", "valorant"], "live"),
  s(2, "Ranked grind to Immortal — road to 100k followers", "Rozu", "fps", "FPS", 42615, 75, 184, ["valorant", "bangla"], "live", true),
  s(3, "Late night chill · reacts + tea, we don't stop", "MimSays", "irl", "IRL", 3322, 40, 140, ["chill", "bangla"], "live"),
  s(4, "Mobile MOBA scrims — scrimming with the squad", "KaziPlays", "moba", "MOBA", 0, 10, 12, ["mobile"], "soon"),
  s(5, "Any% run practice — chasing the sub-40", "SahaGaming", "speedrun", "SPEEDRUN", 8142, 66, 44, ["speedrun"], "live"),
  s(6, "Dhaka Major watchparty — semis, couch and chaos", "xenon_bd", "esports", "ESPORTS", 15622, 88, 310, ["tournament", "bangla"], "live"),
  s(7, "Clutch or kick — community customs night", "NightRaid", "fps", "FPS", 0, 5, 0, ["valorant"], "ended"),
  s(8, "Aim lab bootcamp — 30 minutes to a better flick", "Rozu", "fps", "FPS", 6710, 55, 25, ["valorant"], "live", true),
  s(9, "Pocket MOBA ranked push — Legendary or bust", "KaziPlays", "moba", "MOBA", 2980, 35, 95, ["mobile", "bangla"], "live"),
  s(10, "Charity stream — Flood Relief marathon", "MimSays", "irl", "IRL", 5120, 80, 210, ["chill", "bangla"], "live"),
  s(11, "Speedrun marathon warm-up — 12h incoming", "SahaGaming", "speedrun", "SPEEDRUN", 0, 20, 180, ["speedrun"], "soon"),
  s(12, "Coach reacts — rank replays, no mercy", "xenon_bd", "esports", "ESPORTS", 9980, 60, 60, ["tournament"], "live"),
];

export const allTags = ["valorant", "bangla", "mobile", "chill", "tournament", "speedrun"];

export const commentSeed = [
  { id: 1, user: "Rozu", pro: true, text: "GG, calling map 4 already" },
  { id: 2, user: "mim", text: "where is my hype toast 😮" },
  { id: 3, user: "bot", text: "NightRaid is now 12k followers from 150k" },
  { id: 4, user: "saha", text: "defense this round was NASTY" },
];
export const commentPool = [
  { user: "xenon", text: "that flick was insane 🔥" },
  { user: "tanvir", text: "chat is moving too fast" },
  { user: "Rozu", pro: true, text: "Nova Ascent needs a timeout" },
  { user: "nila", text: "Dhaka represent!" },
  { user: "bot", text: "Follow the channel to get live alerts" },
  { user: "kazi", text: "that eco round was a gamble" },
];

export const matches = [
  { id: 1, live: true, info: "MAP 3 · 12:04", a: 1, b: 2, ta: { name: "NightRaid", short: "NR", color: "#7c3aed" }, tb: { name: "Nova Ascent", short: "NA", color: "#19e3d2" }, odds: ["NR 1.85", "Draw 6.20", "NA 2.40"] },
  { id: 2, live: false, info: "MAP 2 · 00:00", a: 9, b: 9, ta: { name: "Dhaka Pulse", short: "DP", color: "#f5b942" }, tb: { name: "Kazi Crew", short: "KC", color: "#ff3b5c" }, odds: ["DP 2.10", "Chalk 5.50", "KC 1.95"] },
];

// k = thousands of users, x/y = hotspot position on the dotted map (percent)
export const countries = [
  { code: "BD", name: "Bangladesh", k: 412, x: 72, y: 52 },
  { code: "IN", name: "India", k: 268, x: 66, y: 56 },
  { code: "US", name: "United States", k: 181, x: 20, y: 40 },
  { code: "PK", name: "Pakistan", k: 143, x: 62, y: 48 },
  { code: "GB", name: "United Kingdom", k: 96, x: 46, y: 30 },
  { code: "WW", name: "Rest of world", k: 140 },
];

const H = 3600000;
const now = Date.now();
export const events = [
  { id: 1, title: "Dhaka Major — Semifinal A", cat: "ESPORTS", time: "20:30 BDT", note: "NightRaid vs Nova Ascent", at: now + 52 * H, badge: "soon" },
  { id: 2, title: "Charity Stream · Flood Relief", cat: "IRL", time: "19:00 BDT", note: "Hosted by MimSays + 6", at: now + 122 * H, badge: "fund", goal: 200000, raised: 128400 },
  { id: 3, title: "Speedrun Marathon · 12h", cat: "SPEEDRUN", time: "09:00 BDT", note: "Any% relay with 8 runners", at: now + 240 * H },
  { id: 4, title: "Pro Workshop · Grow your channel", cat: "WORKSHOP", time: "18:00 BDT", note: "60 min + live Q&A", at: now + 384 * H, badge: "pro" },
  { id: 5, title: "Valorant Community Cup · Finals", cat: "ESPORTS", time: "17:00 BDT", note: "Streaming now on NightRaid", at: now - 1.5 * H, live: true },
  { id: 6, title: "Dhaka Major — Quarterfinals", cat: "ESPORTS", time: "20:00 BDT", note: "Replay available", at: now - 144 * H, past: true },
  { id: 7, title: "Aim Lab Bootcamp", cat: "WORKSHOP", time: "16:00 BDT", note: "Replay available", at: now - 288 * H, past: true },
];

// ---- small helpers ----
export function fmtMins(m) {
  return Math.floor(m / 60) + "H " + String(m % 60).padStart(2, "0") + "M";
}

export function countdown(ms) {
  if (ms <= 0) return "now";
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const p = (n) => String(n).padStart(2, "0");
  return (d ? d + "d " : "") + p(h) + "h " + p(m) + "m " + p(sec % 60) + "s";
}

export function monthDay(ms) {
  const d = new Date(ms);
  return { day: d.getDate(), month: d.toLocaleString("en-US", { month: "short" }).toUpperCase() };
}
