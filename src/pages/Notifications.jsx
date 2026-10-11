import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotifRow from "../components/NotifRow.jsx";
import { useNotifs } from "../context/NotifContext.jsx";

const filters = [["all", "All", []], ["live", "Live", ["live", "follow"]], ["events", "Events", ["event"]], ["replies", "Replies", ["reply"]], ["pay", "Payments", ["pay"]]];

export default function Notifications() {
  const { list, unread, markAll, markOne, remove } = useNotifs();
  const [f, setF] = useState("all");
  const navigate = useNavigate();
  const types = filters.find((x) => x[0] === f)[2];
  const shown = list.filter((n) => f === "all" || types.includes(n.type));
  const today = shown.filter((n) => Date.now() - n.time < 86400000);
  const earlier = shown.filter((n) => Date.now() - n.time >= 86400000);

  function openItem(n) { markOne(n.id); navigate(n.to); }

  function Group({ title, items }) {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="mono border-b border-line bg-card px-4 py-2 text-[10px] text-muted">{title}</div>
        <div className="divide-y divide-line">{items.map((n) => <NotifRow key={n.id} n={n} onOpen={openItem} onRemove={remove} />)}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-black sm:text-3xl">ALERTS {unread > 0 && <span className="tag tag-live ml-2 align-middle">{unread} NEW</span>}</h1>
        <button onClick={markAll} className="btn-cut btn-sec px-4 py-2 text-xs">Mark all read</button>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {filters.map(([key, label]) => (
          <button key={key} onClick={() => setF(key)} className={"shrink-0 rounded-lg border px-4 py-1.5 text-sm " + (f === key ? "border-brand bg-brand/20 text-white" : "border-line text-muted")}>{label}</button>
        ))}
      </div>
      <div className="panel overflow-hidden">
        {shown.length === 0 ? <p className="p-10 text-center text-muted">All caught up. GG!</p> : <><Group title="TODAY" items={today} /><Group title="EARLIER" items={earlier} /></>}
      </div>
    </div>
  );
}
