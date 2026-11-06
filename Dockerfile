FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# --- Build : dépendances complètes + compilation TypeScript
FROM base AS build
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

# --- Runtime : dépendances de prod uniquement
FROM base AS runtime
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
