import { useEffect, useState } from "react";

export default function BootScreen({ onDone }) {
  const [percent, setPercent] = useState(0);

  // Count up to 100 in about one second, then finish
  useEffect(() => {
    if (percent >= 100) {
      onDone();
      return;
    }
    const timer = setTimeout(() => setPercent(percent + 10), 80);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base">
      <h1 className="font-display text-3xl text-brand">GAMERIFT</h1>
      <p className="mt-2 font-display text-xs text-neon">// LOADING...</p>
      <div className="mt-6 h-1.5 w-56 overflow-hidden rounded bg-line">
        <div className="h-full bg-neon transition-all" style={{ width: percent + "%" }} />
      </div>
    </div>
  );
}
