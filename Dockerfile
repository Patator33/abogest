# ── Stage 1 : build React ─────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2 : production ──────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Installer uniquement express (pas de lock file Windows incompatible)
RUN echo '{"type":"module","dependencies":{"express":"^5.2.1"}}' > package.json \
    && npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 3000
CMD ["node", "server.js"]
