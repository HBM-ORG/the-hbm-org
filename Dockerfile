FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.json prisma.config.ts ./
COPY apps/site/package.json apps/site/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/server/package.json apps/server/package.json
RUN npm ci

COPY . .
RUN npm run typecheck && npm run build

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=build /app /app

EXPOSE 3001

CMD ["npm", "start"]
