import axios from "axios";

// Empty means same-origin: the Vite dev proxy in development, and Express
// serving the built SPA in production. Only set VITE_API_BASE_URL when the API
// is deployed to a different origin than the frontend.
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

// Better Auth authenticates with a session cookie, so requests just need to
// carry credentials - there is no bearer token to attach by hand.
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

export default api;
