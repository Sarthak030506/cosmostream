FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/media-processor/package*.json ./apps/media-processor/
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
WORKDIR /app/apps/media-processor
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/media-processor/dist ./dist
COPY --from=builder /app/apps/media-processor/package*.json ./
RUN npm ci --only=production

EXPOSE 4002
CMD ["npm", "start"]
