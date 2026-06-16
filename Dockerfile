# ============================================================
#  Maintenance Wizard — Production Container for Google Cloud Run
#  Multi-stage build for minimal final image
# ============================================================

# ---------- Stage 1: Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (cache layer)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Build client (Vite -> dist/) and server bundle (esbuild -> dist/server.cjs)
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Only copy production assets
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Cloud Run listens on PORT (default 8080)
EXPOSE 8080

# Healthcheck (Cloud Run will hit /api/health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

CMD ["node", "dist/server.cjs"]
