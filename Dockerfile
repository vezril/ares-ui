# Ares UI — multi-stage build producing a small standalone Next.js server image.
# The standalone server also hosts the Node-runtime BFF routes (/api/ares/*) that
# read the Ares service's survey stream + /health server-side, so the browser
# never talks to a backend and no service needs exposing. Published to Docker Hub
# as calvinference/aresui by the release workflow; deployed by Codex.

# ---- deps: install production + build dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compile the app into a standalone bundle ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* is inlined into the browser bundle at BUILD time — NOT read from
# the container env at runtime, so setting it in the Helm chart alone is inert
# (zeus-ui shipped exactly that bug). Baking the RELATIVE same-origin path here is
# what keeps the image environment-agnostic: the browser calls /api/ares on
# whatever host it was served from. The upstream endpoint stays server-side env.
ARG NEXT_PUBLIC_ARES_API_BASE=/api/ares
ENV NEXT_PUBLIC_ARES_API_BASE=$NEXT_PUBLIC_ARES_API_BASE
RUN npm run build

# ---- runner: minimal runtime ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
