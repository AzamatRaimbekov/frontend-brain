---
title: Где хранить токены в SPA — BFF и HttpOnly-cookie, access в памяти, localStorage нельзя
type: decision
stack: [react, vite, next]
tags: [auth, tokens, bff, cookie, localStorage, oauth, xss, csrf]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

В изученных проектах встречаются все варианты: access и refresh в `localStorage`, access в
`sessionStorage`, refresh в HttpOnly-cookie. Аудит заказчика проверит это первым.

## Решение

По убыванию предпочтения:

1. **BFF** (backend-for-frontend): токены хранит сервер, браузер получает только cookie сессии
   `HttpOnly; Secure; SameSite=Lax|Strict`. Next.js — Route Handlers/Server Actions; Vite SPA — тонкий
   бэкенд или прокси рядом со статикой. По умолчанию для данных клиентов и персональных данных.
2. **Без BFF:** access-токен только в памяти (модуль `session-store`), refresh — в HttpOnly-cookie,
   выдаётся и ротируется сервером. После F5 сессия восстанавливается тихим refresh
   ([session-restore-without-false-redirect](../state/session-restore-without-false-redirect.md)).
3. От CSRF при cookie-авторизации: `SameSite` + anti-CSRF токен для изменяющих запросов.

Запрещено: токены и идентификаторы сессии в `localStorage`/`sessionStorage` в новых проектах.
В существующих — переносить при первой задаче, которая трогает авторизацию.

HttpOnly не отменяет XSS: внедрённый скрипт всё равно делает запросы от имени пользователя. Поэтому
нужен CSP и запрет `dangerouslySetInnerHTML` без санитайзера.

## Почему

`localStorage` доступен любому JS на странице, одна XSS — и токен уходит наружу и живёт дольше вкладки.
BFF убирает токены из браузера целиком. Это рекомендация IETF (OAuth 2.0 for Browser-Based Applications)
и OWASP.

## Источник

https://datatracker.ietf.org/doc/draft-ietf-oauth-browser-based-apps/,
https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html, октябрь 2026.
