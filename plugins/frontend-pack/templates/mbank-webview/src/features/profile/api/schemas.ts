import * as z from 'zod/mini'

// zod/mini: the same schemas and parse, a fraction of the bundle (WebView opens over mobile networks).
export const profileSchema = z.object({ name: z.string(), phone: z.string() })
export type Profile = z.infer<typeof profileSchema>
