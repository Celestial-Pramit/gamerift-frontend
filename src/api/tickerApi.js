import { call, useMock } from "./http.js";

const ICONS = { live: "🔴", event: "📅", message: "⭐" };

// Returns a list of text lines for the ticker bar, or null in mock mode (the bar keeps its own demo lines)
export async function getTicker() {
  if (useMock) return null;
  const items = await call("get", "/ticker");
  return items.map((i) => (ICONS[i.type] || "🎮") + " " + i.text);
}