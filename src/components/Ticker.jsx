const items = [
  "🔴 Live now: Valorant Champions Finals",
  "📅 Upcoming: Fastest Fingers in Gaming",
  "🎮 CS2 Major Highlights just went live",
  "⭐ Go Pro for a gold chat name",
];

// Scrolling strip; the list is shown twice so the loop looks endless
export default function Ticker() {
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
