FROM node:24-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c AS build
WORKDIR /app
COPY package*.json ./
COPY scripts ./scripts
COPY src ./src
COPY public ./public
COPY *.js ./
RUN npm ci --no-audit --no-fund && npm cache clean --force

FROM node:24-bookworm-slim@sha256:c86ecead9e55a5210ac1727de38a4ca840bf03dcaf34dc9749addbf383b1920c
ENV NODE_ENV=production PORT=3000 NODE_OPTIONS=--max-old-space-size=256
WORKDIR /app
COPY --from=build --chown=node:node /app /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=12s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/health?db=1',{signal:AbortSignal.timeout(11000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
