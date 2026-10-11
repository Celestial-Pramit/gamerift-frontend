import { call, useMock } from "./http.js";

// Settings of the logged-in user. In mock mode they just succeed.
export const setTwoFactor = (enabled) =>
  useMock ? Promise.resolve({ ok: true }) : call("put", "/users/me/2fa", { enabled });

export const changePassword = (currentPassword, newPassword) =>
  useMock ? Promise.resolve({ ok: true }) : call("put", "/users/me/password", { currentPassword, newPassword });

// Returns the saved user (bio, country ...)
export const updateProfile = (bio, country) =>
  useMock ? Promise.resolve({ bio, country }) : call("put", "/users/me/profile", { bio, country });

// The four alert switches: { live, events, replies, pay }
export const getNotificationPrefs = () =>
  useMock ? Promise.resolve({ live: true, events: true, replies: true, pay: true }) : call("get", "/users/me/notification-prefs");

export const setNotificationPrefs = (prefs) =>
  useMock ? Promise.resolve(prefs) : call("put", "/users/me/notification-prefs", prefs);