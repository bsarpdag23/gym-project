# ── Stage 1: Build and compile native modules ──
FROM node:20-alpine AS builder
WORKDIR /app
# Install build tools for native C++ addons like bcrypt and sharp
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Remove devDependencies to optimize node_modules size
RUN npm prune --production

# ── Stage 2: Light runtime ──
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "dist/main"]
