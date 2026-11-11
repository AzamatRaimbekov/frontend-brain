// «Сайт» tab: connect to the design-system site, status (совпадает / на сайте новее / в Figma новее /
// конфликт), «Получить с сайта» into the `shadcn` collection and «Отправить на сайт».
import { $, esc, send, chip, toast } from './ui.js';

const view = { site: null, report: null, push: null, asked: false };

function statusBox(s) {
  if (!s || !s.connected) return '<p class="muted">Сайт не подключён.</p>';
  if (s.error) return `<div class="box err">${esc(s.error)}</div>`;
  const changes = s.figmaChangeCount ? `<div class="muted">Изменено в Figma: ${s.figmaChanges.map(esc).join(', ')}${s.figmaChangeCount > s.figmaChanges.length ? '…' : ''}</div>` : '';
  return `<div class="box">
    <div class="row">${chip(s.label, s.tone)}<span>сайт v${esc(s.siteVersion)}</span><span class="muted">в файле v${esc(s.localVersion == null ? '—' : s.localVersion)}${s.at ? `, ${esc(String(s.at).slice(0, 16).replace('T', ' '))}` : ''}</span>
      ${s.collection ? '' : chip('нет коллекции shadcn', 'neutral')} ${s.hasKey ? '' : chip('нет ключа записи', 'warning')}</div>
    ${changes}</div>`;
}

function reportBox() {
  const r = view.report;
  const p = view.push;
  const parts = [];
  if (r) {
    parts.push(`<b>Получено с сайта, версия ${esc(r.version)}</b><ul>
      <li>создано ${r.created.length}, обновлено ${r.updated.length}, без изменений ${r.unchanged}</li>
      <li>ссылок внутри shadcn ${r.refs}</li>
      ${r.collectionCreated ? '<li>создана коллекция shadcn (Light, Dark)</li>' : ''}
      ${r.extra.length ? `<li>не из набора shadcn (не тронуты, на сайт не уходят): ${r.extra.map(esc).join(', ')}</li>` : ''}
      ${r.errors.map((e) => `<li class="err">${esc(e)}</li>`).join('')}</ul>`);
  }
  if (p) {
    parts.push(p.conflict
      ? `<b class="err">Конфликт: на сайте версия ${esc(p.siteVersion)}, правки Figma от версии ${esc(p.localVersion)}.</b><p class="muted">Посмотрите изменения на сайте. «Получить с перезаписью» возьмёт версию сайта (правки Figma пропадут) — или перенесите их на сайте руками.</p>`
      : `<b>Отправлено: версия ${esc(p.version)}</b> — изменённых токенов ${p.overrides}`);
    if (p.skipped && p.skipped.length) parts.push(`<ul>${p.skipped.map((x) => `<li class="muted">${esc(x)}</li>`).join('')}</ul>`);
  }
  return parts.length ? `<div class="box">${parts.join('')}</div>` : '';
}

export function renderSite() {
  const s = view.site || {};
  if (!view.asked) { view.asked = true; send('site-status'); }
  $('#tab-site').innerHTML = `
    <p class="muted">Источник токенов проекта — сайт дизайн-системы. Виджет берёт оттуда коллекцию <span class="mono">shadcn</span> (Light, Dark; имена как в CSS: primary, primary-foreground, radius…; значения shadcn проекта) и отправляет правки значений обратно. Новые имена не отправляются: набор shadcn фиксирован. Сайт в Figma не пишет.</p>
    <div class="box">
      <div class="row"><label>Сайт <input id="s-url" value="${esc(s.url || 'http://localhost:8797')}" size="28"></label>
        <label>Проект <input id="s-project" class="mono" value="${esc(s.project || '')}" size="18" placeholder="credit-crm"></label></div>
      <div class="row"><label>Ключ записи <input id="s-key" type="password" size="36" placeholder="${s.hasKey ? 'сохранён — вставьте новый, чтобы заменить' : 'dsk_… (сайт → проект → Figma)'}"></label>
        <button class="btn" id="s-connect">Подключить</button><button class="btn" id="s-refresh">Обновить статус</button></div>
      <div class="muted">Адрес и проект хранятся в файле (общие для команды), ключ — только у вас (clientStorage).</div>
    </div>
    ${statusBox(view.site)}
    <div class="row">
      <button class="btn primary" id="s-pull" ${s.connected ? '' : 'disabled'}>Получить с сайта</button>
      <button class="btn" id="s-push" ${s.connected && s.hasKey ? '' : 'disabled'}>Отправить на сайт</button>
      ${s.status === 'conflict' || s.status === 'figma-newer' ? '<button class="btn" id="s-force">Получить с перезаписью</button>' : ''}
    </div>
    ${reportBox()}`;
  $('#s-connect').onclick = () => send('site-connect', { url: $('#s-url').value, project: $('#s-project').value, key: $('#s-key').value });
  $('#s-refresh').onclick = () => send('site-status');
  $('#s-pull').onclick = () => send('site-pull', {});
  $('#s-push').onclick = () => send('site-push');
  if ($('#s-force')) $('#s-force').onclick = () => send('site-pull', { force: true });
}

export function onSiteDone(type, m) {
  if (m.site) view.site = m.site;
  if (type === 'site-pull') { view.report = m.report; view.push = null; toast(`Получено: версия ${m.report.version}`, 'success'); }
  if (type === 'site-push') {
    view.push = m.push;
    view.report = null;
    toast(m.push.conflict ? 'Конфликт версий: на сайте новее' : `Отправлено: версия ${m.push.version}`, m.push.conflict ? 'error' : 'success');
  }
  if (type === 'site-connect') toast('Сайт подключён', 'success');
  renderSite();
}
