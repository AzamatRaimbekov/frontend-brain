// Checks built frames: every solid paint bound to a variable, every text on a style.
export function auditNode(root) {
  const issues = { rawFills: 0, rawStrokes: 0, unstyledText: 0, samples: [] };
  const raw = (paints) => Array.isArray(paints) && paints.some((p) => p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color));
  const walk = (n) => {
    if (n.type === 'INSTANCE') return; // kit components own their styling
    if ('fills' in n && raw(n.fills)) { issues.rawFills++; if (issues.samples.length < 10) issues.samples.push(`fill: ${n.name}`); }
    if ('strokes' in n && raw(n.strokes)) { issues.rawStrokes++; if (issues.samples.length < 10) issues.samples.push(`stroke: ${n.name}`); }
    if (n.type === 'TEXT' && !n.textStyleId) { issues.unstyledText++; if (issues.samples.length < 10) issues.samples.push(`text: ${n.name}`); }
    if ('children' in n) n.children.forEach(walk);
  };
  walk(root);
  return issues;
}

export async function auditFrames(ids) {
  const total = { frames: 0, rawFills: 0, rawStrokes: 0, unstyledText: 0, samples: [] };
  for (const id of ids) {
    const n = await figma.getNodeByIdAsync(id);
    if (!n) continue;
    const r = auditNode(n);
    total.frames++;
    total.rawFills += r.rawFills;
    total.rawStrokes += r.rawStrokes;
    total.unstyledText += r.unstyledText;
    total.samples.push(...r.samples.slice(0, 10 - total.samples.length));
  }
  total.ok = !total.rawFills && !total.rawStrokes && !total.unstyledText;
  return total;
}
