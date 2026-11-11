(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // core/oklch.js
  var NUM = "[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:e[+-]?\\d+)?";
  var OKLCH = new RegExp(`^oklch\\(\\s*(${NUM})(%?)\\s+(${NUM})(%?)\\s+(${NUM}|none)(?:deg)?\\s*(?:\\/\\s*(${NUM})(%?)\\s*)?\\)$`, "i");
  var HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
  var clamp01 = (x) => x > 1 - 1e-7 ? 1 : x < 1e-7 ? 0 : x;
  var toLinear = (x) => Math.abs(x) <= 0.04045 ? x / 12.92 : Math.sign(x) * ((Math.abs(x) + 0.055) / 1.055) ** 2.4;
  var toGamma = (x) => Math.abs(x) <= 31308e-7 ? 12.92 * x : Math.sign(x) * (1.055 * Math.abs(x) ** (1 / 2.4) - 0.055);
  function parseOklch(text) {
    const m = OKLCH.exec(String(text == null ? "" : text).trim());
    if (!m) return null;
    const l = Number(m[1]) / (m[2] ? 100 : 1);
    const c = Number(m[3]) * (m[4] ? 0.4 / 100 : 1);
    const h = m[5].toLowerCase() === "none" ? 0 : Number(m[5]);
    const alpha = m[6] === void 0 ? 1 : Number(m[6]) / (m[7] ? 100 : 1);
    if (![l, c, h, alpha].every(Number.isFinite)) return null;
    return { l, c: Math.max(0, c), h, alpha: clamp01(alpha) };
  }
  function oklchToSrgb({ l, c, h }) {
    const rad = h * Math.PI / 180;
    const a = c * Math.cos(rad);
    const b = c * Math.sin(rad);
    const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return {
      r: toGamma(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
      g: toGamma(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
      b: toGamma(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_)
    };
  }
  function srgbToOklch({ r, g, b }) {
    const [R, G, B] = [r, g, b].map(toLinear);
    const l_ = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
    const m_ = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
    const s_ = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
    const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
    const Bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
    const c = Math.sqrt(A * A + Bb * Bb);
    let h = Math.atan2(Bb, A) * 180 / Math.PI;
    if (h < 0) h += 360;
    return { l: L, c, h };
  }
  function parseColor(text) {
    const s = String(text == null ? "" : text).trim();
    const ok = parseOklch(s);
    if (ok) {
      const { r, g, b } = oklchToSrgb(ok);
      return { r: clamp01(r), g: clamp01(g), b: clamp01(b), a: ok.alpha };
    }
    const m = HEX.exec(s);
    if (!m) return null;
    let h = m[1].toLowerCase();
    if (h.length <= 4) h = [...h].map((ch) => ch + ch).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
  }
  var byte = (x) => Math.round(clamp01(x) * 255).toString(16).padStart(2, "0");
  function rgbaToHex(c) {
    if (!c) return null;
    const a = c.a === void 0 ? 1 : c.a;
    return `#${byte(c.r)}${byte(c.g)}${byte(c.b)}${a >= 1 ? "" : byte(a)}`;
  }
  function colorKey(value) {
    if (value && typeof value === "object" && "r" in value) return rgbaToHex(value);
    const c = parseColor(value);
    return c ? rgbaToHex(c) : null;
  }
  var num = (x, digits) => String(Number(x.toFixed(digits)));
  function rgbaToOklch(c) {
    const { l, c: chroma, h } = srgbToOklch(c);
    const a = c.a === void 0 ? 1 : c.a;
    const alpha = a >= 1 ? "" : ` / ${num(a * 100, 1)}%`;
    const want = rgbaToHex(c);
    let out = "";
    for (const d of [3, 4, 5, 6]) {
      const grey = Number(chroma.toFixed(d)) === 0;
      out = `oklch(${num(l, d)} ${grey ? "0" : num(chroma, d)} ${grey ? "0" : num(h, 3)}${alpha})`;
      if (colorKey(out) === want) break;
    }
    return out;
  }
  var luminance = ({ r, g, b }) => {
    const [R, G, B] = [r, g, b].map((x) => toLinear(clamp01(x)));
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  function composite(fg, bg) {
    const a = fg.a === void 0 ? 1 : fg.a;
    return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
  }
  function contrastRatio(a, b) {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  }

  // src/theme.js
  var ROLES = {
    page: "background",
    card: "card",
    soft: "muted",
    text: "foreground",
    muted: "muted-foreground",
    border: "border",
    primary: "primary",
    onPrimary: "primary-foreground",
    accentSoft: "accent",
    accentText: "accent-foreground",
    successBg: "secondary",
    successFg: "secondary-foreground",
    warningBg: "accent",
    warningFg: "destructive",
    errorBg: "destructive",
    errorFg: "primary-foreground",
    neutralBg: "muted",
    neutralFg: "muted-foreground",
    infoBg: "secondary",
    infoFg: "foreground"
  };
  var paint = (value) => parseColor(value) || { r: 0, g: 0, b: 0, a: 0 };
  function chromeColors(tokens) {
    const out = {};
    for (const [role, name] of Object.entries(ROLES)) out[role] = tokens.colors[name] && tokens.colors[name].light || null;
    return out;
  }
  function chrome(tokens) {
    const out = {};
    for (const [role, value] of Object.entries(chromeColors(tokens))) out[role] = paint(value);
    return out;
  }
  var TONES = {
    success: ["successBg", "successFg"],
    warning: ["warningBg", "warningFg"],
    error: ["errorBg", "errorFg"],
    neutral: ["neutralBg", "neutralFg"],
    info: ["infoBg", "infoFg"],
    brand: ["accentSoft", "accentText"]
  };

  // core/model.js
  var SCHEMA = "shadcn/tokens@1";
  var COLLECTION = "shadcn";
  var MODES = ["light", "dark"];
  var FIGMA_MODES = { light: "Light", dark: "Dark" };
  var RADIUS = "radius";
  var GROUPS = [
    { id: "base", label: "\u0424\u043E\u043D \u0438 \u0442\u0435\u043A\u0441\u0442" },
    { id: "action", label: "\u0410\u043A\u0446\u0435\u043D\u0442\u044B" },
    { id: "border", label: "\u0413\u0440\u0430\u043D\u0438\u0446\u044B" },
    { id: "chart", label: "\u0413\u0440\u0430\u0444\u0438\u043A\u0438" },
    { id: "sidebar", label: "\u0421\u0430\u0439\u0434\u0431\u0430\u0440" },
    { id: "radius", label: "\u0420\u0430\u0434\u0438\u0443\u0441" }
  ];
  function groupOf(name) {
    if (name === RADIUS) return "radius";
    if (/^chart-/.test(name)) return "chart";
    if (/^sidebar/.test(name)) return "sidebar";
    if (/^(border|input|ring)$/.test(name)) return "border";
    if (/^(primary|secondary|muted|accent|destructive)/.test(name)) return "action";
    return "base";
  }
  var modeName = (name) => String(name).trim().toLowerCase();
  var LENGTH = /^(\d+(?:\.\d+)?|\.\d+)(px|rem)?$/;
  function toPx(value) {
    if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
    const m = LENGTH.exec(String(value == null ? "" : value).trim());
    if (!m) return null;
    return Number(m[1]) * (m[2] === "rem" ? 16 : 1);
  }
  function normValue(kind, value) {
    if (value == null || String(value).trim() === "") return void 0;
    const s = String(value).trim();
    if (kind === "color") return parseColor(s) ? s.startsWith("#") ? s.toLowerCase() : s.replace(/\s+/g, " ") : NaN;
    if (typeof value === "number") return toPx(value) === null ? NaN : `${value}px`;
    return toPx(s) === null ? NaN : LENGTH.exec(s)[2] ? s : `${s}px`;
  }
  function sameValue(a, b, kind = "color") {
    if (a == null || b == null) return a == b;
    if (kind === "color") return colorKey(a) !== null && colorKey(a) === colorKey(b);
    return toPx(a) !== null && toPx(a) === toPx(b);
  }
  function checkTokens(data) {
    if (!data || typeof data !== "object") return ["\u041D\u0443\u0436\u0435\u043D JSON-\u043E\u0431\u044A\u0435\u043A\u0442 shadcn/tokens@1"];
    const errors = [];
    if (data.$schema !== SCHEMA) errors.push(`$schema: \u043D\u0443\u0436\u0435\u043D \xAB${SCHEMA}\xBB`);
    if (!data.colors || typeof data.colors !== "object") errors.push("colors: \u043D\u0443\u0436\u0435\u043D \u043E\u0431\u044A\u0435\u043A\u0442 { \u0438\u043C\u044F: { light, dark } }");
    if (data.radius !== void 0 && toPx(data.radius) === null) errors.push("radius: \u043D\u0443\u0436\u043D\u0430 \u0434\u043B\u0438\u043D\u0430 \u0432 rem \u0438\u043B\u0438 px");
    return errors;
  }
  function sourceRows(tokens) {
    const rows = Object.entries(tokens.colors).map(([name, v]) => ({
      key: name,
      name,
      kind: "color",
      group: groupOf(name),
      source: { light: v.light, dark: v.dark }
    }));
    rows.push({ key: RADIUS, name: RADIUS, kind: "radius", group: "radius", source: { light: tokens.radius, dark: tokens.radius } });
    return rows;
  }
  function buildModel(tokens, { edits = {} } = {}) {
    const rows = sourceRows(tokens).map((r) => {
      const e = edits[r.key] || {};
      const light = e.light !== void 0 ? e.light : r.source.light;
      const dark = r.kind === "radius" ? light : e.dark !== void 0 ? e.dark : r.source.dark;
      const edited = !sameValue(light, r.source.light, r.kind) || !sameValue(dark, r.source.dark, r.kind);
      return __spreadProps(__spreadValues({}, r), { light, dark, edited });
    });
    return { rows };
  }
  var rowsByName = (rows) => new Map(rows.map((r) => [r.name, r]));
  function counters(model, issues = []) {
    return {
      tokens: model.rows.length,
      edited: model.rows.filter((r) => r.edited).length,
      contrast: issues.filter((i) => !i.ok).length
    };
  }

  // core/sync.js
  var STATUS = {
    bound: { label: "\u2713 \u0432 \u0444\u0430\u0439\u043B\u0435", tone: "success" },
    differs: { label: "\u2260 \u0444\u0430\u0439\u043B", tone: "warning" },
    missing: { label: "\u043D\u0435\u0442 \u0432 \u0444\u0430\u0439\u043B\u0435", tone: "error" },
    library: { label: "\u0432 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0435", tone: "info" },
    unknown: { label: "\u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E", tone: "neutral" }
  };
  var FILLS = ["FRAME_FILL", "SHAPE_FILL"];
  var STROKES = ["STROKE_COLOR"];
  function scopesOf(name, kind = "color") {
    if (kind === "radius") return ["CORNER_RADIUS"];
    if (/-foreground$/.test(name)) return ["TEXT_FILL"];
    if (/^(sidebar-)?(border|ring)$/.test(name)) return [...STROKES];
    if (name === "input") return [...STROKES, ...FILLS];
    if (name === "destructive") return [...FILLS, "TEXT_FILL", ...STROKES];
    if (/^chart-/.test(name)) return [...FILLS, ...STROKES];
    return [...FILLS];
  }
  var codeSyntaxOf = (name) => `var(--${name})`;
  function figmaValue(kind, value) {
    return kind === "color" ? parseColor(value) : toPx(value);
  }
  function plainValue(v) {
    if (v && typeof v === "object" && "r" in v) return colorKey(v);
    return v;
  }
  function statusOf(row, snapshot) {
    if (!snapshot || !snapshot.vars) return "unknown";
    const v = snapshot.vars[row.name];
    if (!v) return snapshot.library && snapshot.library[row.name] ? "library" : "missing";
    const same = (mode) => row.kind === "color" ? colorKey(row[mode]) === v[mode] : toPx(row[mode]) === Number(v[mode]);
    return MODES.every(same) ? "bound" : "differs";
  }
  function fileStatus(rows, snapshot) {
    const byKey = {};
    const totals = { bound: 0, differs: 0, missing: 0, library: 0, unknown: 0 };
    for (const r of rows) {
      const s = statusOf(r, snapshot);
      byKey[r.key] = s;
      totals[s]++;
    }
    return { byKey, totals };
  }
  function planWrites(model, opts = {}) {
    const writes = [];
    const skipped = [];
    for (const r of model.rows) {
      const status = statusOf(r, opts.snapshot);
      if (!opts.all && !r.edited && (status === "bound" || status === "unknown")) continue;
      const light = figmaValue(r.kind, r.light);
      const dark = figmaValue(r.kind, r.dark);
      if (light == null || dark == null) {
        skipped.push({ name: r.name, reason: "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043D\u0435 \u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F" });
        continue;
      }
      writes.push({ name: r.name, type: r.kind === "color" ? "COLOR" : "FLOAT", values: { light, dark }, scopes: scopesOf(r.name, r.kind), codeSyntax: codeSyntaxOf(r.name) });
    }
    return { writes, skipped };
  }

  // src/board.jsx
  var { AutoLayout, Text, Rectangle } = figma.widget;
  var W = 960;
  var COL = { swatch: 220, css: 230, figma: 230, status: 190 };
  function Chip({ c, tone, label, onClick, tooltip }) {
    const [bg, fg] = TONES[tone] || TONES.neutral;
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { fill: c[bg], cornerRadius: 10, padding: { vertical: 3, horizontal: 8 }, onClick, tooltip }, /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c[fg] }, label));
  }
  function Counter({ c, label, value, tone }) {
    const [bg, fg] = TONES[tone] || TONES.neutral;
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 2, padding: { vertical: 8, horizontal: 12 }, fill: c[bg], cornerRadius: 10, width: "fill-parent" }, /* @__PURE__ */ figma.widget.h(Text, { fontSize: 20, fontWeight: 700, fill: c[fg] }, String(value)), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: c[fg] }, label));
  }
  function Swatch({ c, row, mode }) {
    const value = row[mode];
    if (row.kind !== "color") {
      const px = toPx(value);
      return /* @__PURE__ */ figma.widget.h(AutoLayout, { spacing: 6, verticalAlignItems: "center", width: COL.swatch / 2 }, /* @__PURE__ */ figma.widget.h(Rectangle, { width: 24, height: 24, cornerRadius: Math.max(0, Math.min(12, px || 0)), fill: c.soft, stroke: c.border }), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: c.muted }, value == null ? "\u2014" : String(value)));
    }
    const short = String(value == null ? "\u2014" : value).replace(/^oklch\((.*)\)$/, "$1");
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { spacing: 6, verticalAlignItems: "center", width: COL.swatch / 2, tooltip: String(value) }, /* @__PURE__ */ figma.widget.h(Rectangle, { width: 24, height: 24, cornerRadius: 6, fill: paint(value), stroke: c.border }), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 9, fill: c.muted, width: COL.swatch / 2 - 30 }, short));
  }
  function Row({ c, row, status, issue, onOpen }) {
    const st = STATUS[status] || STATUS.unknown;
    return /* @__PURE__ */ figma.widget.h(
      AutoLayout,
      {
        width: "fill-parent",
        spacing: 12,
        padding: { vertical: 6, horizontal: 12 },
        verticalAlignItems: "center",
        hoverStyle: { fill: c.soft },
        onClick: () => onOpen(row.key),
        tooltip: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440 \u0442\u043E\u043A\u0435\u043D\u0430"
      },
      /* @__PURE__ */ figma.widget.h(Swatch, { c, row, mode: "light" }),
      /* @__PURE__ */ figma.widget.h(Swatch, { c, row, mode: "dark" }),
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fontWeight: 600, fill: c.text, width: COL.css }, `--${row.name}`),
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: c.muted, width: COL.figma }, `shadcn / ${row.name}`),
      /* @__PURE__ */ figma.widget.h(AutoLayout, { spacing: 4, width: COL.status }, /* @__PURE__ */ figma.widget.h(Chip, { c, tone: st.tone, label: st.label }), row.edited ? /* @__PURE__ */ figma.widget.h(Chip, { c, tone: "brand", label: "\u0438\u0437\u043C\u0435\u043D\u0451\u043D", tooltip: "\u041E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F \u043E\u0442 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F shadcn \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E" }) : null, issue ? /* @__PURE__ */ figma.widget.h(Chip, { c, tone: "error", label: "AA", tooltip: issue }) : null)
    );
  }
  function Header({ c, source }) {
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 2, width: "fill-parent" }, /* @__PURE__ */ figma.widget.h(Text, { fontSize: 22, fontWeight: 700, fill: c.text }, "shadcn Tokens"), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: c.muted }, source));
  }
  function Tabs({ c, groups, group, counts, onGroup }) {
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { width: "fill-parent", spacing: 6, wrap: true }, groups.map((g) => /* @__PURE__ */ figma.widget.h(
      AutoLayout,
      {
        key: g.id,
        padding: { vertical: 5, horizontal: 10 },
        cornerRadius: 8,
        stroke: c.border,
        fill: g.id === group ? c.accentSoft : c.card,
        onClick: () => onGroup(g.id)
      },
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fill: g.id === group ? c.accentText : c.text }, `${g.label} \xB7 ${counts[g.id] || 0}`)
    )));
  }
  function Board(p) {
    const { c } = p;
    const counts = {};
    for (const r of p.rows) counts[r.group] = (counts[r.group] || 0) + 1;
    const visible = p.rows.filter((r) => r.group === p.group);
    const issueOf = {};
    for (const i of p.issues) if (!i.ok) issueOf[i.fg] = `${issueOf[i.fg] ? `${issueOf[i.fg]}; ` : ""}${i.mode}: ${i.ratio} \u043D\u0430 --${i.bg} (\u043D\u0443\u0436\u043D\u043E ${i.min})`;
    const t = p.totals;
    const fileLine = p.scan ? `\u0424\u0430\u0439\u043B \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D ${p.scan.scannedAt.slice(0, 16).replace("T", " ")}${p.scan.exists ? "" : " (\u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0438 shadcn \u043D\u0435\u0442)"}: \u2713 ${t.bound} \xB7 \u2260 ${t.differs} \xB7 \u043D\u0435\u0442 ${t.missing}${t.library ? ` \xB7 \u0432 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0435 ${t.library}` : ""}` : "\u0424\u0430\u0439\u043B \u0435\u0449\u0451 \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u043B\u0438: \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u0430 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u2192 \xAB\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0444\u0430\u0439\u043B\xBB";
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", width: W, padding: 24, spacing: 16, fill: p.c.page, cornerRadius: 20, stroke: c.border }, /* @__PURE__ */ figma.widget.h(Header, { c, source: p.source }), /* @__PURE__ */ figma.widget.h(AutoLayout, { width: "fill-parent", spacing: 8 }, /* @__PURE__ */ figma.widget.h(Counter, { c, label: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432", value: p.counters.tokens, tone: "neutral" }), /* @__PURE__ */ figma.widget.h(Counter, { c, label: "\u0438\u0437\u043C\u0435\u043D\u0435\u043D\u043E", value: p.counters.edited, tone: "brand" }), /* @__PURE__ */ figma.widget.h(Counter, { c, label: "\u043F\u0440\u043E\u0431\u043B\u0435\u043C \u043A\u043E\u043D\u0442\u0440\u0430\u0441\u0442\u0430 AA", value: p.counters.contrast, tone: p.counters.contrast ? "error" : "success" })), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fill: c.muted, width: "fill-parent" }, fileLine), p.report ? /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fill: c.text, width: "fill-parent" }, p.report) : null, /* @__PURE__ */ figma.widget.h(Tabs, { c, groups: p.groups, group: p.group, counts, onGroup: p.handlers.group }), /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", width: "fill-parent", fill: c.card, cornerRadius: 12, stroke: c.border, padding: { vertical: 6 } }, /* @__PURE__ */ figma.widget.h(AutoLayout, { width: "fill-parent", spacing: 12, padding: { vertical: 6, horizontal: 12 } }, /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c.muted, width: COL.swatch / 2 }, "light"), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c.muted, width: COL.swatch / 2 }, "dark"), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c.muted, width: COL.css }, "CSS-\u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F"), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c.muted, width: COL.figma }, "\u041F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F Figma"), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c.muted, width: COL.status }, "\u0421\u0442\u0430\u0442\u0443\u0441")), visible.length ? visible.map((r) => /* @__PURE__ */ figma.widget.h(Row, { key: r.key, c, row: r, status: p.status[r.key], issue: issueOf[r.name], onOpen: p.handlers.open })) : /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fill: c.muted, width: "fill-parent", horizontalAlignText: "center" }, "\u041F\u0443\u0441\u0442\u043E.")), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: c.muted, width: "fill-parent" }, "\u0421\u0432\u043E\u0439\u0441\u0442\u0432\u0430 \u0432\u0438\u0434\u0436\u0435\u0442\u0430: \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \xB7 \u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0444\u0430\u0439\u043B \xB7 \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0432 Figma \xB7 \u0412\u044B\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u043B\u044F \u043A\u043E\u0434\u0430 \xB7 \u0421\u0430\u0439\u0442. \u041A\u043B\u0438\u043A \u043F\u043E \u0441\u0442\u0440\u043E\u043A\u0435 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u0442\u043E\u043A\u0435\u043D. \u041D\u0430\u0431\u043E\u0440 \u0438\u043C\u0451\u043D shadcn \u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D: \u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F."));
  }

  // ../skills/ds-tokens/references/shadcn-tokens.json
  var shadcn_tokens_default = {
    $schema: "shadcn/tokens@1",
    $comment: "\u0415\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043D\u0430\u0431\u043E\u0440 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0434\u0438\u0437\u0430\u0439\u043D-\u0441\u0438\u0441\u0442\u0435\u043C\u044B: \u0447\u0438\u0441\u0442\u044B\u0439 shadcn/ui (Tailwind v4, oklch). \u0417\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0441\u043D\u044F\u0442\u044B \u0441 shadcn init (style radix-nova, baseColor neutral) 2026-11-11. \u0412\u043B\u0430\u0434\u0435\u043B\u0435\u0446: figma-pack skills/ds-tokens/references/shadcn-tokens.json; \u043A\u043E\u043F\u0438\u044E \u0443 frontend-pack \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442 design-engine sync-contracts. \u0421\u0432\u043E\u0438 \u0442\u043E\u043A\u0435\u043D\u044B \u043F\u0440\u043E\u0435\u043A\u0442\u0430 \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u044E\u0442\u0441\u044F: \u043F\u0440\u043E\u0435\u043A\u0442 \u043C\u0435\u043D\u044F\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u044D\u0442\u0438\u0445 \u0438\u043C\u0451\u043D (\u043F\u0440\u0435\u0441\u0435\u0442 \u043D\u0430 \u0441\u0430\u0439\u0442\u0435 ds-configurator).",
    radius: "0.625rem",
    radiusScale: {
      sm: "calc(var(--radius) * 0.6)",
      md: "calc(var(--radius) * 0.8)",
      lg: "var(--radius)",
      xl: "calc(var(--radius) * 1.4)",
      "2xl": "calc(var(--radius) * 1.8)",
      "3xl": "calc(var(--radius) * 2.2)",
      "4xl": "calc(var(--radius) * 2.6)"
    },
    font: {
      sans: "'Geist Variable', sans-serif",
      heading: "var(--font-sans)"
    },
    colors: {
      background: {
        light: "oklch(1 0 0)",
        dark: "oklch(0.145 0 0)"
      },
      foreground: {
        light: "oklch(0.145 0 0)",
        dark: "oklch(0.985 0 0)"
      },
      card: {
        light: "oklch(1 0 0)",
        dark: "oklch(0.205 0 0)"
      },
      "card-foreground": {
        light: "oklch(0.145 0 0)",
        dark: "oklch(0.985 0 0)"
      },
      popover: {
        light: "oklch(1 0 0)",
        dark: "oklch(0.205 0 0)"
      },
      "popover-foreground": {
        light: "oklch(0.145 0 0)",
        dark: "oklch(0.985 0 0)"
      },
      primary: {
        light: "oklch(0.205 0 0)",
        dark: "oklch(0.922 0 0)"
      },
      "primary-foreground": {
        light: "oklch(0.985 0 0)",
        dark: "oklch(0.205 0 0)"
      },
      secondary: {
        light: "oklch(0.97 0 0)",
        dark: "oklch(0.269 0 0)"
      },
      "secondary-foreground": {
        light: "oklch(0.205 0 0)",
        dark: "oklch(0.985 0 0)"
      },
      muted: {
        light: "oklch(0.97 0 0)",
        dark: "oklch(0.269 0 0)"
      },
      "muted-foreground": {
        light: "oklch(0.556 0 0)",
        dark: "oklch(0.708 0 0)"
      },
      accent: {
        light: "oklch(0.97 0 0)",
        dark: "oklch(0.269 0 0)"
      },
      "accent-foreground": {
        light: "oklch(0.205 0 0)",
        dark: "oklch(0.985 0 0)"
      },
      destructive: {
        light: "oklch(0.577 0.245 27.325)",
        dark: "oklch(0.704 0.191 22.216)"
      },
      border: {
        light: "oklch(0.922 0 0)",
        dark: "oklch(1 0 0 / 10%)"
      },
      input: {
        light: "oklch(0.922 0 0)",
        dark: "oklch(1 0 0 / 15%)"
      },
      ring: {
        light: "oklch(0.708 0 0)",
        dark: "oklch(0.556 0 0)"
      },
      "chart-1": {
        light: "oklch(0.87 0 0)",
        dark: "oklch(0.87 0 0)"
      },
      "chart-2": {
        light: "oklch(0.556 0 0)",
        dark: "oklch(0.556 0 0)"
      },
      "chart-3": {
        light: "oklch(0.439 0 0)",
        dark: "oklch(0.439 0 0)"
      },
      "chart-4": {
        light: "oklch(0.371 0 0)",
        dark: "oklch(0.371 0 0)"
      },
      "chart-5": {
        light: "oklch(0.269 0 0)",
        dark: "oklch(0.269 0 0)"
      },
      sidebar: {
        light: "oklch(0.985 0 0)",
        dark: "oklch(0.205 0 0)"
      },
      "sidebar-foreground": {
        light: "oklch(0.145 0 0)",
        dark: "oklch(0.985 0 0)"
      },
      "sidebar-primary": {
        light: "oklch(0.205 0 0)",
        dark: "oklch(0.488 0.243 264.376)"
      },
      "sidebar-primary-foreground": {
        light: "oklch(0.985 0 0)",
        dark: "oklch(0.985 0 0)"
      },
      "sidebar-accent": {
        light: "oklch(0.97 0 0)",
        dark: "oklch(0.269 0 0)"
      },
      "sidebar-accent-foreground": {
        light: "oklch(0.205 0 0)",
        dark: "oklch(0.985 0 0)"
      },
      "sidebar-border": {
        light: "oklch(0.922 0 0)",
        dark: "oklch(1 0 0 / 10%)"
      },
      "sidebar-ring": {
        light: "oklch(0.708 0 0)",
        dark: "oklch(0.556 0 0)"
      }
    }
  };

  // core/checks.js
  var MIN_TEXT = 4.5;
  var MIN_SECONDARY = 3;
  function pairsFor(name, byName) {
    if (name === "foreground") return [["background", MIN_TEXT]];
    if (name === "muted-foreground") return [["background", MIN_TEXT], ["muted", MIN_SECONDARY]];
    const m = /^(.+)-foreground$/.exec(name);
    return m && byName.has(m[1]) ? [[m[1], MIN_TEXT]] : [];
  }
  function contrastIssues(rows) {
    const byName = rowsByName(rows);
    const out = [];
    for (const r of rows) {
      if (r.kind !== "color") continue;
      for (const [bgName, min] of pairsFor(r.name, byName)) {
        for (const mode of MODES) {
          const page = parseColor(byName.get("background") && byName.get("background")[mode]) || { r: 1, g: 1, b: 1, a: 1 };
          const bgRaw = parseColor(byName.get(bgName)[mode]);
          const fgRaw = parseColor(r[mode]);
          let ratio = null;
          if (bgRaw && fgRaw) {
            const bg = composite(bgRaw, page);
            ratio = Math.round(contrastRatio(composite(fgRaw, bg), bg) * 100) / 100;
          }
          out.push({ fg: r.name, bg: bgName, mode, ratio, min, ok: ratio !== null && ratio >= min });
        }
      }
    }
    return out;
  }

  // core/exports.js
  var clone = (x) => JSON.parse(JSON.stringify(x));
  function exportTokensJson(tokens, { edits = {} } = {}) {
    const out = clone(tokens);
    for (const r of buildModel(tokens, { edits }).rows) {
      if (!r.edited) continue;
      if (r.name === RADIUS) out.radius = r.light;
      else out.colors[r.name] = { light: r.light, dark: r.dark };
    }
    return out;
  }
  function cssVarsOf(tokens, model) {
    const radius = model.rows.find((r) => r.name === RADIUS);
    const light = radius ? { radius: radius.light } : {};
    const dark = {};
    for (const r of model.rows) {
      if (r.name === RADIUS) continue;
      light[r.name] = r.light;
      dark[r.name] = r.dark;
    }
    const theme = {};
    for (const [k, v] of Object.entries(tokens.font || {})) theme[`font-${k}`] = v;
    for (const [k, v] of Object.entries(tokens.radiusScale || {})) theme[`radius-${k}`] = v;
    return { theme, light, dark };
  }
  var REGISTRY_ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
  function registryTheme(tokens, model, { name = "project-theme" } = {}) {
    return {
      $schema: REGISTRY_ITEM_SCHEMA,
      name,
      type: "registry:theme",
      title: "shadcn theme",
      description: "shadcn/ui tokens (Tailwind v4, oklch) from the shadcn Tokens Figma widget",
      cssVars: cssVarsOf(tokens, model),
      meta: { generator: "figma-pack/widget (shadcn Tokens)", figma: { collection: "shadcn", modes: ["Light", "Dark"] } }
    };
  }
  var block = (selector, vars) => `${selector} {
${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join("\n")}
}`;
  function tokensCss(tokens, model) {
    const vars = cssVarsOf(tokens, model);
    const inline = __spreadValues({}, vars.theme);
    for (const r of model.rows) if (r.kind === "color") inline[`color-${r.name}`] = `var(--${r.name})`;
    return [
      "/*",
      " * shadcn/ui design tokens for Tailwind CSS v4 (oklch).",
      " * GENERATED by the Figma widget shadcn Tokens (figma-pack/widget). Do not edit by hand:",
      " * change the values in the widget or on the design-system site and export again.",
      " */",
      "",
      "@custom-variant dark (&:is(.dark *));",
      "",
      block("@theme inline", inline),
      "",
      block(":root", vars.light),
      "",
      block(".dark", vars.dark),
      "",
      "@layer base {",
      "  * { @apply border-border outline-ring/50; }",
      "  body { @apply bg-background text-foreground; }",
      "}",
      ""
    ].join("\n");
  }
  var OWNER_TOKENS = "plugins/figma-pack/skills/ds-tokens/references/shadcn-tokens.json";
  function syncCommands() {
    return [
      {
        title: "\u041F\u0440\u043E\u0435\u043A\u0442: \u0442\u0435\u043C\u0430 \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u2014 \u0431\u043B\u043E\u043A tokens.css \u0437\u0430\u043C\u0435\u043D\u044F\u0435\u0442 \u0442\u0435\u043C\u0443 shadcn \u0432 globals.css (src/app/globals.css \u0438\u043B\u0438 src/index.css)",
        cmd: 'cp ~/Downloads/tokens.css src/styles/tokens.css   # \u0438 @import "./styles/tokens.css"; \u0432 globals.css \u0432\u043C\u0435\u0441\u0442\u043E \u0441\u0442\u0430\u0440\u044B\u0445 :root / .dark'
      },
      {
        title: "\u0418\u043B\u0438 \u0447\u0435\u0440\u0435\u0437 shadcn CLI: registry-\u044D\u043B\u0435\u043C\u0435\u043D\u0442 \u0442\u0435\u043C\u044B",
        cmd: "npx shadcn@latest add ./shadcn-theme.json"
      },
      {
        title: "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0432\u0441\u0435\u0439 \u0434\u0438\u0437\u0430\u0439\u043D-\u0441\u0438\u0441\u0442\u0435\u043C\u044B (\u0442\u043E\u043B\u044C\u043A\u043E \u0441 \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u044F \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0430): shadcn-tokens.json \u2192 \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u0439 frontend-brain",
        cmd: `cp ~/Downloads/shadcn-tokens.json ${OWNER_TOKENS}
node plugins/design-engine/scripts/sync-contracts.mjs
npm test`
      }
    ];
  }

  // core/io.js
  function importTokens(source, text) {
    let data;
    try {
      data = typeof text === "string" ? JSON.parse(text) : text;
    } catch (e) {
      return { errors: [`\u041D\u0435 JSON: ${e.message}`] };
    }
    const errors = checkTokens(data);
    if (errors.length) return { errors };
    const edits = {};
    const bad = [];
    for (const r of buildModel(source).rows) {
      const raw = r.name === RADIUS ? data.radius === void 0 ? void 0 : { light: data.radius } : data.colors[r.name];
      if (!raw) continue;
      const light = normValue(r.kind, raw.light);
      const dark = r.kind === "radius" ? light : normValue(r.kind, raw.dark === void 0 ? raw.light : raw.dark);
      if (Number.isNaN(light) || Number.isNaN(dark) || light === void 0) {
        bad.push(`${r.name}: \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043D\u0435 \u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F`);
        continue;
      }
      if (sameValue(light, r.source.light, r.kind) && sameValue(dark, r.source.dark, r.kind)) continue;
      edits[r.key] = r.kind === "radius" ? { light } : { light, dark };
    }
    const known = new Set(Object.keys(source.colors));
    const ignored = Object.keys(data.colors).filter((n) => !known.has(n));
    return { edits, changed: Object.keys(edits).length, ignored, errors: bad };
  }

  // src/figma-io.js
  var isAlias = (x) => x && typeof x === "object" && x.type === "VARIABLE_ALIAS";
  async function loadShadcn() {
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const col = cols.find((c) => c.name.trim() === COLLECTION) || null;
    const named = /* @__PURE__ */ new Map();
    if (col) {
      for (const v of await figma.variables.getLocalVariablesAsync()) if (v.variableCollectionId === col.id) named.set(v.name, v);
    }
    return { col, named };
  }
  function modeIdOf(col, mode) {
    const hit = col.modes.find((m) => modeName(m.name) === mode);
    if (hit) return hit.modeId;
    return mode === "light" ? col.modes[0].modeId : null;
  }
  async function resolve(value, mode, depth = 0) {
    if (!isAlias(value)) return value;
    if (depth > 10) return null;
    const target = await figma.variables.getVariableByIdAsync(value.id);
    if (!target) return null;
    const c = await figma.variables.getVariableCollectionByIdAsync(target.variableCollectionId);
    const m = c && (c.modes.find((x) => modeName(x.name) === mode) || c.modes.find((x) => x.modeId === c.defaultModeId)) || null;
    return m ? resolve(target.valuesByMode[m.modeId], mode, depth + 1) : null;
  }
  async function scanFile() {
    const ix = await loadShadcn();
    const vars = {};
    if (ix.col) {
      for (const [name, v] of ix.named) {
        const entry = {};
        for (const mode of MODES) {
          const id = modeIdOf(ix.col, mode) || modeIdOf(ix.col, "light");
          entry[mode] = plainValue(await resolve(v.valuesByMode[id], mode));
        }
        vars[name] = entry;
      }
    }
    const library = {};
    if (!ix.col && figma.teamLibrary) {
      try {
        const libs = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
        for (const lib of libs.filter((l) => String(l.name).trim() === COLLECTION)) {
          for (const ref of await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lib.key)) library[ref.name] = true;
        }
      } catch (e) {
      }
    }
    return { scannedAt: (/* @__PURE__ */ new Date()).toISOString(), exists: !!ix.col, count: Object.keys(vars).length, libraryCount: Object.keys(library).length, vars, library };
  }
  function modeFailed(report, e) {
    if (report.modeLimited) return;
    report.modeLimited = true;
    const limit = /Limited to (\d+) modes?/i.exec(e && e.message || "");
    report.errors.push(limit ? `${COLLECTION}: \u0442\u0430\u0440\u0438\u0444 \u0444\u0430\u0439\u043B\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0430\u0435\u0442 ${limit[1]} \u0440\u0435\u0436\u0438\u043C(\u0430) \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 \u2014 \u0437\u0430\u043F\u0438\u0441\u0430\u043D \u0442\u043E\u043B\u044C\u043A\u043E Light. \u041D\u0443\u0436\u0435\u043D \u0444\u0430\u0439\u043B \u0432 \u043A\u043E\u043C\u0430\u043D\u0434\u0435 Professional+, \u0447\u0442\u043E\u0431\u044B \u0431\u044B\u043B Dark.` : `${COLLECTION}: \u0440\u0435\u0436\u0438\u043C Dark \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D (${e && e.message})`);
  }
  function ensureCollection(ix, report, dryRun) {
    if (ix.col) {
      if (!modeIdOf(ix.col, "dark") && !dryRun) {
        try {
          ix.col.addMode(FIGMA_MODES.dark);
          report.modesAdded.push(FIGMA_MODES.dark);
        } catch (e) {
          modeFailed(report, e);
        }
      } else if (!modeIdOf(ix.col, "dark")) report.modesAdded.push(FIGMA_MODES.dark);
      return ix.col;
    }
    report.collectionCreated = true;
    if (dryRun) return null;
    const c = figma.variables.createVariableCollection(COLLECTION);
    c.renameMode(c.modes[0].modeId, FIGMA_MODES.light);
    try {
      c.addMode(FIGMA_MODES.dark);
    } catch (e) {
      modeFailed(report, e);
    }
    ix.col = c;
    return c;
  }
  async function libraryGuard(ix) {
    if (ix.col || !figma.teamLibrary) return null;
    let libs = [];
    try {
      libs = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    } catch (e) {
      return null;
    }
    const connected = libs.filter((l) => String(l.name).trim() === COLLECTION);
    if (!connected.length) return null;
    const from = [...new Set(connected.map((l) => l.libraryName).filter(Boolean))].join(", ") || "\u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0430";
    return `\u0424\u0430\u0439\u043B \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u044E ${COLLECTION} \u0438\u0437 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438 \xAB${from}\xBB. \u041F\u0440\u0438\u043C\u0435\u043D\u044F\u0442\u044C \u043D\u0443\u0436\u043D\u043E \u0432 \u0444\u0430\u0439\u043B\u0435 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438, \u0438\u043D\u0430\u0447\u0435 \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F. \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 (\u043F\u0440\u043E\u0431\u043D\u044B\u0439 \u043F\u0440\u043E\u0433\u043E\u043D) \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430.`;
  }
  var show = (v) => v && typeof v === "object" ? plainValue(v) : v;
  async function applyWrites(writes, opts = {}) {
    if (figma.editorType && figma.editorType !== "figma") throw new Error("\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u0444\u0430\u0439\u043B\u0435 Figma Design (\u043D\u0435 FigJam)");
    const dryRun = !!opts.dryRun;
    const ix = await loadShadcn();
    if (!dryRun) {
      const reason = await libraryGuard(ix);
      if (reason) throw new Error(reason);
    }
    const report = { dryRun, collectionCreated: false, modesAdded: [], created: [], updated: [], unchanged: 0, errors: [], changed: [] };
    const col = ensureCollection(ix, report, dryRun);
    for (const w of writes) {
      let v = ix.named.get(w.name);
      if (v && v.resolvedType !== w.type) {
        report.errors.push(`${w.name}: \u0442\u0438\u043F ${v.resolvedType}, \u0430 \u043D\u0443\u0436\u0435\u043D ${w.type}`);
        continue;
      }
      const fresh = !v;
      if (fresh) {
        report.created.push(w.name);
        if (!dryRun) {
          v = figma.variables.createVariable(w.name, col, w.type);
          ix.named.set(w.name, v);
        }
      }
      if (v && !dryRun) {
        v.scopes = w.scopes || [];
        if (w.codeSyntax) v.setVariableCodeSyntax("WEB", w.codeSyntax);
      }
      let touched = fresh;
      for (const mode of MODES) {
        const modeId = col ? modeIdOf(col, mode) : mode;
        if (!modeId) continue;
        const wanted = w.values[mode];
        const current = v && !fresh ? v.valuesByMode[modeId] : void 0;
        const now = current === void 0 ? void 0 : plainValue(await resolve(current, mode));
        if (!fresh && current !== void 0 && !isAlias(current) && now === show(wanted)) {
          report.unchanged++;
          continue;
        }
        touched = true;
        if (!fresh) report.updated.push(`${w.name} (${FIGMA_MODES[mode]}): ${isAlias(current) ? "\u0441\u0441\u044B\u043B\u043A\u0430" : now === void 0 ? "\u2014" : now} \u2192 ${show(wanted)}`);
        if (!dryRun) v.setValueForMode(modeId, wanted);
      }
      if (touched) report.changed.push(w.name);
    }
    return report;
  }
  function reportLine(r) {
    if (!r) return "";
    const parts = [`\u0441\u043E\u0437\u0434\u0430\u043D\u043E ${r.created.length}`, `\u0438\u0437\u043C\u0435\u043D\u0435\u043D\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0439 ${r.updated.length}`, `\u0431\u0435\u0437 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439 ${r.unchanged}`];
    if (r.collectionCreated) parts.push(`\u043D\u043E\u0432\u0430\u044F \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u044F ${COLLECTION}`);
    if (r.errors.length) parts.push(`\u043E\u0448\u0438\u0431\u043E\u043A ${r.errors.length}`);
    return `${r.dryRun ? "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430" : "\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u043E"}: ${parts.join(" \xB7 ")}`;
  }

  // src/actions.js
  var readState = (store) => ({ edits: Object.fromEntries(store.edits.entries()) });
  var modelOf = (store) => buildModel(shadcn_tokens_default, readState(store));
  async function scan(store) {
    const snapshot = await scanFile();
    store.setScan(snapshot);
    return snapshot;
  }
  async function apply(store, opts = {}) {
    const plan = planWrites(modelOf(store), __spreadProps(__spreadValues({}, opts), { snapshot: store.scan }));
    const report = await applyWrites(plan.writes, opts);
    report.skipped = plan.skipped;
    report.at = (/* @__PURE__ */ new Date()).toISOString();
    if (!opts.dryRun) {
      store.setReport(report);
      await scan(store);
    }
    return report;
  }
  function setToken(store, { key, light, dark }) {
    const row = modelOf(store).rows.find((r) => r.key === key);
    if (!row) return [`\u041D\u0435\u0442 \u0442\u043E\u043A\u0435\u043D\u0430 ${key}: \u043D\u0430\u0431\u043E\u0440 shadcn \u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D, \u0441\u0432\u043E\u0438 \u0438\u043C\u0435\u043D\u0430 \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u044E\u0442\u0441\u044F`];
    const next = { light: normValue(row.kind, light), dark: row.kind === "radius" ? void 0 : normValue(row.kind, dark) };
    const errors = Object.entries(next).filter(([, v]) => Number.isNaN(v)).map(([m]) => `${m}: ${row.kind === "color" ? "\u043D\u0443\u0436\u0435\u043D \u0446\u0432\u0435\u0442 oklch(L C H) \u0438\u043B\u0438 #hex" : "\u043D\u0443\u0436\u043D\u0430 \u0434\u043B\u0438\u043D\u0430 \u0432 rem \u0438\u043B\u0438 px"}`);
    if (errors.length) return errors;
    if (next.light === void 0) next.light = row.source.light;
    if (row.kind === "radius") delete next.dark;
    else if (next.dark === void 0) next.dark = row.source.dark;
    const same = sameValue(next.light, row.source.light, row.kind) && (row.kind === "radius" || sameValue(next.dark, row.source.dark, row.kind));
    if (same) store.edits.delete(key);
    else store.edits.set(key, next);
    return [];
  }
  function importInto(store, text) {
    const res = importTokens(shadcn_tokens_default, text);
    if (res.errors.length) return res;
    for (const k of store.edits.keys()) store.edits.delete(k);
    for (const [k, v] of Object.entries(res.edits)) store.edits.set(k, v);
    return res;
  }
  function exportsOf(store) {
    const state = readState(store);
    const model = modelOf(store);
    const files = [
      { name: "shadcn-tokens.json", mime: "application/json", text: `${JSON.stringify(exportTokensJson(shadcn_tokens_default, state), null, 2)}
` },
      { name: "tokens.css", mime: "text/css", text: tokensCss(shadcn_tokens_default, model) },
      { name: "shadcn-theme.json", mime: "application/json", text: `${JSON.stringify(registryTheme(shadcn_tokens_default, model), null, 2)}
` }
    ];
    return { files, commands: syncCommands() };
  }
  function uiState(store) {
    const model = modelOf(store);
    const issues = contrastIssues(model.rows);
    const status = fileStatus(model.rows, store.scan);
    const rows = model.rows.map((r) => ({
      key: r.key,
      name: r.name,
      kind: r.kind,
      group: r.group,
      light: r.light,
      dark: r.dark,
      source: r.source,
      edited: r.edited,
      status: status.byKey[r.key]
    }));
    return {
      groups: GROUPS,
      rows,
      issues: issues.filter((i) => !i.ok),
      totals: status.totals,
      scan: store.scan ? { scannedAt: store.scan.scannedAt, count: store.scan.count, exists: store.scan.exists } : null
    };
  }

  // core/site.js
  var SITE_COLLECTION = "shadcn";
  var SITE_MODES = MODES;
  var PROJECT_ID = /^[a-z][a-z0-9-]{1,39}$/;
  var STATUS2 = {
    never: { label: "\u043D\u0435 \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043E", tone: "neutral" },
    same: { label: "\u0441\u043E\u0432\u043F\u0430\u0434\u0430\u0435\u0442", tone: "success" },
    "site-newer": { label: "\u043D\u0430 \u0441\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u0435\u0435", tone: "info" },
    "figma-newer": { label: "\u0432 Figma \u043D\u043E\u0432\u0435\u0435", tone: "warning" },
    conflict: { label: "\u043A\u043E\u043D\u0444\u043B\u0438\u043A\u0442", tone: "error" }
  };
  function siteOrigin(url) {
    const m = /^(https?):\/\/([a-z0-9.-]+(?::\d{1,5})?)\/?$/i.exec(String(url || "").trim());
    return m ? `${m[1].toLowerCase()}://${m[2].toLowerCase()}` : null;
  }
  function plain(value) {
    if (value == null) return "";
    if (typeof value === "number") return String(value);
    const c = colorKey(value);
    if (c) return c;
    const px = toPx(value);
    return px === null ? String(value) : String(px);
  }
  function planSig(v) {
    if (!v) return null;
    if (v.ref) return `ref:${v.ref}`;
    if (v.value == null) return null;
    return `value:${plain(v.value)}`;
  }
  function changedNames(before, after) {
    const sig = (x) => (x && typeof x === "object" ? x.sig : x) || null;
    const names = /* @__PURE__ */ new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
    return [...names].filter((n) => SITE_MODES.some((m) => {
      var _a, _b;
      return sig((_a = before == null ? void 0 : before[n]) == null ? void 0 : _a[m]) !== sig((_b = after == null ? void 0 : after[n]) == null ? void 0 : _b[m]);
    })).sort();
  }
  function syncStatus(siteVersion, state, current) {
    if (!state || !state.snapshot) return { status: "never", figmaChanges: Object.keys(current || {}) };
    const figmaChanges = changedNames(state.snapshot, current);
    const siteNewer = siteVersion !== state.version;
    const status = siteNewer && figmaChanges.length ? "conflict" : siteNewer ? "site-newer" : figmaChanges.length ? "figma-newer" : "same";
    return { status, figmaChanges };
  }
  var cssOf = (cur, kind) => {
    if (cur.sig && cur.sig.startsWith("ref:")) return `var(--${cur.sig.slice(4)})`;
    if (cur.css == null) return null;
    if (kind === "font" && !/[,'"]/.test(cur.css)) return `'${cur.css}', sans-serif`;
    return cur.css;
  };
  var baseOf = (v, mode) => v.base && v.base[mode] || v.values[mode];
  function pushPayload(plan, current) {
    const overrides = {};
    const skipped = [];
    const known = new Set(plan.variables.map((v) => v.name));
    for (const v of plan.variables) {
      if (v.editable === false || v.derived) continue;
      const cur = current[v.name];
      if (!cur) {
        if (v.overridden) skipped.push(`${v.name}: \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0439 \u043D\u0435\u0442 \u0432 Figma, \u043F\u0440\u0430\u0432\u043A\u0430 \u043D\u0430 \u0441\u0430\u0439\u0442\u0435 \u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u0430`);
        continue;
      }
      const entry = {};
      for (const mode of SITE_MODES) {
        const now = cur[mode];
        if (!now || now.sig === planSig(baseOf(v, mode))) continue;
        const css = cssOf(now, v.kind);
        if (css) entry[mode] = css;
        else skipped.push(`${v.name} (${mode}): \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043D\u0435 \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043B\u043E\u0441\u044C (\u0441\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u0443\u044E \u0431\u0435\u0437 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F)`);
      }
      if (v.kind && v.kind !== "color" && Object.keys(entry).length) overrides[v.name] = { light: entry.light || entry.dark };
      else if (Object.keys(entry).length) overrides[v.name] = entry;
    }
    for (const name of Object.keys(current)) {
      if (!known.has(name)) skipped.push(`${name}: \u0442\u0430\u043A\u043E\u0433\u043E \u0442\u043E\u043A\u0435\u043D\u0430 shadcn \u043D\u0435\u0442 \u2014 \u0438\u043C\u0435\u043D\u0430 \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u044E\u0442\u0441\u044F, \u043D\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D`);
    }
    return { tokens: { overrides, source: "figma" }, skipped };
  }

  // src/site-io.js
  var isAlias2 = (x) => x && typeof x === "object" && x.type === "VARIABLE_ALIAS";
  function toFigma(type, value) {
    if (value == null) return null;
    if (type === "STRING") return String(value);
    return type === "COLOR" ? parseColor(value) : toPx(value);
  }
  var cssOfRaw = (raw) => {
    if (raw && typeof raw === "object" && "r" in raw) return rgbaToOklch(raw);
    if (typeof raw === "number") return `${raw}px`;
    return typeof raw === "string" ? raw : null;
  };
  async function readMode(v, modeId, mode, col) {
    const raw = v.valuesByMode[modeId];
    if (raw === void 0) return { sig: null, value: null, css: null };
    if (!isAlias2(raw)) {
      const value2 = plainValue(raw);
      return { sig: planSig({ value: value2 }), value: value2, css: cssOfRaw(raw) };
    }
    const target = await figma.variables.getVariableByIdAsync(raw.id);
    if (!target) return { sig: null, value: null, css: null };
    const resolved = await resolve(raw, mode);
    const value = plainValue(resolved);
    if (target.variableCollectionId === col.id) return { sig: `ref:${target.name}`, value, css: `var(--${target.name})` };
    return { sig: value == null ? null : planSig({ value }), value, css: cssOfRaw(resolved) };
  }
  async function readShadcn() {
    const ix = await loadShadcn();
    if (!ix.col) return { exists: false, current: {} };
    const current = {};
    for (const [name, v] of ix.named) {
      current[name] = { type: v.resolvedType, scopes: v.scopes || [] };
      for (const m of SITE_MODES) current[name][m] = await readMode(v, modeIdOf(ix.col, m) || modeIdOf(ix.col, "light"), m, ix.col);
    }
    return { exists: true, current };
  }
  function ensureCollection2(ix, report) {
    if (ix.col) {
      if (!modeIdOf(ix.col, "dark")) {
        try {
          ix.col.addMode(FIGMA_MODES.dark);
          report.modesAdded.push(FIGMA_MODES.dark);
        } catch (e) {
          report.errors.push(`\u0420\u0435\u0436\u0438\u043C Dark \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D: ${e.message}. \u041D\u0443\u0436\u0435\u043D \u0442\u0430\u0440\u0438\u0444 \u0441 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u043C\u0438 \u0440\u0435\u0436\u0438\u043C\u0430\u043C\u0438.`);
        }
      }
      return ix.col;
    }
    const col = figma.variables.createVariableCollection(SITE_COLLECTION);
    col.renameMode(col.modes[0].modeId, FIGMA_MODES.light);
    try {
      col.addMode(FIGMA_MODES.dark);
    } catch (e) {
      report.errors.push(`\u0420\u0435\u0436\u0438\u043C Dark \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D: ${e.message}. \u041D\u0443\u0436\u0435\u043D \u0442\u0430\u0440\u0438\u0444 \u0441 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u043C\u0438 \u0440\u0435\u0436\u0438\u043C\u0430\u043C\u0438.`);
    }
    report.collectionCreated = true;
    ix.col = col;
    return col;
  }
  async function pullPlan(plan) {
    if (figma.editorType && figma.editorType !== "figma") throw new Error("\u041F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0435 \u043F\u0438\u0448\u0443\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u0444\u0430\u0439\u043B\u0435 Figma Design (\u043D\u0435 FigJam)");
    const ix = await loadShadcn();
    const report = { collectionCreated: false, modesAdded: [], created: [], updated: [], refs: 0, unchanged: 0, extra: [], errors: [] };
    const col = ensureCollection2(ix, report);
    const before = (await readShadcn()).current;
    const refs = [];
    const touch = (name) => {
      if (!report.created.includes(name) && !report.updated.includes(name)) report.updated.push(name);
    };
    for (const pv of plan.variables) {
      let v = ix.named.get(pv.name);
      if (v && v.resolvedType !== pv.type) {
        report.errors.push(`${pv.name}: \u0432 Figma \u0442\u0438\u043F ${v.resolvedType}, \u043D\u0430 \u0441\u0430\u0439\u0442\u0435 ${pv.type} \u2014 \u043D\u0435 \u0442\u0440\u043E\u043D\u0443\u0442`);
        continue;
      }
      if (!v) {
        v = figma.variables.createVariable(pv.name, col, pv.type);
        ix.named.set(pv.name, v);
        report.created.push(pv.name);
      }
      if (pv.scopes) v.scopes = pv.scopes;
      v.setVariableCodeSyntax("WEB", pv.codeSyntax || `var(--${pv.name})`);
      for (const mode of SITE_MODES) {
        const modeId = modeIdOf(col, mode);
        if (!modeId) continue;
        const want = pv.values[mode];
        const had = before[pv.name] && before[pv.name][mode];
        if (!want) {
          report.errors.push(`${pv.name} (${mode}): \u043D\u0435\u0442 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F`);
          continue;
        }
        if (want.ref) {
          refs.push({ v, pv, mode, modeId, want, had });
          continue;
        }
        if (had && had.sig && had.sig === planSig(want)) {
          report.unchanged++;
          continue;
        }
        const value = toFigma(pv.type, want.value);
        if (value == null) {
          report.errors.push(`${pv.name} (${mode}): \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \xAB${want.value}\xBB \u043D\u0435 \u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F`);
          continue;
        }
        v.setValueForMode(modeId, value);
        if (had && had.sig) touch(pv.name);
      }
    }
    for (const r of refs) {
      if (r.had && r.had.sig === planSig(r.want)) {
        report.unchanged++;
        continue;
      }
      const target = ix.named.get(r.want.ref);
      if (target && target !== r.v) {
        r.v.setValueForMode(r.modeId, figma.variables.createVariableAlias(target));
        report.refs++;
      } else {
        const value = toFigma(r.pv.type, r.want.value);
        if (value == null) {
          report.errors.push(`${r.pv.name} (${r.mode}): \u043D\u0435\u0442 \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0439 ${r.want.ref} \u0434\u043B\u044F \u0441\u0441\u044B\u043B\u043A\u0438`);
          continue;
        }
        r.v.setValueForMode(r.modeId, value);
      }
      if (r.had && r.had.sig) touch(r.pv.name);
    }
    const planned = new Set(plan.variables.map((x) => x.name));
    report.extra = [...ix.named.keys()].filter((n) => !planned.has(n));
    return report;
  }

  // src/site-actions.js
  var CONN = "site:conn";
  var STATE = "site:state";
  var readData = (key) => {
    try {
      return JSON.parse(figma.root.getPluginData(key) || "null");
    } catch (e) {
      return null;
    }
  };
  var writeData = (key, value) => figma.root.setPluginData(key, value == null ? "" : JSON.stringify(value));
  var keyName = (conn) => `site-key:${conn.url}|${conn.project}`;
  var connection = () => readData(CONN);
  var getKey = async (conn) => figma.clientStorage ? await figma.clientStorage.getAsync(keyName(conn)) || null : null;
  async function call(conn, path, { method = "GET", body, key, version } = {}) {
    if (typeof fetch !== "function") throw new Error("\u0412 \u044D\u0442\u043E\u0439 \u0432\u0435\u0440\u0441\u0438\u0438 Figma \u0443 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u043D\u0435\u0442 \u0441\u0435\u0442\u0438 (fetch)");
    const headers = {};
    if (body !== void 0) headers["Content-Type"] = "application/json";
    if (key) headers["X-Write-Key"] = key;
    if (version !== void 0) headers["If-Match"] = `"${version}"`;
    let res;
    try {
      res = await fetch(`${conn.url}${path}`, { method, headers, body: body === void 0 ? void 0 : JSON.stringify(body) });
    } catch (e) {
      throw new Error(`\u0421\u0430\u0439\u0442 ${conn.url} \u043D\u0435 \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442: \u0437\u0430\u043F\u0443\u0449\u0435\u043D \u043B\u0438 \u0441\u0435\u0440\u0432\u0435\u0440 \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0451\u043D \u043B\u0438 \u0434\u043E\u043C\u0435\u043D \u0432 manifest (networkAccess)`);
    }
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = null;
    }
    if (!res.ok) {
      const err = new Error(data && data.error || `\u0421\u0430\u0439\u0442 \u043E\u0442\u0432\u0435\u0442\u0438\u043B ${res.status}`);
      err.status = res.status;
      err.data = data;
      if (data && data.errors) err.message += `: ${data.errors.slice(0, 5).join("; ")}`;
      throw err;
    }
    return data;
  }
  var need = () => {
    const conn = connection();
    if (!conn) throw new Error("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0441\u0430\u0439\u0442: \u0430\u0434\u0440\u0435\u0441 \u0438 \u043F\u0440\u043E\u0435\u043A\u0442");
    return conn;
  };
  var project = (conn) => `/api/projects/${encodeURIComponent(conn.project)}`;
  async function siteConnect({ url, project: id, key }) {
    const origin = siteOrigin(url);
    if (!origin) throw new Error("\u0410\u0434\u0440\u0435\u0441 \u0441\u0430\u0439\u0442\u0430: http(s)://\u0445\u043E\u0441\u0442[:\u043F\u043E\u0440\u0442], \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 http://localhost:8797");
    const pid = String(id || "").trim();
    if (!PROJECT_ID.test(pid)) throw new Error("\u041F\u0440\u043E\u0435\u043A\u0442: \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440 \u0441 \u0441\u0430\u0439\u0442\u0430 (\u043B\u0430\u0442\u0438\u043D\u0438\u0446\u0430, \u0446\u0438\u0444\u0440\u044B, \u0434\u0435\u0444\u0438\u0441\u044B)");
    const conn = { url: origin, project: pid };
    const prev = connection();
    if (!prev || prev.url !== conn.url || prev.project !== conn.project) writeData(STATE, null);
    writeData(CONN, conn);
    if (key && figma.clientStorage) await figma.clientStorage.setAsync(keyName(conn), String(key).trim());
    return siteStatus();
  }
  async function siteStatus() {
    const conn = connection();
    if (!conn) return { connected: false };
    const state = readData(STATE);
    const base = { connected: true, url: conn.url, project: conn.project, hasKey: !!await getKey(conn), localVersion: state ? state.version : null, at: state ? state.at : null };
    const local = await readShadcn();
    let tokens;
    try {
      tokens = await call(conn, `${project(conn)}/tokens`);
    } catch (e) {
      return __spreadProps(__spreadValues({}, base), { error: e.message, status: null });
    }
    const s = syncStatus(tokens.version, state, local.current);
    return __spreadProps(__spreadValues({}, base), { siteVersion: tokens.version, collection: local.exists, status: s.status, label: STATUS2[s.status].label, tone: STATUS2[s.status].tone, figmaChanges: s.figmaChanges.slice(0, 30), figmaChangeCount: s.figmaChanges.length });
  }
  async function remember(conn, version, extra = {}) {
    const now = await readShadcn();
    const snapshot = {};
    for (const [name, v] of Object.entries(now.current)) snapshot[name] = { light: v.light.sig, dark: v.dark.sig };
    writeData(STATE, __spreadValues({ version, snapshot, at: (/* @__PURE__ */ new Date()).toISOString() }, extra));
  }
  async function markSync(conn, from, version) {
    const key = await getKey(conn);
    if (!key) return false;
    try {
      await call(conn, `${project(conn)}/figma/sync`, { method: "POST", key, body: { from, version, fileKey: figma.fileKey || void 0, fileName: figma.root.name || void 0 } });
      return true;
    } catch (e) {
      return false;
    }
  }
  async function sitePull({ force = false } = {}) {
    const conn = need();
    const plan = await call(conn, `${project(conn)}/figma.json`);
    const state = readData(STATE);
    const s = syncStatus(plan.version, state, (await readShadcn()).current);
    if (!force && state && s.figmaChanges.length) {
      const err = new Error(`\u0412 Figma \u0435\u0441\u0442\u044C \u043D\u0435\u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u0435 \u043F\u0440\u0430\u0432\u043A\u0438 (${s.figmaChanges.slice(0, 5).join(", ")}${s.figmaChanges.length > 5 ? "\u2026" : ""}). \u041E\u0442\u043F\u0440\u0430\u0432\u044C\u0442\u0435 \u0438\u0445 \u043D\u0430 \u0441\u0430\u0439\u0442 \u0438\u043B\u0438 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u0441 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0438\u0441\u044C\u044E.`);
      err.status = "figma-changes";
      throw err;
    }
    const report = await pullPlan(plan);
    await remember(conn, plan.version);
    report.version = plan.version;
    report.recorded = await markSync(conn, "site", plan.version);
    return report;
  }
  async function sitePush() {
    const conn = need();
    const key = await getKey(conn);
    if (!key) throw new Error("\u041D\u0443\u0436\u0435\u043D \u043A\u043B\u044E\u0447 \u0437\u0430\u043F\u0438\u0441\u0438 \u043F\u0440\u043E\u0435\u043A\u0442\u0430 (\u0441\u0430\u0439\u0442 \u2192 \u043F\u0440\u043E\u0435\u043A\u0442 \u2192 Figma \u2192 \xAB\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C\xBB)");
    const state = readData(STATE);
    if (!state) throw new Error("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \xAB\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0441 \u0441\u0430\u0439\u0442\u0430\xBB: \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0430\u0432\u043A\u0438 \u043E\u0442 \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0439 \u0432\u0435\u0440\u0441\u0438\u0438");
    const local = await readShadcn();
    if (!local.exists) throw new Error("\u0412 \u0444\u0430\u0439\u043B\u0435 \u043D\u0435\u0442 \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0438 shadcn");
    const plan = await call(conn, `${project(conn)}/figma.json`);
    const { tokens, skipped } = pushPayload(plan, local.current);
    try {
      const res = await call(conn, `${project(conn)}/tokens`, { method: "PUT", key, version: state.version, body: tokens });
      await remember(conn, res.tokens.version);
      return { version: res.tokens.version, diff: res.diff, skipped, overrides: Object.keys(tokens.overrides).length };
    } catch (e) {
      if (e.status === 409) return { conflict: true, siteVersion: e.data && e.data.current ? e.data.current.version : null, localVersion: state.version, skipped };
      throw e;
    }
  }

  // src/ui-bridge.js
  var SIZE = { width: 760, height: 720 };
  function openUI(store, tab = "tokens", focus = null) {
    const s = __spreadProps(__spreadValues({}, store), { setScan: (x) => {
      s.scan = x;
      store.setScan(x);
    } });
    const post = (type, data) => figma.ui.postMessage(Object.assign({ type }, data));
    const state = () => post("state", { state: uiState(s) });
    const handlers = {
      ready: () => {
        post("open", { tab, focus });
      },
      "set-token": (m) => ({ errors: setToken(s, m) }),
      "reset-token": (m) => {
        s.edits.delete(m.key);
      },
      "reset-all": () => {
        for (const k of s.edits.keys()) s.edits.delete(k);
      },
      import: (m) => ({ result: importInto(s, m.text) }),
      export: () => exportsOf(s),
      scan: async () => ({ scan: await scan(s) }),
      apply: async (m) => ({ report: await apply(s, { all: !!m.all, dryRun: !!m.dryRun }) }),
      "site-status": async () => ({ site: await siteStatus() }),
      "site-connect": async (m) => ({ site: await siteConnect(m) }),
      "site-pull": async (m) => ({ report: await sitePull({ force: !!m.force }), site: await siteStatus() }),
      "site-push": async () => ({ push: await sitePush(), site: await siteStatus() })
    };
    return new Promise((resolve2) => {
      figma.showUI(__html__, Object.assign({ title: "shadcn Tokens", themeColors: false }, SIZE));
      figma.ui.onmessage = async (m) => {
        if (!m || !m.type) return;
        if (m.type === "close") {
          resolve2();
          figma.closePlugin();
          return;
        }
        const fn = handlers[m.type];
        if (!fn) return;
        try {
          const out = await fn(m);
          post(`${m.type}:done`, out || {});
        } catch (e) {
          post("error", { for: m.type, message: String(e && e.message ? e.message : e) });
        }
        state();
      };
    });
  }

  // src/code.jsx
  var { widget } = figma;
  var { useSyncedState, useSyncedMap, usePropertyMenu } = widget;
  function ShadcnTokens() {
    const [group, setGroup] = useSyncedState("group", "base");
    const [scanned, setScan] = useSyncedState("scan", null);
    const [report, setReport] = useSyncedState("report", null);
    const edits = useSyncedMap("edits");
    const store = { scan: scanned, setScan, setReport, edits };
    const model = buildModel(shadcn_tokens_default, readState(store));
    const issues = contrastIssues(model.rows);
    const status = fileStatus(model.rows, scanned);
    usePropertyMenu(
      [
        { itemType: "action", propertyName: "edit", tooltip: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C" },
        { itemType: "action", propertyName: "scan", tooltip: "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0444\u0430\u0439\u043B" },
        { itemType: "action", propertyName: "apply", tooltip: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0432 Figma" },
        { itemType: "action", propertyName: "sync", tooltip: "\u0412\u044B\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u043B\u044F \u043A\u043E\u0434\u0430" },
        { itemType: "action", propertyName: "site", tooltip: "\u0421\u0430\u0439\u0442 \u0434\u0438\u0437\u0430\u0439\u043D-\u0441\u0438\u0441\u0442\u0435\u043C\u044B" }
      ],
      async ({ propertyName }) => {
        if (propertyName === "edit") await openUI(store, "tokens");
        else if (propertyName === "sync") await openUI(store, "code");
        else if (propertyName === "site") await openUI(store, "site");
        else if (propertyName === "scan") {
          const snap = await scan(store);
          figma.notify(snap.exists ? `\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E: ${snap.count} \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0438 shadcn` : "\u0412 \u0444\u0430\u0439\u043B\u0435 \u043D\u0435\u0442 \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0438 shadcn: \xAB\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0432 Figma\xBB \u0441\u043E\u0437\u0434\u0430\u0441\u0442 \u0435\u0451");
        } else if (propertyName === "apply") {
          await openUI(store, "figma");
        }
      }
    );
    const handlers = {
      group: (g) => setGroup(g),
      open: (key) => openUI(store, "tokens", key)
    };
    return /* @__PURE__ */ figma.widget.h(
      Board,
      {
        c: chrome(shadcn_tokens_default),
        groups: GROUPS,
        group,
        rows: model.rows,
        status: status.byKey,
        totals: status.totals,
        issues,
        counters: counters(model, issues),
        scan: scanned,
        report: reportLine(report),
        source: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A: shadcn/ui (Tailwind v4, oklch) \u2014 skills/ds-tokens/references/shadcn-tokens.json",
        handlers
      }
    );
  }
  widget.register(ShadcnTokens);
})();
