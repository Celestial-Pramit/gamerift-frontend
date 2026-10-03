export default function Input({ label, error, ...props }) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <input
        className={"mt-1 block w-full rounded-lg border bg-card px-3 py-2.5 text-white outline-none focus:border-neon " + (error ? "border-live" : "border-line")}
        {...props}
      />
      {error && <span className="text-xs text-live">{error}</span>}
    </label>
  );
}
