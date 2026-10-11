import { useEffect, useRef } from "react";
import { loadScript } from "../../utils/cdn.js";

// Small Chart.js chart (library loaded from the CDN only on this page)
export default function ChartBox({ title, type, labels, data, color = "#a24bff" }) {
  const ref = useRef(null);

  useEffect(() => {
    let chart;
    let cancelled = false;
    loadScript("https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js")
      .then(() => {
        if (cancelled || !ref.current) return;
        const palette = ["#a24bff", "#19e3d2", "#2563ff", "#f5b942", "#ff3b5c", "#7c3aed"];
        const axis = { ticks: { color: "#8b8ba7" }, grid: { color: "#24243a" } };
        chart = new window.Chart(ref.current, {
          type,
          data: { labels, datasets: [{ data, borderColor: color, backgroundColor: type === "doughnut" ? palette : color + "88", borderWidth: type === "doughnut" ? 0 : 2, tension: 0.35, fill: type === "line" }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: type === "doughnut", labels: { color: "#c9c9de" } } }, scales: type === "doughnut" ? {} : { x: axis, y: axis } },
        });
      })
      .catch(() => {});
    return () => { cancelled = true; if (chart) chart.destroy(); };
  }, [labels.join(), data.join()]);

  return (
    <div className="panel p-4">
      <h3 className="mono mb-3 text-[10px] text-muted">{title}</h3>
      <div className="h-52"><canvas ref={ref} /></div>
    </div>
  );
}
