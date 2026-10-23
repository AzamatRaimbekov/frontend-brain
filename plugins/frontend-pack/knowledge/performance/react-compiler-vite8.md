---
title: React Compiler в Vite 8 — plugin-react 6 больше не принимает babel-опцию
type: gotcha
stack: [vite, react]
tags: [react-compiler, vite, plugin-react, babel, rolldown]
author: AzamatRaimbekov
updated: 2026-10-24
---

## Контекст

Скилл говорит включать React Compiler ([react-architecture §10](../../skills/react-architecture/SKILL.md)),
а старые гайды пишут `react({ babel: { plugins: ['babel-plugin-react-compiler'] } })`. В
`@vitejs/plugin-react` 6 (Vite 8) этот путь не работает: Babel вынесен в отдельный плагин.

## Решение

```bash
npm i -D @rolldown/plugin-babel @babel/core babel-plugin-react-compiler
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
})
```

- Next.js: `reactCompiler: true` в `next.config`.
- Версию `babel-plugin-react-compiler` пинь точно.
- Линт — `eslint-plugin-react-hooks` v6+ (пресет recommended), отдельный `eslint-plugin-react-compiler` не нужен.
- Нарушение правил React не ломает сборку: компилятор просто пропускает компонент. Точечный отказ —
  директива `'use no memo'` в начале компонента.
- В plugin-react 6 есть и `react({ compiler: true })` на Rust-порте компилятора, но он помечен
  экспериментальным — для прода используй Babel-вариант.

## Почему

Старый конфиг молча перестаёт подключать компилятор, и ручные `useMemo` начинают казаться нужными.

## Источник

README `@vitejs/plugin-react` 6.1.2 (раздел React Compiler), https://react.dev/learn/react-compiler/installation, октябрь 2026.
