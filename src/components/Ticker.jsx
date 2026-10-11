import { useEffect, useState } from "react";
import { getTicker } from "../api/tickerApi.js";

// The bar keeps these demo lines in mock mode, or until the first fetch answers
const fallback = [
  "🔴 Live now: Valorant Champions Finals",
  "📅 Upcoming: Fastest Fingers in Gaming",
  "🎮 CS2 Major Highlights just went live",
  "⭐ Go Pro for a gold chat name",
];

// Scrolling strip; the list is shown twice so the loop looks endless
export default function Ticker() {
  const [items, setItems] = useState(fallback);

  // Real ticker messages via /api/ticker, refreshed every minute
  useEffect(() => {
    let alive = true;
    const load = () => getTicker().then((rows) => { if (alive && rows && rows.length) setItems(rows); }).catch(() => {});
    load();
    const timer = setInterval(load, 60000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  return (
    <div className="overflow-hidden bg-[#2563ff]">
      <div className="marquee flex w-max gap-12 whitespace-nowrap py-2 text-sm">
        {[...items, ...items].map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}