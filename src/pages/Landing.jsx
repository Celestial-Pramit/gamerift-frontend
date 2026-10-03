import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Counter from "../components/Counter.jsx";

const features = [
  { icon: "play", title: "Watch live", text: "From the dashboard to a looping player in one click.", color: "#a24bff" },
  { icon: "chat", title: "Chat", text: "Real-time messages, emoji, bots and Pro gold names.", color: "#19e3d2" },
  { icon: "users", title: "Follow channels", text: "Follow alerts land as toasts and bell notifications.", color: "#2563ff" },
  { icon: "cal", title: "Events", text: "Countdowns, reminders and tournaments that never miss you.", color: "#f5b942" },
];

const stats = [
  { to: 1240, decimals: 0, suffix: "", label: "streams live now" },
  { to: 1.24, decimals: 2, suffix: "M", label: "monthly viewers" },
  { to: 86400, decimals: 0, suffix: "", label: "messages / day" },
  { to: 4200, decimals: 0, suffix: "", label: "channels" },
];

export default function Landing() {
  return (
    <div className="landing-bg min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-base/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="glitch font-display text-xl font-black">GAMERIFT</span>
          <nav className="hidden gap-6 font-head text-lg text-muted md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pro" className="hover:text-white">Pro</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="font-head text-lg text-muted hover:text-white">Login</Link>
            <Link to="/register" className="btn-cut btn-pri px-4 py-2 text-sm">Sign up</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-12">
        <div className="gradborder scan relative overflow-hidden rounded-2xl p-8 md:p-12">
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-brand/40 bg-brand/10 px-3 py-1 font-head text-sm text-[#d9c4ff]">
                  Bangladesh's game launcher for streams
                </span>
                <span className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-sm">
                  <span className="livedot" /> <Counter to={1240} /> streams live right now
                </span>
              </div>
              <h1 className="mt-6 font-display text-4xl font-black leading-[0.95] sm:text-6xl">
                WATCH.<br />CHAT.<br /><span className="gradtext">LEVEL UP.</span>
              </h1>
              <p className="mt-5 max-w-lg text-muted">
                Live esports, ranked grinds and late-night hangs, with real-time chat, follow alerts and events that never miss you.
                Built for the Dhaka crowd first.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/login" className="btn-cut btn-pri px-6 py-3 text-base"><Icon name="play" size={16} /> Use Web Version</Link>
                <span className="flex items-center gap-2">
                  <button disabled className="btn-cut btn-sec px-6 py-3 text-base opacity-50"><Icon name="download" size={16} /> Download App</button>
                  <span className="rounded border border-muted/40 bg-muted/10 px-2 py-0.5 text-xs text-[#c3c3d6]">Coming in next release</span>
                </span>
              </div>
            </div>

            {/* Demo preview card */}
            <div className="demo-art relative aspect-video overflow-hidden rounded-xl border border-line">
              <div className="scan absolute inset-0" />
              <div className="absolute left-3 top-3 z-10 flex gap-2">
                <span className="flex items-center gap-1.5 rounded bg-live px-2 py-0.5 text-xs font-bold"><span className="livedot !bg-white" /> DEMO LOOP</span>
                <span className="rounded border border-yellow-400/40 bg-yellow-400/10 px-2 py-0.5 text-xs text-yellow-300">SAMPLE CLIP</span>
              </div>
              <div className="float absolute right-3 top-14 z-10 rounded-lg border border-line bg-card/80 px-3 py-2 text-xs backdrop-blur">
                <b className="text-gold">Rozu</b> GG, calling map 4 already
              </div>
              <div className="float absolute left-3 top-1/2 z-10 rounded-lg border border-line bg-card/80 px-3 py-2 text-xs backdrop-blur" style={{ animationDelay: "1.5s" }}>
                🔔 NightRaid just went live
              </div>
              <div className="absolute inset-x-3 bottom-3 z-10">
                <div className="font-display text-base tracking-wide">GRAND FINALS · MAP 3</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="eq"><i /><i /><i /><i /></span>
                  <span>148,204 watching</span>
                  <span className="rounded border border-neon/40 px-1.5 text-neon">ESPORTS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip (demo numbers) */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-[#0c0c13] p-5 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label}>
              <div className={"font-display text-2xl font-black " + (i % 2 ? "text-neon" : "text-white")}>
                <Counter to={s.to} decimals={s.decimals} suffix={s.suffix} />
              </div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto grid max-w-6xl gap-4 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.title} className="featcard">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg border" style={{ color: f.color, borderColor: f.color + "66", background: f.color + "1f" }}>
              <Icon name={f.icon} size={20} />
            </div>
            <h3 className="font-head text-xl font-bold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </div>
        ))}
      </section>

      {/* Pro teaser */}
      <section id="pro" className="mx-auto max-w-6xl px-6 pb-14">
        <div className="proteaser flex flex-wrap items-center justify-between gap-6 p-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-gradient-to-r from-[#f5b942] to-[#b3771a] px-2 py-0.5 text-xs font-bold text-[#241703]"><Icon name="star" size={11} /> PRO</span>
              <span className="rounded border border-muted/40 bg-muted/10 px-2 py-0.5 text-xs text-[#c3c3d6]">Pay with bKash</span>
            </div>
            <h3 className="font-head text-3xl font-bold">Level up your stream</h3>
            <p className="mt-1 max-w-md text-sm text-muted">Gold name in chat, Pro badge and zero ads. From ৳99 per month.</p>
          </div>
          <Link to="/register" className="btn-cut btn-pri px-6 py-3 text-base">Get Pro</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-[#0b0b11]">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="font-display text-lg font-black">GAMERIFT</div>
            <p className="mt-2 text-muted">GG. See you in the rift.</p>
          </div>
          <div><div className="mb-2 font-head text-base font-bold">Product</div><div className="space-y-1 text-muted"><div>Watch</div><div>Events</div><div>Go Pro</div></div></div>
          <div><div className="mb-2 font-head text-base font-bold">Company</div><div className="space-y-1 text-muted"><div>About</div><div>Contact</div></div></div>
          <div><div className="mb-2 font-head text-base font-bold">Legal</div><div className="space-y-1 text-muted"><div>Terms</div><div>Privacy</div></div></div>
        </div>
      </footer>
    </div>
  );
}
