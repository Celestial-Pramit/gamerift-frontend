import { useEffect, useState } from "react";

// Counts up from 0 to the "to" number in about 1.2 seconds
export default function Counter({ to, decimals = 0, suffix = "" }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setValue((to * step) / 40);
      if (step >= 40) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [to]);

  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
}
