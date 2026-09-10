import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./lib/auth.js";
import { connectDB } from "./config/db.js";
import notesRoutes from "./routes/notesRoutes.js";
import notebooksRoutes from "./routes/notebooksRoutes.js";
import tagsRoutes from "./routes/tagsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Dokploy puts Traefik in front of this container, so honour X-Forwarded-*
// headers for protocol detection. Only in production: trusting these when not
// actually behind a proxy would let clients spoof them.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Better Auth reads the raw request stream, so it must be mounted before
// express.json() gets a chance to consume the body.
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/notes", notesRoutes);
app.use("/api/notebooks", notebooksRoutes);
app.use("/api/tags", tagsRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use(express.static(path.join(__dirname, "public")));

// Express 5 dropped bare "*" paths, so the SPA fallback needs a named wildcard.
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handlers only see errors from middleware registered before them.
app.use((err, req, res, next) => {
  console.error("Unhandled error", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: "Internal server error!" });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log("Server started on PORT:", PORT));
});
