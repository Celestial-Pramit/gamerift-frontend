import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useMock } from "../api/http.js";
import { useAuth } from "./AuthContext.jsx";
import { fetchNotifications, setNotificationRead, markAllNotificationsRead, deleteNotification } from "../api/notificationApi.js";
import { createNotifSocket } from "../utils/notifSocket.js";

const Ctx = createContext(null);

// type -> [icon, colour, toast label]
export const typeMeta = {
  live: ["radio", "#ff3b5c", "NOW LIVE"],
  event: ["cal", "#19e3d2", "EVENT ALERT"],
  reply: ["chat", "#a24bff", "NEW REPLY"],
  pay: ["star", "#f5b942", "PRO UNLOCKED"],
  follow: ["users", "#2563ff", "NEW FOLLOWER"],
  system: ["bell", "#19e3d2", "RIFT MODE"],
};

export function ago(ms) {
  const m = Math.floor((Date.now() - ms) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  if (m < 1440) return Math.floor(m / 60) + " h ago";
  return Math.floor(m / 1440) + " d ago";
}

const MIN = 60000;
const seed = [
  { id: 1, type: "live", title: "NightRaid is live: Grand Finals · Map 3", time: Date.now() - 2 * MIN, read: false, to: "/app/stream/1" },
  { id: 2, type: "event", title: "Dhaka Major starts in 30 minutes", time: Date.now() - 28 * MIN, read: false, to: "/app/events" },
  { id: 3, type: "reply", title: "Rozu replied to your comment", time: Date.now() - 60 * MIN, read: true, to: "/app/stream/2" },
  { id: 4, type: "pay", title: "Pro activated: receipt GR-88213", time: Date.now() - 1440 * MIN, read: true, to: "/app/settings" },
  { id: 5, type: "follow", title: "SahaGaming followed you back", time: Date.now() - 2880 * MIN, read: true, to: "/app/discover" },
];

export function NotifProvider({ children }) {
  const { user } = useAuth();
  const [list, setList] = useState(useMock ? seed : []);
  const [toasts, setToasts] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketConnectedRef = useRef(false);
  const clientRef = useRef(null);
  const first = useRef(true);
  const real = !useMock;
  const userIdRef = useRef(user?.id ?? null);
  const mountedRef = useRef(false);

  // Stable refs for callbacks so the socket effect doesn't re-run when they change
  const getTokenRef = useRef(() => localStorage.getItem("gr_token"));
  const dismissRef = useRef((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  });
  const onNotificationRef = useRef((n) => {
    setList((prev) => {
      if (prev.some((x) => String(x.id) === String(n.id))) return prev;
      return [n, ...prev];
    });
    setToasts((t) => [...t, n].slice(-3));
    setTimeout(() => dismissRef.current(n.id), 4500);
  });
  const onConnectedRef = useRef(() => {
    setSocketConnected(true);
    socketConnectedRef.current = true;
    loadRestRef.current();
  });
  const onDisconnectedRef = useRef(() => {
    setSocketConnected(false);
    socketConnectedRef.current = false;
  });

  const loadRestRef = useRef(async () => {
    try {
      const rows = await fetchNotifications();
      setList((prev) => {
        if (first.current) {
          first.current = false;
          return rows;
        }
        const seen = new Set(prev.map((n) => String(n.id)));
        const fresh = rows.filter((n) => !seen.has(String(n.id)) && !n.read);
        if (fresh.length) setToasts((t) => [...t, ...fresh.slice(-3)].slice(-3));
        return rows;
      });
    } catch (_) {}
  });

  function dismiss(id) {
    dismissRef.current(id);
  }

  useEffect(() => {
    if (!real) return;

    if (!user) {
      // Logout: clear list and disconnect
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setList([]);
      first.current = true;
      mountedRef.current = false;
      userIdRef.current = null;
      return;
    }

    // Only (re)connect when user id actually changes
    if (userIdRef.current === user.id && mountedRef.current) return;
    userIdRef.current = user.id;

    // First load for this user
    first.current = true;
    mountedRef.current = true;

    const client = createNotifSocket({
      getToken: getTokenRef.current,
      onNotification: onNotificationRef.current,
      onConnected: onConnectedRef.current,
      onDisconnected: onDisconnectedRef.current,
    });
    clientRef.current = client;
    client.activate();

    // Fallback poll: only while disconnected
    const pollTimer = setInterval(() => {
      if (!socketConnectedRef.current && user) loadRestRef.current();
    }, 60000);

    return () => {
      clearInterval(pollTimer);
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [real, user?.id]);

  async function markOne(id) {
    if (real) {
      try { await setNotificationRead(id, true); } catch (err) { /* keep it local */ }
    }
    setList((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAll() {
    if (real) {
      try { await markAllNotificationsRead(); } catch (err) { /* keep it local */ }
    }
    setList((l) => l.map((n) => ({ ...n, read: true })));
  }

  async function remove(id) {
    if (real) {
      try { await deleteNotification(id); } catch (err) { /* keep it local */ }
    }
    setList((l) => l.filter((n) => n.id !== id));
  }

  const value = {
    list,
    toasts,
    unread: list.filter((n) => !n.read).length,
    dismiss,
    markAll,
    markOne,
    remove,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotifs() {
  return useContext(Ctx);
}