export default function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={"relative h-6 w-11 shrink-0 rounded-full transition " + (on ? "bg-brand" : "bg-line")}
    >
      <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all " + (on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}
