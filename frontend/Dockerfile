# syntax=docker/dockerfile:1.6

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Disable telemetry + make builds more deterministic
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only dependency manifests first (maximizes Docker layer caching)
COPY package.json package-lock.json ./

# Cache npm downloads between builds (requires BuildKit, Docker Desktop supports it)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy only what you actually need to build
COPY src ./src
COPY public ./public
COPY next.config.ts tsconfig.json ./
COPY declarations.d.ts* ./
COPY eslint.config.mjs* ./
COPY README.md* ./

# Cache Next build artifacts between builds
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# Stage 2: Runtime (nginx serving static export)
FROM nginx:alpine AS runner

# If you have a custom nginx.conf, use it (you listed nginx.conf in your folder)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static site output
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]