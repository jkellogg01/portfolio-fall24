FROM golang:alpine AS server-build

ENV CGO_ENABLED=1
ENV GOOS=linux

RUN apk add --no-cache gcc musl-dev

WORKDIR /app/server

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server .
RUN go build -ldflags='-s -w -extldflags "-static"' -o /portfolio-server

FROM server-build AS server-test

RUN go test -v ./...

FROM oven/bun:slim AS client-build

WORKDIR /app/client

ENV NODE_ENV="production"

# Install node modules for the client app
COPY client/bun.lockb client/package.json ./
RUN bun install --ci
COPY client .

# Build static files for the client app
RUN bun run build

# Purge any files which aren't from the build
RUN find . -mindepth 1 ! -regex '^./dist\(/.*\)?' -delete

FROM alpine AS build-release-stage

WORKDIR /

COPY --from=client-build /app/client/dist /dist
COPY --from=server-build /portfolio-server /portfolio-server
COPY server/sql/schema sql/schema

EXPOSE 8080
ENTRYPOINT [ "/portfolio-server" ]
