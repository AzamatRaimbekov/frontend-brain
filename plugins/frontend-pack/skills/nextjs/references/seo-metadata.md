# Metadata, SEO pages, images and fonts

Verified against Next.js 16.4.3 (2026-10-25).

## Root layout

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--font-sans' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'), // relative URLs below need it
  title: { default: 'Компания', template: '%s | Компания' },
  description: 'Короткое описание сайта',
  openGraph: { type: 'website', locale: 'ru_RU', siteName: 'Компания' },
  alternates: { languages: { ru: '/ru', ky: '/ky', en: '/en' } },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
```

- `--font-sans` is consumed by Tailwind v4 `@theme` (`--font-sans: var(--font-sans)` mapping per `react-ui`).
- `metadataBase` is read at build for static pages: a per-stand domain must come from build env or from a dynamic
  `generateMetadata`. If `generateMetadata` uses `'use cache'`, return URLs as strings (no `URL` objects).

## Page metadata from data

```tsx
// src/app/(marketing)/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPost } from '@/features/blog/server' // React cache() or 'use cache' inside: one request for both

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, images: post.cover ? [post.cover] : undefined },
  }
}

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }))
}

export const ensureStatic = 'navigation' // 16.4: build fails if this page turns dynamic

export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const post = await getPost((await params).slug)
  if (!post) notFound()
  return <PostView post={post} />
}
```

- Prerendered pages resolve metadata at build. Dynamic pages stream metadata after the UI; bots listed in
  `htmlLimitedBots` get blocking metadata. Keep SEO pages prerendered when possible.
- `noindex` for stage/test stands: `robots: { index: false }` driven by an env flag, plus `robots.ts`.

## File conventions

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPostSlugs()
  return [
    { url: 'https://example.kg/', changeFrequency: 'weekly', priority: 1 },
    ...posts.map((slug) => ({ url: `https://example.kg/blog/${slug}` })),
  ]
}

// src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] }, sitemap: 'https://example.kg/sitemap.xml' }
}
```

- `opengraph-image.tsx` / `twitter-image.tsx` with `ImageResponse` (flexbox only, no grid). Since 16 the image
  function receives `params` and `id` as Promises, and the sitemap `id` from `generateSitemaps` is a Promise too.
- `icon.png`/`icon.svg`/`apple-icon.png` files in `app/`; multiple formats supported since 16.2.
- JSON-LD: render `<script type="application/ld+json">` with `JSON.stringify(data).replace(/</g, '\\u003c')`.

## Images

```tsx
import Image from 'next/image'

<Image src={hero} alt="Описание" loading="eager" fetchPriority="high" sizes="100vw" placeholder="blur" />
<Image src={product.imageUrl} alt={product.name} width={320} height={240} sizes="(min-width: 768px) 320px, 50vw" />
```

```ts
// next.config.ts
images: {
  remotePatterns: [new URL('https://cdn.example.kg/**')], // the only allowed remote hosts
  qualities: [75],                                        // 16 default; add values you use, others return 400
}
```

- `priority` is deprecated in 16: use `loading="eager"`/`fetchPriority="high"` for the LCP image.
- `images.domains` is deprecated; local IP targets are blocked by default; `minimumCacheTTL` default is 4 h.
- Allow-list remote hosts narrowly (the September 2026 SSRF advisory affected apps with `remotePatterns`).
- Self-hosted on glibc Linux: keep `sharp` ≥ the version named in the latest security post.

## Scripts

`next/script` with `strategy="afterInteractive"` (default) or `lazyOnload` for widgets; never inline third-party
`<script>` tags in JSX. CSP nonces apply to `next/script` automatically when proxy sets them.
