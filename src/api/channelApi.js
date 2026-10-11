import { call, useMock } from "./http.js";
import { channels as mockChannels } from "../mock/mockData.js";

// Mock mode keeps the follow switches in memory
const mockFollowing = new Set(mockChannels.filter((c) => c.following).map((c) => c.id));

// Backend channel -> the shape the React components use
function fromApi(c) {
  return {
    id: c.id, name: c.name, followers: c.followersLabel ?? (c.followersCount >= 1000 ? (c.followersCount / 1000).toFixed(1).replace(/\.0$/, "") + "K" : String(c.followersCount ?? 0)), verified: c.verified, pro: c.pro, live: c.live,
    note: c.note, following: c.following, soon: /^STARTS/i.test(c.note || ""),
  };
}

function fromMock(c) {
  return { ...c, following: mockFollowing.has(c.id) };
}

export async function getChannels() {
  if (useMock) return mockChannels.map(fromMock);
  return (await call("get", "/channels")).map(fromApi);
}

// Follow (true) or unfollow (false). Returns the updated channel.
export async function setFollow(id, follow) {
  let result;
  if (useMock) {
    if (follow) mockFollowing.add(id);
    else mockFollowing.delete(id);
    result = fromMock(mockChannels.find((c) => c.id === id));
  } else {
    result = fromApi(await call(follow ? "post" : "delete", "/channels/" + id + "/follow"));
  }
  // tell other parts of the page (the sidebar "Following" list) to reload
  window.dispatchEvent(new Event("gr-follow-changed"));
  return result;
}
