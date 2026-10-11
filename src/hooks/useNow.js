import { useEffect, useState } from "react";

// Returns the current time and updates it every "ms" milliseconds (used for countdowns)
export default function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(timer);
  }, [ms]);
  return now;
}
