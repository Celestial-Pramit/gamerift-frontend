import axios from "axios";

// true = use fake data from src/mock, false = call the real backend
export const useMock = import.meta.env.VITE_USE_MOCK === "true";

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Send the JWT token with every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("gr_token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

// One helper for all real calls: returns data or throws an Error with a message
export async function call(method, url, body) {
  try {
    const res = await http({ method, url, data: body });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Something went wrong");
  }
}
