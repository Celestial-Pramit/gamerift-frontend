import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Counter from "../components/Counter.jsx";
import Brand from "../components/Brand.jsx";
import StreamCard from "../components/StreamCard.jsx";
import Ticker from "../components/Ticker.jsx";
import useNow from "../hooks/useNow.js";
import { streams, events, countdown, games } from "../mock/mockData.js";
import { getPublicStats } from "../api/statsApi.js";
import RiftGuide from "../components/landing/RiftGuide.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import "./Landing.css";

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

function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={className + " rv" + (shown ? " in" : "")} style={{ animationDelay: delay + "ms" }} {...rest}>
      {children}
    </Tag>
  );
}

function ChatMock() {
  const [n, setN] = useState(3);
  useEffect(() => { const t = setInterval(() => setN((x) => x + 1), 5000); return () => clearInterval(t); }, []);
  return (
    <div className="panel space-y-2 p-4 text-sm">
      {Array.from({ length: 4 }).map((_, i) => { const [u, pro, t] = lines[(n - 3 + i) % lines.length]; return <div key={n + i} className="rise"><b className={pro ? "goldname" : "text-neon"}>{u}</b>{pro && <span className="tag tag-pro ml-1">PRO</span>} <span className="text-[#c9c9de]">{t}</span></div>; })}
    </div>
  );
}

function ToastDemo() {
  return (
    <div className="space-y-2">
      <div className="toastin panel flex items-center gap-3 p-3 relative overflow-hidden" style={{ borderColor: "#ff3b5c88" }}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: "#ff3b5c22", color: "#ff3b5c" }}><Icon name="radio" size={18} /></span>
        <div className="min-w-0"><div className="mono text-[9px]" style={{ color: "#ff3b5c" }}>NOW LIVE</div><div className="truncate text-sm font-semibold">NightRaid went live: Grand Finals · Map 3</div></div>
        <div className="toastbar absolute bottom-0 left-0 h-0.5 w-full" style={{ background: "#ff3b5c" }} />
      </div>
      <div className="toastin panel flex items-center gap-3 p-3 relative overflow-hidden" style={{ borderColor: "#19e3d288" }}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: "#19e3d222", color: "#19e3d2" }}><Icon name="cal" size={18} /></span>
        <div className="min-w-0"><div className="mono text-[9px]" style={{ color: "#19e3d2" }}>EVENT ALERT</div><div className="truncate text-sm font-semibold">Dhaka Major semifinal starts in 30 minutes</div></div>
        <div className="toastbar absolute bottom-0 left-0 h-0.5 w-full" style={{ background: "#19e3d2" }} />
      </div>
    </div>
  );
}

function EventCountdown() {
  const now = useNow();
  return (
    <div className="mt-4 panel p-4 text-center">
      <div className="font-bold">{events[0].title}</div>
      <div className="mt-2 font-display text-3xl text-neon">{countdown(events[0].at - now)}</div>
    </div>
  );
}

export default function Landing() {
  const [top, setTop] = useState(false);
  const [name, setName] = useState("Rozu");
  const [stats, setStats] = useState(STATS_FALLBACK);
  const live = streams.filter((s) => s.status === "live");
  const liveEight = live.slice(0, 8);
  const barRef = useRef(null);

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
    let ticking = false;
    let lastTop = false;
    function update() {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = "scaleX(" + p + ")";
      const t = window.scrollY > 600;
      if (t !== lastTop) { lastTop = t; setTop(t); }
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onRiftOpen() {
      const evt = new CustomEvent("rift-guide:open");
      window.dispatchEvent(evt);
    }
    const btn = document.getElementById("open-rift-guide");
    if (btn) btn.addEventListener("click", onRiftOpen);
    return () => { if (btn) btn.removeEventListener("click", onRiftOpen); };
  }, []);

  return (
    <div className="landing-root">
      <div className="landing-atmosphere" aria-hidden="true">
        <div className="atmosphere-grid" />
      </div>

      <div ref={barRef} className="fixed left-0 top-0 z-50 h-0.5 w-full origin-left" style={{ transform: "scaleX(0)", background: "linear-gradient(90deg,#a24bff,#19e3d2)" }} />

      <header className="sticky top-0 z-30 border-b border-line bg-base/95">
        <div className="page-wrap flex items-center justify-between px-4 py-3 sm:px-6">
          <Brand className="text-xl" />
          <nav className="hidden gap-6 font-head text-lg text-muted md:flex"><a href="#trending" className="hover:text-white">Trending</a><a href="#how" className="hover:text-white">How it works</a><a href="#pro" className="hover:text-white">Pro</a><a href="#faq" className="hover:text-white">FAQ</a></nav>
          <div className="flex items-center gap-3 sm:gap-4"><Link to="/login" className="font-head text-lg text-muted hover:text-white">Login</Link><Link to="/register" className="btn-cut btn-pri px-4 py-2 text-sm">Sign up</Link></div>
        </div>
      </header>

      <main className="page-wrap relative z-10">
        {/* HERO */}
        <section id="hero" className="hero-section">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 font-head text-sm text-[#d9c4ff]">Bangladesh's game launcher for streams</span>
                <span className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-sm"><span className="livedot" /> <Counter to={1240} /> streams live right now</span>
              </div>
              <h1 className="mt-6 leading-[0.95] hero-headline">
                <Brand text="WATCH." className="block" delay={500} />
                <Brand text="CHAT." className="block" delay={700} />
                <Brand text="LEVEL UP." className="block" delay={900} />
              </h1>
              <p className="mt-5 max-w-[52ch] text-muted">Live esports, ranked grinds and late-night hangs, with real-time chat, follow alerts and events that never miss you. Built for the Dhaka crowd first.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/login" className="btn-cut btn-pri px-6 py-3"><Icon name="play" size={16} /> Use Web Version</Link>
                <span className="flex flex-wrap items-center gap-2"><button disabled className="btn-cut btn-sec px-6 py-3 opacity-50"><Icon name="download" size={16} /> Download App</button><span className="rounded border border-muted/40 bg-muted/10 px-2 py-0.5 text-xs text-[#c3c3d6]">Coming in next release</span></span>
              </div>
            </div>
            <div className="hero-preview">
              <div className="preview-stack">
                <div className="ghost-card ghost-1" aria-hidden="true" />
                <div className="ghost-card ghost-2" aria-hidden="true" />
                <div className="demo-art relative aspect-[16/10] overflow-hidden rounded-2xl border border-line gradborder scan">
                  <div className="absolute left-3 top-3 z-10 flex gap-2"><span className="flex items-center gap-1.5 rounded bg-live px-2 py-0.5 text-xs font-bold"><span className="livedot !bg-white" /> DEMO LOOP</span><span className="tag tag-pro">SAMPLE CLIP</span></div>
                  <div className="float-chip absolute right-3 top-14 z-10 rounded-lg border border-line bg-card/80 px-3 py-2 text-xs backdrop-blur"><b className="text-gold">Rozu</b> GG, calling map 4 already</div>
                  <div className="float-chip absolute left-3 top-1/2 z-10 rounded-lg border border-line bg-card/80 px-3 py-2 text-xs backdrop-blur" style={{ animationDelay: "1.5s" }}>🔔 NightRaid just went live</div>
                  <div className="absolute inset-x-3 bottom-3 z-10"><div className="font-display text-[1rem] tracking-wide">GRAND FINALS · MAP 3</div><div className="mt-1 flex items-center gap-2 text-xs"><span className="eq"><i /><i /><i /><i /></span><span>148,204 watching</span><span className="tag">ESPORTS</span></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE TICKER BAND */}
        <section className="ticker-band" aria-label="Live updates">
          <div className="ticker-fullbleed">
            <Ticker />
          </div>
        </section>

        {/* STATS */}
        <Reveal as="section" delay={100} className="stats-section">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={s.label} className="stat-item">
                <div className={"font-display text-3xl sm:text-4xl font-black " + (i % 2 ? "text-neon" : "text-white")}><Counter to={s.to} decimals={s.decimals} suffix={s.suffix} /></div>
                <div className="text-xs text-muted mt-1">{s.label} <span className="text-xs">(demo numbers)</span></div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* TRENDING */}
        <Reveal as="section" id="trending" delay={150} className="trending-section">
          <div className="section-header">
            <div>
              <span className="section-label mono text-[10px] text-neon">01 / TRENDING</span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black">TRENDING <span className="gradtext">RIGHT NOW</span></h2>
              <p className="mt-2 text-sm text-muted">Log in to jump into any of these.</p>
            </div>
          </div>
          <div className="trending-grid">
            {liveEight.map((s, i) => (
              <Reveal key={s.id} delay={i * 40} className="trending-card-wrapper">
                <StreamCard s={s} index={i} />
                <div className="trending-overlay">Log in to watch</div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* HOW IT WORKS */}
        <Reveal as="section" id="how" delay={200} className="how-section">
          <div className="section-header">
            <span className="section-label mono text-[10px] text-neon">02 / HOW IT WORKS</span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black">HOW IT <span className="gradtext">WORKS</span></h2>
          </div>
          <div className="steps-grid">
            {steps.map(([t, d], i) => (
              <Reveal key={t} delay={i * 80} className="featcard step-card">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-brand/60 bg-base font-display text-xl font-black text-brand">{i + 1}</div>
                <h3 className="font-head text-xl font-bold">{t}</h3>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </Reveal>
            ))}
          </div>
        </Reveal>

{/* FEATURE BENTO */}
        <Reveal as="section" delay={250} className="bento-section">
          <div className="section-header">
            <span className="section-label mono text-[10px] text-neon">03 / FEATURES</span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black">CORE <span className="gradtext">FEATURES</span></h2>
          </div>
          <div className="bento-grid">
            <Reveal delay={0} className="bento-card bento-chat gradborder scan">
              <div className="relative z-10 p-6">
                <span className="tag">LIVE CHAT</span>
                <h3 className="mt-3 font-head text-2xl font-bold">Chat that never sleeps</h3>
                <p className="mt-2 text-muted">Emoji, reactions and a hype meter. Pro members get a gold name that stands out in the crowd.</p>
                <ChatMock />
              </div>
            </Reveal>
            <Reveal delay={80} className="bento-card bento-alerts gradborder scan">
              <div className="relative z-10 p-6">
                <span className="tag tag-live">ALERTS</span>
                <h3 className="mt-3 font-head text-2xl font-bold">Never miss a stream</h3>
                <p className="mt-2 text-muted">Follow a channel and get a toast and a bell notification the moment it goes live.</p>
                <ToastDemo />
              </div>
            </Reveal>
            <Reveal delay={160} className="bento-card bento-countdown gradborder scan">
              <div className="relative z-10 p-6">
                <span className="tag">EVENTS</span>
                <h3 className="mt-3 font-head text-2xl font-bold">Countdowns you can feel</h3>
                <p className="mt-2 text-muted">Turn on Remind me and we ping you before the finals start.</p>
                <EventCountdown />
              </div>
            </Reveal>
            <Reveal delay={240} className="bento-card bento-tiles gradborder scan">
              <div className="relative z-10 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {features.map((f, i) => (
                    <div key={f.title} className="featcard h-full">
                      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg border" style={{ color: f.color, borderColor: f.color + "66", background: f.color + "1f" }}><Icon name={f.icon} size={20} /></div>
                      <h3 className="font-head text-xl font-bold">{f.title}</h3>
                      <p className="mt-1 text-sm text-muted">{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Reveal>

        {/* PRO BAND */}
        <Reveal as="section" id="pro" delay={300} className="pro-band">
          <div className="pro-fullbleed" aria-hidden="true" />
          <div className="pro-grid">
            <div className="pro-content">
              <div className="mb-2 flex flex-wrap items-center gap-2"><span className="tag tag-pro"><Icon name="star" size={11} /> PRO</span><span className="tag tag-mute">Pay with bKash</span></div>
              <h3 className="font-head text-3xl sm:text-4xl font-bold">Level up your name</h3>
              <p className="mt-1 text-sm text-muted">Gold name in chat, Pro badge and zero ads. From ৳99 for 30 days.</p>
              <Link to="/register" className="btn-cut btn-pri mt-4 px-6 py-3 text-[1rem]">Get Pro</Link>
            </div>
            <div className="pro-preview rounded-lg border border-line bg-card p-4 sm:p-6 text-sm">
              <input value={name} maxLength={14} onChange={(e) => setName(e.target.value)} className="mb-3 h-10 w-full rounded border border-line bg-base px-3 outline-none focus:border-gold" />
              <div><b className="goldname">{name || "you"}</b> <span className="tag tag-pro">PRO</span> <span className="text-[#c9c9de]">this is how you look in chat</span></div>
</div>
          </div>
        </Reveal>

        {/* COMMUNITY VOICES */}
        <Reveal as="section" delay={350} className="voices-section">
          <div className="section-header">
            <span className="section-label mono text-[10px] text-neon">04 / COMMUNITY</span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black">COMMUNITY <span className="gradtext">VOICES</span> <span className="tag tag-mute align-middle ml-2">SAMPLE QUOTES</span></h2>
          </div>
          <div className="voices-grid">
            {voices.map(([n, r, q], i) => (
              <Reveal key={n} delay={i * 80} className="panel h-full p-5">
                <p className="text-sm text-[#c9c9de]">"{q}"</p>
                <div className="mt-4 text-sm"><b>{n}</b> <span className="text-muted">· {r}</span></div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* FAQ */}
        <Reveal as="section" id="faq" delay={400} className="faq-section">
          <div className="faq-grid">
            <div className="faq-sidebar">
              <span className="section-label mono text-[10px] text-neon">05 / HELP</span>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black">GOT <span className="gradtext">QUESTIONS?</span></h2>
              <p className="mt-4 text-sm text-muted">Quick answers to common questions. For more, ask the Rift Guide.</p>
              <button id="open-rift-guide" type="button" className="mt-6 btn-cut btn-pri px-6 py-3 w-full sm:w-auto"><Icon name="message-square" size={16} className="mr-2" /> Ask the Rift</button>
            </div>
            <div className="faq-accordion">
              {faq.map(([q, a]) => (
                <details key={q} className="faq panel px-4 py-3">
                  <summary className="flex items-center justify-between gap-3 font-semibold">{q}<span className="plus text-xl text-brand transition">+</span></summary>
                  <p className="mt-2 text-sm text-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>

        {/* FINAL CTA */}
        <Reveal as="section" delay={450} className="cta-section">
          <div className="cta-fullbleed" aria-hidden="true" />
          <div className="cta-content gradborder scan relative overflow-hidden rounded-2xl p-8 sm:p-12 lg:p-16 text-center">
            <div className="relative z-10">
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black">READY TO <span className="gradtext">ENTER THE RIFT?</span></h2>
              <p className="mx-auto mt-3 max-w-md text-muted text-[1rem]">Free to join. Your first stream is one click away.</p>
              <Link to="/register" className="btn-cut btn-pri mt-6 px-8 py-3.5 text-[1rem]">Create free account</Link>
            </div>
          </div>
        </Reveal>

      </main>

      <footer className="footer-section">
        <div className="page-wrap border-t border-line bg-[#0b0b11] py-8">
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm">
  <div><Brand className="text-lg" /><p className="mt-2 text-muted">GG. See you in the rift.</p></div>
  <div><div className="mb-2 font-head text-[1rem] font-bold">Product</div><div className="space-y-1 text-muted">Watch<div>Events</div><div>Go Pro</div></div></div>
  <div><div className="mb-2 font-head text-[1rem] font-bold">Company</div><div className="space-y-1 text-muted">About<div>Contact</div></div></div>
  <div><div className="mb-2 font-head text-[1rem] font-bold">Legal</div><div className="space-y-1 text-muted">Terms<div>Privacy</div></div></div>
</div>
        </div>
      </footer>

      {top && <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className="btn-cut btn-pri fixed bottom-4 right-4 z-40 px-4 py-3 text-sm">↑ Top</button>}

      <ErrorBoundary fallback={null}>
        <RiftGuide />
      </ErrorBoundary>
    </div>
  );
}