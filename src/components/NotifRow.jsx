import Icon from "./Icon.jsx";
import { typeMeta, ago } from "../context/NotifContext.jsx";

// One notification line (used by the bell panel and the notifications page)
export default function NotifRow({ n, onOpen, onRemove }) {
  const [icon, color] = typeMeta[n.type];
  return (
    <div className={"flex items-center gap-3 px-4 py-3 hover:bg-white/5 " + (n.read ? "" : "bg-brand/5")}>
      <button onClick={() => onOpen(n)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border" style={{ color, borderColor: color + "66", background: color + "1a" }}>
          <Icon name={icon} size={18} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{n.title}</span>
          <span className="mono text-[10px] text-muted">{ago(n.time)}</span>
        </span>
        {!n.read && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-brand" />}
      </button>
      {onRemove && <button onClick={() => onRemove(n.id)} aria-label="Delete" className="grid h-8 w-8 shrink-0 place-items-center text-muted hover:text-live">✕</button>}
    </div>
  );
}
