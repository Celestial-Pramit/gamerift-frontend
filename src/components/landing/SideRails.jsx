import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../Icon.jsx";
import Avatar from "../Avatar.jsx";
import Cover from "../Cover.jsx";
import Counter from "../Counter.jsx";
import { streams, channels, events, countdown, games, fmtMins } from "../../mock/mockData.js";
import useNow from "../../hooks/useNow.js";

const LIVE_STREAMS = streams.filter((s) => s.status === "live");
const TOP_CHANNELS = channels.filter((c) => c.live || c.following).slice(0, 4);
const NEXT_EVENT = events.find((e) => e.status === "upcoming" || e.badge === "soon") || events[0];
const ALERT_MESSAGES = [
  { id: 1, text: "NightRaid just went live: Grand Finals · Map 3", type: "live" },
  { id: 2, text: "Dhaka Major semifinal starts in 30 minutes", type: "event" },
  { id: 3, text: "Rozu hit 100k followers! 🎉", type: "follow" },
];

const typeMeta = {
  live: { icon: "radio", color: "#ff3b5c", label: "NOW LIVE" },
  event: { icon: "cal", color: "#19e3d2", label: "EVENT ALERT" },
  follow: { icon: "users", color: "#2563ff", label: "NEW FOLLOWER" },
};

function RailWrapper({ side, children }) {
  const isLeft = side === "left";
  return (
    <aside
      className={`rail-wrapper ${isLeft ? "left" : "right"}`}
      aria-label="Highlights"
      role="complementary"
    >
      <div className="rail-bg-layer" aria-hidden="true">
        <div className="rail-gradient" />
        <div className="rail-grid" />
        <div className="rail-scanlines" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rail-orb" style={{ "--orb-delay": `${i * 2}s` }} />
        ))}
      </div>
      <div className="rail-border" aria-hidden="true">
        <div className="rail-corner tl" />
        <div className="rail-corner tr" />
        <div className="rail-corner bl" />
        <div className="rail-corner br" />
      </div>
      <div className="rail-content">{children}</div>
    </aside>
  );
}

function LiveNowSection() {
  return (
    <section className="rail-section" aria-labelledby="live-now-label">
      <div className="rail-header">
        <div className="rail-header-main">
          <span id="live-now-label" className="mono text-[10px] text-live flex items-center gap-2">
            <span className="livedot rail-live-dot" />
            LIVE NOW
          </span>
        </div>
        <span className="tag tag-mute rail-badge">DEMO</span>
      </div>
      <div className="rail-marquee" role="list" aria-label="Live streams">
        {[...LIVE_STREAMS, ...LIVE_STREAMS].map((s, i) => (
          <StreamRailCard key={s.id + "-" + i} stream={s} index={i} />
        ))}
      </div>
    </section>
  );
}

function StreamRailCard({ stream, index }) {
  return (
    <Link
      to={"/login"}
      className="rail-card group relative overflow-hidden"
      role="listitem"
      aria-label={`${stream.channel}: ${stream.title}, ${stream.viewers.toLocaleString()} viewers`}
    >
      <div className="rail-card-glow" aria-hidden="true" />
      <div
        className="rail-thumb relative shrink-0 overflow-hidden"
        style={{ width: 112, height: 63 }}
      >
        <Cover colors={games[stream.cat] || games.esports} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
        <div className="shade" />
        <span className="tag tag-live absolute bottom-1.5 left-1.5 z-10 text-[9px] px-2 py-0.5">{stream.label}</span>
        <div className="rail-thumb-overlay absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="min-w-0 flex-1 p-3">
        <h4 className="font-head text-sm font-bold line-clamp-1 group-hover:text-neon transition-colors">
          {stream.title}
        </h4>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
          <Avatar name={stream.channel} size={20} />
          <span className="truncate">{stream.channel}</span>
          <span className="mono ml-auto">{stream.viewers.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

function TopChannelsSection() {
  return (
    <section className="rail-section" aria-labelledby="top-channels-label">
      <div className="rail-header">
        <h3 id="top-channels-label" className="mono text-[10px] text-neon rail-header-main">TOP CHANNELS</h3>
        <span className="tag tag-mute rail-badge">DEMO</span>
      </div>
      <div className="space-y-2.5" role="list">
        {TOP_CHANNELS.map((c, i) => (
          <Link
            key={c.id}
            to="/login"
            className="rail-card group relative overflow-hidden flex items-center gap-3"
            role="listitem"
            aria-label={`${c.name}, ${c.followers} followers${c.verified ? ", verified" : ""}`}
          >
            <div className="rail-card-glow" aria-hidden="true" />
            <Avatar name={c.name} size={40} live={c.live} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-head text-sm font-bold">
                <span className="truncate group-hover:text-neon transition-colors">{c.name}</span>
                {c.verified && <Icon name="check" size={12} className="text-neon" />}
                {c.pro && <span className="tag tag-pro text-[9px] px-1.5 py-0.5">PRO</span>}
              </div>
              <span className="mono text-[10px] text-muted">{c.followers} followers</span>
            </div>
            <div className="rail-chevron opacity-0 group-hover:opacity-100 transition-opacity text-neon">›</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NextEventSection() {
  const now = useNow();
  const timeLeft = NEXT_EVENT.at - now;
  const isLive = timeLeft <= 0;

  return (
    <section className="rail-section" aria-labelledby="next-event-label">
      <div className="rail-header">
        <h3 id="next-event-label" className="mono text-[10px] text-neon rail-header-main flex items-center gap-2">
          NEXT EVENT
        </h3>
        <span className="tag tag-mute rail-badge">DEMO</span>
      </div>
      <Link to="/login" className="rail-card event-card group relative overflow-hidden p-4" aria-label={`${NEXT_EVENT.title}, ${isLive ? "Live now" : countdown(timeLeft)}`}>
        <div className="rail-card-glow event-glow" aria-hidden="true" />
        <div className="flex items-start gap-3 relative z-10">
          <div className="event-badge shrink-0 grid h-14 w-12 place-items-center rounded-lg border border-line bg-card/50 text-center backdrop-blur">
            <div className="font-display text-lg font-black leading-none text-gold">{NEXT_EVENT.id}</div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-head text-sm font-bold line-clamp-1 group-hover:text-neon transition-colors">
              {NEXT_EVENT.title}
            </h4>
            <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
              <span className="tag tag-mute">{NEXT_EVENT.time}</span>
              <span className="tag tag-mute">{NEXT_EVENT.cat}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted line-clamp-1">{NEXT_EVENT.note}</p>
            <div className="mt-3 font-display text-lg font-black" style={{ color: isLive ? "#ff3b5c" : "#19e3d2" }}>
              {isLive ? "LIVE NOW" : countdown(timeLeft)}
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

function AlertFeedSection() {
  const [index, setIndex] = useState(0);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % ALERT_MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [reducedMotion]);

  const current = ALERT_MESSAGES[index];

  return (
    <section className="rail-section" aria-labelledby="alert-feed-label" aria-live="polite">
      <div className="rail-header">
        <h3 id="alert-feed-label" className="mono text-[10px] text-neon rail-header-main flex items-center gap-2">
          ALERT FEED
        </h3>
        <span className="tag tag-mute rail-badge">DEMO</span>
      </div>
      <div className="rail-alert-panel relative overflow-hidden">
        <Link
          to="/login"
          className={`rail-alert flex items-center gap-3 w-full relative ${reducedMotion ? "" : "animate-alert-in"}`}
          aria-label={`${typeMeta[current.type].label}: ${current.text}`}
        >
          <span
            className="alert-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg relative"
            style={{ background: typeMeta[current.type].color + "22", color: typeMeta[current.type].color }}
          >
            <Icon name={typeMeta[current.type].icon} size={18} />
            <span className="alert-icon-ring absolute inset-0 rounded-lg" style={{ borderColor: typeMeta[current.type].color }} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="mono text-[9px]" style={{ color: typeMeta[current.type].color }}>
              {typeMeta[current.type].label}
            </div>
            <div className="truncate text-sm font-semibold">{current.text}</div>
          </div>
          <div className="alert-bar absolute bottom-0 left-0 h-0.5 w-full" style={{ background: typeMeta[current.type].color }} />
        </Link>
        {!reducedMotion && (
          <div className="rail-alert-dots flex items-center justify-center gap-1.5 mt-3" aria-hidden="true">
            {ALERT_MESSAGES.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  i === index ? "bg-neon scale-125" : "bg-muted/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProCardSection() {
  return (
    <section className="rail-section" aria-labelledby="pro-card-label">
      <Link to="/register" className="rail-card pro-card group relative overflow-hidden" aria-label="Get Pro - gold name in chat, Pro badge, zero ads">
        <div className="rail-card-glow pro-glow" aria-hidden="true" />
        <div className="relative z-10 p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="tag tag-pro"><Icon name="star" size={11} /> PRO</span>
            <span className="tag tag-mute">SSLCommerz</span>
          </div>
          <h4 className="font-head text-lg font-bold mb-2 group-hover:text-gold transition-colors">Level up your name</h4>
          <p className="text-sm text-muted mb-4">Gold name, Pro badge, zero ads. From ৳99/30 days.</p>
          <span className="btn-cut btn-pri px-5 py-2 text-xs inline-flex group-hover:scale-[1.02] transition-transform">Get Pro</span>
        </div>
      </Link>
    </section>
  );
}

export function SideRail({ side }) {
  const isLeft = side === "left";
  return (
    <RailWrapper side={side}>
      {isLeft ? (
        <>
          <LiveNowSection />
          <TopChannelsSection />
        </>
      ) : (
        <>
          <NextEventSection />
          <AlertFeedSection />
          <ProCardSection />
        </>
      )}
    </RailWrapper>
  );
}

export default SideRail;