# PSB SecureWealth — Full-stack container image
# Builds the React SPA and serves it from the Node/Express backend.

# ------------------------ Stage 1: Client build ------------------------
FROM node:22-slim AS client-build
WORKDIR /app/client

# Install build tooling for native modules if needed
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ------------------------ Stage 2: Backend production ------------------------
FROM node:22-slim AS production
WORKDIR /app

# Native modules (better-sqlite3) require a compiler
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev && npm cache clean --force

COPY backend/ ./backend/
COPY --from=client-build /app/client/dist ./client/dist

# Remove build tooling now that native modules are compiled
RUN apt-get purge -y --auto-remove python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=10000
EXPOSE 10000

WORKDIR /app/backend
CMD ["node", "server.js"]
