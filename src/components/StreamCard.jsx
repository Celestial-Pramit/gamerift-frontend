import { Link } from "react-router-dom";
import Cover from "./Cover.jsx";
import Avatar from "./Avatar.jsx";
import { games, fmtMins } from "../mock/mockData.js";

export default function StreamCard({ s, list = false, index = 0 }) {
  let statusTag = <span className="tag tag-end">ENDED</span>;
  if (s.status === "live") statusTag = <span className="tag tag-live"><span className="livedot !bg-white" />LIVE</span>;
  if (s.status === "soon") statusTag = <span className="tag">STARTING SOON</span>;

  let timeText = "REPLAY";
  if (s.status === "live") timeText = fmtMins(s.mins);
  if (s.status === "soon") timeText = "IN " + s.mins + "M";

  return (
    <Link
      to={"/app/stream/" + s.id}
      style={{ animationDelay: index * 45 + "ms" }}
      className={"card-hover panel rise group flex overflow-hidden " + (list ? "flex-col sm:flex-row" : "flex-col")}
    >
      <Cover colors={games[s.cat] || games.esports} className={"aspect-video shrink-0 " + (list ? "sm:w-72" : "")}>
        <div className="shade" />
        <div className="relative z-10 flex items-start justify-between p-3">
          {statusTag}
          {s.status === "live" && (
            <span className="tag tag-mute"><span className="eq"><i /><i /><i /><i /></span>{s.viewers.toLocaleString("en-US")}</span>
          )}
        </div>
        <span className="tag absolute bottom-3 left-3 z-10">{s.label}</span>
      </Cover>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-3">
        <h3 className="line-clamp-2 font-head text-lg font-bold leading-snug group-hover:text-neon">{s.title}</h3>
        <div className="flex items-center gap-2 text-sm">
          <Avatar name={s.channel} size={24} />
          <span className="truncate">{s.channel}</span>
          {s.pro && <span className="tag tag-pro">PRO</span>}
          <span className="mono ml-auto text-[10px] text-muted">{timeText}</span>
        </div>
      </div>
    </Link>
  );
}
