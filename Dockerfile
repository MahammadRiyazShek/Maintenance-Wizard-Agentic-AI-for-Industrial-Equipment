# ============================================================
# Maintenance Wizard — Agentic AI for Industrial Equipment
# Production Dockerfile — multi-stage build for Google Cloud Run
# ============================================================

# ---- Stage 1: Builder ----
FROM node:20-slim AS builder
WORKDIR /app

# Install ALL dependencies (including devDeps required for build: vite, esbuild, tailwind)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --silent

# Copy source and build (Vite static bundle + esbuild server)
COPY . .
RUN npm run build

# Prune devDependencies for slim runtime layer
RUN npm prune --production --silent

# ---- Stage 2: Runtime ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Cloud Run sends SIGTERM; honour graceful shutdown
ENV NODE_OPTIONS="--enable-source-maps"

# Copy only what runtime needs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Non-root user for security
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Cloud Run will set PORT; document the default
ENV PORT=8080
EXPOSE 8080

# Healthcheck endpoint already exposed at /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.cjs"]
