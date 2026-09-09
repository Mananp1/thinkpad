import { createAuthClient } from "better-auth/react";

// Must point at the same origin as the axios client, or the session cookie set
// by sign-in would not be sent with API requests. Undefined means same-origin.
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export const authClient = createAuthClient({
  baseURL: API_BASE || undefined,
});
