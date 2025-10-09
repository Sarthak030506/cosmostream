FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/realtime/package*.json ./apps/realtime/
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/realtime
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/realtime/dist ./dist
COPY --from=builder /app/apps/realtime/package*.json ./
RUN npm ci --only=production

EXPOSE 4001
CMD ["npm", "start"]
