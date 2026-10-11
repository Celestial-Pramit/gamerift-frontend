import { call, useMock } from "./http.js";
import { countries as mockCountries } from "../mock/mockData.js";

// Users per country: [{ code, country, users }]
export async function getUsersByCountry() {
  if (useMock) return mockCountries.map((c) => ({ code: c.code, country: c.name, users: c.k * 1000 }));
  return call("get", "/stats/users-by-country");
}

// Real numbers for the landing page: { users, liveStreams, channels, viewersNow } (null in mock mode)
export async function getPublicStats() {
  if (useMock) return null;
  return call("get", "/stats/public");
}
