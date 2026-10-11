import { call, useMock } from "./http.js";
import { events as mockEvents } from "../mock/mockData.js";

// Mock mode keeps the "Remind me" switches in memory
const mockReminded = new Set([1, 4]);

// Both sources are turned into the same shape: { id, title, cat, time, note, at, badge, goal, raised, status, reminded }
function fromMock(e) {
  return {
    id: e.id, title: e.title, cat: e.cat, time: e.time, note: e.note, at: e.at, badge: e.badge || "",
    goal: e.goal || 0, raised: e.raised || 0,
    status: e.live ? "live" : e.past ? "past" : "upcoming",
    reminded: mockReminded.has(e.id),
  };
}

function fromApi(e) {
  return {
    id: e.id, title: e.title, cat: e.category, time: e.time, note: e.note, at: Date.parse(e.startsAt),
    badge: e.badge || "", goal: e.goal, raised: e.raised, status: e.status, reminded: e.reminded,
  };
}

// All events (the page filters the tabs itself: there are only a few events)
export async function getEvents() {
  if (useMock) return mockEvents.map(fromMock);
  const data = await call("get", "/events");
  return data.map(fromApi);
}

// Remind me on / off
export async function setReminder(id, enabled) {
  if (useMock) {
    if (enabled) mockReminded.add(id);
    else mockReminded.delete(id);
    return null;
  }
  return fromApi(await call("put", "/events/" + id + "/remind", { enabled }));
}
