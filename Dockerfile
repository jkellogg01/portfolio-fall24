FROM oven/bun:${BUN_VERSION}-slim as base

WORKDIR /app

ENV NODE_ENV="production"

FROM base as build

COPY --link bun.lockb package.json ./
RUN bun install --ci

COPY --link client/bun.lockb client/package.json ./client/
RUN cd client && bun install --ci

COPY --link . .

WORKDIR /app/client
RUN bun run build

RUN find . -mindepth 1 ! -regex './dist\(/.*\)?' -delete

FROM base

COPY --from=build /app /app

EXPOSE 3000
CMD [ "bun", "run", "start" ]
