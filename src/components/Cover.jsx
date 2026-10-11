// Generated artwork (no images needed): two glow colors + grid + angled frame
export default function Cover({ colors, className = "", children }) {
  return (
    <div className={"cover " + className} style={{ "--c1": colors[0] + "99", "--c2": colors[1] + "88" }}>
      {children}
    </div>
  );
}
