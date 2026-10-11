import { call, useMock } from "./http.js";
import * as mock from "../mock/mockAuth.js";

// The real login answers { needsOtp, token }. If the user object is missing, load it from /auth/me
// (the token is saved first so the request carries it).
async function withUser(data) {
  if (!data || data.needsOtp || data.user || !data.token) return data;
  localStorage.setItem("gr_token", data.token);
  const me = await call("get", "/auth/me");
  return { ...data, user: me };
}

export const login = async (email, password) =>
  useMock ? mock.login(email, password) : withUser(await call("post", "/auth/login", { email, password }));

export const verifyLoginOtp = async (email, code) =>
  useMock ? mock.verifyLoginOtp(email, code) : withUser(await call("post", "/auth/login/verify-otp", { email, code }));

export const register = (form) =>
  useMock ? mock.register(form) : call("post", "/auth/register", form);

export const verifySignupOtp = (email, code) =>
  useMock ? mock.verifySignupOtp(email, code) : call("post", "/auth/verify-otp", { email, code });

export const resendOtp = (email) =>
  useMock ? mock.resendOtp(email) : call("post", "/auth/resend-otp", { email });

export const forgotPassword = (email) =>
  useMock ? mock.forgotPassword(email) : call("post", "/auth/forgot-password", { email });

// both field names are sent, the server uses the one it knows
export const resetPassword = (token, password) =>
  useMock
    ? mock.resetPassword(token, password)
    : call("post", "/auth/reset-password", { token, password, newPassword: password });

// The logged-in user, fresh from the server
export const getMe = () => call("get", "/auth/me");