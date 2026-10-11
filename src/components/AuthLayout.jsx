import { Link } from "react-router-dom";
import Brand from "./Brand.jsx";

// Split screen: neon artwork on the left, glowing form card on the right
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <div className="landing-bg scan relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <Link to="/" className="relative z-10"><Brand className="text-2xl" /></Link>
        <div className="relative z-10">
          <p className="font-display text-5xl font-black leading-tight">
            ENTER THE <span className="gradtext">RIFT.</span>
          </p>
          <p className="mt-3 max-w-sm text-muted">Live esports, real-time chat and events, built for the Dhaka crowd first.</p>
          <div className="float mt-8 w-72 rounded-xl border border-line bg-card/80 p-3 backdrop-blur">
            <div className="flex items-center gap-2 text-xs">
              <span className="livedot" /> LIVE <span className="eq ml-1"><i /><i /><i /><i /></span>
            </div>
            <div className="mt-1 font-head text-lg font-bold">NightRaid · Grand Finals</div>
            <div className="text-xs text-muted">148,204 watching</div>
          </div>
        </div>
        <p className="relative z-10 text-sm text-muted">GG. See you in the rift.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="gradborder w-full max-w-md rounded-2xl p-8" style={{ "--gb-fill": "#14141d" }}>
          <h1 className="font-head text-3xl font-bold">{title}</h1>
          <p className="mb-6 text-sm text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
