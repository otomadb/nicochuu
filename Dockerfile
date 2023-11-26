# Builder
FROM node:20.10.0-slim@sha256:363a50faa3a561618775c1bab18dae9b4d0910a28f249bf8b72c0251c83791ff AS builder
WORKDIR /app

# install OpenSSL
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl=3.0.11-1~deb12u1 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN corepack enable && npm ci --ignore-scripts

COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm run generate:prisma

COPY buf.gen.yaml ./
COPY proto ./proto
RUN npm run generate:buf

COPY *.ts tsconfig.json rollup.config.js ./
RUN npm run build

# Runner
FROM node:20.10.0-slim@sha256:363a50faa3a561618775c1bab18dae9b4d0910a28f249bf8b72c0251c83791ff AS runner
WORKDIR /app
ENV NODE_ENV production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl=3.0.11-1~deb12u1 \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ADD https://github.com/krallin/tini/releases/download/v0.19.0/tini /bin/tini
RUN chmod +x /bin/tini

COPY package.json package-lock.json ./
RUN corepack enable && npm ci --omit dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/server.mjs"]
