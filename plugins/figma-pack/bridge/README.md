# Мост для Claude (figma-bridge)

Агент управляет Figma Desktop через наш плагин DS Builder: без кликов мышкой и без переписывания кода в `use_figma`.

```
Claude ── MCP figma-bridge ── HTTP 127.0.0.1:3055 ── плагин DS Builder «Мост для Claude» ── файл Figma
```

1. Figma Desktop → Plugins → Development → DS Builder → **«Мост для Claude»** (маленькое окно «подключено»).
2. MCP `figma-bridge` поднимается вместе с плагином figma-pack (`.mcp.json`). Вручную: `node bridge/server.mjs` (MCP + HTTP) или `node bridge/server.mjs --http`.
3. Инструменты: `figma_status`, `figma_command` (`render-all`, `build`, `contract-render`, `contract-bind`, `tokens-apply`, `inspect`), `figma_export` (PNG на диск — агент смотрит результат), `figma_eval` (короткий код Plugin API для проверки).

Без MCP: `curl -X POST 127.0.0.1:3055/run -d '{"type":"inspect"}'`.

Порт занят вторым мостом — новый экземпляр работает через него. Слушает только 127.0.0.1; `figma_eval` выполняет код в открытом файле, поэтому мост держим только на своей машине.
