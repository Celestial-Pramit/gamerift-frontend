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
  const clientRef = useRef(null);
  const first = useRef(true); // real mode: do not toast the initial load
  const real = !useMock;

  function dismiss(id) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  // Mock-only: simulated arrivals (REMOVED - no interval in mock mode)

  useEffect(() => {
    // Mock mode: use seeded data only, no intervals, no socket
    if (!real) {
      return;
    }

    // Real mode: start from empty, load once on connect, fallback poll only while disconnected
    first.current = true;
    setList([]);
    if (!user) return;

    const getToken = () => localStorage.getItem("gr_token");

    const loadRest = async () => {
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
    };

    // Create STOMP socket
    const client = createNotifSocket({
      getToken,
      onNotification: (n) => {
        // Deduplicate: if already in list, ignore
        setList((prev) => {
          if (prev.some((x) => String(x.id) === String(n.id))) return prev;
          return [n, ...prev];
        });
        setToasts((t) => [...t, n].slice(-3));
        setTimeout(() => dismiss(n.id), 4500);
      },
      onConnected: () => {
        setSocketConnected(true);
        // Refetch REST list once on connect (catches anything missed while offline)
        loadRest();
      },
      onDisconnected: () => {
        setSocketConnected(false);
      },
    });
    clientRef.current = client;
    client.activate();

    // Fallback poll: only runs while socket is disconnected (slow 60s interval)
    const pollTimer = setInterval(() => {
      if (!socketConnected && user) loadRest();
    }, 60000);

    return () => {
      clearInterval(pollTimer);
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [real, user && user.username, socketConnected]);

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