const palettes = [["#7c3aed", "#2563ff"], ["#ff7a45", "#ff3b5c"], ["#19e3d2", "#2563ff"], ["#f5b942", "#ff3b5c"], ["#a24bff", "#19e3d2"]];

// Round gradient avatar with the first letter; red ring when the channel is live
export default function Avatar({ name, size = 36, live = false }) {
  const [a, b] = palettes[name.charCodeAt(0) % palettes.length];
  return (
    <span
      className={"inline-grid shrink-0 place-items-center rounded-full font-head font-bold text-white " + (live ? "ring-2 ring-live ring-offset-2 ring-offset-[#11111a]" : "")}
      style={{ width: size, height: size, fontSize: size * 0.42, background: "linear-gradient(135deg, " + a + ", " + b + ")" }}
    >
      {name[0].toUpperCase()}
    </span>
  );
}
