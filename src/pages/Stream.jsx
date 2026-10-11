import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Cover from "../components/Cover.jsx";
import Avatar from "../components/Avatar.jsx";
import Icon from "../components/Icon.jsx";
import StreamCard from "../components/StreamCard.jsx";
import useNow from "../hooks/useNow.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifs } from "../context/NotifContext.jsx";
import { games } from "../mock/mockData.js";
import { chatBots } from "../mock/mockPhase3.js";
import { getStream, getRelated, getLike, setLike } from "../api/streamApi.js";
import { useMock } from "../api/http.js";
import { getComments, postComment, setCommentLike, deleteComment, editComment } from "../api/commentApi.js";
import { loadModule, alertBox } from "../utils/cdn.js";

// Get the 11-character YouTube id from a normal or short link
function ytId(url) {
  const m = (url || "").match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// YouTube embed (looping, muted), MP4 video, or generated art when no link is set yet
function Player({ s }) {
  const id = ytId(s.videoUrl);
  if (id) {
    const src = "https://www.youtube.com/embed/" + id + "?autoplay=1&mute=1&loop=1&playlist=" + id + "&controls=0&modestbranding=1&rel=0&playsinline=1";
    return <iframe className="absolute inset-0 h-full w-full" src={src} allow="autoplay; encrypted-media" title={s.title} />;
  }
  if (s.videoUrl) return <video className="absolute inset-0 h-full w-full object-cover" src={s.videoUrl} autoPlay muted loop playsInline />;
  return (
    <Cover colors={games[s.cat] || ["#7c3aed", "#2563ff"]} className="absolute inset-0">
      <div className="shade" />
      <span className="mono absolute bottom-3 right-3 z-10 text-[10px] text-muted">Demo loop · add a YouTube link in Admin</span>
    </Cover>
  );
}

function Sparkline({ data }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => (i / (data.length - 1)) * 96 + "," + (22 - ((v - min) / (max - min || 1)) * 20)).join(" ");
  return <svg viewBox="0 0 96 24" className="h-6 w-24"><polyline points={pts} fill="none" stroke="#19e3d2" strokeWidth="1.5" /></svg>;
}

// Chat panel: bots every few seconds + your own messages, emoji picker, density slider
function Chat({ open, onClose, onActivity }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState(() => chatBots.slice(0, 4).map((m, i) => ({ id: i, ...m })));
  const [text, setText] = useState("");
  const [density, setDensity] = useState(1);
  const [picker, setPicker] = useState(false);
  const listRef = useRef(null);
  const msgsRef = useRef([]);
  msgsRef.current = msgs;

  useEffect(() => {
    const timer = setInterval(() => {
      // pick a line that was not used in the last 5 messages
      const recent = msgsRef.current.slice(-5).map((x) => x.text);
      const fresh = chatBots.filter((b) => !recent.includes(b.text));
      const m = fresh[Math.floor(Math.random() * fresh.length)];
      setMsgs((l) => [...l, { id: Date.now(), ...m }].slice(-60));
      onActivity(false, m);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { listRef.current.scrollTop = listRef.current.scrollHeight; }, [msgs]);
  useEffect(() => { if (picker) loadModule("https://cdn.jsdelivr.net/npm/emoji-picker-element@1/index.js"); }, [picker]);

  // The emoji picker is a web component: listen for its click event once
  const pickerRef = useCallback((el) => {
    if (el) {
      el.className = "dark";
      el.addEventListener("emoji-click", (e) => setText((t) => t + e.detail.unicode));
    }
  }, []);

  function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setMsgs((l) => [...l, { id: Date.now(), user: user?.username || "you", pro: user?.isPro, text }].slice(-60));
    setText("");
    setPicker(false);
    onActivity(true, { user: user?.username || "you", text });
  }

  const size = ["text-xs space-y-1", "text-sm space-y-2", " space-y-3"][density];

  return (
    <aside className={(open ? "slideup fixed inset-x-0 bottom-0 z-50 flex h-[75vh] max-h-[640px] rounded-t-2xl " : "hidden ") + "panel flex-col lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-20 lg:z-10 lg:max-h-none lg:flex lg:h-[calc(100vh-6.5rem)] lg:rounded-xl"}>
      <div className="mx-auto mt-2 h-1 w-10 rounded bg-line lg:hidden" />
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="mono text-[11px] font-bold">Live chat</h2>
        <label className="flex items-center gap-2" title="Chat size"><span className="mono text-[9px] text-muted">Aa</span><input type="range" min="0" max="2" value={density} onChange={(e) => setDensity(Number(e.target.value))} className="w-16 accent-[#a24bff]" /></label>
        <button onClick={onClose} className="text-muted lg:hidden" aria-label="Close chat">✕</button>
      </header>
      <div ref={listRef} className={"min-h-0 flex-1 overflow-y-auto p-4 " + size}>
        {msgs.map((m) => (
          <div key={m.id} className="rise break-words">
            <b className={m.pro ? "goldname" : "text-neon"}>{m.user}</b>
            {m.pro && <span className="tag tag-pro ml-1">PRO</span>}{" "}
            <span className="text-[#c9c9de]">{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="relative flex gap-2 border-t border-line p-3">
        {picker && <div className="absolute bottom-full right-2 z-10 mb-2"><emoji-picker ref={pickerRef} /></div>}
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Send a message..." className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon" />
        <button type="button" onClick={() => setPicker(!picker)} aria-label="Emoji" className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-card">😊</button>
        <button className="btn-cut btn-pri px-4 text-sm">Send</button>
      </form>
    </aside>
  );
}

function Comments({ streamId }) {
  const [list, setList] = useState([]);
  const [text, setText] = useState("");
  const [sort, setSort] = useState("top");
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null); // { id, text }

  const fail = (err) => alertBox({ icon: "error", title: err.message });

  // Real mode reloads after every change, so likes, replies and edits always match the server
  const reload = () => getComments(streamId).then(setList).catch(() => {});

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getComments(streamId)
      .then((rows) => { if (alive) { setList(rows); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [streamId]);

  async function post(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const c = await postComment(streamId, text.trim(), replyTo ? replyTo.id : null);
      if (useMock) setList([c, ...list]);
      else await reload();
      setText("");
      setReplyTo(null);
    } catch (err) {
      fail(err);
    }
  }

  async function like(c) {
    if (useMock) {
      setList(list.map((x) => (x.id === c.id ? { ...x, likes: x.likes + 1 } : x)));
      return;
    }
    try {
      await setCommentLike(c.id, !c.liked);
      await reload();
    } catch (err) {
      fail(err);
    }
  }

  async function del(c) {
    try {
      await deleteComment(c.id);
      if (useMock) setList(list.filter((x) => x.id !== c.id && x.parentId !== c.id));
      else await reload();
    } catch (err) {
      fail(err);
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing || !editing.text.trim()) return;
    try {
      await editComment(editing.id, editing.text.trim());
      setEditing(null);
      await reload();
    } catch (err) {
      fail(err);
    }
  }

  const sorted = [...list].sort((a, b) =>
    (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
    (sort === "top" ? b.likes - a.likes : Date.parse(b.at) - Date.parse(a.at)));

  // one comment row; used for top-level comments and for their replies (small = reply)
  function row(c, small) {
    return (
      <div className="flex gap-2">
        <Avatar name={c.user} size={small ? 24 : 34} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <b className={c.pro ? "goldname" : ""}>{c.user}</b>
            {c.pro && <span className="tag tag-pro">PRO</span>}
            {c.pinned && <span className="tag">PINNED BY ADMIN</span>}
            {c.locked && <span className="tag tag-mute">LOCKED</span>}
            {c.edited && <span className="mono text-[10px] text-muted">(edited)</span>}
          </div>
          {editing && editing.id === c.id ? (
            <form onSubmit={saveEdit} className="mt-2 flex gap-2">
              <input value={editing.text} onChange={(e) => setEditing({ id: c.id, text: e.target.value })} className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon" />
              <button className="btn-cut btn-pri px-4 text-xs">Save</button>
              <button type="button" onClick={() => setEditing(null)} className="btn-cut btn-sec px-3 text-xs">✕</button>
            </form>
          ) : (
            <p className="mt-1 break-words text-sm text-[#c9c9de]">{c.text}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button onClick={() => like(c)} className={"mono text-[10px] " + (c.liked ? "text-neon" : "text-muted hover:text-neon")}>▲ {c.likes}</button>
            {!useMock && !small && !c.locked && <button onClick={() => setReplyTo(c)} className="mono text-[10px] text-muted hover:text-white">Reply</button>}
            {!useMock && c.mine && !c.locked && <button onClick={() => setEditing({ id: c.id, text: c.text })} className="mono text-[10px] text-muted hover:text-white">Edit</button>}
            {c.mine && <button onClick={() => del(c)} className="mono text-[10px] text-live hover:text-white">Delete</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="panel">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="mono text-[11px] font-bold">Comments · {list.length}</h2>
        <div className="flex rounded-lg border border-line bg-card p-0.5 text-xs font-bold">
          {["top", "newest"].map((t) => <button key={t} onClick={() => setSort(t)} className={"rounded px-3 py-1 capitalize " + (sort === t ? "bg-brand text-white" : "text-muted")}>{t}</button>)}
        </div>
      </header>
      <form onSubmit={post} className="flex gap-2 p-4">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={replyTo ? "Reply to " + replyTo.user + "..." : "Add a comment..."} className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon" />
        {replyTo && <button type="button" onClick={() => setReplyTo(null)} className="btn-cut btn-sec px-3 text-xs" title="Cancel reply">✕</button>}
        <button className="btn-cut btn-pri px-5 text-sm">Post</button>
      </form>
      {loading && <p className="p-6 text-center text-sm text-muted">Loading comments...</p>}
      <ul className="divide-y divide-line">
        {sorted.map((c) => (
          <li key={c.id} className="p-4">
            {row(c, false)}
            {c.replies && c.replies.length > 0 && (
              <ul className="ml-10 mt-3 space-y-3 border-l border-line pl-3">
                {c.replies.map((r) => <li key={r.id}>{row(r, true)}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StreamView({ id }) {
  const { push } = useNotifs();
  const now = useNow();
  const [s, setS] = useState(null);
  const [related, setRelated] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const startedAt = useRef(Date.now());
  const chatOpenRef = useRef(false);
  const [viewers, setViewers] = useState(0);
  const [series, setSeries] = useState(Array(20).fill(0));
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [theater, setTheater] = useState(false);
  const [hype, setHype] = useState(30);
  const [floaters, setFloaters] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [last, setLast] = useState(null);
  chatOpenRef.current = chatOpen;

  // Load the stream, the related list and the like state from the api (re-runs when the id changes)
  useEffect(() => {
    let alive = true;
    setS(null);
    getStream(id)
      .then((stream) => {
        if (!alive) return;
        if (!stream) return setNotFound(true);
        setS(stream);
        setViewers(stream.viewers);
        setSeries(Array(20).fill(stream.viewers));
        startedAt.current = Date.now() - (stream.mins || 0) * 60000;
        getRelated(id).then((rows) => { if (alive) setRelated(rows); }).catch(() => {});
        getLike(id).then((like) => { if (alive) { setLiked(like.liked); setLikes(like.likesCount); } }).catch(() => {});
      })
      .catch(() => { if (alive) setNotFound(true); });
    return () => { alive = false; };
  }, [id]);

  // Lock page scroll while the chat sheet is open; Escape or a wider screen closes it
  useEffect(() => {
    document.body.style.overflow = chatOpen ? "hidden" : "";
    function onKey(e) { if (e.key === "Escape") setChatOpen(false); }
    function onResize() { if (window.innerWidth >= 1024) setChatOpen(false); }
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize); };
  }, [chatOpen]);

  // Viewer count drifts every 5 seconds; hype slowly cools down
  useEffect(() => {
    const t1 = setInterval(() => {
      setViewers((v) => { const n = Math.max(500, v + Math.floor(Math.random() * 121) - 50); setSeries((a) => [...a.slice(1), n]); return n; });
    }, 5000);
    const t2 = setInterval(() => setHype((h) => Math.max(0, h - 1)), 1500);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  // Full hype meter = RIFT MODE toast
  useEffect(() => {
    if (hype >= 100) { push("system", "RIFT MODE unlocked: chat is on fire", "/app/stream/" + id); setHype(35); }
  }, [hype]);

  function onActivity(isUser, m) {
    if (m) setLast(m);
    setHype((h) => Math.min(100, h + (isUser ? 3 : 1)));
    if (!chatOpenRef.current) setUnread((u) => u + 1);
  }

  function react(e) {
    const f = { id: Date.now() + Math.random(), e, left: 10 + Math.random() * 80 };
    setFloaters((l) => [...l, f]);
    setHype((h) => Math.min(100, h + 6));
    setTimeout(() => setFloaters((l) => l.filter((x) => x.id !== f.id)), 1600);
  }

  async function share() {
    try { await navigator.clipboard.writeText(window.location.href); } catch (err) { /* ignore */ }
    alertBox({ toast: true, position: "bottom-end", icon: "success", title: "Link copied", showConfirmButton: false, timer: 1800 });
  }

  // Optimistic like; the server count becomes the new number
  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikes((l) => l + (next ? 1 : -1));
    try {
      const like = await setLike(id, next);
      setLiked(like.liked);
      setLikes(like.likesCount);
    } catch (err) {
      setLiked(!next);
      setLikes((l) => l + (next ? -1 : 1));
      alertBox({ icon: "error", title: err.message });
    }
  }

  if (notFound) return <div className="panel p-10 text-center">Stream not found. <Link to="/app/discover" className="text-neon">Back to Discover</Link></div>;
  if (!s) return <div className="panel shimmer min-h-[400px]" />;

  const up = Math.max(0, Math.floor((now - startedAt.current) / 1000));
  const clock = [Math.floor(up / 3600), Math.floor((up % 3600) / 60), up % 60].map((n) => String(n).padStart(2, "0")).join(":");
  const [c1, c2] = games[s.cat] || ["#7c3aed", "#2563ff"];

  return (
    <div className={"grid gap-4 " + (theater ? "lg:grid-cols-[1fr_300px]" : "lg:grid-cols-[1fr_340px]")}>
      <div className="relative isolate min-w-0 space-y-4">
        <div className="glowbg" style={{ "--c1": c1 + "88", "--c2": c2 + "66" }} />

        {/* Player (pinned at the top on phones) */}
        <div className="sticky top-[60px] z-30 -mx-3 sm:-mx-4 lg:static lg:mx-0">
          <div className={"relative overflow-hidden bg-black lg:rounded-xl " + (theater ? "aspect-video lg:aspect-[21/9]" : "aspect-video")}>
            <Player s={s} />
            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
              <span className="tag tag-live"><span className="livedot !bg-white" />LIVE</span>
              <span className="tag tag-mute"><span className="eq"><i /><i /><i /><i /></span>{viewers.toLocaleString("en-US")}</span>
            </div>
            <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
              <span className="tag tag-mute">UPTIME {clock}</span>
              <button onClick={() => setTheater(!theater)} aria-label="Theater mode" className="hidden h-8 w-8 place-items-center rounded border border-line bg-black/60 lg:grid"><Icon name="grid" size={14} /></button>
            </div>
            {floaters.map((f) => <span key={f.id} className="floatup z-10" style={{ left: f.left + "%" }}>{f.e}</span>)}
          </div>
        </div>

        {/* Reactions + hype meter + sparkline */}
        <div className="panel flex flex-wrap items-center gap-4 p-3">
          <div className="flex gap-2">
            {["🔥", "💀", "GG", "❤️"].map((e) => <button key={e} onClick={() => react(e)} className="grid h-10 min-w-10 place-items-center rounded-lg border border-line bg-card px-2 text-lg hover:border-brand active:scale-90">{e}</button>)}
          </div>
          <div className="min-w-40 flex-1">
            <div className="mono mb-1 flex justify-between text-[9px] text-muted"><span>Hype</span><span className={hype > 70 ? "text-live" : "text-neon"}>{hype}%</span></div>
            <div className="h-2 overflow-hidden rounded bg-line"><div className="h-full rounded transition-all" style={{ width: hype + "%", background: "linear-gradient(90deg,#19e3d2,#a24bff,#ff3b5c)" }} /></div>
          </div>
          <div className="hidden items-center gap-2 sm:flex"><Sparkline data={series} /><span className="mono text-[9px] text-muted">viewers (simulated)</span></div>
        </div>

        {/* Chat preview strip (phones and tablets): tap to open the chat sheet */}
        <button onClick={() => { setChatOpen(true); setUnread(0); }} className="panel flex w-full items-center gap-3 p-3 text-left lg:hidden">
          <span className="tag tag-live shrink-0">LIVE CHAT</span>
          <span className="min-w-0 flex-1 truncate text-sm text-[#c9c9de]">{last ? <><b className={last.pro ? "goldname" : "text-neon"}>{last.user}</b> {last.text}</> : "Tap to join the chat"}</span>
          {unread > 0 && <span className="rounded-full bg-live px-1.5 text-[10px] font-bold">{unread > 99 ? "99+" : unread}</span>}
          <span className="mono shrink-0 text-[10px] text-brand">Open</span>
        </button>

        {/* Title, channel, actions */}
        <section className="panel space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2"><span className="tag">{s.label}</span>{s.tags.map((t) => <span key={t} className="tag tag-mute">#{t}</span>)}</div>
          <h1 className="font-head text-2xl font-bold leading-tight sm:text-3xl">{s.title}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
            <Avatar name={s.channel} size={48} live />
            <div className="min-w-0 flex-1 basis-40"><div className="flex items-center gap-2 font-bold">{s.channel}{s.pro && <span className="tag tag-pro">PRO</span>}</div><div className="mono text-[10px] text-muted">Started {Math.floor(s.mins / 60)}h {s.mins % 60}m ago</div></div>
            <div className="flex w-full gap-2 sm:w-auto">
            <button onClick={toggleLike} className={"btn-cut flex-1 px-4 py-2.5 text-xs sm:flex-none " + (liked ? "btn-pri" : "btn-sec")}>Like {likes >= 1000 ? (likes / 1000).toFixed(1) + "K" : likes}</button>
            <button onClick={share} className="btn-cut btn-sec flex-1 px-4 py-2.5 text-xs sm:flex-none">Share</button>
            <button onClick={() => setFollowing(!following)} className={"btn-cut flex-1 px-5 py-2.5 text-xs sm:flex-none " + (following ? "btn-sec" : "btn-pri")}>{following ? "Following" : "Follow"}</button>
            </div>
          </div>
          <p className="text-sm text-[#c9c9de]">Best-of-five, map 3 going the distance. Chat is moving fast, so bring snacks. Tap the reactions to push the hype meter and unlock RIFT MODE.</p>
        </section>

        <section>
          <h2 className="mono mb-2 text-[11px] font-bold text-muted">Related / up next</h2>
          <div className="snap-row no-scrollbar">{related.map((r, i) => <div key={r.id} className="w-64"><StreamCard s={r} index={i} /></div>)}</div>
        </section>

        <Comments streamId={id} />
      </div>

      {chatOpen && <div onClick={() => setChatOpen(false)} className="fixed inset-0 z-[45] bg-black/60 lg:hidden" />}
      <Chat open={chatOpen} onClose={() => setChatOpen(false)} onActivity={onActivity} />

    </div>
  );
}

// key={id} resets all state when you open another stream
export default function Stream() {
  const { id } = useParams();
  return <StreamView key={id} id={id} />;
}
