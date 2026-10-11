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
      <div className="rail-content">{children}</div>
      <div className="rail-decor" aria-hidden="true">
        <div className="glow-orb" />
        <div className="glow-orb" />
      </div>
    </aside>
  );
}

function LiveNowSection() {
  return (
    <section className="rail-section" aria-labelledby="live-now-label">
      <div className="rail-header">
        <span id="live-now-label" className="mono text-[10px] text-live flex items-center gap-2">
          <span className="livedot" /> LIVE NOW
        </span>
        <span className="tag tag-mute">DEMO</span>
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
  const [c1, c2] = games[stream.cat] || games.esports;
  return (
    <Link
      to={"/login"}
      className="rail-card panel group flex items-center gap-3 p-3"
      role="listitem"
      aria-label={`${stream.channel}: ${stream.title}, ${stream.viewers.toLocaleString()} viewers`}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-lg"
        style={{ width: 96, height: 54 }}
      >
        <Cover colors={games[stream.cat] || games.esports} className="w-full h-full">
          <div className="shade" />
        </Cover>
        <span className="tag tag-live absolute bottom-1 left-1 z-10 text-[9px] px-1.5 py-0.5">
          {stream.label}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-head text-sm font-bold line-clamp-1 group-hover:text-neon">
          {stream.title}
        </h4>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted">
          <Avatar name={stream.channel} size={18} />
          <span className="truncate">{stream.channel}</span>
          <span className="mono">{stream.viewers.toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

function TopChannelsSection() {
  return (
    <section className="rail-section" aria-labelledby="top-channels-label">
      <h3 id="top-channels-label" className="rail-header mono text-[10px] text-neon">
        TOP CHANNELS
        <span className="tag tag-mute ml-2">DEMO</span>
      </h3>
      <div className="space-y-3" role="list">
        {TOP_CHANNELS.map((c, i) => (
          <Link
            key={c.id}
            to="/login"
            className="rail-card panel group flex items-center gap-3 p-3"
            role="listitem"
            aria-label={`${c.name}, ${c.followers} followers${c.verified ? ", verified" : ""}`}
          >
            <Avatar name={c.name} size={36} live={c.live} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-head text-sm font-bold">
                <span className="truncate">{c.name}</span>
                {c.verified && <Icon name="check" size={12} className="text-neon" />}
                {c.pro && <span className="tag tag-pro text-[9px] px-1.5 py-0.5">PRO</span>}
              </div>
              <span className="mono text-[10px] text-muted">{c.followers} followers</span>
            </div>
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
      <h3 id="next-event-label" className="rail-header mono text-[10px] text-neon flex items-center gap-2">
        NEXT EVENT
        <span className="tag tag-mute">DEMO</span>
      </h3>
      <Link to="/login" className="rail-card panel p-4 group" aria-label={`${NEXT_EVENT.title}, ${isLive ? "Live now" : countdown(timeLeft)}`}>
        <div className="flex items-start gap-3">
          <div className="grid h-14 w-12 shrink-0 place-items-center rounded-lg border border-line bg-card text-center">
            <div className="font-display text-lg font-black leading-none text-gold">{NEXT_EVENT.id}</div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-head text-sm font-bold line-clamp-1 group-hover:text-neon">
              {NEXT_EVENT.title}
            </h4>
            <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
              <span className="tag tag-mute">{NEXT_EVENT.time}</span>
              <span className="tag tag-mute">{NEXT_EVENT.cat}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted line-clamp-1">{NEXT_EVENT.note}</p>
            <div className="mt-2 font-display text-lg font-black" style={{ color: isLive ? "#ff3b5c" : "#19e3d2" }}>
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
      <h3 id="alert-feed-label" className="rail-header mono text-[10px] text-neon flex items-center gap-2">
        ALERT FEED
        <span className="tag tag-mute">DEMO</span>
      </h3>
      <div className="rail-alert-panel panel p-3">
        <Link
          to="/login"
          className={`toastin rail-alert flex items-center gap-3 w-full transition-opacity duration-300 ${
            reducedMotion ? "" : "opacity-100"
          }`}
          style={{ opacity: reducedMotion ? 1 : 1 }}
          aria-label={`${typeMeta[current.type].label}: ${current.text}`}
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
            style={{ background: typeMeta[current.type].color + "22", color: typeMeta[current.type].color }}
          >
            <Icon name={typeMeta[current.type].icon} size={16} />
          </span>
          <div className="min-w-0">
            <div className="mono text-[9px]" style={{ color: typeMeta[current.type].color }}>
              {typeMeta[current.type].label}
            </div>
            <div className="truncate text-sm font-semibold">{current.text}</div>
          </div>
          <div className="toastbar absolute bottom-0 left-0 h-0.5 w-full" style={{ background: typeMeta[current.type].color }} />
        </Link>
        {!reducedMotion && (
          <div className="rail-alert-dots flex items-center justify-center gap-1 mt-2" aria-hidden="true">
            {ALERT_MESSAGES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-neon" : "bg-muted/30"
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
      <Link to="/register" className="rail-card panel proteaser p-4 group" aria-label="Get Pro - gold name in chat, Pro badge, zero ads">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="tag tag-pro"><Icon name="star" size={11} /> PRO</span>
          <span className="tag tag-mute">bKash</span>
        </div>
        <h4 className="font-head text-lg font-bold mb-2 group-hover:text-gold">Level up your name</h4>
        <p className="text-sm text-muted mb-4">Gold name, Pro badge, zero ads. From ৳99/30 days.</p>
        <span className="btn-cut btn-pri px-4 py-2 text-xs inline-flex">Get Pro</span>
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