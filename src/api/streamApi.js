import { call, useMock } from "./http.js";
import { streams as mockStreams } from "../mock/mockData.js";

// Backend stream (StreamResponse) -> the shape the React components already use
export function normalizeStream(s) {
  return {
    id: s.id,
    channelId: s.channelId,
    title: s.title,
    channel: s.channelName,
    cat: s.categorySlug,
    label: s.label,
    viewers: s.viewers,
    trend: s.trendScore,
    mins: s.minutes,
    tags: s.tags || [],
    status: s.status,
    pro: s.pro,
    videoUrl: s.videoUrl,
    videoSource: s.videoSource,
    thumbnailUrl: s.thumbnailUrl,
    likes: s.likesCount,
    featured: s.featured,
    description: s.description,
  };
}

// Mock version of the server-side search (same rules as the backend)
function mockSearch(f) {
  const sorters = {
    viewers: (a, b) => b.viewers - a.viewers,
    viewersAsc: (a, b) => a.viewers - b.viewers,
    newest: (a, b) => a.mins - b.mins,
    trending: (a, b) => b.trend - a.trend,
  };
  const list = mockStreams
    .filter(
      (s) =>
        (!f.category || f.category === "all" || s.cat === f.category) &&
        s.viewers >= (f.minViewers || 0) &&
        (!f.q || (s.title + s.channel + s.tags.join(" ")).toLowerCase().includes(f.q.toLowerCase())) &&
        (f.tags || []).every((t) => s.tags.includes(t)) &&
        (!f.status || f.status === "all" || s.status === f.status)
    )
    .sort(sorters[f.sort] || sorters.viewers);
  const start = f.page * f.size;
  return Promise.resolve({
    content: list.slice(start, start + f.size),
    page: f.page,
    size: f.size,
    totalElements: list.length,
    totalPages: Math.ceil(list.length / f.size),
  });
}

/**
 * Discover page search. f = { q, category, tags, minViewers, status, sort, page, size }.
 * Real mode: GET /api/streams?... (the server filters, sorts and pages).
 */
export async function searchStreams(f) {
  if (useMock) return mockSearch(f);
  const params = new URLSearchParams();
  if (f.q) params.set("q", f.q);
  if (f.category && f.category !== "all") params.set("category", f.category);
  (f.tags || []).forEach((t) => params.append("tags", t));
  if (f.minViewers) params.set("minViewers", f.minViewers);
  if (f.status) params.set("status", f.status);
  params.set("sort", f.sort || "viewers");
  params.set("page", f.page || 0);
  params.set("size", f.size || 12);
  const data = await call("get", "/streams?" + params.toString());
  return { ...data, content: data.content.map(normalizeStream) };
}

// The hero stream of the dashboard
export async function getFeatured() {
  if (useMock) {
    return {
      ...mockStreams[0],
      channelId: 1,
      description: "NightRaid vs Nova Ascent. Winner takes the Dhaka Major trophy, and chat is already unhinged.",
    };
  }
  return normalizeStream(await call("get", "/streams/featured"));
}

// One stream page (Stream.jsx). The backend answers 404 for an unknown id.
export async function getStream(id) {
  if (useMock) return mockStreams.find((x) => String(x.id) === String(id));
  return normalizeStream(await call("get", "/streams/" + id));
}

// The "Up next" list under the player
export async function getRelated(id) {
  if (useMock) return mockStreams.filter((x) => String(x.id) !== String(id)).slice(0, 4);
  const data = await call("get", "/streams/" + id + "/related");
  return data.map(normalizeStream);
}

// any stream that is pushed (has a red "NOTICE" badge), or the first live one
export async function getTrending() {
  if (useMock) return mockStreams.filter((x, i) => i % 2 === 0).slice(0, 4);
  const data = await call("get", "/streams/trending");
  return data.map(normalizeStream);
}

export async function getLike(id) {
  if (useMock) return { liked: false, likesCount: Math.floor(1800 + Math.random() * 400) };
  return call("get", "/streams/" + id + "/like");
}

export async function setLike(id, liked) {
  if (useMock) return { liked, likesCount: Math.floor(1800 + Math.random() * 400) };
  return call("put", "/streams/" + id + "/like", { liked });
}
