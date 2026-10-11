import { useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import { useNotifs, typeMeta } from "../context/NotifContext.jsx";

// Achievement-style arrival toasts (top right on desktop, full width on phones)
export default function ToastHost() {
  const { toasts, dismiss, markOne } = useNotifs();
  const navigate = useNavigate();

  return (
    <div className="pointer-events-none fixed inset-x-3 top-2 z-[60] sm:top-16 space-y-2 sm:inset-x-auto sm:right-4 sm:w-96">
      {toasts.map((t) => {
        const [icon, color, label] = typeMeta[t.type];
        return (
          <button
            key={t.id}
            onClick={() => { markOne(t.id); dismiss(t.id); navigate(t.to); }}
            className="toastin panel pointer-events-auto relative block w-full overflow-hidden p-3 text-left"
            style={{ borderColor: color + "88" }}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: color + "22", color }}><Icon name={icon} size={18} /></span>
              <div className="min-w-0">
                <div className="mono text-[9px]" style={{ color }}>{label}</div>
                <div className="truncate text-sm font-semibold">{t.title}</div>
              </div>
            </div>
            <div className="toastbar absolute bottom-0 left-0" style={{ background: color }} />
          </button>
        );
      })}
    </div>
  );
}
