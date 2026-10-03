import { useRef } from "react";

// 6 boxes: auto-advance, backspace goes back, paste fills all boxes
export default function OTPInput({ value, onChange, length = 6 }) {
  const refs = useRef([]);

  function handleChange(i, e) {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    onChange((value.slice(0, i) + digit + value.slice(i + 1)).slice(0, length));
    if (digit && i < length - 1) refs.current[i + 1].focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1].focus();
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      e.preventDefault();
      onChange(pasted);
      refs.current[Math.min(pasted.length, length - 1)].focus();
    }
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          className="h-12 w-11 rounded-lg border border-line bg-card text-center font-display text-xl text-neon outline-none focus:border-neon"
        />
      ))}
    </div>
  );
}
