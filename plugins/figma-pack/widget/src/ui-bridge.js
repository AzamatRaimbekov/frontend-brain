// Opens the iframe (dist/ui.html) and routes its messages to the actions. The returned promise
// stays pending while the window is open, which keeps the widget's code running (Widget API rule).
import * as A from './actions.js';
import * as S from './site-actions.js';

const SIZE = { width: 760, height: 720 };

/** store: synced state wrapper from code.jsx; tab: which tab the window opens on; focus: row key. */
export function openUI(store, tab = 'tokens', focus = null) {
  // The render-time snapshot of brand/scan/prefix goes stale while the window is open: keep our own.
  const s = {
    ...store,
    setBrand: (b) => { s.brand = b; store.setBrand(b); },
    setScan: (x) => { s.scan = x; store.setScan(x); },
    setPrefix: (p) => { s.prefix = p; store.setPrefix(p); },
    setPropagation: (p) => { s.propagation = p; store.setPropagation(p); },
  };
  const post = (type, data) => figma.ui.postMessage(Object.assign({ type }, data));
  const state = () => post('state', { state: A.uiState(s, s.brand) });

  const handlers = {
    ready: () => { post('open', { tab, focus }); },
    brand: (m) => { if (m.brand) s.setBrand(m.brand); },
    'set-token': (m) => ({ errors: A.setToken(s, s.brand, m) }),
    'reset-token': (m) => { s.edits.delete(m.key); },
    'reset-all': () => { for (const k of s.edits.keys()) s.edits.delete(k); },
    prefix: (m) => { s.setPrefix(String(m.prefix || '').trim()); },
    'add-extra': (m) => ({ errors: A.addExtra(s, m.token) }),
    'set-extra': (m) => ({ errors: A.setExtra(s, m.token) }),
    'remove-extra': (m) => { s.extras.delete(m.name); },
    'gen-preview': (m) => ({ preview: A.generatePreview(m.hex) }),
    'gen-apply': (m) => ({ count: A.applyGenerated(s, s.brand, m.hex) }),
    contract: async (m) => ({ contract: A.contractView(s, m.name), component: await A.componentInfo(s, m.name) }),
    binding: (m) => ({ errors: A.setBinding(s, m), contract: A.contractView(s, m.contract) }),
    'binding-reset': (m) => { A.resetBindings(s, m.contract); return { contract: A.contractView(s, m.contract) }; },
    import: (m) => ({ result: A.importInto(s, m.text) }),
    export: () => A.exportsOf(s, s.brand),
    scan: async () => ({ scan: await A.scan(s) }),
    apply: async (m) => ({ report: await A.apply(s, { all: !!m.all, dryRun: !!m.dryRun }) }),
    'component-update': async (m) => {
      const result = await A.updateInFile(s, m.name, { build: !!m.build });
      return { result, component: await A.componentInfo(s, m.name) };
    },
    'component-insert': async (m) => ({ inserted: await A.insertComponent(s, m.name) }),
    'site-status': async () => ({ site: await S.siteStatus() }),
    'site-connect': async (m) => ({ site: await S.siteConnect(m) }),
    'site-pull': async (m) => ({ report: await S.sitePull({ force: !!m.force }), site: await S.siteStatus() }),
    'site-push': async () => ({ push: await S.sitePush(), site: await S.siteStatus() }),
  };

  return new Promise((resolve) => {
    figma.showUI(__html__, Object.assign({ title: 'Mbank Tokens', themeColors: false }, SIZE));
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
