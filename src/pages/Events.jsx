import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Toggle from "../components/Toggle.jsx";
import useNow from "../hooks/useNow.js";
import { alertBox } from "../utils/cdn.js";
import { countdown, monthDay } from "../mock/mockData.js";
import { getEvents, setReminder } from "../api/eventApi.js";

const tabs = [["upcoming", "Upcoming"], ["live", "Live now"], ["past", "Past"], ["reminders", "My reminders"]];

export default function Events() {
  const now = useNow();
  const [tab, setTab] = useState("upcoming");
  const [cat, setCat] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // Load all events once (the server also knows which ones this user wants a reminder for)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getEvents()
      .then((data) => { if (!cancelled) { setEvents(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [reload]);

  const remindedCount = events.filter((e) => e.reminded).length;
  const cats = ["all", ...new Set(events.map((e) => e.cat))];
  const list = events.filter((e) => (cat === "all" || e.cat === cat) && (tab === "reminders" ? e.reminded : e.status === tab));

  // Optimistic switch: change the screen at once, undo it if the server says no
  async function toggle(e, on) {
    setEvents((old) => old.map((x) => (x.id === e.id ? { ...x, reminded: on } : x)));
    try {
      await setReminder(e.id, on);
    } catch (err) {
      setEvents((old) => old.map((x) => (x.id === e.id ? { ...x, reminded: !on } : x)));
      alertBox({ icon: "error", title: err.message });
      return;
    }
    alertBox({
      toast: true,
      position: "bottom-end",
      icon: on ? "success" : "info",
      title: on ? "Reminder set" : "Reminder removed",
      text: on ? "We'll ping you 30 min and 5 min before start." : e.title,
      showConfirmButton: false,
      timer: 2200,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-black sm:text-3xl">EVENTS</h1>
        <p className="text-sm text-muted">Countdowns and reminders that really create a notification.</p>
      </div>

      <div className="panel flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="no-scrollbar flex max-w-full overflow-x-auto rounded-lg border border-line bg-card p-1">
          {tabs.map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={"shrink-0 rounded-md px-4 py-1.5 font-head font-bold " + (tab === key ? "bg-brand text-white" : "text-muted hover:text-white")}>
              {label}{key === "reminders" && " (" + remindedCount + ")"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-11 rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon">
            {cats.map((c) => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
          </select>
          <div className="flex rounded-lg border border-line bg-card p-1 text-sm font-bold">
            <span className="rounded-md bg-brand px-3 py-1.5 text-white">List</span>
            <span className="px-3 py-1.5 text-muted/60" title="Coming soon">Calendar</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="shimmer h-44 rounded-xl" />)}
        </div>
      ) : error ? (
        <div className="panel flex flex-col items-center gap-3 border-live/50 p-10 text-center">
          <b className="font-head text-xl">Couldn't load events</b>
          <p className="text-sm text-muted">{error}</p>
          <button onClick={() => setReload(reload + 1)} className="btn-cut btn-sec px-4 py-2 text-sm">Try again</button>
        </div>
      ) : list.length === 0 ? (
        <div className="panel dash p-10 text-center text-muted">Nothing here yet. Turn on a reminder from Upcoming.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((e, i) => {
            const kind = e.status;
            const d = monthDay(e.at);
            return (
              <article key={e.id} style={{ animationDelay: i * 60 + "ms" }} className="card-hover panel rise flex flex-col gap-3 p-4">
                <div className="flex gap-3">
                  <div className="grid h-16 w-14 shrink-0 place-items-center rounded-lg border border-line bg-card text-center">
                    <div><div className="font-display text-xl font-black leading-none">{d.day}</div><div className="mono text-[9px] text-muted">{d.month}</div></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-head text-lg font-bold leading-tight">{e.title}</h3>
                      {e.badge === "soon" && <span className="tag tag-live">LIVE SOON</span>}
                      {e.badge === "fund" && <span className="tag">FUNDRAISER</span>}
                      {e.badge === "pro" && <span className="tag tag-pro">PRO ONLY</span>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2"><span className="tag">{e.time}</span><span className="tag">{e.cat}</span></div>
                    <p className="mt-1 text-xs text-muted">{e.note}</p>
                  </div>
                </div>

                {e.goal && (
                  <div>
                    <div className="h-1.5 overflow-hidden rounded bg-line"><div className="h-full bg-neon" style={{ width: Math.round((e.raised / e.goal) * 100) + "%" }} /></div>
                    <div className="mono mt-1 flex justify-between text-[10px] text-muted"><span>Goal ৳{e.goal.toLocaleString("en-US")}</span><span className="text-neon">৳{e.raised.toLocaleString("en-US")} · {Math.round((e.raised / e.goal) * 100)}%</span></div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className={"font-display text-lg " + (kind === "live" ? "text-live" : "text-neon")}>{kind === "live" ? "LIVE NOW" : kind === "past" ? "ENDED" : countdown(e.at - now)}</span>
                  {kind !== "past" && (
                    <label className="flex items-center gap-2">
                      <span className="mono text-[10px] text-muted">Remind me</span>
                      <Toggle on={e.reminded} onChange={(on) => toggle(e, on)} label="Remind me" />
                    </label>
                  )}
                </div>

                {e.badge === "pro" && (
                  <div className="flex items-center gap-4">
                    <button className="btn-cut btn-pri px-4 py-2 text-xs">Reserve a seat</button>
                    <button className="mono text-[10px] text-muted hover:text-white">Add to calendar</button>
                  </div>
                )}
                {kind === "live" && <Link to="/app/stream/1" className="btn-cut btn-pri px-4 py-2.5 text-center text-xs">Watch now</Link>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
