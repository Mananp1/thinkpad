import { createAuthClient } from "better-auth/react";

// The API is same-origin in both environments - Vite proxies /api in dev, and
// Express serves the built SPA in production - so the default baseURL (the
// current origin) is correct and nothing needs configuring per environment.
export const authClient = createAuthClient();
