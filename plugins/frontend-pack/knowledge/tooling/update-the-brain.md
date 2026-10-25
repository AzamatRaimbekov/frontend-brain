---
title: Как получить свежий мозг и не держать две копии плагина
type: recipe
stack: [all]
tags: [install, update, marketplace]
author: AzamatRaimbekov
updated: 2026-10-22
---

## Контекст

Правила обновляются через PR в `AzamatRaimbekov/frontend-brain`. Без обновления у тебя старые правила. Плагин `frontend-pack` раньше ставился из GitLab-маркетплейса `mdigital`; если включены обе копии, работают старые скиллы и хуки вперемешку с новыми.

## Решение

Claude Code:

```bash
claude plugin list | grep -A3 frontend-pack      # должна быть включена только @frontend-brain
claude plugin disable frontend-pack@mdigital     # если старая копия есть и включена
claude plugin marketplace update frontend-brain
claude plugin update frontend-pack@frontend-brain
```

Codex: `codex plugin marketplace upgrade`.

После обновления перезапусти сессию: скиллы читаются при старте.

## Почему

Новые статьи и правила попадают к тебе только после обновления маркетплейса. Две включённые копии с одним именем плагина дают два набора хуков и противоречивые инструкции.

## Источник

Проверено при переходе с `frontend-pack@mdigital` 0.5.0 на `frontend-pack@frontend-brain` 0.8.0, октябрь 2026.
