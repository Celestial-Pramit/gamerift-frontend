import { useState } from "react";
import Input from "./Input.jsx";

// 0 to 4 points: length, capital letter, number, symbol
function strength(p) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

export default function PasswordInput({ label = "Password", showMeter = false, value = "", ...props }) {
  const [show, setShow] = useState(false);
  const score = strength(value);
  const colors = ["bg-line", "bg-live", "bg-gold", "bg-neon", "bg-green-500"];

  return (
    <div className="relative">
      <Input label={label} type={show ? "text" : "password"} value={value} {...props} />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-8 text-xs text-muted hover:text-white">
        {show ? "Hide" : "Show"}
      </button>
      {showMeter && (
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={"h-1 flex-1 rounded " + (i <= score ? colors[score] : "bg-line")} />
          ))}
        </div>
      )}
    </div>
  );
}
