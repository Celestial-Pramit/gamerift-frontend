import { Client } from "@stomp/stompjs";

/**
 * Creates a STOMP WebSocket client for notifications.
 * @param {Object} options
 * @param {Function} options.getToken - Returns the current JWT token (Bearer)
 * @param {Function} options.onNotification - Called when a notification message arrives (normalized)
 * @param {Function} options.onConnected - Called when STOMP connect succeeds
 * @param {Function} options.onDisconnected - Called when socket closes or errors
 * @returns {Client} - The STOMP client (call .activate() to connect, .deactivate() to disconnect)
 */
export function createNotifSocket({ getToken, onNotification, onConnected, onDisconnected }) {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:9090/api";
  const wsUrl = import.meta.env.VITE_WS_URL || apiBase.replace(/^http/, "ws").replace(/\/api$/, "") + "/ws";

  const client = new Client({
    brokerURL: wsUrl,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {}, // silence STOMP debug logs
    beforeConnect: () => {
      const token = getToken();
      if (token) {
        client.connectHeaders = { Authorization: "Bearer " + token };
      }
    },
    onConnect: () => {
      client.subscribe("/user/queue/notifications", (msg) => {
        try {
          const raw = JSON.parse(msg.body);
          const normalized = {
            id: raw.id,
            type: raw.type,
            title: raw.title,
            to: raw.to,
            read: raw.read,
            time: raw.time,
          };
          onNotification(normalized);
        } catch (e) {
          // ignore malformed messages
        }
      });
      onConnected();
    },
    onWebSocketClose: () => {
      onDisconnected();
    },
    onStompError: (frame) => {
      const body = frame.body || "";
      if (body.includes("Unauthorized")) {
        // Bad token - stop reconnecting
        client.deactivate();
      }
      onDisconnected();
    },
  });

  return client;
}