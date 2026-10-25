# Self-hosting: Docker (standalone) + nginx

Verified against Next.js 16.4.3 (2026-10-25). Based on the official `examples/with-docker` (MIT) and the
Self-Hosting guide. Mdigital deploys Next.js as a Node.js server in Docker behind nginx; static export
(`output: 'export'`) only for sites with no server features (no actions, proxy, ISR, image optimization).

## next.config.ts

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',                           // .next/standalone with server.js and traced node_modules
  deploymentId: process.env.DEPLOYMENT_VERSION,   // version-skew protection for rolling deploys (git sha)
  poweredByHeader: false,
  // outputFileTracingRoot: path.join(__dirname, '../../'), // monorepo only
}
export default nextConfig
```

## Dockerfile

```dockerfile
ARG NODE_VERSION=24-slim
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store corepack enable pnpm && pnpm install --frozen-lockfile

FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
ARG DEPLOYMENT_VERSION
# NEXT_PUBLIC_* are inlined here, at build: only values that are the same on every stand
RUN --mount=type=secret,id=actions_key corepack enable pnpm && \
    if [ -f /run/secrets/actions_key ]; then export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/actions_key)"; fi && \
    pnpm build                         # ARG DEPLOYMENT_VERSION is visible to next.config as env here

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
```

- `standalone` does not copy `public/` and `.next/static`: the two `COPY` lines are required, or every asset 404s.
- `HOSTNAME=0.0.0.0`, otherwise the server listens on the container hostname only.
- Run as `node`, not root. `.dockerignore`: `node_modules`, `.next`, `.git`, `.env*`.
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` (base64, 16/24/32 bytes, e.g. `openssl rand -base64 32`) is embedded into the
  build output: pass it as a BuildKit secret, keep it the same for every image of one release that runs side by side.
- `/api/health` is a tiny route handler returning 200 (add `await connection()` so it is not prerendered).
- `docker stop` sends `SIGTERM`; Next.js finishes in-flight requests and `after()` callbacks. Give 10-30 s
  (`stop_grace_period: 30s` in compose, `terminationGracePeriodSeconds` in k8s).

## Runtime config, one image for all stands

`process.env.X` read in server code at request time is runtime config; `NEXT_PUBLIC_X` is frozen at build. For a
backend URL that differs per stand: the browser calls relative `/api/...`, nginx proxies to the backend, and server
code reads `process.env.API_URL` (validated by Zod in `shared/config/env.ts`). Values the client really needs
are passed from a Server Component as props.

## nginx in front

```nginx
upstream next_app { server app:3000; keepalive 32; }

server {
  listen 80;
  server_name example.kg;
  client_max_body_size 10m;

  location /_next/static/ {
    proxy_pass http://next_app;          # Next sends immutable Cache-Control for hashed files itself
  }

  location /api/backend/ {
    proxy_pass ${BACKEND_URL}/;          # nginx:alpine templates substitute env
  }

  location / {
    proxy_pass http://next_app;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;      # Server Actions CSRF check compares Origin with it
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Connection "";
    proxy_buffering off;                 # streaming / Suspense / PPR need unbuffered responses
    proxy_read_timeout 60s;
  }
}
```

`${BACKEND_URL}` substitution works like in the
[Vite SPA recipe](../../../knowledge/project-setup/docker-nginx-vite-spa.md). nginx handles TLS, slow clients, body size and rate limiting (`limit_req`) so the Node process does not.
Alternatively send `X-Accel-Buffering: no` from `next.config` `headers()`.

## More than one instance

Required when replicas > 1 or during rolling deploys:

1. Same `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` for all instances (else "Failed to find Server Action").
2. `deploymentId` set (mismatch triggers a hard reload instead of broken navigations).
3. Shared cache: `cacheHandlers` (for `'use cache'` / `'use cache: remote'`) and `cacheHandler` (ISR/route cache)
   backed by Redis; the handler must serialize `Buffer`/`Map`, bound its size, index tags, implement `refreshTags`
   so `revalidateTag` on one pod reaches the others. Start from the community handlers listed in the official Redis
   example README instead of writing one.
4. Build once, promote the same image; if you rebuild per stage, set `generateBuildId` to the git sha.

## Images

`next/image` works with `next start`/`server.js` with no extra setup (uses `sharp`). On glibc images keep `sharp`
patched (October 2026 advisory: `sharp` ≥ 0.35.5); `node:*-slim` is glibc, `alpine` is musl.
