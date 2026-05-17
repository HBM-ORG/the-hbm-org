FROM node:20-bookworm-slim AS build

WORKDIR /app

# `lib/*.js` is resolved from repo root — Node must find deps like `luxon` under /app/node_modules
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json prisma.config.ts ./
COPY apps/server/package.json apps/server/package-lock.json apps/server/tsconfig.json ./apps/server/
WORKDIR /app/apps/server
RUN npm ci

WORKDIR /app
COPY . .
RUN npm --prefix apps/server run validate

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /app /app

EXPOSE 3001

CMD ["npm", "--prefix", "apps/server", "run", "web"]
