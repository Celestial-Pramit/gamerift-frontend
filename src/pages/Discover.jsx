import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import StreamCard from "../components/StreamCard.jsx";
import { searchStreams } from "../api/streamApi.js";
import { allTags } from "../mock/mockData.js";

const selectCls = "h-11 rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon";
const PAGE_SIZE = 8;

export default function Discover() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [qDebounced, setQDebounced] = useState(q);
  const [tab, setTab] = useState(params.get("tab") || "live");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("viewers");
  const [minV, setMinV] = useState(0);
  const [tags, setTags] = useState([]);
  const [view, setView] = useState("grid");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const inputRef = useRef(null);
  const requestId = useRef(0);

  // Press "/" to jump into the search box
  useEffect(() => {
    function onKey(e) {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Wait 300 ms after the last key press before searching
  useEffect(() => {
    const timer = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  // The tab decides the status and the sorting that are sent to the server
  function filtersFor(pageNumber) {
    return {
      q: qDebounced,
      category: cat,
      tags,
      minViewers: minV,
      status: tab === "new" ? "" : "live",
      sort: tab === "trending" ? "trending" : tab === "new" ? "newest" : sort,
      page: pageNumber,
      size: PAGE_SIZE,
    };
  }

  // First page: runs whenever a filter changes
  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    searchStreams(filtersFor(0))
      .then((data) => {
        if (id !== requestId.current) return; // an older request: ignore
        setItems(data.content);
        setTotal(data.totalElements);
        setPage(0);
        setLoading(false);
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        setError(err.message);
        setLoading(false);
      });
  }, [qDebounced, tab, cat, sort, minV, tags, reload]);

  // "Load more streams": next page, appended to the list
  function loadMore() {
    setLoadingMore(true);
    searchStreams(filtersFor(page + 1))
      .then((data) => {
        setItems((old) => [...old, ...data.content]);
        setPage(page + 1);
        setLoadingMore(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingMore(false);
      });
  }

  function toggleTag(t) {
    setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  }

  function reset() {
    setQ(""); setCat("all"); setSort("viewers"); setMinV(0); setTags([]); setTab("live");
  }

  const gridCls = "grid gap-4 " + (view === "list" ? "grid-cols-1" : "grid-cols-1 min-[540px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4");

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="panel space-y-3 p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Icon name="search" size={16} /></span>
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search streams, channels, tags..." className="h-11 w-full rounded-lg border border-line bg-card pl-9 pr-10 text-sm outline-none focus:border-neon" />
            <kbd className="mono absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 text-[10px] text-muted sm:block">/</kbd>
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={selectCls}>
            <option value="all">All categories</option>
            {["esports", "fps", "irl", "moba", "speedrun"].map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls} disabled={tab !== "live"}>
            <option value="viewers">Viewers: high to low</option>
            <option value="viewersAsc">Viewers: low to high</option>
            <option value="newest">Newest first</option>
          </select>
        </div>

        <label className="flex flex-wrap items-center gap-3">
          <span className="mono text-[10px] text-muted">Min viewers</span>
          <input type="range" min="0" max="20000" step="500" value={minV} onChange={(e) => setMinV(Number(e.target.value))} className="min-w-40 flex-1 accent-[#a24bff] sm:max-w-sm" />
          <span className="mono text-xs text-neon">{minV >= 1000 ? minV / 1000 + "k" : minV}</span>
        </label>

        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {allTags.map((t) => (
            <button key={t} onClick={() => toggleTag(t)} className={"shrink-0 rounded-lg border px-3 py-1.5 text-sm " + (tags.includes(t) ? "border-neon bg-neon/10 text-neon" : "border-line text-muted hover:text-white")}>#{t}</button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border border-line bg-card p-1">
            {["live", "trending", "new"].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={"rounded-md px-4 py-1.5 font-head font-bold capitalize " + (tab === t ? "bg-brand text-white" : "text-muted hover:text-white")}>{t}</button>
            ))}
          </div>
          <div className="flex rounded-lg border border-line bg-card p-1">
            <button onClick={() => setView("grid")} aria-label="Grid view" className={"grid h-9 w-9 place-items-center rounded-md " + (view === "grid" ? "bg-brand text-white" : "text-muted")}><Icon name="grid" size={16} /></button>
            <button onClick={() => setView("list")} aria-label="List view" className={"grid h-9 w-9 place-items-center rounded-md " + (view === "list" ? "bg-brand text-white" : "text-muted")}><Icon name="list" size={16} /></button>
          </div>
        </div>
        <p className="text-xs text-muted"><b className="text-neon">{total}</b> streams match · {tab === "trending" ? "sorted by trend score" : tab === "new" ? "newest first" : "sorted by viewers"}</p>
      </div>

      {/* Results */}
      {loading ? (
        <div className={gridCls}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="panel overflow-hidden">
              <div className="shimmer aspect-video" />
              <div className="space-y-2 p-3"><div className="shimmer h-4 rounded" /><div className="shimmer h-4 w-2/3 rounded" /></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="panel flex flex-col items-center gap-3 border-live/50 p-10 text-center">
          <b className="font-head text-xl">Couldn't load streams</b>
          <p className="text-sm text-muted">{error}</p>
          <button onClick={() => setReload(reload + 1)} className="btn-cut btn-sec px-4 py-2 text-sm">Try again</button>
        </div>
      ) : items.length === 0 ? (
        <div className="panel dash flex flex-col items-center gap-3 p-10 text-center">
          <span className="text-muted"><Icon name="search" size={28} /></span>
          <b className="font-head text-xl">No results{qDebounced ? " for “" + qDebounced + "”" : ""}</b>
          <p className="text-sm text-muted">Try a shorter query, or clear the filters.</p>
          <button onClick={reset} className="btn-cut btn-sec px-4 py-2 text-sm">Reset filters</button>
        </div>
      ) : (
        <>
          <div className={gridCls}>
            {items.map((s, i) => <StreamCard key={s.id} s={s} list={view === "list"} index={i} />)}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="mono text-[10px] text-muted">Showing {items.length} of {total}</span>
            {items.length < total && (
              <button onClick={loadMore} disabled={loadingMore} className="btn-cut btn-sec px-5 py-2.5 text-sm disabled:opacity-50">{loadingMore ? "Loading..." : "Load more streams"}</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
