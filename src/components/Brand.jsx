import { useEffect, useRef } from "react";

// Gradient logo text. The red/cyan glitch plays on hover, once on load, and on tap (phones).
export default function Brand({ text = "GAMERIFT", className = "", delay = 400 }) {
  const ref = useRef(null);

  function play() {
    const el = ref.current;
    el.classList.remove("play");
    void el.offsetWidth; // restart the animation
    el.classList.add("play");
  }

  useEffect(() => {
    const timer = setTimeout(play, delay);
    return () => clearTimeout(timer);
  }, []);

  return <span ref={ref} data-text={text} onClick={play} className={"brand " + className}>{text}</span>;
}
