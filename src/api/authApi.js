import { call, useMock } from "./http.js";
import * as mock from "../mock/mockAuth.js";

// Each function uses mock data or the real API depending on VITE_USE_MOCK
export const login = (email, password) =>
  useMock ? mock.login(email, password) : call("post", "/auth/login", { email, password });

export const verifyLoginOtp = (email, code) =>
  useMock ? mock.verifyLoginOtp(email, code) : call("post", "/auth/login/verify-otp", { email, code });

export const register = (form) =>
  useMock ? mock.register(form) : call("post", "/auth/register", form);

export const verifySignupOtp = (email, code) =>
  useMock ? mock.verifySignupOtp(email, code) : call("post", "/auth/verify-otp", { email, code });

export const resendOtp = (email) =>
  useMock ? mock.resendOtp(email) : call("post", "/auth/resend-otp", { email });

export const forgotPassword = (email) =>
  useMock ? mock.forgotPassword(email) : call("post", "/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
  useMock ? mock.resetPassword(token, password) : call("post", "/auth/reset-password", { token, password });
