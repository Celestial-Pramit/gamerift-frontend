import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Counter from "../components/Counter.jsx";
import Brand from "../components/Brand.jsx";
import StreamCard from "../components/StreamCard.jsx";
import useNow from "../hooks/useNow.js";
import { streams, events, countdown } from "../mock/mockData.js";
import { getPublicStats } from "../api/statsApi.js";
import { SideRail } from "../components/landing/SideRails.jsx";
import RiftGuide from "../components/landing/RiftGuide.jsx";
import "../components/landing/SideRails.css";

const features = [
  { icon: "play", title: "Watch live", text: "From the dashboard to a looping player in one click.", color: "#a24bff" },
  { icon: "chat", title: "Chat", text: "Real-time messages, emoji, bots and Pro gold names.", color: "#19e3d2" },
  { icon: "users", title: "Follow channels", text: "Follow alerts land as toasts and bell notifications.", color: "#2563ff" },
  { icon: "cal", title: "Events", text: "Countdowns, reminders and tournaments that never miss you.", color: "#f5b942" },
];
const STATS_FALLBACK = [
  { to: 1240, decimals: 0, suffix: "", label: "streams live now" },
  { to: 1.24, decimals: 2, suffix: "M", label: "monthly viewers" },
  { to: 86400, decimals: 0, suffix: "", label: "messages / day" },
  { to: 4200, decimals: 0, suffix: "", label: "channels" },
];
const steps = [["Sign up", "Create an account and verify with a 6-digit OTP."], ["Follow channels", "Pick your favourites and get a ping when they go live."], ["Watch and chat", "Jump in, react, chat, and unlock RIFT MODE with the crowd."]];
const lines = [["Rozu", true, "GG, calling map 4 already"], ["mim", false, "where is my hype toast"], ["bot", false, "NightRaid is now 12k followers"], ["saha", false, "defense this round was NASTY"], ["tanvir", false, "chat is moving too fast"], ["nila", false, "Dhaka represent!"]];
const voices = [["Rozu", "Ranked grinder", "The chat feels alive even on a slow night. The gold name is a flex."], ["NightRaid", "Esports caster", "Follow alerts and event reminders mean my community never misses a final."], ["MimSays", "IRL streamer", "Charity streams with a live goal bar. Simple and it just works."]];
const faq = [["Is Gamerift free?", "Yes. Watching, following and chatting are free. Pro is an optional one-time pass."], ["Are the streams real?", "This is a demo build: streams are looping clips with a live look. Auth, chat, follows, notifications and sandbox payments are real flows."], ["How do payments work?", "Pro uses the bKash sandbox, so no real money moves. Other methods are marked Soon."], ["Can I stream myself?", "Not yet. Admins add streams for now, and a real live option is marked Coming soon."], ["Which devices work?", "Any modern browser on phone, tablet or desktop. The desktop app is coming in the next release."]];

// Fades and slides a section in when it scrolls into view
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: delay + "ms" }} className={"reveal " + className}>{children}</div>;
}

function ChatMock() {
  const [n, setN] = useState(3);
  useEffect(() => { const t = setInterval(() => setN((x) => x + 1), 2200); return () => clearInterval(t); }, []);
  return (
    <div className="panel space-y-2 p-4 text-sm">
      {Array.from({ length: 4 }).map((_, i) => { const [u, pro, t] = lines[(n - 3 + i) % lines.length]; return <div key={n + i} className="rise"><b className={pro ? "goldname" : "text-neon"}>{u}</b>{pro && <span className="tag tag-pro ml-1">PRO</span>} <span className="text-[#c9c9de]">{t}</span></div>; })}
    </div>
  );
}

export default function Landing() {
  const now = useNow();
  const [progress, setProgress] = useState(0);
  const [top, setTop] = useState(false);
  const [name, setName] = useState("Rozu");
  const [stats, setStats] = useState(STATS_FALLBACK);
  const live = streams.filter((s) => s.status === "live").slice(0, 4);

  // Real numbers when the backend is on: { users, liveStreams, channels, viewersNow }
  useEffect(() => {
    getPublicStats().then((d) => {
      if (!d) return;
      setStats([
        { to: d.users, decimals: 0, suffix: "", label: "members" },
        { to: d.liveStreams, decimals: 0, suffix: "", label: "streams live now" },
        { to: d.channels, decimals: 0, suffix: "", label: "channels" },
        { to: d.viewersNow, decimals: 0, suffix: "", label: "watching right now" },
      ]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
      setTop(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing-bg min-h-screen overflow-x-hidden">
      <div className="fixed left-0 top-0 z-50 h-0.5 bg-gradient-to-r from-[#a24bff] to-[#19e3d2]" style={{ width: progress + "%", background: "linear-gradient(90deg,#a24bff,#19e3d2)" }} />
      <header className="sticky top-0 z-30 border-b border-line bg-base/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Brand className="text-xl" />
          <nav className="hidden gap-6 font-head text-lg text-muted md:flex"><a href="#trending" className="hover:text-white">Trending</a><a href="#how" className="hover:text-white">How it works</a><a href="#pro" className="hover:text-white">Pro</a><a href="#faq" className="hover:text-white">FAQ</a></nav>
          <div className="flex items-center gap-3 sm:gap-4"><Link to="/login" className="font-head text-lg text-muted hover:text-white">Login</Link><Link to="/register" className="btn-cut btn-pri px-4 py-2 text-sm">Sign up</Link></div>
        </div>
      </header>

      <div className="landing-with-rails">
        <SideRail side="left" />
        <main className="center-column min-w-0">
          {/* Hero */}
          <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-12">
        <div className="gradborder scan relative overflow-hidden rounded-2xl p-6 sm:p-8 md:p-12">
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 font-head text-sm text-[#d9c4ff]">Bangladesh's game launcher for streams</span>
                <span className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-sm"><span className="livedot" /> <Counter to={1240} /> streams live right now</span>
              </div>
              <h1 className="mt-6 leading-[0.95]">
                <Brand text="WATCH." className="block text-4xl sm:text-6xl" delay={500} />
                <Brand text="CHAT." className="block text-4xl sm:text-6xl" delay={700} />
                <Brand text="LEVEL UP." className="block text-4xl sm:text-6xl" delay={900} />
              </h1>
              <p className="mt-5 max-w-lg text-muted">Live esports, ranked grinds and late-night hangs, with real-time chat, follow alerts and events that never miss you. Built for the Dhaka crowd first.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/login" className="btn-cut btn-pri px-6 py-3 text-base"><Icon name="play" size={16} /> Use Web Version</Link>
                <span className="flex flex-wrap items-center gap-2"><button disabled className="btn-cut btn-sec px-6 py-3 text-base opacity-50"><Icon name="download" size={16} /> Download App</button><span className="rounded border border-muted/40 bg-muted/10 px-2 py-0.5 text-xs text-[#c3c3d6]">Coming in next release</span></span>
              </div>
            </div>
            <div className="demo-art relative aspect-video overflow-hidden rounded-xl border border-line">
              <div className="scan absolute inset-0" />
              <div className="absolute left-3 top-3 z-10 flex gap-2"><span className="flex items-center gap-1.5 rounded bg-live px-2 py-0.5 text-xs font-bold"><span className="livedot !bg-white" /> DEMO LOOP</span><span className="tag tag-pro">SAMPLE CLIP</span></div>
              <div className="float absolute right-3 top-14 z-10 rounded-lg border border-line bg-card/80 px-3 py-2 text-xs backdrop-blur"><b className="text-gold">Rozu</b> GG, calling map 4 already</div>
              <div className="float absolute left-3 top-1/2 z-10 rounded-lg border border-line bg-card/80 px-3 py-2 text-xs backdrop-blur" style={{ animationDelay: "1.5s" }}>🔔 NightRaid just went live</div>
              <div className="absolute inset-x-3 bottom-3 z-10"><div className="font-display text-base tracking-wide">GRAND FINALS · MAP 3</div><div className="mt-1 flex items-center gap-2 text-xs"><span className="eq"><i /><i /><i /><i /></span><span>148,204 watching</span><span className="tag">ESPORTS</span></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-[#0c0c13] p-5 md:grid-cols-4">
          {stats.map((s, i) => <div key={s.label}><div className={"font-display text-2xl font-black " + (i % 2 ? "text-neon" : "text-white")}><Counter to={s.to} decimals={s.decimals} suffix={s.suffix} /></div><div className="text-xs text-muted">{s.label} (demo numbers)</div></div>)}
        </div>
      </section>

      {/* Trending */}
      <section id="trending" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Reveal><h2 className="font-display text-2xl font-black sm:text-3xl">TRENDING <span className="gradtext">RIGHT NOW</span></h2><p className="mb-6 text-sm text-muted">Log in to jump into any of these.</p></Reveal>
        <div className="snap-row no-scrollbar sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">{live.map((s, i) => <div key={s.id} className="w-72 sm:w-auto"><StreamCard s={s} index={i} /></div>)}</div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <Reveal className="relative">
          <h2 className="mb-8 font-display text-2xl font-black sm:text-3xl">HOW IT <span className="gradtext">WORKS</span></h2>
          <svg className="absolute left-0 right-0 top-[88px] hidden h-2 w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 2"><line className="draw" x1="8" y1="1" x2="92" y2="1" stroke="#a24bff" strokeWidth="0.4" strokeDasharray="2 1.5" /></svg>
          <div className="relative grid gap-4 md:grid-cols-3">
            {steps.map(([t, d], i) => <div key={t} className="featcard"><div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-brand/60 bg-base font-display text-xl font-black text-brand">{i + 1}</div><h3 className="font-head text-xl font-bold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div>)}
          </div>
        </Reveal>
      </section>

      {/* Feature showcases */}
      <section className="mx-auto max-w-6xl space-y-14 px-4 pb-14 sm:px-6">
        <Reveal className="grid items-center gap-6 md:grid-cols-2"><div><span className="tag">LIVE CHAT</span><h3 className="mt-3 font-head text-3xl font-bold">Chat that never sleeps</h3><p className="mt-2 text-muted">Emoji, reactions and a hype meter. Pro members get a gold name that stands out in the crowd.</p></div><ChatMock /></Reveal>
        <Reveal className="grid items-center gap-6 md:grid-cols-2"><div className="order-2 md:order-1"><div className="panel float space-y-2 p-4"><div className="mono text-[9px] text-live">NOW LIVE</div><div className="font-semibold">NightRaid is live: Grand Finals · Map 3</div><div className="mono text-[10px] text-muted">2 min ago · tap to watch</div></div></div><div className="order-1 md:order-2"><span className="tag tag-live">ALERTS</span><h3 className="mt-3 font-head text-3xl font-bold">Never miss a stream</h3><p className="mt-2 text-muted">Follow a channel and get a toast and a bell notification the moment it goes live.</p></div></Reveal>
        <Reveal className="grid items-center gap-6 md:grid-cols-2"><div><span className="tag">EVENTS</span><h3 className="mt-3 font-head text-3xl font-bold">Countdowns you can feel</h3><p className="mt-2 text-muted">Turn on Remind me and we ping you before the finals start.</p></div><div className="panel p-4"><div className="font-bold">{events[0].title}</div><div className="mt-2 font-display text-2xl text-neon">{countdown(events[0].at - now)}</div></div></Reveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {features.map((f, i) => <Reveal key={f.title} delay={i * 80}><div className="featcard h-full"><div className="mb-3 grid h-10 w-10 place-items-center rounded-lg border" style={{ color: f.color, borderColor: f.color + "66", background: f.color + "1f" }}><Icon name={f.icon} size={20} /></div><h3 className="font-head text-xl font-bold">{f.title}</h3><p className="mt-1 text-sm text-muted">{f.text}</p></div></Reveal>)}
      </section>

      {/* Pro */}
      <section id="pro" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <Reveal className="proteaser grid items-center gap-6 p-6 md:grid-cols-2">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2"><span className="tag tag-pro"><Icon name="star" size={11} /> PRO</span><span className="tag tag-mute">Pay with bKash</span></div>
            <h3 className="font-head text-3xl font-bold">Level up your name</h3>
            <p className="mt-1 text-sm text-muted">Gold name in chat, Pro badge and zero ads. From ৳99 for 30 days.</p>
            <Link to="/register" className="btn-cut btn-pri mt-4 px-6 py-3 text-base">Get Pro</Link>
          </div>
          <div className="rounded-lg border border-line bg-card p-4 text-sm"><input value={name} maxLength={14} onChange={(e) => setName(e.target.value)} className="mb-3 h-10 w-full rounded border border-line bg-base px-3 outline-none focus:border-gold" /><div><b className="goldname">{name || "you"}</b> <span className="tag tag-pro">PRO</span> <span className="text-[#c9c9de]">this is how you look in chat</span></div></div>
        </Reveal>
      </section>

      {/* Voices */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <Reveal><h2 className="font-display text-2xl font-black sm:text-3xl">COMMUNITY <span className="gradtext">VOICES</span> <span className="tag tag-mute align-middle">SAMPLE QUOTES</span></h2></Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-3">{voices.map(([n, r, q], i) => <Reveal key={n} delay={i * 100}><div className="panel h-full p-5"><p className="text-sm text-[#c9c9de]">“{q}”</p><div className="mt-4 text-sm"><b>{n}</b> <span className="text-muted">· {r}</span></div></div></Reveal>)}</div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        <Reveal><h2 className="mb-6 font-display text-2xl font-black sm:text-3xl">GOT <span className="gradtext">QUESTIONS?</span></h2>
          <div className="space-y-3">{faq.map(([q, a]) => <details key={q} className="faq panel px-4 py-3"><summary className="flex items-center justify-between gap-3 font-semibold">{q}<span className="plus text-xl text-brand transition">+</span></summary><p className="mt-2 text-sm text-muted">{a}</p></details>)}</div>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <Reveal className="gradborder scan relative overflow-hidden rounded-2xl p-8 text-center sm:p-12"><div className="relative z-10"><h2 className="font-display text-3xl font-black sm:text-5xl">READY TO <span className="gradtext">ENTER THE RIFT?</span></h2><p className="mx-auto mt-3 max-w-md text-muted">Free to join. Your first stream is one click away.</p><Link to="/register" className="btn-cut btn-pri mt-6 px-8 py-3.5 text-base">Create free account</Link></div></Reveal>
      </section>

        </main>
        <SideRail side="right" />
      </div>

      <RiftGuide />

      <footer className="border-t border-line bg-[#0b0b11]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div><Brand className="text-lg" /><p className="mt-2 text-muted">GG. See you in the rift.</p></div>
          {[["Product", ["Watch", "Events", "Go Pro"]], ["Company", ["About", "Contact"]], ["Legal", ["Terms", "Privacy"]]].map(([h, items]) => <div key={h}><div className="mb-2 font-head text-base font-bold">{h}</div><div className="space-y-1 text-muted">{items.map((x) => <div key={x}>{x}</div>)}</div></div>)}
        </div>
      </footer>

      {top && <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className="btn-cut btn-pri fixed bottom-4 right-4 z-40 px-4 py-3 text-sm">↑ Top</button>}
    </div>
  );
}
