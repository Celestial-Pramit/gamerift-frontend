import { useEffect, useState } from "react";
import Avatar from "../components/Avatar.jsx";
import Toggle from "../components/Toggle.jsx";
import OrdersTable from "../components/OrdersTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { alertBox } from "../utils/cdn.js";
import { setTwoFactor, changePassword as changePasswordApi, updateProfile, getNotificationPrefs, setNotificationPrefs } from "../api/userApi.js";

const tabs = [["profile", "Profile"], ["security", "Security"], ["alerts", "Notifications"], ["payments", "Payments"]];
const countries = ["Bangladesh", "India", "Pakistan", "United Kingdom", "United States", "Germany", "France", "Ukraine", "Other"];
const field = "h-11 w-full rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon";

function saved(title) {
  alertBox({ toast: true, position: "bottom-end", icon: "success", title, showConfirmButton: false, timer: 1800 });
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [bio, setBio] = useState(user?.bio || "");
  const [country, setCountry] = useState(user?.country || "Bangladesh");
  const [pw, setPw] = useState({ old: "", next: "", again: "" });
  const [prefs, setPrefs] = useState({ live: true, events: true, replies: true, pay: true });

  // Load the saved alert switches (keeps the defaults in mock mode)
  useEffect(() => {
    getNotificationPrefs().then(setPrefs).catch(() => {});
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const me = await updateProfile(bio, country);
      updateUser({ bio: me?.bio ?? bio, country: me?.country ?? country });
      saved("Profile saved");
    } catch (err) {
      alertBox({ icon: "error", title: err.message });
    }
  }

  // Optimistic switch: save the whole prefs object, restore the old ones on error
  async function togglePref(k, v) {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    try {
      setPrefs(await setNotificationPrefs(next));
      saved("Preference saved");
    } catch (err) {
      setPrefs(prefs);
      alertBox({ icon: "error", title: err.message });
    }
  }

  async function toggleTwoFactor(v) {
    try {
      await setTwoFactor(v);
      updateUser({ twoFactor: v });
      saved(v ? "2FA turned on" : "2FA turned off");
    } catch (err) {
      alertBox({ icon: "error", title: err.message });
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    if (pw.next.length < 8) return alertBox({ icon: "error", title: "Password needs at least 8 characters" });
    if (pw.next !== pw.again) return alertBox({ icon: "error", title: "Passwords do not match" });
    try {
      await changePasswordApi(pw.old, pw.next);
      setPw({ old: "", next: "", again: "" });
      saved("Password changed");
    } catch (err) {
      alertBox({ icon: "error", title: err.message });
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Player card */}
      <section className="gradborder relative overflow-hidden rounded-2xl p-5" style={{ "--gb-fill": "#11111a" }}>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={user?.username || "u"} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="font-display text-2xl font-black">{user?.username}</h1>{user?.isPro && <span className="tag tag-pro">PRO</span>}<span className="tag">{user?.role}</span></div>
            <p className="mt-1 text-sm text-muted">{bio || "No bio yet. Tell the rift who you are."}</p>
            <p className="mono mt-1 text-[10px] text-muted">{country} · {user?.email}</p>
          </div>
        </div>
      </section>

      <div className="no-scrollbar flex overflow-x-auto rounded-lg border border-line bg-card p-1">
        {tabs.map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={"shrink-0 rounded-md px-4 py-1.5 font-head font-bold " + (tab === key ? "bg-brand text-white" : "text-muted hover:text-white")}>{label}</button>)}
      </div>

      {tab === "profile" && (
        <form onSubmit={saveProfile} className="panel space-y-4 p-5">
          <label className="block text-sm"><span className="text-muted">Bio</span><textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={120} rows={3} className="mt-1 w-full rounded-lg border border-line bg-card p-3 text-sm outline-none focus:border-neon" /></label>
          <label className="block text-sm"><span className="text-muted">Country</span><select value={country} onChange={(e) => setCountry(e.target.value)} className={"mt-1 " + field}>{countries.map((c) => <option key={c}>{c}</option>)}</select></label>
          <button className="btn-cut btn-pri px-6 py-3 text-sm">Save profile</button>
        </form>
      )}

      {tab === "security" && (
        <div className="space-y-4">
          <section className="panel flex items-center justify-between gap-4 p-5">
            <div><h2 className="font-head text-xl font-bold">Two-step verification</h2><p className="text-sm text-muted">Ask for an email OTP every time you log in.</p></div>
            <Toggle on={!!user?.twoFactor || user?.role === "ADMIN"} onChange={toggleTwoFactor} label="Two-step verification" />
          </section>
          <form onSubmit={changePassword} className="panel space-y-3 p-5">
            <h2 className="font-head text-xl font-bold">Change password</h2>
            {[["old", "Current password"], ["next", "New password"], ["again", "Repeat new password"]].map(([k, l]) => (
              <input key={k} type="password" placeholder={l} value={pw[k]} onChange={(e) => setPw({ ...pw, [k]: e.target.value })} className={field} />
            ))}
            <button className="btn-cut btn-pri px-6 py-3 text-sm">Update password</button>
          </form>
        </div>
      )}

      {tab === "alerts" && (
        <section className="panel divide-y divide-line">
          {[["live", "Followed channel goes live"], ["events", "Event reminders"], ["replies", "Replies to my comments"], ["pay", "Payment receipts"]].map(([k, l]) => (
            <div key={k} className="flex items-center justify-between gap-4 p-4"><span className="text-sm">{l}</span><Toggle on={prefs[k]} onChange={(v) => togglePref(k, v)} label={l} /></div>
          ))}
        </section>
      )}

      {tab === "payments" && <section className="panel overflow-hidden"><OrdersTable /></section>}
    </div>
  );
}
