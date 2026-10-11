import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CrudSection from "../components/admin/CrudSection.jsx";
import StreamForm from "../components/admin/StreamForm.jsx";
import ChartBox from "../components/admin/ChartBox.jsx";
import Counter from "../components/Counter.jsx";
import Icon from "../components/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifs } from "../context/NotifContext.jsx";
import { useMock } from "../api/http.js";
import { REAL_SECTIONS, adminList, adminSave, adminDelete, adminToggle, getAdminStats, adminBroadcast } from "../api/adminApi.js";
import { adminData, usersByCountry, revenue7 } from "../mock/mockAdmin.js";

const sections = [["overview", "Overview"], ["streams", "Streams"], ["channels", "Channels"], ["categories", "Categories"], ["events", "Events"], ["matches", "Matches"], ["users", "Users"], ["comments", "Comments"], ["orders", "Orders"], ["plans", "Pro plans"], ["coupons", "Coupons"], ["ticker", "Ticker"], ["broadcast", "Broadcast"]];

const catOpts = adminData.categories.map((c) => c.slug);
const chanOpts = adminData.channels.map((c) => c.name);

// Every CRUD screen is described here (columns for the table, fields for the form)
const configs = {
  streams: {
    title: "Streams", singular: "stream", searchKeys: ["title", "channel"], filter: { key: "cat", label: "All categories", options: catOpts },
    columns: [{ key: "title", label: "Title" }, { key: "channel", label: "Channel" }, { key: "cat", label: "Category", type: "chip" }, { key: "baseViewers", label: "Base viewers" }, { key: "isLive", label: "Live", type: "toggle" }, { key: "published", label: "Published", type: "toggle" }],
    makeNew: () => ({ title: "", channel: chanOpts[0], cat: catOpts[0], tags: "", baseViewers: 1000, isLive: false, published: true, videoSource: "YOUTUBE", videoUrl: "", description: "" }),
    renderForm: (v, set) => <StreamForm value={v} onChange={set} cats={catOpts} chans={chanOpts} />,
    fields: [{ key: "title", label: "Title", required: true }],
  },
  channels: {
    title: "Channels", singular: "channel", searchKeys: ["name"],
    columns: [{ key: "name", label: "Channel", type: "avatar" }, { key: "followers", label: "Followers" }, { key: "verified", label: "Verified", type: "toggle" }, { key: "pro", label: "Pro", type: "toggle" }, { key: "live", label: "Live", type: "toggle" }],
    fields: [{ key: "name", label: "Name", required: true }, { key: "followers", label: "Followers (for example 12.4K)" }, { key: "verified", label: "Verified", type: "toggle" }, { key: "pro", label: "Pro channel", type: "toggle" }, { key: "live", label: "Live now", type: "toggle" }],
  },
  categories: {
    title: "Categories", singular: "category", searchKeys: ["name", "slug"],
    columns: [{ key: "icon", label: "Icon" }, { key: "name", label: "Name" }, { key: "slug", label: "Slug" }],
    fields: [{ key: "name", label: "Name", required: true }, { key: "slug", label: "Slug (lowercase, unique)", required: true }, { key: "icon", label: "Icon (emoji)" }],
  },
  events: {
    title: "Events", singular: "event", searchKeys: ["title", "cat"],
    columns: [{ key: "title", label: "Title" }, { key: "cat", label: "Category", type: "chip" }, { key: "startsAt", label: "Starts" }, { key: "note", label: "Note" }],
    fields: [{ key: "title", label: "Title", required: true }, { key: "cat", label: "Category", type: "select", options: ["ESPORTS", "IRL", "SPEEDRUN", "WORKSHOP"] }, { key: "startsAt", label: "Starts at", type: "datetime", required: true }, { key: "note", label: "Note" }, { key: "badge", label: "Badge", type: "select", options: [["", "None"], ["soon", "Live soon"], ["fund", "Fundraiser"], ["pro", "Pro only"]] }],
  },
  matches: {
    title: "Matches", singular: "match", searchKeys: ["teamA", "teamB"],
    columns: [{ key: "teamA", label: "Team A" }, { key: "teamB", label: "Team B" }, { key: "scoreA", label: "A" }, { key: "scoreB", label: "B" }, { key: "status", label: "Status", type: "chip" }],
    fields: [{ key: "teamA", label: "Team A", required: true }, { key: "teamB", label: "Team B", required: true }, { key: "scoreA", label: "Score A", type: "number" }, { key: "scoreB", label: "Score B", type: "number" }, { key: "status", label: "Status", type: "select", options: ["LIVE", "HALF TIME", "ENDED"] }, { key: "info", label: "Info (for example MAP 3 · 12:04)" }],
  },
  users: {
    title: "Users", singular: "user", searchKeys: ["username", "email"], canCreate: false, filter: { key: "role", label: "All roles", options: ["VIEWER", "ADMIN"] },
    columns: [{ key: "username", label: "User", type: "avatar" }, { key: "email", label: "Email" }, { key: "role", label: "Role", type: "chip" }, { key: "country", label: "Country" }, { key: "banned", label: "Banned", type: "toggle" }],
    fields: [{ key: "username", label: "Username", readOnly: true }, { key: "email", label: "Email", readOnly: true }, { key: "role", label: "Role", type: "select", options: ["VIEWER", "ADMIN"] }, { key: "country", label: "Country" }, { key: "banned", label: "Banned", type: "toggle" }],
  },
  comments: {
    title: "Comments", singular: "comment", searchKeys: ["user", "text", "stream"], canCreate: false, canEdit: false,
    columns: [{ key: "user", label: "User", type: "avatar" }, { key: "text", label: "Comment" }, { key: "stream", label: "Stream" }, { key: "at", label: "When" }],
  },
  orders: {
    title: "Orders", singular: "order", searchKeys: ["id", "user", "plan"], canCreate: false, canEdit: false, canDelete: false, filter: { key: "status", label: "All statuses", options: ["PAID", "FAILED", "REFUNDED"] },
    columns: [{ key: "id", label: "Transaction" }, { key: "user", label: "User" }, { key: "plan", label: "Plan" }, { key: "amount", label: "Amount", type: "money" }, { key: "status", label: "Status", type: "chip" }, { key: "date", label: "Date" }],
  },
  plans: {
    title: "Pro plans", singular: "plan", searchKeys: ["name"],
    columns: [{ key: "name", label: "Plan" }, { key: "days", label: "Days" }, { key: "price", label: "Price", type: "money" }, { key: "bestValue", label: "Best value", type: "toggle" }, { key: "active", label: "Active", type: "toggle" }],
    fields: [{ key: "name", label: "Name", required: true }, { key: "days", label: "Duration (days)", type: "number" }, { key: "price", label: "Price (BDT)", type: "number" }, { key: "tagline", label: "Tagline" }, { key: "bestValue", label: "Best value badge", type: "toggle" }, { key: "active", label: "Active", type: "toggle" }],
  },
  coupons: {
    title: "Coupons", singular: "coupon", searchKeys: ["code"],
    columns: [{ key: "code", label: "Code" }, { key: "type", label: "Type", type: "chip" }, { key: "value", label: "Value" }, { key: "used", label: "Used" }, { key: "maxUses", label: "Max uses" }, { key: "expires", label: "Expires" }, { key: "active", label: "Active", type: "toggle" }],
    fields: [{ key: "code", label: "Code", required: true }, { key: "type", label: "Type", type: "select", options: ["PERCENT", "FLAT"] }, { key: "value", label: "Value", type: "number" }, { key: "maxUses", label: "Max uses", type: "number" }, { key: "expires", label: "Expires on", type: "date" }, { key: "active", label: "Active", type: "toggle" }],
  },
  ticker: {
    title: "Ticker messages", singular: "ticker message", searchKeys: ["text"],
    columns: [{ key: "text", label: "Message" }, { key: "active", label: "Active", type: "toggle" }],
    fields: [{ key: "text", label: "Message", required: true }, { key: "active", label: "Active", type: "toggle" }],
  },
};

function Overview({ data, stats }) {
  const real = !!stats;
  const users = real ? stats.users : data.users.length;
  const live = real ? stats.liveStreams : data.streams.filter((s) => s.isLive).length;
  const comments = real ? stats.comments : data.comments.length;
  const revenue = real ? stats.revenue : data.orders.filter((o) => o.status === "PAID").reduce((sum, o) => sum + o.amount, 0);

  const cards = [
    ["Users", <Counter to={users} />, "users", "#a24bff"],
    ["Live streams", <Counter to={live} />, "radio", "#ff3b5c"],
    ["Comments", <Counter to={comments} />, "chat", "#19e3d2"],
    ["Revenue", "৳" + revenue.toLocaleString("en-US"), "star", "#f5b942"],
  ];

  const catLabels = real ? stats.streamsByCategory.map((x) => x.category) : data.categories.map((c) => c.name);
  const catCounts = real ? stats.streamsByCategory.map((x) => x.count) : data.categories.map((c) => data.streams.filter((s) => s.cat === c.slug).length);
  const countryData = real ? stats.usersByCountry.map((x) => [x.country, x.users]) : usersByCountry;
  const dayLabels = Array.from({ length: 7 }).map((_, i) =>
    new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en-GB", { weekday: "short" }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value, icon, color]) => (
          <div key={label} className="panel flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ background: color + "22", color }}><Icon name={icon} size={20} /></span>
            <div><div className="font-display text-xl font-black">{value}</div><div className="mono text-[9px] text-muted">{label}</div></div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartBox title="Users by country" type="bar" labels={countryData.map((x) => x[0])} data={countryData.map((x) => x[1])} />
        <ChartBox title="Streams by category" type="doughnut" labels={catLabels} data={catCounts} />
        <ChartBox title="Revenue, last 7 days (BDT)" type="line" labels={dayLabels} data={real ? stats.revenueByDay : revenue7} color="#19e3d2" />
      </div>
    </div>
  );
}

// Send a notification to everyone (shows up as a toast + in the bell)
function Broadcast() {
  const { push } = useNotifs();
  const [form, setForm] = useState({ title: "", type: "system" });
  const [sent, setSent] = useState([]);
  const [busy, setBusy] = useState(false);

  function send(e) {
    e.preventDefault();
    if (!form.title.trim() || busy) return;
    if (useMock) {
      push(form.type, form.title.trim(), "/app/notifications");
      setSent([{ id: Date.now(), ...form }, ...sent]);
      setForm({ ...form, title: "" });
      return;
    }
    setBusy(true);
    setForm({ ...form, title: "" });
    adminBroadcast(form.type, form.title.trim())
      .then(() => setSent([{ id: Date.now(), ...form, title: form.title.trim() }, ...sent]))
      .catch((err) => alertBox({ icon: "error", title: err.message }))
      .finally(() => setBusy(false));
  }

  return (
    <div className="grid max-w-3xl gap-4">
      <form onSubmit={send} className="panel space-y-4 p-5">
        <h2 className="font-head text-xl font-bold">Broadcast a notification</h2>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Message, for example: Dhaka Major finals start in 10 minutes" className="h-11 w-full rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-11 w-full rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon sm:w-60">
          <option value="system">System</option><option value="live">Live</option><option value="event">Event</option>
        </select>
        <button className="btn-cut btn-pri px-6 py-3 text-sm">{busy ? "Sending..." : "Send to everyone"}</button>
      </form>
      <div className="panel divide-y divide-line">
        {sent.length === 0 && <p className="p-6 text-center text-sm text-muted">Nothing sent yet. Try one and watch the toast arrive.</p>}
        {sent.map((s) => <div key={s.id} className="flex items-center justify-between gap-3 p-4 text-sm"><span>{s.title}</span><span className="tag">{s.type}</span></div>)}
      </div>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const { section = "overview" } = useParams();
  const [data, setData] = useState(adminData);
  const [realRows, setRealRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [cats, setCats] = useState(catOpts);
  const [chans, setChans] = useState(chanOpts);
  const real = !useMock && REAL_SECTIONS.includes(section);

  // Categories + channels for the stream form come from the same backend
  useEffect(() => {
    if (useMock) return;
    adminList("categories").then((rows) => setCats(rows.map((c) => c.slug))).catch(() => {});
    adminList("channels").then((rows) => setChans(rows.map((c) => c.name))).catch(() => {});
  }, []);

  // Load the real table every time the section changes
  useEffect(() => {
    if (!real) return;
    setLoading(true);
    setLoadError("");
    adminList(section)
      .then(setRealRows)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [section, real]);

  // Load the real overview numbers when needed
  useEffect(() => {
    if (useMock || section !== "overview") return;
    setStats(null);
    getAdminStats().then(setStats).catch(() => {});
  }, [section]);

  const reload = () => adminList(section).then(setRealRows);
  const save = (id, form) => adminSave(section, id, form).then(reload);
  const del = (id) => adminDelete(section, id).then(reload);
  const toggle = (id, key, val) => adminToggle(section, id, key, val).then(reload);

  if (user?.role !== "ADMIN") {
    return <div className="panel p-10 text-center">Admins only. <Link to="/app" className="text-neon">Back to dashboard</Link></div>;
  }

  const cfg = { ...configs[section] };
  // real backend: categories and channels are fetched lists, and the Followers field has no backend column
  if (real && section === "streams") {
    cfg.makeNew = () => ({ title: "", channel: chans[0] || "", cat: cats[0] || "", tags: "", baseViewers: 1000, isLive: false, published: true, videoSource: "YOUTUBE", videoUrl: "", description: "" });
    cfg.renderForm = (v, set) => <StreamForm value={v} onChange={set} cats={cats} chans={chans} />;
    cfg.filter = { key: "cat", label: "All categories", options: cats };
  }
  if (real && section === "channels") {
    cfg.fields = configs.channels.fields.filter((f) => f.key !== "followers");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-black sm:text-3xl">ADMIN <span className="gradtext">PANEL</span></h1>
        <p className="text-sm text-muted">{real ? "Changes go straight to the database." : "Manage everything here. Changes use mock data until the backend is connected."}</p>
      </div>
      <nav className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        {sections.map(([key, label]) => (
          <Link key={key} to={"/app/admin/" + key} className={"shrink-0 rounded-lg border px-4 py-1.5 font-head text-base font-bold " + (section === key ? "border-brand bg-brand/20 text-white" : "border-line text-muted hover:text-white")}>{label}</Link>
        ))}
      </nav>
      {section === "overview" && <Overview data={data} stats={stats} />}
      {section === "broadcast" && <Broadcast />}
      {real && loading && <p className="panel p-6 text-center text-sm text-muted">Loading real data...</p>}
      {real && loadError && <p className="panel p-6 text-center text-sm text-live">{loadError}</p>}
      {configs[section] && <CrudSection key={section} {...cfg} rows={real ? realRows : data[section]} setRows={(r) => setData((d) => ({ ...d, [section]: r }))} onSave={real ? save : undefined} onDelete={real ? del : undefined} onToggle={real ? toggle : undefined} />}
    </div>
  );
}
