import { call, useMock } from "./http.js";
import { matches as mockMatches } from "../mock/mockData.js";

const COLORS = ["#7c3aed", "#19e3d2", "#2563ff", "#ff3b5c", "#f5b942", "#a24bff"];

// same name -> same colour every time
function colorOf(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return COLORS[h % COLORS.length];
}

// "Nova Ascent" -> "NA", "NightRaid" -> "NR"
function shortOf(name) {
  const words = name.trim().split(/[\s_-]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  const caps = name.match(/[A-Z]/g) || [];
  if (caps.length >= 2) return caps[0] + caps[1];
  return name.slice(0, 2).toUpperCase();
}

// Backend MatchResponse -> the shape the Dashboard match cards use
function fromApi(m) {
  const ta = { name: m.teamA, short: shortOf(m.teamA), color: colorOf(m.teamA) };
  const tb = { name: m.teamB, short: shortOf(m.teamB), color: colorOf(m.teamB) };
  return {
    id: m.id,
    live: m.status === "LIVE",
    ended: m.status === "ENDED",
    info: m.info || "",
    a: m.scoreA,
    b: m.scoreB,
    ta,
    tb,
    odds: [m.oddsA && ta.short + " " + m.oddsA, m.oddsDraw && "Draw " + m.oddsDraw, m.oddsB && tb.short + " " + m.oddsB].filter(Boolean),
  };
}

export async function getMatches() {
  if (useMock) return mockMatches;
  return (await call("get", "/matches")).map(fromApi);
}