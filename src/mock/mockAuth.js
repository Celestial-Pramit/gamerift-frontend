// Fake auth API for building the UI without a backend
export const DEMO_OTP = "123456";

const users = [
  { username: "admin", email: "admin@gamerift.tech", password: "Admin@123", role: "ADMIN", country: "Bangladesh" },
  { username: "gamer", email: "gamer@gamerift.tech", password: "Gamer@123", role: "VIEWER", country: "Bangladesh" },
];

const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

function makeSession(u) {
  return { token: "mock-token-" + u.username, user: { username: u.username, email: u.email, role: u.role, country: u.country } };
}

export async function login(email, password) {
  await wait();
  const u = users.find((x) => x.email === email && x.password === password);
  if (!u) throw new Error("Wrong email or password");
  // Admin always needs OTP (2FA)
  if (u.role === "ADMIN") return { needsOtp: true };
  return makeSession(u);
}

export async function verifyLoginOtp(email, code) {
  await wait();
  if (code !== DEMO_OTP) throw new Error("Wrong code");
  return makeSession(users.find((x) => x.email === email));
}

export async function register(form) {
  await wait();
  if (users.find((x) => x.email === form.email)) throw new Error("Email already registered");
  users.push({ ...form, role: "VIEWER" });
  return { email: form.email };
}

export async function verifySignupOtp(email, code) {
  await wait();
  if (code !== DEMO_OTP) throw new Error("Wrong code");
  return { ok: true };
}

export async function resendOtp(email) { await wait(); return { ok: true }; }
export async function forgotPassword(email) { await wait(); return { ok: true }; }
export async function resetPassword(token, password) { await wait(); return { ok: true }; }
