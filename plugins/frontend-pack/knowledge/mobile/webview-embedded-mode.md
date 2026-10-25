---
title: Одна SPA и как сайт, и внутри WebView приложения — режим через класс на body и один CSS-файл
type: recipe
stack: [react, vite]
tags: [webview, embedded, mobile-app, viewport, safe-area]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Одно веб-приложение работает как сайт и внутри WebView мобильного приложения компании. В WebView нужно
спрятать веб-шапку (навигацию даёт нативное приложение), закрепить viewport под вырез экрана и не трогать
при этом публичные страницы сайта.

## Решение

Два маленьких компонента в корне роутера переключают классы на `body`, все стили режима — в одном
CSS-файле, привязанном к этим классам:

```tsx
export function EmbeddedBodyClass() {
  const embedded = useEmbeddedFlag()     // query ?embedded=1 при первом заходе, дальше sessionStorage (в try/catch)
  useEffect(() => { document.body.classList.toggle('webview-embedded', embedded) }, [embedded])
  return null
}

const PUBLIC_ROUTES = ['/intro', '/login']
export function WebViewScope() {
  const { pathname } = useLocation()
  useEffect(() => {
    const scoped = !PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))
    document.body.classList.toggle('wv', scoped)
    document.querySelector('meta[name=viewport]')?.setAttribute('content', scoped ? WEBVIEW_VIEWPORT : STANDARD_VIEWPORT)
  }, [pathname])
  return null
}
```

- Признак `embedded` сохраняй при первом заходе (sessionStorage) или передавай через User-Agent / JS-bridge
  нативного приложения: query теряется при переходе по ссылке без него.
- `user-scalable=no` нарушает WCAG 1.4.4 — только внутри WebView, никогда на сайте.
- Отступы под вырез — `env(safe-area-inset-*)` при `viewport-fit=cover`.
- Цвета и отступы режима — те же токены, без отдельной палитры.

## Почему

Когда режим держится на одном классе и одном CSS-файле, сайт не меняется, а режим включается и
выключается без правок в компонентах.

## Источник

Проверено на SPA онбординга сотрудников (`hooks/useEmbedded.ts`, `styles/webview.css`), октябрь 2026.
