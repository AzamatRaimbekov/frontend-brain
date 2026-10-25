# Server Actions: security, validation, invalidation

Verified against Next.js 16.4.3 (2026-10-25). Error result shape and client form handling are owned by
`react-error-handling` references/nextjs.md (`ActionResult`, `form.setError`); this file adds the security and
cache parts.

## What the framework does and does not do

Does: compares `Origin` with `Host`/`X-Forwarded-Host` (CSRF), caps the body at 1 MB, encrypts action ids and
closure variables, strips unused actions from the client bundle.

Does not: authenticate, authorize, validate, or filter return values. Every exported `'use server'` function is
reachable by a POST from anyone who can load a page that references it.

## Layout

```
src/features/orders/api/
  order.dal.ts        import 'server-only'; session, ownership, DB/backend calls, returns DTOs
  order.actions.ts    'use server'; parse → call DAL → invalidate → ActionResult
  order.schemas.ts    Zod schemas shared by the form and the action
```

```ts
// src/shared/auth/session.ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'

export const getSession = cache(async () => {
  const token = (await cookies()).get('session')?.value
  return token ? verifySession(token) : null // backend/JWT check, never decode-only
})

export async function requireUser() {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized') // unexpected for UI that only renders when logged in
  return session.user
}
```

```ts
// src/features/orders/api/order.actions.ts
'use server'

import { updateTag } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/shared/api/actionResult'
import { requireUser } from '@/shared/auth/session'
import { cancelOrderForUser } from './order.dal'
import { orderTags } from './order.server'

const cancelOrderSchema = z.object({ orderId: z.string().uuid(), reason: z.string().trim().max(500) })

export async function cancelOrderAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser()                                   // 1. authenticate
  const parsed = cancelOrderSchema.safeParse(input)                  // 2. validate the shape
  if (!parsed.success) {
    return { ok: false, message: 'Проверьте поля формы.', fieldErrors: z.flattenError(parsed.error).fieldErrors }
  }
  const res = await cancelOrderForUser(user.id, parsed.data)         // 3. authorize by ownership in the DAL
  if (res.kind === 'not_found') return { ok: false, message: 'Заказ не найден.' } // same answer for "not yours"
  if (res.kind === 'already_shipped') return { ok: false, message: 'Заказ уже отправлен.' }
  updateTag(orderTags.detail(res.id))                                // 4. read-your-own-writes
  return { ok: true, data: { id: res.id } }                          // 5. minimal DTO
}
```

Rules:

- Take only ids and the user's change from the client; re-read owner, price, status on the server.
- Zod checks shape, not permission. The DAL query includes `ownerId = user.id` (or a role check).
- Destructive operations: re-check permission and consider re-authentication.
- `redirect()` throws: call `updateTag`/`revalidatePath` before it.
- Never return `error.message`, stack traces, or full DB rows. Log server-side with the digest.
- Optional extra: `experimental.taint` + `taintObjectReference` on sensitive objects, after DTO filtering.
- Rate-limit expensive or abuse-prone actions (login, OTP, search) - nginx `limit_req` or a store-backed limiter.

## Calling from the client

```tsx
'use client'
// features/orders/components/CancelOrderButton.tsx
const queryClient = useQueryClient()
const cancel = useMutation({
  mutationFn: cancelOrderAction,
  onSuccess: (result) => {
    if (!result.ok) return toast.error(result.message)
    queryClient.invalidateQueries({ queryKey: orderQueries.all() })  // client cache
  },
})
```

- Actions run one at a time per client; to do work in parallel, do it inside one action.
- A plain `<form action={...}>` + `useActionState` is fine for simple forms with no Query cache involvement.
- After a deploy, old clients may call action ids that no longer exist: show a "reload" retry path, prefer rolling
  deploys, keep `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` stable and set `deploymentId`.

## Configuration

```ts
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['app.example.kg'], // only when a proxy/CDN rewrites Host; never '*'
      bodySizeLimit: '2mb',               // only if uploads need it; large files go to a route handler/S3
    },
  },
}
```

Behind nginx, forward `Host` and `X-Forwarded-Host` correctly (self-hosting.md) so the CSRF check passes without
`allowedOrigins`.

## Choosing the invalidation

- `updateTag(tag)`: the user must see the change in this response (Server Actions only).
- `revalidateTag(tag, 'max')`: others may see it a bit later; no re-render in this response.
- `revalidatePath('/orders')`: no tags on that data.
- `refresh()`: only uncached UI changed (e.g. a cookie-based preference). Setting/deleting a cookie already
  re-renders the page.

## Keep patched

Server Actions were the target of the October 2026 DoS advisory (GHSA-p3m5-59mp-jv5r, fixed in 16.4.1 / 15.5.28).
Any app with at least one Server Action must stay on the latest patch.
