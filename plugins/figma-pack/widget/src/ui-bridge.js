// Opens the iframe (dist/ui.html) and routes its messages to the actions. The returned promise
// stays pending while the window is open, which keeps the widget's code running (Widget API rule).
import * as A from './actions.js';
import * as S from './site-actions.js';

const SIZE = { width: 760, height: 720 };

/** store: synced state wrapper from code.jsx; tab: which tab the window opens on; focus: row key. */
export function openUI(store, tab = 'tokens', focus = null) {
  // The render-time snapshot of scan goes stale while the window is open: keep our own.
  const s = { ...store, setScan: (x) => { s.scan = x; store.setScan(x); } };
  const post = (type, data) => figma.ui.postMessage(Object.assign({ type }, data));
  const state = () => post('state', { state: A.uiState(s) });

  const handlers = {
    ready: () => { post('open', { tab, focus }); },
    'set-token': (m) => ({ errors: A.setToken(s, m) }),
    'reset-token': (m) => { s.edits.delete(m.key); },
    'reset-all': () => { for (const k of s.edits.keys()) s.edits.delete(k); },
    import: (m) => ({ result: A.importInto(s, m.text) }),
    export: () => A.exportsOf(s),
    scan: async () => ({ scan: await A.scan(s) }),
    apply: async (m) => ({ report: await A.apply(s, { all: !!m.all, dryRun: !!m.dryRun }) }),
    'site-status': async () => ({ site: await S.siteStatus() }),
    'site-connect': async (m) => ({ site: await S.siteConnect(m) }),
    'site-pull': async (m) => ({ report: await S.sitePull({ force: !!m.force }), site: await S.siteStatus() }),
    'site-push': async () => ({ push: await S.sitePush(), site: await S.siteStatus() }),
  };

  return new Promise((resolve) => {
    figma.showUI(__html__, Object.assign({ title: 'shadcn Tokens', themeColors: false }, SIZE));
    figma.ui.onmessage = async (m) => {
      if (!m || !m.type) return;
      if (m.type === 'close') { resolve(); figma.closePlugin(); return; }
      const fn = handlers[m.type];
      if (!fn) return;
      try {
        const out = await fn(m);
        post(`${m.type}:done`, out || {});
      } catch (e) {
        post('error', { for: m.type, message: String(e && e.message ? e.message : e) });
      }
      state();
    };
  });
}
