# Mbank icons by role (Icons library)

Library `Icons` (file `mS7YDd02ncMJH43DFk2Ixy`, library key `lk-450575c3585dc5425ef125ccdcace23e1209bed9ecc0ae1b7a3337829fa306bdc8db2051961d6f27deb1f79e7abad038f859ca7300409adf91a8efad71ac83e1`). Each icon is a component set with `Style` = Line / Outlined / Solid / Duo Tone, 24 px. Keys below were resolved with `search_design_system` on 2026-10-09.

Import: `figma.importComponentSetByKeyAsync(key)`; if it throws, the icon is a single component, so use `figma.importComponentByKeyAsync(key)`. Place an icon by **swapping an existing icon slot** inside a kit instance (`slot.swapComponent(set variant with the slot's current Style)`), never by appending a free icon next to a component.

## Navigation (tab bar)

| Role | Icon | key |
|---|---|---|
| Главная | `home` | `a78b8d74715500596284c5d5c85e37aeb7c3b498` |
| Переводы | `swap-arrow-horizontal` | `e461d58e04b90167d19a71bc8301e8ff3d655cd1` |
| Платежи | `wallet` | `82c50e7fa879ad24f1836a01a79ec9d828f6dab8` |
| История | `time` | `b3fba14b0ae7d05a7eadc0667465384df9342fe9` |
| Ещё / меню | `more-menu` | `9c06e40ba8f86c06ae35a15fbc4f765e9ba0672a` |
| Профиль | `user` | `97d03b2d55b447f904dbe536eaf39342aba16809` |
| Карты | `credit-card` | `238fc09fae275bcdf0014f8385eac3351c326a00` |
| QR | `qr-code` | `763d01ca93d379ce658447d6f3409a7dee3b9113` |

Selected tab = `Style=Solid`, others `Style=Line` (the Tab Bar component already sets this per slot; keep the slot's style when swapping).

## Actions and controls

| Role | Icon | key |
|---|---|---|
| Поиск | `search` | `c97f4e61357410f27d3a6793a4ea5e3792b844b1` |
| Назад | `chevron-left` | `5d4765a43a19810a20206d97feaedc8dd430fd86` |
| Вперёд / в строке | `chevron-right` | `1b4cea99c6cafd5f629a15bf8e757046a71bf61c` |
| Закрыть | `close` | `2f87bc63a8dc121693cc20445a3375df002e74b3` |
| Добавить | `plus` | `ee53f7acc7b65e85576b53e0e92bb77b9d371356` |
| Уведомления | `Bell` | `31650a8bb97e2dae6e514e67bc41bd0a2ce23d5b` |
| Настройки | `setting` | `5e39be42e9a89823ca4d341322b91e85c8e0fbca` |
| Копировать | `copy` | `aa6f064d4a86a982474069290d84a5616616a880` |
| Поделиться (iOS) | `ios-share` | `8f186cec176a3c4318b73ee13f7f54e50acfe9c1` |
| Поделиться (Android) | `material-share` | `b2af4029c2370bd555d4a7b0dbecdd1a88057282` |
| Редактировать | `edit-pen` | `315b58394074a05a05a36344cfaf3bb7a28795c0` |
| Удалить | `delete` | `0a139b6789e73545e7284f42a552c072c8a7453d` |
| Корзина | `trash` | `bb60e2366e377628574f2f2af9eb8cfedd287ced` |
| Скачать | `download` | `bd81080a79a47b6856cadd02276bc81459829c70` |
| Загрузить | `upload` | `8b0ee00c42d0e34faed95cc940cbfa9872d8481a` |
| Фильтр | `filter` | `abcde51b0401e1bb7b32245a45a712ee5bc55e77` |
| Календарь / дата | `calendar` | `d564c1765ca497ebd54a610aff5a8c1e388f9389` |
| Показать (пароль, баланс) | `eye` | `ec61c7f40a7a2dad29fd0ad31f5ee1a3cac24825` |
| Позвонить | `calling` | `c53a91c42d8089d6823c74c9e36de5350d02749c` |

## Status

| Role | Icon | key |
|---|---|---|
| Информация | `info` | `ab8861b5d72a6e3c6b4eee50232d14be52dbdf89` |
| Предупреждение / ошибка | `info-triangle` | `f8c3458ce5fe23763df4a5040f21034f5bf93718` |
| Успех (галочка) | `checked` | `915ee4759f4b8c7eccd79dcca2d1f486954447c7` |
| Успех (в круге) | `circle-check` | `3fccbea6a74b16503b6a67cc7986d0c57a1875ef` |

## Brand

| Role | Icon | key |
|---|---|---|
| Знак Mbank | `Mbank-icon` | `40ae05601e9480e59e508ed3277d036ab82516ca` |

Other logos (`mbank-logo`, `MPay`, `mkassa-logo`, …) and the 266 flags are in the same library: resolve them with one `search_design_system` call scoped to the Icons library key.

## Not in this table

1. Search once: `search_design_system` with `includeLibraryKeys: [Icons key]`, one query per role, all roles batched in one call.
2. Pick the exact-name match (e.g. `home`, not `home-bank`); no match → closest by meaning, and name it in the report.
3. Add the new row here (role, icon, key) so the next screen does not search again.
4. Never Lucide, emoji, or a hand-drawn vector for a role that the library covers.
