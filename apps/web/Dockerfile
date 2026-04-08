FROM node:20-alpine AS build

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/design-tokens/package.json packages/design-tokens/package.json
COPY packages/ui-primitives/package.json packages/ui-primitives/package.json

RUN pnpm install --frozen-lockfile

COPY apps/web apps/web
COPY packages/design-tokens packages/design-tokens
COPY packages/ui-primitives packages/ui-primitives

RUN pnpm build

FROM nginx:1.27-alpine

COPY apps/web/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY apps/web/docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY --from=build /workspace/apps/web/dist /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 8080
