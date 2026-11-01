// Figma prototype from the spec's links (core/links.js). Figma navigates only within one page, so:
// section pages link the default frames of their own screens, and the «Прототип» page holds one
// default frame per screen (desktop, plus mobile when the spec has it) with every link wired.
import { LINK_KEY, text } from './draw.js';

export const PROTO_PAGE = 'Прототип';
export const SCREEN_KEY = 'mbank-screen'; // "<project>|<screenId>|<state>|<viewport>" on every built frame
const PROTO_KEY = 'mbank-proto'; // project name on the «Прототип» page nodes: a rebuild replaces them
const GAP = 160;

export async function pageFor(name) {
  await figma.loadAllPagesAsync();
  return figma.root.children.find((p) => p.name === name) || Object.assign(figma.createPage(), { name });
}

// The state a screen is clicked through in: default, or the first one the spec lists.
export const protoState = (s) => (s.states.includes('default') ? 'default' : s.states[0]);

export const reaction = (destinationId) => ({
  trigger: { type: 'ON_CLICK' },
  actions: [{ type: 'NODE', destinationId, navigation: 'NAVIGATE', transition: { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.2 } }],
});

async function setReactions(node, list) {
  if (typeof node.setReactionsAsync === 'function') await node.setReactionsAsync(list);
  else node.reactions = list;
}

// Nodes to click for a link key. "text:…" matches visible text and climbs to the button around it;
// a reaction cannot sit inside an instance, so the outermost instance wins.
function clickable(frame, key) {
  if (!key.startsWith('text:')) return frame.findAll((n) => n.getPluginData(LINK_KEY) === key);
  const want = key.slice(5);
  return frame.findAll((n) => n.type === 'TEXT' && String(n.characters).trim().replace(/^\+\s*/, '') === want).map((t) => {
    let tagged = null;
    let inst = null;
    for (let n = t.parent; n && n !== frame; n = n.parent) {
      if (!tagged && n.getPluginData(LINK_KEY)) tagged = n;
      if (n.type === 'INSTANCE') inst = n;
    }
    return inst || tagged || t;
  });
}

/** Wires links between frames (Map screenId -> frame, all on one page). Returns { wired, missing }. */
export async function wireFrames(frames, links) {
  const out = { wired: 0, missing: [] };
  for (const [id, frame] of frames) {
    const plan = new Map();
    for (const l of links) {
      if (l.from !== id || !frames.has(l.to)) continue;
      const nodes = clickable(frame, l.on);
      if (!nodes.length && !l.auto) out.missing.push(`${l.from}: ${l.on} → ${l.to}`);
      for (const n of nodes) plan.set(n, frames.get(l.to).id);
    }
    for (const [n, dest] of plan) { await setReactions(n, [reaction(dest)]); out.wired++; }
  }
  return out;
}

// Replaces this project's flows on a page, keeps everyone else's.
function setFlows(page, flows) {
  const names = flows.map((f) => f.name);
  page.flowStartingPoints = [...(page.flowStartingPoints || []).filter((f) => !names.includes(f.name)), ...flows];
}

const flowName = (spec, vp, where) => [spec.project, where, vp === 'desktop' ? null : vp].filter(Boolean).join(' · ');

/** Same-page links on a section page: default frames of this project's screens, per viewport. */
export async function wirePage(page, spec, links) {
  const byVp = {};
  for (const sec of page.children) for (const f of sec.type === 'SECTION' ? sec.children : [sec]) {
    const [project, id, state, vp] = (f.getPluginData(SCREEN_KEY) || '').split('|');
    const s = project === spec.project && spec.screens.find((x) => x.id === id);
    if (!s || state !== protoState(s)) continue;
    (byVp[vp] = byVp[vp] || new Map()).set(id, f);
  }
  const res = { wired: 0, missing: [] };
  const flows = [];
  for (const [vp, frames] of Object.entries(byVp)) {
    const r = await wireFrames(frames, links);
    res.wired += r.wired;
    const start = spec.screens.find((s) => frames.has(s.id));
    flows.push({ nodeId: frames.get(start.id).id, name: flowName(spec, vp, page.name) });
  }
  setFlows(page, flows);
  return res;
}

// Where the click-through starts: login, else the first nav item's screen, else the first screen.
function startOf(spec, screens) {
  const login = screens.find((s) => s.blocks.some((b) => b.type === 'login'));
  return login || screens.find((s) => s.nav && s.nav === spec.nav[0]?.id) || screens[0];
}

/**
 * «Прототип» page: one row of frames per section (page), left to right, with a label above;
 * desktop flow first, then mobile when the spec has both. make(screen, state, vp) builds a frame.
 */
export async function buildPrototype(spec, links, base, make) {
  const page = await pageFor(PROTO_PAGE);
  await figma.setCurrentPageAsync(page);
  page.children.filter((n) => n.getPluginData(PROTO_KEY) === spec.project).forEach((n) => n.remove());
  let y = Math.max(0, ...page.children.map((n) => n.y + n.height + GAP));
  const all = spec.screens.flatMap((s) => s.viewports);
  const vps = ['desktop', 'mobile', 'tablet'].filter((v) => all.includes(v)).slice(0, all.includes('desktop') ? 2 : 1);
  const tag = (n) => { n.setPluginData(PROTO_KEY, spec.project); page.appendChild(n); return n; };
  const label = async (value, size, py) => {
    const t = tag(await text(base, value, { size, weight: 'bold', color: 'muted-foreground' }));
    t.x = 0;
    t.y = py;
    return t.height;
  };
  const res = { page: page.name, frames: [], wired: 0, missing: [] };
  const flows = [];
  for (const vp of vps) {
    const screens = spec.screens.filter((s) => s.viewports.includes(vp));
    y += (await label(flowName(spec, vp, vp === 'desktop' ? 'десктоп' : null), '3xl', y)) + 48;
    const frames = new Map();
    for (const section of [...new Set(screens.map((s) => s.page))]) {
      y += (await label(section, 'xl', y)) + 24;
      let x = 0;
      let rowH = 0;
      for (const s of screens.filter((x2) => x2.page === section)) {
        const f = tag(await make(s, protoState(s), vp));
        f.name = s.title;
        f.x = x;
        f.y = y;
        f.setPluginData(SCREEN_KEY, [spec.project, s.id, protoState(s), vp].join('|'));
        x += f.width + GAP / 2;
        rowH = Math.max(rowH, f.height);
        frames.set(s.id, f);
        res.frames.push({ id: f.id, screen: s.id, viewport: vp });
      }
      y += rowH + GAP;
    }
    const r = await wireFrames(frames, links);
    res.wired += r.wired;
    res.missing.push(...r.missing);
    flows.push({ nodeId: frames.get(startOf(spec, screens).id).id, name: flowName(spec, vp) });
    y += GAP;
  }
  setFlows(page, flows);
  return res;
}
