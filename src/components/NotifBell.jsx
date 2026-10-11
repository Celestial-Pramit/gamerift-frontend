import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import NotifRow from "./NotifRow.jsx";
import { useNotifs } from "../context/NotifContext.jsx";

// Bell with unread badge and a dropdown (closes on Escape or outside click)
export default function NotifBell() {
  const { list, unread, markAll, markOne } = useNotifs();
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDown(e) { if (box.current && !box.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function openItem(n) {
    markOne(n.id);
    setOpen(false);
    navigate(n.to);
  }

  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen(!open)} aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-lg border border-line bg-card">
        <Icon name="bell" size={18} />
        {unread > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-live px-1 text-[10px] font-bold">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="panel rise fixed inset-x-3 top-16 z-50 overflow-hidden shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[360px]">
          <div className="mono flex items-center justify-between border-b border-line px-4 py-3 text-[10px] text-muted">
            <span>Notifications</span>
            <button onClick={markAll} className="hover:text-white">Mark all read</button>
          </div>
          <div className="max-h-[60vh] divide-y divide-line overflow-y-auto">
            {list.slice(0, 5).map((n) => <NotifRow key={n.id} n={n} onOpen={openItem} />)}
          </div>
          <Link to="/app/notifications" onClick={() => setOpen(false)} className="mono block border-t border-line px-4 py-3 text-center text-[10px] text-brand hover:text-white">Open notifications</Link>
        </div>
      )}
    </div>
  );
}
