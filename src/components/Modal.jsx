import { useEffect } from "react";

// Centered dialog on desktop, bottom sheet on phones. Escape or a click outside closes it.
export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={"slideup panel flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl " + (wide ? "sm:max-w-4xl" : "sm:max-w-lg")}>
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-head text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-white">✕</button>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
