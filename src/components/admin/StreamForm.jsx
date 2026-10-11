import { Field } from "./CrudSection.jsx";
import StreamCard from "../StreamCard.jsx";
import Toggle from "../Toggle.jsx";
import { sampleClips } from "../../mock/mockAdmin.js";

function ytId(url) {
  const m = (url || "").match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const sources = [
  ["YOUTUBE", "YouTube", "REAL", "Paste a link. It loops muted."],
  ["CLOUDINARY", "Cloudinary", "DEMO", "Pick a sample clip."],
  ["LIVE_HLS", "Live stream", "SOON", "Real RTMP/HLS later."],
];

// Custom form for streams: video source cards + live card preview
export default function StreamForm({ value: v, onChange, cats, chans }) {
  const set = (k, x) => onChange({ ...v, [k]: x });
  const id = ytId(v.videoUrl);
  const preview = { id: 0, title: v.title || "Your stream title", channel: v.channel, cat: v.cat, label: String(v.cat).toUpperCase(), viewers: v.baseViewers, trend: 0, mins: 5, tags: [], status: v.isLive ? "live" : "soon", pro: false };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="space-y-4">
        <Field f={{ label: "Title", required: true }} value={v.title} onChange={(x) => set("title", x)} />
        <Field f={{ type: "textarea", label: "Description" }} value={v.description} onChange={(x) => set("description", x)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field f={{ type: "select", label: "Category", options: cats }} value={v.cat} onChange={(x) => set("cat", x)} />
          <Field f={{ type: "select", label: "Channel", options: chans }} value={v.channel} onChange={(x) => set("channel", x)} />
        </div>
        <Field f={{ label: "Tags (comma separated)" }} value={v.tags} onChange={(x) => set("tags", x)} />

        <div>
          <div className="mb-2 text-sm text-muted">Video source</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {sources.map(([key, name, badge, hint]) => (
              <button type="button" key={key} disabled={key === "LIVE_HLS"} onClick={() => set("videoSource", key)} className={"rounded-xl border p-3 text-left transition " + (v.videoSource === key ? "border-brand bg-brand/10" : "border-line") + (key === "LIVE_HLS" ? " opacity-50" : "")}>
                <div className="flex items-center justify-between"><b>{name}</b><span className={"tag " + (badge === "REAL" ? "" : "tag-mute")}>{badge}</span></div>
                <div className="mt-1 text-xs text-muted">{hint}</div>
              </button>
            ))}
          </div>
          {v.videoSource === "YOUTUBE" && (
            <div className="mt-3">
              <Field f={{ label: "YouTube link" }} value={v.videoUrl} onChange={(x) => set("videoUrl", x)} />
              <p className="mono mt-1 text-[10px] text-muted">{id ? "Video ID: " + id : "Paste a youtube.com or youtu.be link"}</p>
            </div>
          )}
          {v.videoSource === "CLOUDINARY" && (
            <div className="mt-3">
              <Field f={{ type: "select", label: "Sample clip (demo only, no upload)", options: [["", "Choose a clip"], ...sampleClips.map(([n, u]) => [u, n])] }} value={v.videoUrl} onChange={(x) => set("videoUrl", x)} />
            </div>
          )}
        </div>

        <label className="block text-sm">
          <span className="text-muted">Base viewers: <b className="text-neon">{v.baseViewers.toLocaleString("en-US")}</b></span>
          <input type="range" min="0" max="20000" step="100" value={v.baseViewers} onChange={(e) => set("baseViewers", Number(e.target.value))} className="mt-2 w-full accent-[#a24bff]" />
        </label>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <label className="flex items-center gap-3 text-sm"><span>Live now</span><Toggle on={v.isLive} onChange={(x) => set("isLive", x)} label="Live now" /></label>
          {[["true", "Published"], ["false", "Draft"]].map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 text-sm"><input type="radio" name="pub" checked={String(v.published) === k} onChange={() => set("published", k === "true")} className="accent-[#a24bff]" />{l}</label>
          ))}
        </div>
      </div>

      <aside className="space-y-3">
        <div className="mono text-[10px] text-muted">Live preview</div>
        <div className="pointer-events-none"><StreamCard s={preview} /></div>
        {id && <img src={"https://img.youtube.com/vi/" + id + "/hqdefault.jpg"} alt="YouTube thumbnail" className="aspect-video w-full rounded-lg border border-line object-cover" />}
      </aside>
    </div>
  );
}
