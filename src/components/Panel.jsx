// Dashboard card with a small HUD-style title bar
export default function Panel({ title, right, children, className = "" }) {
  return (
    <section className={"panel rise flex min-w-0 flex-col " + className}>
      <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="mono text-[11px] font-bold text-[#c9c9de]">{title}</h2>
        {right}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
