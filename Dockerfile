# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 - build the React SPA.
# Vite bakes VITE_* values in at build time, but the app is same-origin in
# production (Express serves this bundle), so none need to be passed here.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS frontend

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 - backend runtime.
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/ ./

# Express serves the SPA out of public/. It is produced by the build stage, so
# the compiled bundle never has to be committed to git.
COPY --from=frontend /app/frontend/dist ./public

# Drop root.
USER node

EXPOSE 3000

# Dokploy can point its health check at this.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
