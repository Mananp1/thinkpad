import axios from "axios";

// Better Auth authenticates with a session cookie, so requests just need to
// carry credentials - there is no bearer token to attach by hand.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
});

export default api;
