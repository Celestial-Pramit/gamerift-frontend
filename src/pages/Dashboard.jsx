import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Panel from "../components/Panel.jsx";
import Cover from "../components/Cover.jsx";
import Avatar from "../components/Avatar.jsx";
import Toggle from "../components/Toggle.jsx";
import Icon from "../components/Icon.jsx";
import useNow from "../hooks/useNow.js";
import { games, commentSeed, commentPool, matches as matchSeed, countdown, monthDay } from "../mock/mockData.js";
import { getMatches } from "../api/matchApi.js";
import { getFeatured } from "../api/streamApi.js";
import { getChannels, setFollow } from "../api/channelApi.js";
import { getUsersByCountry } from "../api/statsApi.js";
import { getEvents, setReminder } from "../api/eventApi.js";
import { alertBox } from "../utils/cdn.js";

// Featured stream (from the server) with a drifting viewer count
function Hero() {
  const [stream, setStream] = useState(null);
  const [watching, setWatching] = useState(0);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState("");

  // Load the featured stream, and find out whether we already follow its channel
  useEffect(() => {
    getFeatured()
      .then(async (s) => {
        const channels = await getChannels();
        const mine = channels.find((c) => String(c.id) === String(s.channelId));
        setFollowing(!!(mine && mine.following));
        setStream(s);
        setWatching(s.viewers);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setWatching((w) => Math.max(0, w + Math.floor(Math.random() * 41) - 15)), 3000);
    return () => clearInterval(timer);
  }, []);

  async function handleFollow() {
    try {
      await setFollow(stream.channelId, !following);
      setFollowing(!following);
    } catch (err) {
      alertBox({ icon: "error", title: err.message });
    }
  }

  if (error) return <section className="panel rise p-10 text-center text-muted md:col-span-2 xl:col-span-5">{error}</section>;
  if (!stream) return <section className="panel shimmer min-h-[360px] md:col-span-2 xl:col-span-5" />;

  return (
    <section className="panel rise overflow-hidden md:col-span-2 xl:col-span-5">
      <Cover colors={games[stream.cat] || games.esports} className="flex min-h-[360px] flex-col justify-between p-4 sm:min-h-[440px] sm:p-6">
        <div className="shade" />
        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="tag tag-live"><span className="livedot !bg-white" />LIVE</span>
            <span className="tag tag-pro">FEATURED</span>
          </div>
          <span className="tag tag-mute"><span className="eq"><i /><i /><i /><i /></span>{watching.toLocaleString("en-US")}</span>
        </div>
        <div className="relative z-10">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="tag">{stream.label}</span>
            {stream.tags.slice(0, 2).map((t) => <span key={t} className="tag tag-mute">#{t}</span>)}
            <span className="tag tag-mute">{stream.channel}</span>
          </div>
          <h1 className="font-display text-2xl font-black uppercase leading-tight sm:text-4xl">{stream.title}</h1>
          <p className="mt-2 max-w-lg text-sm text-[#c9c9de]">{stream.description}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to={"/app/stream/" + stream.id} className="btn-cut btn-pri px-5 py-3 text-sm"><Icon name="play" size={14} /> Watch now</Link>
            <button onClick={handleFollow} className="btn-cut btn-sec px-5 py-3 text-sm">{following ? "Following" : "Follow channel"}</button>
          </div>
        </div>
      </Cover>
    </section>
  );
}

// Chat-like comments: a new one arrives every 4 seconds
function Comments() {
  const [list, setList] = useState(commentSeed);
  const [text, setText] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const i = Math.floor(Math.random() * commentPool.length);
      setList((l) => {
        // skip the message we just showed so it never repeats twice in a row
        const next = commentPool[i].text === l[0]?.text ? commentPool[(i + 1) % commentPool.length] : commentPool[i];
        return [{ id: Date.now(), ...next }, ...l].slice(0, 8);
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setList([{ id: Date.now(), user: "you", text }, ...list].slice(0, 8));
    setText("");
  }

  return (
    <Panel title="Live comments" className="xl:col-span-4" right={<span className="mono flex items-center gap-1.5 text-[10px] text-live"><span className="livedot" />Streaming</span>}>
      <ul className="max-h-[300px] space-y-3 overflow-y-auto p-4 sm:max-h-[340px]">
        {list.map((c) => (
          <li key={c.id} className="rise flex gap-3 text-sm">
            <Avatar name={c.user} size={28} />
            <div className="min-w-0">
              <b className={c.pro ? "text-gold" : ""}>{c.user}</b>
              {c.pro && <span className="tag tag-pro ml-1.5">PRO</span>}
              <p className="break-words text-[#c9c9de]">{c.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={send} className="flex gap-2 border-t border-line p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment..." className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon" />
        <button className="btn-cut btn-pri px-4 text-sm">Send</button>
      </form>
    </Panel>
  );
}

function Team({ t }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-lg font-display text-sm font-black" style={{ background: t.color }}>{t.short}</span>
      <span className="text-xs font-bold">{t.name}</span>
    </div>
  );
}

// Two score cards; the live one gets a goal now and then
function Matches() {
  const [list, setList] = useState([]);

  // Load the match table (demo list in mock mode, the real one otherwise)
  useEffect(() => {
    getMatches().then(setList).catch(() => setList(matchSeed));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setList((l) => l.map((m) => (m.live && Math.random() > 0.5 ? { ...m, b: m.b + 1 } : m)));
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid content-start gap-4 xl:col-span-3">
      {list.map((m) => (
        <div key={m.id} className="panel rise p-4">
          <div className="flex items-center justify-between">
            {m.live ? <span className="tag tag-live"><span className="livedot !bg-white" />LIVE</span> : m.ended ? <span className="tag">FINAL</span> : <span className="tag">HALF TIME</span>}
            <span className="mono text-[10px] text-muted">{m.info}</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <Team t={m.ta} />
            <div className="font-display text-3xl font-black">{m.a} – {m.b}</div>
            <Team t={m.tb} />
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">{m.odds.map((o) => <span key={o} className="tag tag-mute">{o}</span>)}</div>
          <button className="btn-cut btn-sec mt-3 w-full py-2 text-sm">{m.live ? "Watch now" : "Replay soon"}</button>
        </div>
      ))}
    </div>
  );
}

function Channels() {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState("live");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getChannels()
      .then((data) => { setList(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  // Optimistic follow: change the button at once, undo it if the server refuses
  async function toggle(c) {
    setList((old) => old.map((x) => (x.id === c.id ? { ...x, following: !c.following } : x)));
    try {
      const updated = await setFollow(c.id, !c.following);
      setList((old) => old.map((x) => (x.id === c.id ? updated : x)));
    } catch (err) {
      setList((old) => old.map((x) => (x.id === c.id ? c : x)));
      alertBox({ icon: "error", title: err.message });
    }
  }

  const rows = list.filter((c) => tab === "all" || c.live);

  const tabs = (
    <div className="flex rounded-lg border border-line bg-card p-0.5 text-xs font-bold">
      {["live", "all"].map((t) => (
        <button key={t} onClick={() => setTab(t)} className={"rounded px-3 py-1 uppercase " + (tab === t ? "bg-brand text-white" : "text-muted")}>{t}</button>
      ))}
    </div>
  );

  return (
    <Panel title="Channels you follow" className="xl:col-span-4" right={tabs}>
      {loading && <div className="space-y-3 p-4">{[0, 1, 2].map((i) => <div key={i} className="shimmer h-14 rounded-lg" />)}</div>}
      {error && <p className="p-6 text-center text-sm text-muted">{error}</p>}
      <ul className="divide-y divide-line">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center gap-3 p-4">
            <Avatar name={c.name} size={44} live={c.live} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 font-bold">
                {c.name}
                {c.verified && <span className="text-neon"><Icon name="check" size={14} /></span>}
                {c.pro && <span className="tag tag-pro">PRO</span>}
                {c.live ? <span className="tag tag-live">LIVE</span> : <span className="tag tag-mute">{c.soon ? "SOON" : "OFFLINE"}</span>}
              </div>
              <div className="mono truncate text-[10px] text-muted">{c.followers} FOLLOWERS · {c.note}</div>
            </div>
            <button onClick={() => toggle(c)} className={"btn-cut px-3 py-2 text-xs " + (c.following ? "btn-sec" : "btn-pri")}>
              {c.following ? "Following" : "Follow"}
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// Where the hotspot of a country sits on the dotted map (percent)
const HOTSPOTS = { BD: [72, 52], IN: [66, 56], US: [20, 40], PK: [62, 48], GB: [46, 30] };

// 12400 -> "12.4k", 412000 -> "412k", 3 -> "3"
function compact(n) {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return (k >= 100 ? Math.round(k) : Math.round(k * 10) / 10) + "k";
}

// Dotted map with glowing hotspots + segmented bars (the numbers come from a MongoDB aggregation)
function Countries() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsersByCountry().then(setRows).catch((err) => setError(err.message));
  }, []);

  const max = rows.length ? Math.max(...rows.map((r) => r.users)) : 1;

  return (
    <Panel title="Users by country" className="xl:col-span-4" right={<span className="tag">REAL USERS</span>}>
      <div className="p-4">
        <div className="worldgrid relative h-36 overflow-hidden rounded-lg border border-line bg-[#0d0d15]">
          {rows.filter((r) => HOTSPOTS[r.code]).map((r) => (
            <span key={r.code} className="hot" title={r.country} style={{ left: HOTSPOTS[r.code][0] + "%", top: HOTSPOTS[r.code][1] + "%" }} />
          ))}
        </div>
        {error && <p className="mt-3 text-center text-sm text-muted">{error}</p>}
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.code} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 text-sm">
              <b className="mono text-[11px] text-muted">{r.code}</b>
              <div>
                <div>{r.country}</div>
                <div className="seg mt-1" title={r.users + " users"}>
                  {Array.from({ length: 10 }).map((_, i) => <i key={i} className={i < Math.max(1, Math.round((r.users / max) * 10)) ? "on" : ""} />)}
                </div>
              </div>
              <b className="font-display text-sm text-neon">{compact(r.users)}</b>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

function UpcomingEvents() {
  const now = useNow();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getEvents().then(setEvents).catch((err) => setError(err.message));
  }, []);

  // Optimistic "Remind me": undo it if the server refuses
  async function toggle(e, on) {
    setEvents((old) => old.map((x) => (x.id === e.id ? { ...x, reminded: on } : x)));
    try {
      await setReminder(e.id, on);
    } catch (err) {
      setEvents((old) => old.map((x) => (x.id === e.id ? { ...x, reminded: !on } : x)));
      alertBox({ icon: "error", title: err.message });
    }
  }

  const list = events.filter((e) => e.status === "upcoming").sort((a, b) => a.at - b.at).slice(0, 4);

  return (
    <Panel title="Upcoming events" className="md:col-span-2 xl:col-span-4" right={<Link to="/app/events" className="mono text-[10px] text-muted hover:text-white">All events</Link>}>
      {error && <p className="p-6 text-center text-sm text-muted">{error}</p>}
      <ul className="divide-y divide-line">
        {list.map((e) => {
          const d = monthDay(e.at);
          return (
            <li key={e.id} className="flex items-center gap-3 p-4">
              <div className="grid h-14 w-12 shrink-0 place-items-center rounded-lg border border-line bg-card text-center">
                <div><div className="font-display text-lg font-black leading-none">{d.day}</div><div className="mono text-[9px] text-muted">{d.month}</div></div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">{e.title}</div>
                <div className="mt-1 flex flex-wrap gap-2"><span className="tag">{e.time}</span><span className="tag">{e.cat}</span></div>
                <div className="mono mt-1 whitespace-nowrap text-[10px] text-neon"><span className="hidden sm:inline">starts in </span>{countdown(e.at - now)}</div>
              </div>
              <Toggle on={e.reminded} onChange={(v) => toggle(e, v)} label="Remind me" />
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export default function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
      <Hero />
      <Comments />
      <Matches />
      <Channels />
      <Countries />
      <UpcomingEvents />
    </div>
  );
}
