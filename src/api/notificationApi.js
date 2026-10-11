import { call, useMock } from "./http.js";

// Backend NotificationResponse -> the shape NotifBell / Notifications / NotifRow use.
// time arrives as epoch milliseconds already (the backend serializes it as such).
export function normalizeNotification(n) {
  return { id: n.id, type: n.type, title: n.title, to: n.to, read: n.read, time: n.time };
}

export async function fetchNotifications() {
  if (useMock) return [];
  const data = await call("get", "/notifications");
  return data.map(normalizeNotification);
}

export async function setNotificationRead(id, read) {
  if (useMock) return;
  return call("put", "/notifications/" + id + "/read", { enabled: read });
}

export async function markAllNotificationsRead() {
  if (useMock) return;
  return call("put", "/notifications/read-all", { enabled: true });
}

export async function deleteNotification(id) {
  if (useMock) return;
  return call("delete", "/notifications/" + id);
}