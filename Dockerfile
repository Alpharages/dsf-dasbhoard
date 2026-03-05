# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Enable corepack so pnpm is available
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

# Copy lockfile + manifests first (layer cache)
COPY package.json pnpm-lock.yaml ./

# Install all deps (including devDependencies — needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build-time env vars (VITE_* are inlined at compile time)
ARG VITE_API_BASE_URL=http://localhost:3000
ARG VITE_WS_URL=http://localhost:3000

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN pnpm build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
