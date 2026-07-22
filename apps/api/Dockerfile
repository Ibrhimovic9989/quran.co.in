# NestJS API image — build from the MONOREPO ROOT:
#   docker build -f apps/api/Dockerfile .
#
# Note: the build stage installs all workspace deps (simple + reliable).
# Optimize later with npm's workspace pruning if image size matters.

FROM node:22-alpine AS build
WORKDIR /repo

# Workspace manifests first for layer caching
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/database/package.json packages/database/

RUN npm ci --ignore-scripts

# Prisma schema + api sources
COPY packages/database packages/database
COPY apps/api apps/api

RUN npx prisma generate --schema packages/database/prisma/schema.prisma
RUN npm run build -w api

FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=build /repo/node_modules node_modules
COPY --from=build /repo/apps/api/dist apps/api/dist
COPY --from=build /repo/apps/api/package.json apps/api/package.json
COPY --from=build /repo/packages/database packages/database

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
