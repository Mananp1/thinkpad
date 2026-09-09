import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

// Resolves the Better Auth session cookie and puts the user on the request.
export default async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = session.user;
    req.session = session.session;
    return next();
  } catch (error) {
    console.error("Error resolving session", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
