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
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

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

  // core/color.js
  function hexToRgb(hex) {
    let h = String(hex).trim().replace(/^#/, "");
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(h)) throw new Error(`Bad hex color: ${hex}`);
    const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
  }
  function rgbToHex({ r, g, b, a = 1 }) {
    const c = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0");
    return `#${c(r)}${c(g)}${c(b)}${a < 1 ? c(a) : ""}`;
  }
  var toLinear = (v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  var toGamma = (v) => v <= 31308e-7 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  function hexToOklch(hex) {
    const { r, g, b } = hexToRgb(hex);
    const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const C = Math.sqrt(A * A + B * B);
    const H = C < 1e-4 ? 0 : (Math.atan2(B, A) * 180 / Math.PI + 360) % 360;
    return { l: L, c: C, h: H };
  }
  function oklchToLinear({ l, c, h }) {
    const a = c * Math.cos(h * Math.PI / 180);
    const b = c * Math.sin(h * Math.PI / 180);
    const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
      4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
      -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
      -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_
    ];
  }
  function parseOklch(css) {
    const m = /^\s*oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?)\s*)?\)\s*$/i.exec(String(css));
    if (!m) throw new Error(`Bad oklch color: ${css}`);
    const num = (s, scale) => s.endsWith("%") ? parseFloat(s) / 100 : parseFloat(s) * scale;
    return { l: num(m[1], 1), c: parseFloat(m[2]), h: parseFloat(m[3]), a: m[4] == null ? 1 : num(m[4], 1) };
  }
  function oklchToRgba(css) {
    const { l, c, h, a } = parseOklch(css);
    const [r, g, b] = oklchToLinear({ l, c, h }).map((v) => toGamma(Math.min(1, Math.max(0, v))));
    return { r, g, b, a };
  }
  var round3 = (x) => Math.round(x * 1e3) / 1e3;
  function rgbaToOklch({ r, g, b, a = 1 }) {
    const o = hexToOklch(rgbToHex({ r, g, b }));
    const c = o.c < 5e-4 ? 0 : round3(o.c);
    const h = c === 0 ? 0 : round3(o.h);
    const alpha = a < 1 ? ` / ${Math.round(a * 100)}%` : "";
    return `oklch(${round3(o.l)} ${c} ${h}${alpha})`;
  }

  // core/tokens.js
  var SHADCN_TOKENS = shadcn_tokens_default;
  var COLLECTION = "shadcn";
  var THEMES = ["light", "dark"];
  var COLOR_TOKENS = Object.keys(shadcn_tokens_default.colors);
  var REM = 16;
  var remToPx = (s) => String(s).endsWith("rem") ? parseFloat(s) * REM : parseFloat(s);
  var RADIUS = remToPx(shadcn_tokens_default.radius);
  var factor = (expr) => {
    const m = /\*\s*([\d.]+)/.exec(expr);
    return m ? parseFloat(m[1]) : 1;
  };
  function radiusScale(radius = RADIUS) {
    const r = Number(radius);
    const out = {};
    for (const [k, expr] of Object.entries(shadcn_tokens_default.radiusScale)) out[k] = Math.round(r * factor(expr) * 100) / 100;
    return out;
  }
  var RADIUS_KEYS = Object.keys(shadcn_tokens_default.radiusScale);
  var RADIUS_TOKENS = ["radius", ...RADIUS_KEYS.map((k) => `radius-${k}`)];
  var rgbaOf = (token, theme) => oklchToRgba(shadcn_tokens_default.colors[token][theme]);
  var FILLS = ["FRAME_FILL", "SHAPE_FILL"];
  function scopesFor(token) {
    if (/-foreground$/.test(token)) return ["TEXT_FILL"];
    if (/^(sidebar-)?(border|ring)$/.test(token)) return ["STROKE_COLOR"];
    if (token === "input") return ["STROKE_COLOR", ...FILLS];
    if (token === "destructive") return [...FILLS, "TEXT_FILL", "STROKE_COLOR"];
    if (/^chart-/.test(token)) return [...FILLS, "STROKE_COLOR"];
    return [...FILLS];
  }
  var TYPE_SCALE = {
    xs: [12, 16],
    sm: [14, 20],
    base: [16, 24],
    lg: [18, 28],
    xl: [20, 28],
    "2xl": [24, 32],
    "3xl": [30, 36],
    "4xl": [36, 40]
  };

  // plugin/src/variables.js
  var isAlias = (x) => x && typeof x === "object" && x.type === "VARIABLE_ALIAS";
  async function loadIndex() {
    const cols2 = await figma.variables.getLocalVariableCollectionsAsync();
    const vars = await figma.variables.getLocalVariablesAsync();
    const byId = new Map(vars.map((v) => [v.id, v]));
    const col = {};
    for (const c of cols2) col[c.name] = c;
    const named = {};
    for (const c of cols2) named[c.name] = /* @__PURE__ */ new Map();
    for (const v of vars) {
      const c = cols2.find((x) => x.id === v.variableCollectionId);
      if (c) named[c.name].set(v.name, v);
    }
    return { col, named, byId };
  }
  var themeMode = (c, theme) => (c.modes.find((m) => (theme === "dark" ? /dark/i : /light/i).test(m.name)) || c.modes[theme === "dark" ? 1 : 0] || c.modes[0]).modeId;
  async function inspect() {
    const ix = await loadIndex();
    const c = ix.col[COLLECTION];
    const have = ix.named[COLLECTION] || /* @__PURE__ */ new Map();
    return {
      collection: !!c,
      modes: c ? c.modes.map((m) => m.name) : [],
      colors: COLOR_TOKENS.filter((t) => have.has(t)).length,
      total: COLOR_TOKENS.length,
      missing: [...COLOR_TOKENS, "radius"].filter((t) => !have.has(t)),
      collections: Object.keys(ix.col)
    };
  }
  var radiusValues = () => {
    const s = radiusScale(RADIUS);
    return [["radius", RADIUS], ...Object.entries(s).map(([k, v]) => [`radius-${k}`, v])];
  };
  async function ensureShadcn(opts = {}) {
    const ix = await loadIndex();
    let c = ix.col[COLLECTION];
    const report2 = { created: [], reset: 0, collection: false };
    if (!c) {
      c = figma.variables.createVariableCollection(COLLECTION);
      c.renameMode(c.modes[0].modeId, "Light");
      c.addMode("Dark");
      ix.col[COLLECTION] = c;
      ix.named[COLLECTION] = /* @__PURE__ */ new Map();
      report2.collection = true;
    } else if (c.modes.length < 2) c.addMode("Dark");
    const named = ix.named[COLLECTION];
    const make = (name, type) => {
      const v = figma.variables.createVariable(name, c, type);
      v.setVariableCodeSyntax("WEB", `var(--${name})`);
      named.set(name, v);
      ix.byId.set(v.id, v);
      report2.created.push(name);
      return v;
    };
    for (const token of COLOR_TOKENS) {
      const fresh = !named.has(token);
      const v = named.get(token) || make(token, "COLOR");
      if (fresh) v.scopes = scopesFor(token);
      if (fresh || opts.reset) {
        for (const theme of THEMES) v.setValueForMode(themeMode(c, theme), rgbaOf(token, theme));
        if (!fresh) report2.reset++;
      }
    }
    for (const [name, px] of radiusValues()) {
      const fresh = !named.has(name);
      const v = named.get(name) || make(name, "FLOAT");
      if (fresh) v.scopes = ["CORNER_RADIUS"];
      if (fresh || opts.reset) for (const m of c.modes) v.setValueForMode(m.modeId, px);
    }
    return report2;
  }
  function resolve(ix, v, theme, depth = 0) {
    const c = Object.values(ix.col).find((x) => x.id === v.variableCollectionId);
    const val = c && v.valuesByMode[themeMode(c, theme)];
    if (isAlias(val)) {
      const next = depth < 10 && ix.byId.get(val.id);
      return next ? resolve(ix, next, theme, depth + 1) : null;
    }
    return val == null ? null : val;
  }
  async function readShadcn() {
    const ix = await loadIndex();
    const named = ix.named[COLLECTION] || /* @__PURE__ */ new Map();
    const colors = {};
    const missing = [];
    for (const token of COLOR_TOKENS) {
      const v = named.get(token);
      const entry = {};
      for (const theme of THEMES) {
        const val = v && resolve(ix, v, theme);
        if (val && typeof val === "object" && "r" in val) entry[theme] = rgbaToOklch(val);
      }
      if (entry.light && entry.dark) colors[token] = entry;
      else {
        colors[token] = __spreadValues(__spreadValues({}, SHADCN_TOKENS.colors[token]), entry);
        missing.push(token);
      }
    }
    const r = named.get("radius");
    const px = r ? resolve(ix, r, "light") : RADIUS;
    return {
      $schema: SHADCN_TOKENS.$schema,
      radius: `${Math.round(Number(px) / 16 * 1e3) / 1e3}rem`,
      radiusScale: SHADCN_TOKENS.radiusScale,
      font: SHADCN_TOKENS.font,
      colors,
      missing
    };
  }
  async function modeVars() {
    const ix = await loadIndex();
    const named = ix.named[COLLECTION] || /* @__PURE__ */ new Map();
    const vars = {};
    for (const t of COLOR_TOKENS) vars[t] = named.get(t) || null;
    const radius = {};
    for (const k of ["sm", "md", "lg", "xl"]) radius[k] = named.get(`radius-${k}`) || null;
    radius.full = 999;
    return { vars, radius, ix };
  }
  async function setFrameModes(frame, { theme } = {}) {
    if (!theme) return;
    const ix = await loadIndex();
    const c = ix.col[COLLECTION];
    if (c) frame.setExplicitVariableModeForCollection(c, themeMode(c, theme));
  }

  // plugin/src/draw.js
  var SIZING = /* @__PURE__ */ new WeakMap();
  var WEIGHTS = { regular: "Regular", medium: "Medium", semibold: "Semi Bold", bold: "Bold" };
  function createCtx({ vars, radius, font, kit: kit2, width, state, spec }) {
    return { vars, radius, font, kit: kit2, width, state, spec, styles: {}, kitStyles: null, stats: { instances: 0, fallbacks: 0, fallbackFonts: false, roles: {} } };
  }
  async function loadFonts(family) {
    const loaded = [];
    for (const style of Object.values(WEIGHTS)) {
      try {
        await figma.loadFontAsync({ family, style });
        loaded.push(style);
      } catch (e) {
      }
    }
    if (loaded.includes("Regular")) return family;
    for (const style of Object.values(WEIGHTS)) await figma.loadFontAsync({ family: "Inter", style });
    return "Inter";
  }
  function paint(ctx, token, opacity = 1) {
    const v = ctx.vars[token];
    const base = { type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 }, opacity };
    return v ? __spreadProps(__spreadValues({}, figma.variables.setBoundVariableForPaint(base, "color", v)), { opacity }) : base;
  }
  function fill(node, ctx, token, opacity) {
    node.fills = token ? [paint(ctx, token, opacity)] : [];
  }
  function stroke(node, ctx, token = "border", weight = 1) {
    node.strokes = [paint(ctx, token)];
    node.strokeWeight = weight;
    node.strokeAlign = "INSIDE";
  }
  function round(node, ctx, size3 = "lg") {
    const v = ctx.radius[size3];
    if (v && typeof v === "object") {
      for (const k of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) node.setBoundVariable(k, v);
    } else node.cornerRadius = typeof v === "number" ? v : size3 === "full" ? 999 : 8;
  }
  function box(ctx, name, o = {}) {
    var _a, _b, _c;
    const f = figma.createFrame();
    f.name = name;
    f.layoutMode = o.dir === "H" ? "HORIZONTAL" : "VERTICAL";
    f.itemSpacing = (_a = o.gap) != null ? _a : 0;
    const p = Array.isArray(o.pad) ? o.pad : [(_b = o.pad) != null ? _b : 0];
    const [t, r = t, b = t, l = r] = p.length === 2 ? [p[0], p[1], p[0], p[1]] : p;
    Object.assign(f, { paddingTop: t, paddingRight: r, paddingBottom: b, paddingLeft: l });
    f.primaryAxisAlignItems = o.justify || "MIN";
    f.counterAxisAlignItems = o.align || "MIN";
    if (o.wrap) {
      f.layoutWrap = "WRAP";
      f.counterAxisSpacing = (_c = o.gap) != null ? _c : 0;
    }
    fill(f, ctx, o.fill, o.fillOpacity);
    if (o.stroke) stroke(f, ctx, o.stroke === true ? "border" : o.stroke);
    if (o.radius) round(f, ctx, o.radius);
    f.clipsContent = !!o.clip;
    const fixW = typeof o.w === "number";
    const fixH = typeof o.h === "number";
    if (fixW || fixH) f.resize(fixW ? o.w : f.width, fixH ? o.h : Math.max(1, f.height));
    const row = f.layoutMode === "HORIZONTAL";
    f.primaryAxisSizingMode = (row ? fixW : fixH) ? "FIXED" : "AUTO";
    f.counterAxisSizingMode = (row ? fixH : fixW) ? "FIXED" : "AUTO";
    SIZING.set(f, { w: o.w, h: o.h });
    return f;
  }
  function sizing(node, w, h) {
    SIZING.set(node, { w, h });
    return node;
  }
  function size(node, w, h) {
    if (w === "fill") node.layoutSizingHorizontal = "FILL";
    else if (w === "hug" && "layoutMode" in node && node.layoutMode !== "NONE") node.layoutSizingHorizontal = "HUG";
    if (h === "fill") node.layoutSizingVertical = "FILL";
    else if (h === "hug" && "layoutMode" in node && node.layoutMode !== "NONE") node.layoutSizingVertical = "HUG";
  }
  function add(parent, ...children) {
    for (const c of children.flat()) {
      if (!c) continue;
      parent.appendChild(c);
      const s = SIZING.get(c);
      if (s) size(c, s.w, s.h);
    }
    return parent;
  }
  async function textStyle(ctx, sz, weight) {
    const key = `${sz}/${weight}`;
    if (ctx.styles[key]) return ctx.styles[key];
    if (!ctx.kitStyles) ctx.kitStyles = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
    const kit2 = ctx.kitStyles.get(`text-${sz}/leading-normal/${weight === "regular" ? "normal" : weight}`);
    if (kit2) {
      try {
        await figma.loadFontAsync(kit2.fontName);
        return ctx.styles[key] = kit2;
      } catch (e) {
      }
    }
    const name = `ds/${sz}/${weight}`;
    const st = ctx.kitStyles.get(name) || figma.createTextStyle();
    if (!ctx.kitStyles.has(name)) {
      st.name = name;
      ctx.kitStyles.set(name, st);
    }
    const [px, lh] = TYPE_SCALE[sz] || TYPE_SCALE.sm;
    st.fontName = { family: ctx.font, style: WEIGHTS[weight] || "Regular" };
    st.fontSize = px;
    st.lineHeight = { unit: "PIXELS", value: lh };
    st.letterSpacing = { unit: "PERCENT", value: ["2xl", "3xl", "4xl"].includes(sz) ? -2 : 0 };
    ctx.stats.fallbackFonts = true;
    return ctx.styles[key] = st;
  }
  async function text(ctx, value, o = {}) {
    const t = figma.createText();
    const st = await textStyle(ctx, o.size || "sm", o.weight || "regular");
    t.fontName = st.fontName;
    t.characters = String(value != null ? value : "");
    await t.setTextStyleIdAsync(st.id);
    t.fills = [paint(ctx, o.color || "foreground")];
    t.name = o.name || String(value).slice(0, 32);
    if (o.align) t.textAlignHorizontal = o.align;
    if (o.truncate) {
      t.textTruncation = "ENDING";
      t.maxLines = 1;
    }
    SIZING.set(t, { w: o.w });
    if (o.w === "fill") t.textAutoResize = "HEIGHT";
    return t;
  }
  function rect(ctx, name, w, h, token, radius) {
    const r = figma.createRectangle();
    r.name = name;
    r.resize(w, h);
    fill(r, ctx, token);
    if (radius) round(r, ctx, radius);
    return r;
  }
  function skel(ctx, w, h = 12, radius = "sm") {
    const r = rect(ctx, "Skeleton", typeof w === "number" ? w : 120, h, "muted", radius);
    if (w === "fill") SIZING.set(r, { w: "fill" });
    return r;
  }
  var LINK_KEY = "mbank-link";
  function link(node, key) {
    if (node && key) node.setPluginData(LINK_KEY, key);
    return node;
  }

  // core/contract.js
  var SCHEMA = "mbank/component@1";
  var STATES = ["default", "hover", "active", "focus", "disabled"];
  var statesAllowed = (c) => [.../* @__PURE__ */ new Set([...STATES, ...c && c.states || []])];
  var STEP = 4;
  var KINDS = {
    bg: "color",
    fg: "color",
    border: "color",
    "focus-ring": "color",
    radius: "radius",
    height: "space",
    "min-height": "space",
    px: "space",
    py: "space",
    pt: "space",
    pb: "space",
    gap: "space",
    size: "space",
    text: "text",
    weight: "weight",
    "border-width": "number",
    opacity: "number",
    shadow: "shadow",
    layout: "layout",
    align: "layout",
    hidden: "flag"
  };
  var PROPS = Object.keys(KINDS);
  var WEIGHTS2 = ["regular", "medium", "semibold", "bold"];
  var TEXT_PART = /^(label|text|title|placeholder|value|description|caption|hint)$/;
  var ICON_PART = /icon/;
  function partKind(part, c) {
    if (part === "root") return "root";
    const set = c && c.anatomy && c.anatomy[part] && c.anatomy[part].kind;
    if (set) return set;
    return TEXT_PART.test(part) ? "text" : ICON_PART.test(part) ? "icon" : "frame";
  }
  var ANATOMY_KINDS = ["text", "frame", "icon", "instance"];
  var SIDES = ["top", "right", "bottom", "left"];
  var parentOf = (c, part) => part === "root" ? null : c.anatomy && c.anatomy[part] && c.anatomy[part].parent || "root";
  function checkAnatomy(errors, c) {
    if (c.anatomy === void 0) return;
    if (!isObj(c.anatomy)) {
      errors.push("anatomy: \u043E\u0431\u044A\u0435\u043A\u0442");
      return;
    }
    for (const [part, a] of Object.entries(c.anatomy)) {
      const where = `anatomy.${part}`;
      if (!c.parts.includes(part)) {
        errors.push(`${where}: \u0447\u0430\u0441\u0442\u044C \u043D\u0435 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0430 \u0432 parts`);
        continue;
      }
      if (!isObj(a)) {
        errors.push(`${where}: \u043E\u0431\u044A\u0435\u043A\u0442`);
        continue;
      }
      if (a.kind !== void 0 && !ANATOMY_KINDS.includes(a.kind)) errors.push(`${where}.kind: ${ANATOMY_KINDS.join(" | ")}`);
      if (a.parent !== void 0) {
        const i = c.parts.indexOf(a.parent);
        if (i < 0) errors.push(`${where}.parent: \u043D\u0435\u0442 \u0447\u0430\u0441\u0442\u0438 \xAB${a.parent}\xBB`);
        else if (i >= c.parts.indexOf(part)) errors.push(`${where}.parent: \xAB${a.parent}\xBB \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u0442\u043E\u044F\u0442\u044C \u0432 parts \u0440\u0430\u043D\u044C\u0448\u0435`);
        else if (!["root", "frame"].includes(partKind(a.parent, c))) errors.push(`${where}.parent: \xAB${a.parent}\xBB \u043D\u0435 \u0440\u0430\u043C\u043A\u0430`);
      }
      if (a.width !== void 0 && !(typeof a.width === "number" && a.width > 0)) errors.push(`${where}.width: \u0447\u0438\u0441\u043B\u043E px`);
      if (a.fill !== void 0 && typeof a.fill !== "boolean") errors.push(`${where}.fill: true | false`);
      if (a.sides !== void 0 && !(Array.isArray(a.sides) && a.sides.every((s) => SIDES.includes(s)))) errors.push(`${where}.sides: ${SIDES.join(", ")}`);
      if (a.sample !== void 0 && typeof a.sample !== "string") errors.push(`${where}.sample: \u0441\u0442\u0440\u043E\u043A\u0430`);
      if (a.icon !== void 0 && typeof a.icon !== "string") errors.push(`${where}.icon: \u0438\u043C\u044F \u0438\u043A\u043E\u043D\u043A\u0438`);
      if (a.layer !== void 0 && !(typeof a.layer === "string" && a.layer.trim())) errors.push(`${where}.layer: \u0438\u043C\u044F \u0441\u043B\u043E\u044F \u2014 \u043D\u0435\u043F\u0443\u0441\u0442\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430`);
      if (a.kind === "instance" && !(isObj(a.component) && typeof a.component.name === "string")) errors.push(`${where}.component: { name, key }`);
    }
  }
  function splitKey(key) {
    const i = key.indexOf(":");
    return i < 0 ? { prop: key, state: "default" } : { prop: key.slice(0, i), state: key.slice(i + 1) };
  }
  function splitToken(value) {
    const [token, op] = String(value).split("/");
    return { token, opacity: op === void 0 ? 1 : Number(op) / 100 };
  }
  var isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
  function checkStyles(errors, where, styles, c) {
    if (!isObj(styles)) {
      errors.push(`${where}: \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043E\u0431\u044A\u0435\u043A\u0442\u043E\u043C`);
      return;
    }
    for (const [part, props] of Object.entries(styles)) {
      if (!c.parts.includes(part)) {
        errors.push(`${where}: \u0447\u0430\u0441\u0442\u044C \xAB${part}\xBB \u043D\u0435 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0430 \u0432 parts`);
        continue;
      }
      if (!isObj(props)) {
        errors.push(`${where}.${part}: \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043E\u0431\u044A\u0435\u043A\u0442\u043E\u043C`);
        continue;
      }
      for (const [key, value] of Object.entries(props)) {
        const { prop, state } = splitKey(key);
        if (!KINDS[prop]) errors.push(`${where}.${part}: \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0435 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E \xAB${prop}\xBB`);
        if (!statesAllowed(c).includes(state)) errors.push(`${where}.${part}: \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \xAB${state}\xBB`);
        if (KINDS[prop] === "color" && (typeof value !== "string" || /^#|^rgb|^oklch/i.test(value)))
          errors.push(`${where}.${part}.${key}: \u0446\u0432\u0435\u0442 \u2014 \u0442\u043E\u043B\u044C\u043A\u043E \u0438\u043C\u044F \u0442\u043E\u043A\u0435\u043D\u0430, \u043D\u0435 \xAB${value}\xBB`);
        if (KINDS[prop] === "space" && !(typeof value === "number" && value >= 0)) errors.push(`${where}.${part}.${key}: \u0448\u0430\u0433 \u0441\u0435\u0442\u043A\u0438 \u2014 \u0447\u0438\u0441\u043B\u043E`);
        if (KINDS[prop] === "flag" && typeof value !== "boolean") errors.push(`${where}.${part}.${key}: true \u0438\u043B\u0438 false`);
        if (prop === "weight" && !WEIGHTS2.includes(value)) errors.push(`${where}.${part}.weight: ${WEIGHTS2.join(" | ")}`);
      }
    }
  }
  function validateContract(c) {
    var _a, _b, _c;
    if (!isObj(c)) return ["\u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442: \u043D\u0435 \u043E\u0431\u044A\u0435\u043A\u0442"];
    const errors = [];
    if (c.$schema !== SCHEMA) errors.push(`$schema: \u043E\u0436\u0438\u0434\u0430\u0435\u0442\u0441\u044F ${SCHEMA}`);
    if (!/^[a-z][a-z0-9-]*$/.test(c.name || "")) errors.push("name: kebab-case \u043B\u0430\u0442\u0438\u043D\u0438\u0446\u0435\u0439, \u043A\u0430\u043A \u0438\u043C\u044F \u0444\u0430\u0439\u043B\u0430");
    if (!Array.isArray(c.parts) || !c.parts.includes("root")) {
      errors.push('parts: \u043C\u0430\u0441\u0441\u0438\u0432 \u0441 "root"');
      return errors;
    }
    if (!isObj(c.props)) errors.push("props: \u043E\u0431\u044A\u0435\u043A\u0442");
    for (const [p, d] of Object.entries(c.props || {})) {
      if (p === "state") errors.push("props.state: \u0437\u0430\u0440\u0435\u0437\u0435\u0440\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E, \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0437\u0430\u0434\u0430\u044E\u0442\u0441\u044F \u0432 states");
      if (!isObj(d) || !Array.isArray(d.values) || !d.values.length) {
        errors.push(`props.${p}.values: \u043D\u0435\u043F\u0443\u0441\u0442\u043E\u0439 \u043C\u0430\u0441\u0441\u0438\u0432`);
        continue;
      }
      if (d.default !== void 0 && !d.values.includes(d.default)) errors.push(`props.${p}.default: \u043D\u0435\u0442 \u0432 values`);
      for (const v of d.values) if (!isObj((_b = (_a = c.variants) == null ? void 0 : _a[p]) == null ? void 0 : _b[v])) errors.push(`variants.${p}.${v}: \u043D\u0435 \u043E\u043F\u0438\u0441\u0430\u043D`);
    }
    for (const s of c.states || []) if (!/^[a-z][a-z0-9-]*$/.test(s)) errors.push(`states: \xAB${s}\xBB \u2014 kebab-case \u043B\u0430\u0442\u0438\u043D\u0438\u0446\u0435\u0439`);
    checkAnatomy(errors, c);
    if (c.base) checkStyles(errors, "base", c.base, c);
    for (const [p, byValue] of Object.entries(c.variants || {})) {
      if (!((_c = c.props) == null ? void 0 : _c[p])) {
        errors.push(`variants.${p}: \u043D\u0435\u0442 \u0442\u0430\u043A\u043E\u0433\u043E \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u0430 \u0432 props`);
        continue;
      }
      for (const [v, styles] of Object.entries(byValue)) checkStyles(errors, `variants.${p}.${v}`, styles, c);
    }
    (c.compound || []).forEach((cv, i) => {
      if (!isObj(cv.when)) errors.push(`compound[${i}].when: \u043E\u0431\u044A\u0435\u043A\u0442`);
      const _a2 = cv, { when } = _a2, styles = __objRest(_a2, ["when"]);
      checkStyles(errors, `compound[${i}]`, styles, c);
    });
    return errors;
  }
  function combos(c) {
    let out = [{}];
    for (const [p, d] of Object.entries(c.props || {})) out = out.flatMap((o) => d.values.map((v) => __spreadProps(__spreadValues({}, o), { [p]: v })));
    return out;
  }
  var statesOf = (c) => c.states && c.states.length ? c.states : ["default"];
  function variantName(props, state, withState = true) {
    const pairs = Object.entries(props).map(([k, v]) => `${k}=${v}`);
    if (withState) pairs.push(`state=${state}`);
    return pairs.join(", ") || "default";
  }
  function variantList(c) {
    const states = statesOf(c);
    return combos(c).flatMap((props) => states.map((state) => ({ props, state, name: variantName(props, state, states.length > 1) })));
  }
  function layers(c, props) {
    var _a, _b;
    const out = [{ source: "base", styles: c.base || {} }];
    for (const [p, v] of Object.entries(props)) out.push({ source: `${p}=${v}`, styles: ((_b = (_a = c.variants) == null ? void 0 : _a[p]) == null ? void 0 : _b[v]) || {} });
    (c.compound || []).forEach((cv, i) => {
      const _a2 = cv, { when } = _a2, styles = __objRest(_a2, ["when"]);
      if (Object.entries(when || {}).every(([k, v]) => props[k] === v)) out.push({ source: `compound:${i}`, styles });
    });
    return out;
  }
  function resolveStyle(c, props, state = "default") {
    const out = {};
    for (const part of c.parts) {
      const plain = {};
      const stated = {};
      for (const { styles } of layers(c, props)) {
        for (const [key, value] of Object.entries(styles[part] || {})) {
          const k = splitKey(key);
          if (k.state === "default") plain[k.prop] = value;
          else if (k.state === state) stated[k.prop] = value;
        }
      }
      const s = __spreadValues(__spreadValues({}, plain), stated);
      if (state !== "focus") delete s["focus-ring"];
      out[part] = s;
    }
    if (state === "disabled" && !JSON.stringify(c).includes(":disabled")) out.root.opacity = 50;
    return out;
  }
  function inherited(style, part, prop, fallback) {
    var _a, _b, _c, _d;
    return (_d = (_c = (_a = style[part]) == null ? void 0 : _a[prop]) != null ? _c : (_b = style.root) == null ? void 0 : _b[prop]) != null ? _d : fallback;
  }
  var ALIGN = { start: "MIN", center: "CENTER", end: "MAX", between: "CENTER" };
  function layoutFor(s = {}) {
    var _a, _b;
    const px = (v) => typeof v === "number" ? v * STEP : 0;
    const row = (s.layout || "row") !== "column";
    const out = {
      layoutMode: row ? "HORIZONTAL" : "VERTICAL",
      primaryAxisAlignItems: s.align === "between" ? "SPACE_BETWEEN" : row && s.align === "center" ? "CENTER" : row && s.align === "end" ? "MAX" : "MIN",
      counterAxisAlignItems: ALIGN[s.align] || (row ? "CENTER" : "MIN"),
      itemSpacing: px(s.gap),
      paddingLeft: px(s.px),
      paddingRight: px(s.px),
      paddingTop: px((_a = s.pt) != null ? _a : s.py),
      paddingBottom: px((_b = s.pb) != null ? _b : s.py),
      primaryAxisSizingMode: "AUTO",
      counterAxisSizingMode: "AUTO"
    };
    if (s.size !== void 0) {
      out.width = px(s.size);
      out.height = px(s.size);
      out.primaryAxisSizingMode = "FIXED";
      out.counterAxisSizingMode = "FIXED";
    } else if (s.height !== void 0) {
      out.height = px(s.height);
      if (row) out.counterAxisSizingMode = "FIXED";
      else out.primaryAxisSizingMode = "FIXED";
    }
    if (s["min-height"] !== void 0) out.minHeight = px(s["min-height"]);
    return out;
  }
  function bindingRows(c) {
    const rows = [];
    const push = (source, path, styles) => {
      for (const [part, props] of Object.entries(styles || {})) {
        if (!isObj(props)) continue;
        for (const [key, value] of Object.entries(props)) {
          const { prop, state } = splitKey(key);
          if (!["color", "radius", "space", "text", "weight"].includes(KINDS[prop])) continue;
          rows.push({ id: [...path, part, key].join("."), source, path: [...path, part], key, part, prop, state, kind: KINDS[prop], value });
        }
      }
    };
    push("base", ["base"], c.base);
    for (const [p, byValue] of Object.entries(c.variants || {})) for (const [v, styles] of Object.entries(byValue)) push(`${p}=${v}`, ["variants", p, v], styles);
    (c.compound || []).forEach((cv, i) => {
      const _a = cv, { when } = _a, styles = __objRest(_a, ["when"]);
      push(Object.entries(when || {}).map(([k, v]) => `${k}=${v}`).join(" + "), ["compound", String(i)], styles);
    });
    return rows;
  }
  function setBinding(c, path, key, value) {
    const next = JSON.parse(JSON.stringify(c));
    let o = next;
    for (const seg of path) {
      if (o[seg] === void 0) o[seg] = {};
      o = o[seg];
    }
    if (value === null || value === void 0 || value === "") delete o[key];
    else o[key] = value;
    return next;
  }
  var normName = (name) => String(name).split(",").map((s) => s.trim().replace(/\s*=\s*/, "=")).filter(Boolean).sort().join(", ");
  function diffVariants(existing, wanted) {
    const byName = new Map(existing.map((e) => [normName(e.name), e]));
    const keep = [];
    const create = [];
    for (const w of wanted) {
      const hit = byName.get(normName(w.name));
      if (hit) {
        keep.push(__spreadProps(__spreadValues({}, w), { id: hit.id }));
        byName.delete(normName(w.name));
      } else create.push(w);
    }
    return { keep, create, stale: [...byName.values()] };
  }

  // plugin/src/icons.js
  var P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 12 0v1"/><path d="M16 4a4 4 0 0 1 0 8"/><path d="M18 15a5 5 0 0 1 4 5v1"/>',
    chart: '<path d="M3 3v18h18"/><path d="M8 16v-4"/><path d="M13 16V8"/><path d="M18 16v-7"/>',
    settings: '<path d="M4 6h10"/><path d="M18 6h2"/><circle cx="16" cy="6" r="2"/><path d="M4 12h2"/><path d="M10 12h10"/><circle cx="8" cy="12" r="2"/><path d="M4 18h10"/><path d="M18 18h2"/><circle cx="16" cy="18" r="2"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    wallet: '<path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/><path d="M17 14h.01"/>',
    transfer: '<path d="M4 8h16l-4-4"/><path d="M20 16H4l4 4"/>',
    history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    minus: '<path d="M5 12h14"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
    folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'
  };
  var ICONS = Object.keys(P);
  function guessIcon(label2 = "") {
    const s = label2.toLowerCase();
    const rules = [
      [/главн|обзор|дашборд|home|dashboard/, "home"],
      [/заявк|входящ|inbox|очеред/, "inbox"],
      [/клиент|пользоват|сотрудн|users|роли/, "users"],
      [/отчёт|отчет|аналит|report|stat/, "chart"],
      [/настро|settings/, "settings"],
      [/документ|договор|file/, "file"],
      [/карт|card/, "card"],
      [/уведом|bell/, "bell"],
      [/перевод|transfer/, "transfer"],
      [/платеж|платёж|кошел|wallet/, "wallet"],
      [/истор|history/, "history"],
      [/безопас|провер|aml|risk|риск/, "shield"],
      [/календ|calendar/, "calendar"],
      [/продукт|каталог/, "layers"],
      [/ещё|еще|more/, "more"]
    ];
    const hit = rules.find(([re]) => re.test(s));
    return hit ? hit[1] : "folder";
  }
  function icon(ctx, name, color = "muted-foreground", px = 16) {
    const body = P[name] || P.folder;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
    const node = figma.createNodeFromSvg(svg);
    node.name = `Icon / ${name}`;
    node.fills = [];
    const tint = (n) => {
      if ("strokes" in n && n.strokes.length) n.strokes = [paint(ctx, color)];
      if ("fills" in n && n.type !== "FRAME") n.fills = [];
      if ("children" in n) n.children.forEach(tint);
    };
    tint(node);
    node.rescale(px / 24);
    return node;
  }

  // plugin/src/library-import.js
  var TIMEOUT = 4e3;
  var unreachable = false;
  function resetLibraryImports() {
    unreachable = false;
  }
  async function importByKey(load) {
    if (unreachable) return null;
    let timer;
    const timeout = new Promise((resolve2) => {
      timer = setTimeout(() => resolve2("timeout"), TIMEOUT);
    });
    try {
      const res = await Promise.race([Promise.resolve().then(load).catch(() => null), timeout]);
      if (res === "timeout") {
        unreachable = true;
        return null;
      }
      return res || null;
    } finally {
      clearTimeout(timer);
    }
  }

  // plugin/src/tokens-resolve.js
  async function tokenIndex() {
    const ix = await loadIndex();
    return { ix, shadcn: ix.named[COLLECTION] || /* @__PURE__ */ new Map(), cache: /* @__PURE__ */ new Map(), created: [], missing: [], imported: [] };
  }
  var fromShadcn = (t, name, type) => {
    const v = t.shadcn.get(name);
    return v && v.resolvedType === type ? v : null;
  };
  var findColor = (t, token) => fromShadcn(t, token, "COLOR");
  var findRadius = (t, key) => fromShadcn(t, key === "default" ? "radius" : `radius-${key}`, "FLOAT");
  var report = (t, kind, token) => {
    if (!t.missing.some((m) => m.kind === kind && m.token === token)) t.missing.push({ kind, token });
  };
  async function fillCollection(t) {
    if (t.filled) return;
    t.filled = true;
    const r = await ensureShadcn();
    if (!r.created.length) return;
    t.created.push(...r.created.filter((n) => COLOR_TOKENS.includes(n)).map((token) => ({ token, like: null })));
    t.shadcn = (await loadIndex()).named[COLLECTION];
  }
  async function colorVar(t, token, { create = true } = {}) {
    if (t.cache.has(`c:${token}`)) return t.cache.get(`c:${token}`);
    let v = findColor(t, token);
    if (!v && create && COLOR_TOKENS.includes(token)) {
      await fillCollection(t);
      v = findColor(t, token);
    }
    if (!v) report(t, "color", token);
    if (v || create) t.cache.set(`c:${token}`, v || null);
    if (v) t.missing = t.missing.filter((x) => !(x.kind === "color" && x.token === token));
    return v || null;
  }
  async function floatVar(t, kind, value) {
    if (kind !== "radius") return null;
    const key = `${kind}:${value}`;
    if (t.cache.has(key)) return t.cache.get(key);
    let v = findRadius(t, value);
    if (!v && RADIUS_KEYS.includes(String(value))) {
      await fillCollection(t);
      v = findRadius(t, value);
    }
    if (!v && !(value === "full" || value === "none")) report(t, kind, String(value));
    t.cache.set(key, v || null);
    return v || null;
  }
  function tokenForVariable(v) {
    return v.resolvedType === "FLOAT" && /^radius-/.test(v.name) ? v.name.slice(7) : v.name;
  }
  async function listVariables() {
    const t = await tokenIndex();
    return [...t.shadcn.values()].filter((v) => v.resolvedType === "COLOR" || v.resolvedType === "FLOAT").map((v) => ({ id: v.id, name: v.name, collection: COLLECTION, type: v.resolvedType, token: tokenForVariable(v) }));
  }
  async function screenVars(base) {
    const t = await tokenIndex();
    const vars = __spreadValues({}, base.vars);
    for (const k of Object.keys(vars)) if (!vars[k]) vars[k] = findColor(t, k) || null;
    const radius = __spreadValues({}, base.radius);
    for (const k of Object.keys(radius)) if (!radius[k]) radius[k] = findRadius(t, k) || null;
    return { vars, radius };
  }

  // plugin/src/components.js
  var PAGE = "Components";
  var KEY = "mbank-contract";
  var GAP = 24;
  var RADIUS_PX = __spreadProps(__spreadValues({ none: 0 }, radiusScale()), { full: 9999 });
  var MAGENTA = { r: 1, g: 0, b: 1 };
  async function componentsPage(name = PAGE) {
    await figma.loadAllPagesAsync();
    const page = figma.root.children.find((p2) => p2.name === name);
    if (page) return page;
    const p = figma.createPage();
    p.name = name;
    return p;
  }
  var pageOf = (c) => c && c.figma && c.figma.page || PAGE;
  var isSingle = (c) => !Object.keys(c.props || {}).length && statesOf(c).length === 1;
  var findType = (page, c, type) => page.findOne((n) => n.type === type && n.getPluginData(KEY) === c.name) || page.findOne((n) => n.type === type && n.name === (c.title || c.name) && (type === "COMPONENT_SET" || n.parent === page));
  function findSet(page, c) {
    const set = findType(page, c, "COMPONENT_SET");
    return set || (isSingle(c) ? findType(page, c, "COMPONENT") : null);
  }
  async function paintFor(r, value) {
    const { token, opacity } = splitToken(value);
    const v = await colorVar(r.t, token, { create: r.create });
    const base = { type: "SOLID", color: MAGENTA, opacity };
    if (!v) {
      r.unbound++;
      return base;
    }
    r.bound++;
    return figma.variables.setBoundVariableForPaint(base, "color", v);
  }
  async function ringFor(r, value) {
    const { token, opacity } = splitToken(value);
    const v = await colorVar(r.t, token, { create: r.create });
    const effect = { type: "DROP_SHADOW", color: __spreadProps(__spreadValues({}, MAGENTA), { a: opacity }), offset: { x: 0, y: 0 }, radius: 0, spread: 3, visible: true, blendMode: "NORMAL", showShadowBehindNode: false };
    if (!v) {
      r.unbound++;
      return effect;
    }
    r.bound++;
    return figma.variables.setBoundVariableForEffect(effect, "color", v);
  }
  async function bindFloat(r, node, fields, kind, value) {
    if (kind === "space") return;
    const v = await floatVar(r.t, kind, value);
    if (!v) {
      r.unbound++;
      return;
    }
    for (const f of fields) node.setBoundVariable(f, v);
    r.bound++;
  }
  var FLOAT_FIELDS = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "itemSpacing", "width", "height", "minHeight", "topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"];
  async function applyFrame(r, node, s, a = {}) {
    var _a, _b;
    const L = layoutFor(s);
    if (a.width && s.size === void 0) {
      L.width = a.width;
      if (L.layoutMode === "HORIZONTAL") L.primaryAxisSizingMode = "FIXED";
      else L.counterAxisSizingMode = "FIXED";
    }
    for (const f of FLOAT_FIELDS) if (node.boundVariables && node.boundVariables[f]) node.setBoundVariable(f, null);
    for (const k of ["layoutMode", "primaryAxisAlignItems", "counterAxisAlignItems", "itemSpacing", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) node[k] = L[k];
    node.primaryAxisSizingMode = L.primaryAxisSizingMode;
    node.counterAxisSizingMode = L.counterAxisSizingMode;
    if (L.width !== void 0 || L.height !== void 0) {
      node.resize(L.width || node.width, L.height || node.height);
      node.primaryAxisSizingMode = L.primaryAxisSizingMode;
      node.counterAxisSizingMode = L.counterAxisSizingMode;
    }
    if (L.minHeight !== void 0) node.minHeight = L.minHeight;
    if (s.px !== void 0) await bindFloat(r, node, ["paddingLeft", "paddingRight"], "space", s.px);
    if (s.py !== void 0) await bindFloat(r, node, ["paddingTop", "paddingBottom"], "space", s.py);
    if (s.pt !== void 0) await bindFloat(r, node, ["paddingTop"], "space", s.pt);
    if (s.pb !== void 0) await bindFloat(r, node, ["paddingBottom"], "space", s.pb);
    if (s.gap !== void 0) await bindFloat(r, node, ["itemSpacing"], "space", s.gap);
    if (s.size !== void 0) await bindFloat(r, node, ["width", "height"], "space", s.size);
    else if (s.height !== void 0) await bindFloat(r, node, ["height"], "space", s.height);
    if (s["min-height"] !== void 0) await bindFloat(r, node, ["minHeight"], "space", s["min-height"]);
    node.fills = s.bg ? [await paintFor(r, s.bg)] : [];
    if (s.border) {
      node.strokes = [await paintFor(r, s.border)];
      const w = (_a = s["border-width"]) != null ? _a : 1;
      node.strokeWeight = w;
      node.strokeAlign = "INSIDE";
      if (a.sides) for (const side of ["Top", "Right", "Bottom", "Left"]) node[`stroke${side}Weight`] = a.sides.includes(side.toLowerCase()) ? w : 0;
    } else node.strokes = [];
    if (s.radius !== void 0) {
      const v = await floatVar(r.t, "radius", s.radius);
      if (v) {
        for (const f of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) node.setBoundVariable(f, v);
        r.bound++;
      } else node.cornerRadius = (_b = RADIUS_PX[s.radius]) != null ? _b : RADIUS_PX.md;
    } else node.cornerRadius = 0;
    node.opacity = s.opacity !== void 0 ? s.opacity / 100 : 1;
    node.effects = s["focus-ring"] ? [await ringFor(r, s["focus-ring"])] : [];
  }
  async function pickTextStyle(r, size3, weight) {
    const key = `${size3}/${weight}`;
    if (r.textStyles.has(key)) return r.textStyles.get(key);
    const sz = TYPE_SCALE[size3] ? size3 : { "2xs": "xs", caption: "xs", md: "sm", "5xl": "4xl", "6xl": "4xl", "7xl": "4xl" }[size3] || "sm";
    const st = await textStyle(r.ctx, sz, weight);
    r.textStyles.set(key, st);
    return st;
  }
  var LABELS = { button: "\u041A\u043D\u043E\u043F\u043A\u0430", badge: "\u0421\u0442\u0430\u0442\u0443\u0441", pagination: "1", "tabs-trigger": "\u0412\u043A\u043B\u0430\u0434\u043A\u0430", avatar: "\u0410\u0422" };
  var defaultText = (part, c) => ({ placeholder: "Placeholder", description: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", value: "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435", hint: "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430" })[part] || LABELS[c.name] || c.title || c.name;
  async function applyText(r, node, style, part, c, a = {}) {
    const size3 = inherited(style, part, "text", "sm");
    const weight = inherited(style, part, "weight", "regular");
    const st = await pickTextStyle(r, size3, weight);
    try {
      await figma.loadFontAsync(node.fontName);
    } catch (e) {
    }
    node.fontName = st.fontName;
    if (!node.characters) node.characters = a.sample || defaultText(part, c);
    await node.setTextStyleIdAsync(st.id);
    node.fills = [await paintFor(r, inherited(style, part, "fg", "foreground"))];
    r.bound++;
  }
  async function applyIcon(r, comp, style, part, a = {}) {
    var _a, _b;
    const token = splitToken(inherited(style, part, "fg", "foreground")).token;
    r.ctx.vars[token] = await colorVar(r.t, token, { create: r.create });
    const node = icon(r.ctx, a.icon || "check", token, ((_b = (_a = style[part]) == null ? void 0 : _a.size) != null ? _b : 4) * STEP);
    node.name = part;
    if (r.ctx.vars[token]) r.bound++;
    else r.unbound++;
    return node;
  }
  async function instanceOf(r, a) {
    const { name, key } = a.component;
    let main = null;
    if (key && figma.importComponentByKeyAsync) main = await importByKey(() => figma.importComponentByKeyAsync(key));
    if (!main) {
      const local = figma.root.findOne((n) => (n.type === "COMPONENT_SET" || n.type === "COMPONENT") && n.name === name);
      main = local && local.type === "COMPONENT_SET" ? local.defaultVariant : local;
    }
    if (!main) {
      if (!r.missingComponents.includes(name)) r.missingComponents.push(name);
      return null;
    }
    const inst = main.createInstance();
    const label2 = a.sample && inst.findOne && inst.findOne((n) => n.type === "TEXT");
    if (label2) {
      try {
        await figma.loadFontAsync(label2.fontName);
        label2.characters = a.sample;
      } catch (e) {
      }
    }
    r.instances++;
    return inst;
  }
  async function renderPart(r, holder, style, part, c) {
    const kind = partKind(part, c);
    const a = c.anatomy && c.anatomy[part] || {};
    const layer = a.layer || part;
    let node = holder.children.find((n) => n.name === layer);
    const fits = node && (kind === "text" ? node.type === "TEXT" : kind === "instance" ? node.type === "INSTANCE" : kind === "frame" && node.type === "FRAME");
    if (node && !fits) {
      node.remove();
      node = null;
    }
    if (kind === "icon") node = await applyIcon(r, holder, style, part, a);
    else if (kind === "instance") node = node || await instanceOf(r, a) || figma.createFrame();
    else if (kind === "text") {
      node = node || figma.createText();
      await applyText(r, node, style, part, c, a);
    } else {
      node = node || figma.createFrame();
      await applyFrame(r, node, style[part] || {}, a);
    }
    node.name = layer;
    holder.appendChild(node);
    const column = holder.layoutMode === "VERTICAL";
    const fill2 = c.anatomy ? !!a.fill : column && kind !== "icon";
    if (fill2) node.layoutSizingHorizontal = "FILL";
    if (fill2 && kind === "text") node.textAutoResize = "HEIGHT";
    if (kind === "frame" && !column && holder.counterAxisSizingMode === "FIXED" && (fill2 && holder.primaryAxisSizingMode === "FIXED" || a.width)) node.layoutSizingVertical = "FILL";
    else if (kind === "text" && a.width) {
      node.textAutoResize = "HEIGHT";
      node.resize(a.width, node.height);
    }
    return node;
  }
  async function renderVariant(r, comp, c, props, state) {
    const style = resolveStyle(c, props, state);
    const rootA = c.anatomy && c.anatomy.root || {};
    await applyFrame(r, comp, style.root, rootA);
    if (comp.layoutMode === "VERTICAL" && comp.counterAxisSizingMode === "AUTO") {
      comp.resize(320, comp.height);
      comp.counterAxisSizingMode = "FIXED";
    }
    const holders = /* @__PURE__ */ new Map([["root", comp]]);
    const keep = /* @__PURE__ */ new Set();
    for (const part of c.parts.filter((p) => p !== "root")) {
      const node = await renderPart(r, holders.get(parentOf(c, part)), style, part, c);
      node.visible = !(style[part] && style[part].hidden);
      holders.set(part, node);
      keep.add(node);
    }
    for (const [part, h] of holders) if (h.type !== "INSTANCE" && h.children && partKind(part, c) !== "icon") {
      for (const n of [...h.children]) if (!keep.has(n)) n.remove();
    }
    for (const [part, h] of holders) {
      const s = style[part] || {};
      if (part !== "root" && h.type === "FRAME" && !h.children.length && h.layoutSizingVertical !== "FILL" && s.height === void 0 && s.size === void 0 && s["min-height"] === void 0) h.resize(h.width, 0.01);
    }
  }
  function layoutGrid(set, c, comps) {
    const states = statesOf(c);
    const props = Object.keys(c.props || {});
    const cols2 = states.length > 1 ? states.length : props.length ? (c.props[props[props.length - 1]].values || []).length || 1 : 1;
    const w = Math.max(...comps.map((x) => x.node.width));
    const h = Math.max(...comps.map((x) => x.node.height));
    comps.forEach((x, i) => {
      x.node.x = GAP + i % cols2 * (w + GAP);
      x.node.y = GAP + Math.floor(i / cols2) * (h + GAP);
    });
    const rows = Math.ceil(comps.length / cols2);
    set.resizeWithoutConstraints(GAP + cols2 * (w + GAP), GAP + rows * (h + GAP));
  }
  var reportOf = (r, t, extra) => __spreadProps(__spreadValues({}, extra), {
    bound: r.bound,
    unbound: r.unbound,
    missing: t.missing,
    createdTokens: t.created,
    fallbackFonts: r.ctx.stats.fallbackFonts,
    imported: t.imported,
    instances: r.instances,
    missingComponents: r.missingComponents
  });
  function textProperty(set, c) {
    const part = ["label", "text"].find((p) => c.parts.includes(p));
    if (!part || set.type !== "COMPONENT_SET") return;
    const defs = set.componentPropertyDefinitions;
    let key = Object.keys(defs).find((k) => defs[k].type === "TEXT" && /^Label#/.test(k));
    if (!key) key = set.addComponentProperty("Label", "TEXT", c.anatomy && c.anatomy[part] && c.anatomy[part].sample || defaultText(part, c));
    const layer = c.anatomy && c.anatomy[part] && c.anatomy[part].layer || part;
    for (const v of set.children) {
      const t = v.findOne((n) => n.type === "TEXT" && n.name === layer);
      if (t) t.componentPropertyReferences = { characters: key };
    }
  }
  async function refreshPaints(root) {
    const nodes = [root, ...root.findAll ? root.findAll(() => true) : []];
    for (const n of nodes) {
      for (const key of ["fills", "strokes"]) {
        const list2 = n[key];
        if (!Array.isArray(list2) || !list2.some((p) => p.boundVariables && p.boundVariables.color)) continue;
        const next = [];
        for (const p of list2) {
          const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
          const v = id && await figma.variables.getVariableByIdAsync(id);
          next.push(v ? figma.variables.setBoundVariableForPaint(p, "color", v) : p);
        }
        n[key] = [];
        n[key] = next;
      }
    }
  }
  function finish(node, c) {
    node.name = c.title || c.name;
    node.description = `mbank/component@1 \xB7 ${c.name}`;
    node.setPluginData(KEY, c.name);
    const contract = __spreadProps(__spreadValues({}, c), { figma: __spreadValues(__spreadProps(__spreadValues({}, c.figma || {}), { name: node.name, nodeId: node.id }), node.key ? { key: node.key } : {}) });
    node.setPluginData("contract-json", JSON.stringify(contract));
    return contract;
  }
  async function renderSingle(r, t, page, found, c) {
    const node = found || figma.createComponent();
    if (!found) {
      page.appendChild(node);
      node.x = GAP;
      node.y = GAP + Math.max(0, ...page.children.filter((n) => n !== node).map((n) => n.y + n.height));
    }
    await renderVariant(r, node, c, {}, "default");
    await refreshPaints(node);
    const contract = finish(node, c);
    return { contract, report: reportOf(r, t, { setId: node.id, page: page.name, variants: 1, created: found ? 0 : 1, updated: found ? 1 : 0, stale: [], pruned: false }) };
  }
  async function renderContract(c, opts = {}) {
    var _a;
    const errors = validateContract(c);
    if (errors.length) return { errors };
    const page = await componentsPage(pageOf(c));
    const t = await tokenIndex();
    const font = await loadFonts(opts.font || "Inter");
    const r = { t, ctx: createCtx({ vars: {}, radius: {}, font }), textStyles: /* @__PURE__ */ new Map(), bound: 0, unbound: 0, instances: 0, missingComponents: [], create: opts.create !== false };
    const wanted = variantList(c);
    let set = findSet(page, c);
    if (isSingle(c) && (!set || set.type === "COMPONENT")) return renderSingle(r, t, page, set, c);
    const existing = set ? set.children.filter((n) => n.type === "COMPONENT").map((n) => ({ id: n.id, name: n.name })) : [];
    const diff = diffVariants(existing, wanted);
    const comps = [];
    for (const w of wanted) {
      const hit = diff.keep.find((k) => k.name === w.name);
      const node = hit ? set.children.find((n) => n.id === hit.id) : figma.createComponent();
      if (!hit) page.appendChild(node);
      node.name = w.name;
      await renderVariant(r, node, c, w.props, w.state);
      comps.push({ node, w });
    }
    const fresh = comps.filter((x) => !diff.keep.some((k) => k.name === x.w.name)).map((x) => x.node);
    if (!set) {
      set = figma.combineAsVariants(fresh, page);
    } else for (const n of fresh) set.appendChild(n);
    for (const s of diff.stale) if (opts.prune) (_a = set.children.find((n) => n.id === s.id)) == null ? void 0 : _a.remove();
    layoutGrid(set, c, comps);
    textProperty(set, c);
    await refreshPaints(set);
    const contract = finish(set, c);
    return {
      contract,
      report: reportOf(r, t, {
        setId: set.id,
        page: page.name,
        variants: wanted.length,
        created: diff.create.length,
        updated: diff.keep.length,
        stale: diff.stale.map((s) => s.name),
        pruned: !!opts.prune
      })
    };
  }

  // plugin/src/place.js
  async function contractRegistry() {
    await figma.loadAllPagesAsync();
    const out = {};
    for (const n of figma.root.findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] })) {
      const name = n.getPluginData(KEY);
      if (!name || n.type === "COMPONENT" && n.parent && n.parent.type === "COMPONENT_SET") continue;
      if (!out[name] || n.type === "COMPONENT_SET") out[name] = { id: n.id, name: n.name };
    }
    return out;
  }
  function count(ctx, role, ok) {
    const s = ctx.stats;
    if (!s.roles) s.roles = {};
    const r = s.roles[role] = s.roles[role] || { instances: 0, fallbacks: 0, standIns: 0 };
    if (ok === "stand-in") r.standIns++;
    else if (ok) {
      r.instances++;
      s.instances++;
    } else {
      r.fallbacks++;
      s.fallbacks++;
    }
  }
  var norm = (s) => String(s).toLowerCase().replace(/[\s_-]+/g, "");
  var parse = (name) => Object.fromEntries(String(name).split(",").map((p) => p.split("=").map((x) => x.trim())).filter((p) => p.length === 2).map(([k, v]) => [k.toLowerCase(), v]));
  var same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
  function pickVariant(set, want) {
    const def = parse(set.defaultVariant ? set.defaultVariant.name : set.children[0].name);
    let best = null;
    let score2 = -1;
    for (const c of set.children) {
      if (c.type !== "COMPONENT") continue;
      const p = parse(c.name);
      let s = 0;
      for (const [k, v] of Object.entries(want)) if (v != null && p[k.toLowerCase()] !== void 0 && same(p[k.toLowerCase()], v)) s += 100;
      for (const [k, v] of Object.entries(def)) if (p[k] === v) s += 1;
      if (s > score2) {
        best = c;
        score2 = s;
      }
    }
    return best;
  }
  async function mainOf(inst) {
    return inst.getMainComponentAsync ? inst.getMainComponentAsync() : inst.mainComponent;
  }
  async function loadFontsOf(t) {
    const n = t.characters ? t.characters.length : 0;
    const fonts = n && t.getRangeAllFontNames ? t.getRangeAllFontNames(0, n) : [t.fontName];
    for (const f of fonts) if (f && typeof f === "object") await figma.loadFontAsync(f);
  }
  var textKey = (inst, name) => {
    const props = inst.componentProperties || {};
    return Object.keys(props).find((k) => props[k].type === "TEXT" && norm(k.split("#")[0]) === norm(name)) || null;
  };
  async function setTextProp(inst, key, value) {
    for (const t of inst.findAll((n) => n.type === "TEXT" && n.componentPropertyReferences && n.componentPropertyReferences.characters === key)) await loadFontsOf(t);
    inst.setProperties({ [key]: String(value) });
  }
  async function setLayer(ctx, inst, name, value) {
    const node = inst.findOne((n) => norm(n.name) === norm(name));
    if (!node) {
      const key = value != null && value !== false && textKey(inst, name);
      if (key) await setTextProp(inst, key, value);
      return !!key;
    }
    if (value === null || value === false) {
      node.visible = false;
      return true;
    }
    node.visible = true;
    if (node.type !== "TEXT") return true;
    const ref = node.componentPropertyReferences && node.componentPropertyReferences.characters;
    if (ref) await setTextProp(inst, ref, value);
    else {
      await loadFontsOf(node);
      node.characters = String(value);
    }
    return true;
  }
  async function setVariant(inst, want) {
    const main = await mainOf(inst);
    const set = main && main.parent && main.parent.type === "COMPONENT_SET" ? main.parent : null;
    if (!set) return;
    const defs = set.componentPropertyDefinitions;
    const out = {};
    for (const [k, d] of Object.entries(defs)) {
      if (d.type !== "VARIANT") continue;
      const wk = Object.keys(want).find((w) => same(w, k));
      const hit = wk != null && want[wk] != null && d.variantOptions.find((o) => same(o, want[wk]));
      if (hit) out[k] = hit;
    }
    if (Object.keys(out).length) inst.setProperties(out);
  }
  async function configure(ctx, inst, o = {}) {
    if (o.label != null) {
      const key = textKey(inst, "Label");
      if (key) await setTextProp(inst, key, o.label);
      else await setLayer(ctx, inst, "Label", o.label);
    }
    for (const [name, value] of Object.entries(o.texts || {})) await setLayer(ctx, inst, name, value);
    for (const [name, token] of Object.entries(o.colors || {})) {
      const node = inst.findOne((n) => norm(n.name) === norm(name));
      if (node && token) node.fills = [paint(ctx, token)];
    }
    for (const [name, sub] of Object.entries(o.nested || {})) {
      const n = inst.findOne((x) => x.type === "INSTANCE" && norm(x.name) === norm(name));
      if (!n) continue;
      if (sub.props) await setVariant(n, sub.props);
      await configure(ctx, n, sub);
    }
  }
  function size2(inst, w, h) {
    const auto = inst.layoutMode && inst.layoutMode !== "NONE";
    const row = inst.layoutMode === "HORIZONTAL";
    const hugs = (horizontal) => auto && (row === horizontal ? inst.primaryAxisSizingMode : inst.counterAxisSizingMode) === "AUTO";
    const hugW = hugs(true);
    const hugH = hugs(false);
    const fw = typeof w === "number";
    const fh = typeof h === "number";
    if (fw || fh) inst.resize(fw ? w : inst.width, fh ? h : inst.height);
    const sw = typeof w === "string" ? w : !fw && fh && hugW ? "hug" : void 0;
    const sh = typeof h === "string" ? h : fw && !fh && hugH ? "hug" : void 0;
    if (sw || sh) sizing(inst, sw, sh);
  }
  async function place(ctx, name, o = {}) {
    const ref = ctx.sets && ctx.sets[name];
    if (!ref) return null;
    const cache = ctx.nodeCache || (ctx.nodeCache = /* @__PURE__ */ new Map());
    if (!cache.has(ref.id)) cache.set(ref.id, await figma.getNodeByIdAsync(ref.id));
    const node = cache.get(ref.id);
    if (!node || node.removed) return null;
    const comp = node.type === "COMPONENT_SET" ? pickVariant(node, o.props || {}) : node;
    if (!comp) return null;
    const inst = comp.createInstance();
    try {
      await configure(ctx, inst, o);
      size2(inst, o.w, o.h);
    } catch (e) {
      inst.remove();
      const errs = ctx.stats.placeErrors || (ctx.stats.placeErrors = []);
      if (errs.length < 10) errs.push(`${name}: ${e && e.message ? e.message : e}`);
      return null;
    }
    count(ctx, o.role || name, true);
    return inst;
  }
  var handDrawn = (stats2) => Object.entries(stats2.roles || {}).filter(([, r]) => r.fallbacks).map(([role, r]) => ({ role, count: r.fallbacks }));
  function rolesReport(stats2) {
    const rows = Object.entries(stats2.roles || {}).sort((a, b) => b[1].fallbacks - a[1].fallbacks || a[0].localeCompare(b[0]));
    return rows.map(([role, r]) => `${role} ${r.instances}/${r.fallbacks}${r.standIns ? ` (+${r.standIns} \u0437\u0430\u043C\u0435\u043D\u043E\u0439)` : ""}`).join(" \xB7 ");
  }

  // plugin/src/kit.js
  var ROLES = {
    button: ["button"],
    badge: ["badge"],
    input: ["input", "text-field", "textfield"],
    checkbox: ["checkbox"],
    switch: ["switch", "toggle"],
    avatar: ["avatar"],
    select: ["select"],
    textarea: ["textarea"],
    tabs: ["tabs"],
    separator: ["separator", "divider"]
  };
  var norm2 = (s) => s.toLowerCase().replace(/^[^a-z]+/, "").replace(/[\s_/]+/g, "-");
  function variantProps(node) {
    const out = {};
    const defs = node.type === "COMPONENT_SET" ? node.componentPropertyDefinitions : {};
    for (const [k, d] of Object.entries(defs)) if (d.type === "VARIANT") out[k] = d.variantOptions;
    return out;
  }
  function textProps(node) {
    const defs = node.componentPropertyDefinitions || {};
    return Object.keys(defs).filter((k) => defs[k].type === "TEXT");
  }
  async function scanKit() {
    await figma.loadAllPagesAsync();
    const nodes = figma.root.findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] }).filter((n) => !(n.type === "COMPONENT" && n.parent && n.parent.type === "COMPONENT_SET"));
    const kit2 = {};
    const all = [];
    for (const n of nodes) {
      const name = norm2(n.name);
      all.push({ id: n.id, name: n.name, type: n.type, variants: variantProps(n), texts: textProps(n) });
      for (const [role, names] of Object.entries(ROLES)) {
        if (kit2[role]) continue;
        if (names.some((x) => name === x || name.endsWith(`-${x}`))) kit2[role] = { id: n.id, name: n.name };
      }
    }
    return { kit: kit2, components: all };
  }
  function pickVariant2(set, want) {
    const props = variantProps(set);
    const chosen = {};
    for (const [prop, options] of Object.entries(props)) {
      const p = prop.toLowerCase();
      for (const [k, val] of Object.entries(want)) {
        if (!p.includes(k)) continue;
        const hit = options.find((o) => o.toLowerCase() === String(val).toLowerCase());
        if (hit) chosen[prop] = hit;
      }
    }
    return chosen;
  }
  async function setLabel(inst, label2) {
    const defs = inst.componentProperties || {};
    const key = Object.keys(defs).find((k) => defs[k].type === "TEXT" && /label|text|title|placeholder|value/i.test(k)) || Object.keys(defs).find((k) => defs[k].type === "TEXT");
    if (key) {
      inst.setProperties({ [key]: label2 });
      return true;
    }
    const t = inst.findOne((n) => n.type === "TEXT" && n.visible);
    if (!t) return false;
    const fonts = t.getRangeAllFontNames(0, t.characters.length);
    for (const f of fonts) await figma.loadFontAsync(f);
    t.characters = label2;
    return true;
  }
  async function instance(ctx, role, want, label2) {
    const ref = ctx.kit && ctx.kit[role];
    if (!ref) return null;
    const node = await figma.getNodeByIdAsync(ref.id);
    if (!node) return null;
    const comp = node.type === "COMPONENT_SET" ? node.defaultVariant : node;
    const inst = comp.createInstance();
    if (node.type === "COMPONENT_SET") {
      const v = pickVariant2(node, want);
      if (Object.keys(v).length) try {
        inst.setProperties(v);
      } catch (e) {
      }
    }
    if (label2 != null) {
      try {
        await setLabel(inst, label2);
      } catch (e) {
        inst.remove();
        return null;
      }
    }
    count(ctx, role, true);
    return inst;
  }
  var BTN = {
    default: ["primary", "primary-foreground", null],
    secondary: ["secondary", "secondary-foreground", null],
    outline: ["background", "foreground", "border"],
    ghost: [null, "foreground", null],
    destructive: ["destructive", "primary-foreground", null]
  };
  var BTN_VARIANT = { default: "primary", secondary: "secondary", outline: "outline", ghost: "ghost", destructive: "destructive", link: "link" };
  var BTN_SIZE = { default: "md", sm: "sm", lg: "lg", icon: "icon" };
  var BADGE_TONE = { default: "accent", secondary: "neutral", outline: "clear", destructive: "error", success: "accent", warning: "clear", info: "neutral" };
  async function button(ctx, label2, variant = "default", sz = "default") {
    const props = { variant: BTN_VARIANT[variant] || variant, size: BTN_SIZE[sz] || sz, state: "default" };
    const inst = await place(ctx, "button", { props, label: label2 }) || await instance(ctx, "button", __spreadProps(__spreadValues({}, props), { type: variant, style: variant }), label2);
    if (inst) return inst;
    count(ctx, "button", false);
    const [bg, fg, border] = BTN[variant] || BTN.default;
    const b = box(ctx, `Button / ${variant}`, { dir: "H", gap: 8, pad: sz === "sm" ? [6, 12] : [8, 16], fill: bg, stroke: border, radius: "md", align: "CENTER", justify: "CENTER" });
    return add(b, await text(ctx, label2, { size: "sm", weight: "medium", color: fg }));
  }
  var BADGE = {
    default: ["primary", "primary-foreground"],
    secondary: ["secondary", "secondary-foreground"],
    outline: [null, "foreground"],
    destructive: ["destructive", "primary-foreground"],
    // shadcn Badge has default / secondary / outline / destructive; statuses map onto them.
    success: ["primary", "primary-foreground"],
    warning: ["secondary", "secondary-foreground"],
    info: [null, "foreground"]
  };
  async function badge(ctx, label2, variant = "secondary") {
    const props = { tone: BADGE_TONE[variant] || "neutral", shape: "rounded", size: "md" };
    const inst = await place(ctx, "badge", { props, label: label2 }) || await instance(ctx, "badge", __spreadProps(__spreadValues({}, props), { variant, type: variant }), label2);
    if (inst) return inst;
    count(ctx, "badge", false);
    const [bg, fg] = BADGE[variant] || BADGE.secondary;
    const b = box(ctx, `Badge / ${variant}`, { dir: "H", pad: [2, 8], fill: bg, stroke: variant === "outline" ? "border" : null, radius: "full", align: "CENTER" });
    return add(b, await text(ctx, label2, { size: "xs", weight: "medium", color: fg }));
  }
  async function input(ctx, placeholder, o = {}) {
    const props = { state: o.error ? "invalid" : "default", size: "md" };
    const w = o.w || "fill";
    const own = o.kind && await place(ctx, o.kind, { props, texts: { Placeholder: placeholder }, w });
    if (own) return own;
    let inst = await place(ctx, "input", { props, texts: { Placeholder: placeholder }, w });
    if (!inst && (inst = await instance(ctx, "input", props, placeholder))) {
      if (typeof w === "number") inst.resize(w, inst.height);
      else sizing(inst, w);
    }
    if (inst) {
      if (o.kind) count(ctx, o.kind, "stand-in");
      return inst;
    }
    count(ctx, o.kind || "input", false);
    const f = box(ctx, "Input", { dir: "H", gap: 8, pad: [8, 12], fill: "background", stroke: o.error ? "destructive" : "input", radius: "md", align: "CENTER", w: o.w || "fill", h: 36 });
    return add(f, await text(ctx, placeholder, { size: "sm", color: "muted-foreground", truncate: true }));
  }
  async function avatar(ctx, name, d = 32) {
    const initials2 = String(name).split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    const props = { size: d <= 24 ? "xs" : d <= 32 ? "sm" : d <= 40 ? "md" : "lg" };
    const inst = await place(ctx, "avatar", { props, label: initials2 }) || await instance(ctx, "avatar", props, initials2);
    if (inst) return inst;
    count(ctx, "avatar", false);
    const a = box(ctx, "Avatar", { dir: "H", fill: "muted", radius: "full", align: "CENTER", justify: "CENTER", w: d, h: d });
    a.primaryAxisSizingMode = "FIXED";
    a.counterAxisSizingMode = "FIXED";
    return add(a, await text(ctx, initials2, { size: "xs", weight: "medium", color: "muted-foreground" }));
  }
  async function checkbox(ctx, checked = false) {
    const inst = await place(ctx, "checkbox", { props: { state: checked ? "checked" : "default" } }) || await instance(ctx, "checkbox", { checked: checked ? "true" : "false", state: checked ? "checked" : "default" }, null);
    if (inst) return inst;
    count(ctx, "checkbox", false);
    const c = figma.createRectangle();
    c.name = "Checkbox";
    c.resize(16, 16);
    fill(c, ctx, checked ? "primary" : "background");
    stroke(c, ctx, checked ? "primary" : "input");
    round(c, ctx, "sm");
    return c;
  }
  async function radio(ctx, checked = false) {
    const inst = await place(ctx, "radio", { props: { state: checked ? "checked" : "default" } });
    if (inst) return inst;
    count(ctx, "radio", false);
    const c = figma.createEllipse ? figma.createEllipse() : figma.createRectangle();
    c.name = "Radio";
    c.resize(16, 16);
    fill(c, ctx, "background");
    stroke(c, ctx, checked ? "primary" : "input", checked ? 5 : 1);
    if (!figma.createEllipse) round(c, ctx, "full");
    return c;
  }
  async function skeleton(ctx, w, h = 12, radius = "sm") {
    const shape = radius === "full" && w === h ? "circle" : h >= 24 ? "block" : "line";
    const inst = await place(ctx, "skeleton", { props: { shape }, w: typeof w === "number" ? w : "fill", h });
    if (inst) return inst;
    count(ctx, "skeleton", false);
    return skel(ctx, w, h, radius);
  }
  function statusVariant(label2) {
    const s = String(label2).toLowerCase();
    if (/низк\S* риск|проверен|пройден|подключ|работает/.test(s)) return "success";
    if (/высок\S* риск|сбой/.test(s)) return "destructive";
    if (/средн\S* риск|медленно|ожида/.test(s)) return "warning";
    if (/одобр|выдан|оплач|успеш|актив|готов|approved|done|paid|active/.test(s)) return "success";
    if (/отказ|отклон|ошиб|просроч|блок|rejected|failed|overdue|blocked/.test(s)) return "destructive";
    if (/провер|ожида|скоринг|review|pending|wait/.test(s)) return "warning";
    if (/нов|new/.test(s)) return "info";
    return "secondary";
  }

  // core/fake.js
  var FIRST = ["\u0410\u0439\u0433\u0443\u043B\u044C", "\u0411\u0430\u043A\u044B\u0442", "\u041D\u0443\u0440\u043B\u0430\u043D", "\u0410\u0441\u0435\u043B\u044C", "\u0422\u0438\u043C\u0443\u0440", "\u0416\u044B\u043B\u0434\u044B\u0437", "\u042D\u043C\u0438\u043B\u044C", "\u0414\u0438\u043D\u0430\u0440\u0430", "\u0420\u0443\u0441\u043B\u0430\u043D", "\u041C\u044D\u044D\u0440\u0438\u043C", "\u0410\u0437\u0430\u043C\u0430\u0442", "\u041A\u0430\u043C\u0438\u043B\u0430"];
  var LAST = ["\u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B\u043E\u0432\u0430", "\u0410\u0441\u0430\u043D\u043E\u0432", "\u0418\u0441\u0430\u043A\u043E\u0432", "\u0421\u0430\u0434\u044B\u043A\u043E\u0432\u0430", "\u0411\u0435\u043A\u043C\u0443\u0440\u0430\u0442\u043E\u0432", "\u041E\u0441\u043C\u043E\u043D\u043E\u0432\u0430", "\u0416\u0443\u043C\u0430\u0431\u0435\u043A\u043E\u0432", "\u0410\u043B\u0438\u0435\u0432\u0430", "\u041A\u0430\u0434\u044B\u0440\u043E\u0432", "\u041C\u0430\u043C\u044B\u0442\u043E\u0432\u0430"];
  var COMPANIES = ["\u041E\u0441\u041E\u041E \xAB\u0410\u043B\u0430-\u0422\u043E\u043E \u0422\u0440\u0435\u0439\u0434\xBB", "\u0418\u041F \u0421\u0430\u0434\u044B\u043A\u043E\u0432\u0430", "\u041E\u0441\u041E\u041E \xAB\u0411\u0438\u0448\u043A\u0435\u043A \u041B\u043E\u0433\u0438\u0441\u0442\u0438\u043A\xBB", "\u041E\u0441\u041E\u041E \xAB\u041D\u0443\u0440 \u0410\u0433\u0440\u043E\xBB", "\u041E\u0410\u041E \xAB\u0422\u044F\u043D\u044C-\u0428\u0430\u043D\u044C\xBB", "\u041E\u0441\u041E\u041E \xAB\u041E\u0448 \u041C\u0430\u0440\u043A\u0435\u0442\xBB"];
  var PRODUCTS = ["\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439", "\u0410\u0432\u0442\u043E\u043A\u0440\u0435\u0434\u0438\u0442", "\u0418\u043F\u043E\u0442\u0435\u043A\u0430", "\u0411\u0438\u0437\u043D\u0435\u0441-\u043A\u0440\u0435\u0434\u0438\u0442", "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430", "\u0420\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0430"];
  var CITIES = ["\u0411\u0438\u0448\u043A\u0435\u043A", "\u041E\u0448", "\u041A\u0430\u0440\u0430\u043A\u043E\u043B", "\u0414\u0436\u0430\u043B\u0430\u043B-\u0410\u0431\u0430\u0434", "\u041D\u0430\u0440\u044B\u043D", "\u0422\u043E\u043A\u043C\u043E\u043A"];
  var WORDS = ["\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u043E\u0432", "\u0417\u0432\u043E\u043D\u043E\u043A \u043A\u043B\u0438\u0435\u043D\u0442\u0443", "\u041F\u043E\u0432\u0442\u043E\u0440\u043D\u044B\u0439 \u0441\u043A\u043E\u0440\u0438\u043D\u0433", "\u0417\u0430\u043F\u0440\u043E\u0441 \u0432\u044B\u043F\u0438\u0441\u043A\u0438", "\u0421\u043E\u0433\u043B\u0430\u0441\u043E\u0432\u0430\u043D\u0438\u0435 \u043B\u0438\u043C\u0438\u0442\u0430", "\u0412\u044B\u0434\u0430\u0447\u0430 \u0441\u0440\u0435\u0434\u0441\u0442\u0432"];
  var DEFAULT_STATUSES = ["\u041D\u043E\u0432\u0430\u044F", "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435", "\u041D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435", "\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u0430", "\u041E\u0442\u043A\u0430\u0437"];
  function rng(seed = 1) {
    let s = seed >>> 0 || 1;
    return () => (s = s * 1664525 + 1013904223 >>> 0) / 2 ** 32;
  }
  var pick = (r, list2) => list2[Math.floor(r() * list2.length)];
  var groups = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\xA0");
  var money = (r) => `${groups(Math.round(r() * 2400 + 50) * 1e3)} \u0441`;
  var date = (r, time) => {
    const d = String(1 + Math.floor(r() * 28)).padStart(2, "0");
    const m = String(1 + Math.floor(r() * 10)).padStart(2, "0");
    const t = `${String(9 + Math.floor(r() * 9)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}`;
    return time ? `${d}.${m}.2026, ${t}` : `${d}.${m}.2026`;
  };
  var GEN = {
    id: (r, i) => `CL-${240100 + i * 7 + Math.floor(r() * 5)}`,
    person: (r) => `${pick(r, FIRST)} ${pick(r, LAST)}`,
    company: (r) => pick(r, COMPANIES),
    phone: (r) => `+996 ${700 + Math.floor(r() * 99)} ${String(Math.floor(r() * 999)).padStart(3, "0")} ${String(Math.floor(r() * 999)).padStart(3, "0")}`,
    email: (r) => `${pick(r, ["a", "b", "n", "t", "d"])}.${pick(r, ["asanov", "isakova", "bekov", "alieva"])}@mail.kg`,
    money,
    date: (r) => date(r, false),
    datetime: (r) => date(r, true),
    number: (r) => String(Math.floor(r() * 990 + 10)),
    percent: (r) => `${(r() * 40 + 55).toFixed(1)}%`,
    product: (r) => pick(r, PRODUCTS),
    city: (r) => pick(r, CITIES),
    text: (r) => pick(r, WORDS)
  };
  var FIELD_TYPES = [...Object.keys(GEN), "status", "actions"];
  function parseColumn(col) {
    if (typeof col === "object") return { label: col.label, type: col.type || "text" };
    const [label2, type = "text"] = String(col).split(":");
    return { label: label2.trim(), type: type.trim() };
  }
  function fakeValue(type, r, i = 0, statuses = DEFAULT_STATUSES) {
    if (type === "status") return statuses[(i + Math.floor(r() * 2)) % statuses.length];
    if (type === "actions") return "\u2022\u2022\u2022";
    return (GEN[type] || GEN.text)(r, i);
  }
  function fakeRows(columns, count2, seed = 7, statuses) {
    const r = rng(seed);
    const cols2 = columns.map(parseColumn);
    return Array.from({ length: count2 }, (_, i) => cols2.map((c) => fakeValue(c.type, r, i, statuses)));
  }

  // core/platforms.js
  var PLATFORMS = {
    "web": {
      "title": "Web",
      "viewports": [
        "desktop",
        "tablet"
      ]
    },
    "mobile": {
      "title": "Mobile",
      "viewports": [
        "mobile"
      ]
    }
  };
  var VIEWPORTS = { "desktop": 1440, "tablet": 768, "mobile": 375 };

  // core/spec.js
  var STATES2 = ["default", "loading", "empty", "error", "no-access"];
  var BLOCKS = {
    header: ["title"],
    stats: ["items"],
    toolbar: [],
    table: ["columns"],
    pagination: [],
    tabs: ["items"],
    form: ["fields"],
    details: ["items"],
    kanban: ["columns"],
    chart: [],
    list: [],
    timeline: [],
    stepper: ["steps"],
    cards: ["items"],
    alert: ["text"],
    empty: [],
    login: [],
    split: ["columns"],
    // Credit pipeline CRM (blocks-crm.js)
    funnel: ["items"],
    meters: ["items"],
    score: ["value"],
    decision: ["items"],
    files: ["items"],
    checks: ["items"],
    comments: ["items"],
    profile: ["name"],
    breakdown: ["items"]
  };
  var DATA_BLOCKS = ["stats", "table", "kanban", "chart", "list", "timeline", "cards", "details", "funnel", "meters", "score", "files", "checks", "comments", "breakdown"];
  function checkBlock(b, path, errors) {
    if (!b || typeof b !== "object") return errors.push(`${path}: block must be an object`);
    const req = BLOCKS[b.type];
    if (!req) return errors.push(`${path}.type: unknown "${b.type}" (use ${Object.keys(BLOCKS).join(", ")})`);
    for (const f of req) if (b[f] == null) errors.push(`${path}.${f}: required for ${b.type}`);
    if (b.type === "table") {
      (b.columns || []).forEach((c, i) => {
        const { type } = parseColumn(c);
        if (!FIELD_TYPES.includes(type)) errors.push(`${path}.columns[${i}]: unknown field type "${type}"`);
      });
    }
    if (b.type === "split") {
      if (!Array.isArray(b.columns) || b.columns.length < 2) errors.push(`${path}.columns: split needs 2+ columns of blocks`);
      else b.columns.forEach((col, i) => (col || []).forEach((x, j) => checkBlock(x, `${path}.columns[${i}][${j}]`, errors)));
    }
    if (b.type === "stats") {
      (b.items || []).forEach((it, i) => {
        if (it && typeof it === "object" && it.better != null && !["up", "down"].includes(it.better)) errors.push(`${path}.items[${i}].better: up | down`);
      });
    }
    if (b.type === "header" && b.period != null && !(Array.isArray(b.period) && b.period.length >= 2)) {
      errors.push(`${path}.period: 2+ labels, e.g. ["\u0421\u0435\u0433\u043E\u0434\u043D\u044F", "\u041D\u0435\u0434\u0435\u043B\u044F", "\u041C\u0435\u0441\u044F\u0446", "\u041A\u0432\u0430\u0440\u0442\u0430\u043B"]`);
    }
    if (b.type === "form") {
      (b.fields || []).forEach((f, i) => {
        if (!(typeof f === "string" || (f == null ? void 0 : f.label))) errors.push(`${path}.fields[${i}]: needs a label`);
      });
    }
  }
  function validateSpec(spec) {
    const errors = [];
    if (!spec || typeof spec !== "object") return ["spec: not an object"];
    if (!spec.project) errors.push("project: required");
    if (!PLATFORMS[spec.platform || "web"]) errors.push(`platform: ${Object.keys(PLATFORMS).join(" | ")}`);
    for (const v of spec.viewports || []) if (!VIEWPORTS[v]) errors.push(`viewports: unknown "${v}"`);
    if (!Array.isArray(spec.screens) || !spec.screens.length) errors.push("screens: at least one screen");
    const navIds = new Set((spec.nav || []).map((n) => n.id));
    const ids = /* @__PURE__ */ new Set();
    (spec.screens || []).forEach((s, i) => {
      const p = `screens[${i}]`;
      if (!s.id) errors.push(`${p}.id: required`);
      if (ids.has(s.id)) errors.push(`${p}.id: duplicate "${s.id}"`);
      ids.add(s.id);
      if (!s.title) errors.push(`${p}.title: required`);
      if (s.nav && !navIds.has(s.nav)) errors.push(`${p}.nav: "${s.nav}" is not in nav`);
      for (const st of s.states || []) if (!STATES2.includes(st)) errors.push(`${p}.states: unknown "${st}"`);
      for (const v of s.viewports || []) if (!VIEWPORTS[v]) errors.push(`${p}.viewports: unknown "${v}"`);
      if (!Array.isArray(s.blocks) || !s.blocks.length) errors.push(`${p}.blocks: at least one block`);
      (s.blocks || []).forEach((b, j) => checkBlock(b, `${p}.blocks[${j}]`, errors));
    });
    return errors;
  }
  function statDelta(item) {
    var _a;
    const raw = String((_a = item == null ? void 0 : item.delta) != null ? _a : "").trim();
    if (!raw) return null;
    const at = raw.search(/\s(?=(к|за|от|vs|против|в сравнении)(\s|$))/i);
    const value = at > 0 ? raw.slice(0, at) : raw;
    const label2 = at > 0 ? raw.slice(at + 1) : "";
    const sign = /^[+▲↑]/.test(value) ? "up" : /^[-−–▼↓]/.test(value) ? "down" : null;
    const tone = item.tone || (!sign ? "neutral" : sign === (item.better || "up") ? "positive" : "negative");
    return { value, label: label2, tone };
  }
  function normalizeSpec(spec) {
    var _a, _b;
    const platform = spec.platform || "web";
    const viewport = ((_a = PLATFORMS[platform]) == null ? void 0 : _a.viewports[0]) || "desktop";
    const phone = VIEWPORTS[viewport] < 600;
    const section = (s) => {
      var _a2;
      return (_a2 = (spec.nav || []).find((n) => n.id === s.nav)) == null ? void 0 : _a2.label;
    };
    return __spreadProps(__spreadValues({}, spec), {
      platform,
      viewports: ((_b = spec.viewports) == null ? void 0 : _b.length) ? spec.viewports : [viewport],
      nav: spec.nav || [],
      user: spec.user || { name: "\u0410\u0439\u0433\u0443\u043B\u044C \u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B\u043E\u0432\u0430", role: "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440" },
      screens: spec.screens.map((s) => {
        var _a2, _b2, _c, _d;
        return __spreadProps(__spreadValues({
          shell: s.shell || (phone ? "mobile" : ((_a2 = spec.nav) == null ? void 0 : _a2.length) ? "sidebar" : "plain"),
          page: s.page || section(s) || s.title,
          states: ((_b2 = s.states) == null ? void 0 : _b2.length) ? s.states : ["default"]
        }, s), {
          viewports: ((_c = s.viewports) == null ? void 0 : _c.length) ? s.viewports : ((_d = spec.viewports) == null ? void 0 : _d.length) ? spec.viewports : [viewport]
        });
      })
    });
  }

  // plugin/src/shell.js
  var SIDEBAR = { desktop: 256, tablet: 72 };
  var PAD = { desktop: 32, tablet: 24, mobile: 16 };
  async function navItem(ctx, item, active, compact) {
    const texts = __spreadValues({ Count: !compact && item.badge ? String(item.badge) : null }, compact ? { Label: null } : {});
    const inst = await place(ctx, "nav-item", { props: { state: active ? "selected" : "default" }, label: item.label, texts, w: compact ? "hug" : "fill" });
    if (inst) {
      inst.name = `Nav / ${item.label}`;
      return link(inst, `nav:${item.id}`);
    }
    count(ctx, "nav-item", false);
    const it = box(ctx, `Nav / ${item.label}`, { dir: "H", gap: 10, pad: compact ? [10, 10] : [8, 12], radius: "md", align: "CENTER", fill: active ? "sidebar-accent" : null, w: compact ? "hug" : "fill", justify: compact ? "CENTER" : "MIN" });
    add(it, icon(ctx, item.icon || guessIcon(item.label), active ? "sidebar-accent-foreground" : "sidebar-foreground", 16));
    if (!compact) add(it, await text(ctx, item.label, { size: "sm", weight: active ? "medium" : "regular", color: active ? "sidebar-accent-foreground" : "sidebar-foreground", w: "fill" }));
    if (!compact && item.badge) add(it, await badge(ctx, String(item.badge), active ? "default" : "secondary"));
    return link(it, `nav:${item.id}`);
  }
  async function logo(ctx, spec, compact) {
    const l = box(ctx, "Logo", { dir: "H", gap: 10, align: "CENTER", pad: [4, compact ? 0 : 8], w: compact ? "hug" : "fill" });
    const mark = box(ctx, "Mark", { dir: "H", w: 32, h: 32, radius: "md", fill: "sidebar-primary", align: "CENTER", justify: "CENTER" });
    add(mark, await text(ctx, (spec.logo || spec.project).slice(0, 1).toUpperCase(), { size: "sm", weight: "bold", color: "sidebar-primary-foreground" }));
    add(l, mark);
    if (!compact) add(l, add(box(ctx, "Name", { gap: 0, w: "fill" }), await text(ctx, spec.project, { size: "sm", weight: "semibold", color: "sidebar-foreground", truncate: true, w: "fill" }), spec.subtitle && await text(ctx, spec.subtitle, { size: "xs", color: "muted-foreground" })));
    return l;
  }
  async function sidebar(ctx, spec, screen, vp) {
    const compact = vp === "tablet";
    const s = box(ctx, "Sidebar", { gap: 4, pad: compact ? [16, 12] : [16, 12], fill: "sidebar", stroke: "sidebar-border", w: SIDEBAR[vp], h: "fill", align: compact ? "CENTER" : "MIN" });
    add(s, await logo(ctx, spec, compact), box(ctx, "Gap", { h: 16 }));
    let group = null;
    for (const item of spec.nav) {
      const changed = item.group && item.group !== group;
      group = item.group || group;
      if (changed && !compact) add(s, add(box(ctx, "Group", { pad: [12, 12, 4, 12], w: "fill" }), await text(ctx, item.group, { size: "xs", weight: "medium", color: "muted-foreground" })));
      add(s, await navItem(ctx, item, item.id === screen.nav, compact));
    }
    add(s, box(ctx, "Spacer", { h: "fill" }));
    const user = box(ctx, "User", { dir: "H", gap: 10, pad: [8, compact ? 0 : 8], align: "CENTER", w: compact ? "hug" : "fill" });
    add(user, await avatar(ctx, spec.user.name));
    if (!compact) add(user, add(box(ctx, "Who", { gap: 0, w: "fill" }), await text(ctx, spec.user.name, { size: "sm", weight: "medium", color: "sidebar-foreground", truncate: true, w: "fill" }), await text(ctx, spec.user.role, { size: "xs", color: "muted-foreground" })));
    return add(s, user);
  }
  async function topbar(ctx, spec, screen, vp) {
    const t = box(ctx, "Topbar", { dir: "H", gap: 12, pad: [12, PAD[vp]], align: "CENTER", fill: "background", stroke: "border", w: "fill", h: 60 });
    if (vp === "mobile") add(t, icon(ctx, "menu", "foreground", 20), await text(ctx, screen.title, { size: "base", weight: "semibold", w: "fill", truncate: true }));
    else add(t, await input(ctx, spec.searchPlaceholder || "\u041F\u043E\u0438\u0441\u043A\u2026", { w: 320, kind: "search-input" }), box(ctx, "Spacer", { w: "fill" }));
    return add(t, icon(ctx, "bell", "muted-foreground", 18), await avatar(ctx, spec.user.name));
  }
  async function mobileBar(ctx, screen) {
    const bar2 = box(ctx, "App bar", { dir: "H", gap: 12, pad: [12, 16], align: "CENTER", fill: "background", w: "fill", h: 56 });
    if (screen.back) add(bar2, link(icon(ctx, "back", "foreground", 22), "back"));
    return add(bar2, await text(ctx, screen.title, { size: "lg", weight: "semibold", w: "fill", truncate: true }), icon(ctx, "bell", "foreground", 20));
  }
  async function tabbar(ctx, spec, screen) {
    const bar2 = box(ctx, "Tab bar", { dir: "H", pad: [8, 8, 24, 8], fill: "background", stroke: "border", w: "fill", justify: "SPACE_BETWEEN" });
    for (const item of spec.nav.slice(0, 5)) {
      const on = item.id === screen.nav;
      const inst = await place(ctx, "tabbar-item", { props: { state: on ? "selected" : "default" }, label: item.label, w: "fill" });
      if (inst) {
        inst.name = `Tab / ${item.label}`;
        add(bar2, link(inst, `nav:${item.id}`));
        continue;
      }
      count(ctx, "tabbar-item", false);
      const it = link(box(ctx, `Tab / ${item.label}`, { gap: 4, align: "CENTER", pad: [4, 6], w: "fill" }), `nav:${item.id}`);
      add(bar2, add(it, icon(ctx, item.icon || guessIcon(item.label), on ? "primary" : "muted-foreground", 22), await text(ctx, item.label, { size: "xs", weight: on ? "medium" : "regular", color: on ? "primary" : "muted-foreground", align: "CENTER" })));
    }
    return bar2;
  }
  async function shell(ctx, spec, screen, vp, frameWidth) {
    const frame = box(ctx, "Screen", { dir: screen.shell === "sidebar" && vp !== "mobile" ? "H" : "V", fill: "background", w: frameWidth, clip: true });
    frame.primaryAxisSizingMode = screen.shell === "sidebar" && vp !== "mobile" ? "FIXED" : "AUTO";
    frame.counterAxisSizingMode = screen.shell === "sidebar" && vp !== "mobile" ? "AUTO" : "FIXED";
    const pad = PAD[vp];
    const content = box(ctx, "Content", { gap: vp === "mobile" ? 16 : 24, pad: screen.shell === "mobile" ? [8, 16, 24, 16] : [pad, pad, pad * 1.5, pad], w: "fill" });
    let width = frameWidth - pad * 2;
    let push = null;
    if (screen.shell === "sidebar" && vp !== "mobile") {
      const main = box(ctx, "Main", { w: "fill", h: "hug" });
      add(frame, await sidebar(ctx, spec, screen, vp), main);
      add(main, await topbar(ctx, spec, screen, vp), content);
      width -= SIDEBAR[vp];
      frame.counterAxisAlignItems = "MIN";
    } else if (screen.shell === "sidebar") {
      add(frame, await topbar(ctx, spec, screen, vp), content);
    } else if (screen.shell === "mobile") {
      add(frame, await mobileBar(ctx, screen), content);
      if (spec.nav.length && screen.tabbar !== false) {
        push = box(ctx, "Push", { w: "fill" });
        add(frame, push, await tabbar(ctx, spec, screen));
      }
    } else {
      add(frame, content);
      fill(frame, ctx, "muted", 0.4);
    }
    return { frame, content, width, push };
  }

  // plugin/src/blocks-data.js
  var blocks_data_exports = {};
  __export(blocks_data_exports, {
    card: () => card,
    cards: () => cards,
    chart: () => chart,
    details: () => details,
    kanban: () => kanban,
    list: () => list,
    stats: () => stats,
    table: () => table,
    timeline: () => timeline
  });
  var card = (ctx, name, o = {}) => {
    var _a, _b;
    return box(ctx, name, __spreadValues({ gap: (_a = o.gap) != null ? _a : 16, pad: (_b = o.pad) != null ? _b : 24, fill: "card", stroke: "border", radius: "xl", w: "fill" }, o));
  };
  async function cardTitle(ctx, title, sub) {
    const h = box(ctx, "Card header", { gap: 4, w: "fill" });
    return add(h, await text(ctx, title, { size: "base", weight: "semibold", w: "fill" }), sub && await text(ctx, sub, { size: "sm", color: "muted-foreground", w: "fill" }));
  }
  var cols = (ctx, desktop) => ctx.vp === "mobile" ? Math.min(desktop, 1) : ctx.vp === "tablet" ? Math.min(desktop, 2) : desktop;
  var DELTA_TONE = { positive: "primary", negative: "destructive", neutral: "muted-foreground" };
  async function kpiCard(ctx, it, w) {
    const d = ctx.state !== "empty" ? statDelta(it) : null;
    const note = d ? ctx.vp !== "mobile" && d.label || null : it.hint || null;
    const texts = { Label: it.label, Value: ctx.state === "empty" ? "0" : it.value, Delta: d || note ? true : null, "Delta value": d ? d.value : null, "Delta label": note };
    const inst = await place(ctx, "crm-kpi-card", { texts, colors: d ? { "Delta value": DELTA_TONE[d.tone] } : {}, w });
    if (inst) inst.name = `Stat / ${it.label}`;
    return inst;
  }
  async function stats(ctx, b) {
    const row = box(ctx, "Stats", { dir: "H", gap: 16, w: ctx.width, wrap: true });
    const per = ctx.vp === "mobile" ? 2 : cols(ctx, b.items.length > 4 ? 4 : b.items.length);
    const w = Math.floor((ctx.width - 16 * (per - 1)) / per);
    for (const it of b.items) {
      if (ctx.state !== "loading") {
        const kpi = await kpiCard(ctx, it, w);
        if (kpi) {
          add(row, kpi);
          continue;
        }
        count(ctx, "crm-kpi-card", false);
      }
      const c = card(ctx, `Stat / ${it.label}`, { gap: 8, pad: 20, w });
      if (ctx.state === "loading") add(c, await skeleton(ctx, 96, 12), await skeleton(ctx, 140, 28, "md"), await skeleton(ctx, 72, 10));
      else {
        const value = ctx.state === "empty" ? "0" : it.value;
        const d = ctx.state !== "empty" ? statDelta(it) : null;
        const tone = { positive: "primary", negative: "destructive", neutral: "muted-foreground" };
        const delta = d ? add(
          box(ctx, "Delta", { dir: "H", gap: 4, align: "CENTER" }),
          await text(ctx, d.value, { size: "xs", weight: "medium", color: tone[d.tone] }),
          d.label && ctx.vp !== "mobile" && await text(ctx, d.label, { size: "xs", color: "muted-foreground" })
        ) : null;
        const top = box(ctx, "Top", { dir: "H", gap: 8, align: "CENTER", w: "fill" });
        add(top, await text(ctx, it.label, { size: "sm", weight: "medium", color: "muted-foreground", w: "fill" }));
        if (it.icon && ctx.vp !== "mobile") {
          const tile = box(ctx, "Icon", { dir: "H", w: 32, h: 32, radius: "md", align: "CENTER", justify: "CENTER" });
          fill(tile, ctx, "muted");
          add(top, add(tile, icon(ctx, it.icon, "foreground", 16)));
        }
        add(
          c,
          top,
          await text(ctx, value, { size: ctx.vp === "mobile" ? "xl" : "2xl", weight: "bold" }),
          delta || it.hint && await text(ctx, it.hint, { size: "xs", color: "muted-foreground" })
        );
      }
      add(row, c);
    }
    return row;
  }
  async function cell(ctx, type, value, w) {
    const c = box(ctx, "Cell", { dir: "H", gap: 8, pad: [12, 12], align: "CENTER", w, h: 52 });
    if (ctx.state === "loading") return add(c, await skeleton(ctx, Math.max(40, Math.min(w - 24, 60 + w % 70)), 12));
    if (type === "status") return add(c, await badge(ctx, value, statusVariant(value)));
    if (type === "person") return add(c, await avatar(ctx, value, 28), await text(ctx, value, { size: "sm", weight: "medium", truncate: true }));
    const muted = type === "actions" || ["id", "date", "datetime", "phone", "email"].includes(type);
    const inst = await place(ctx, "table-cell", { texts: { Text: type === "actions" ? "\u2022\u2022\u2022" : value }, colors: muted ? { Text: "muted-foreground" } : {}, w, h: 52 });
    if (inst) {
      c.remove();
      inst.name = "Cell";
      return inst;
    }
    count(ctx, "table-cell", false);
    if (type === "actions") return add(c, await text(ctx, "\u2022\u2022\u2022", { size: "sm", color: "muted-foreground" }));
    const color = ["id", "date", "datetime", "phone", "email"].includes(type) ? "muted-foreground" : "foreground";
    const t = await text(ctx, value, { size: "sm", color, weight: type === "money" ? "medium" : "regular", truncate: true });
    if (type === "money") c.primaryAxisAlignItems = "MAX";
    return add(c, t);
  }
  var WEIGHT = { id: 1, person: 1.6, company: 1.6, money: 1.1, status: 1, date: 1, datetime: 1.2, actions: 0.4, email: 1.6, text: 1.6 };
  async function mobileRows(ctx, b, columns, rows) {
    const list2 = card(ctx, "List", { gap: 0, pad: 0 });
    for (const r of rows) {
      const item = link(box(ctx, "Row", { dir: "H", gap: 12, pad: 16, w: "fill", align: "CENTER", stroke: "border" }), b.link && `row:${b.link}`);
      const main = box(ctx, "Main", { gap: 4, w: "fill" });
      const pi = columns.findIndex((c) => c.type === "person" || c.type === "company");
      const si = columns.findIndex((c) => c.type === "status");
      const mi = columns.findIndex((c) => c.type === "money");
      if (ctx.state === "loading") add(main, await skeleton(ctx, 140, 12), await skeleton(ctx, 90, 10));
      else add(
        main,
        await text(ctx, r[pi >= 0 ? pi : 0], { size: "sm", weight: "medium", w: "fill", truncate: true }),
        await text(ctx, r[0], { size: "xs", color: "muted-foreground" })
      );
      const side = box(ctx, "Side", { gap: 4, align: "MAX" });
      if (ctx.state !== "loading") add(side, mi >= 0 && await text(ctx, r[mi], { size: "sm", weight: "medium" }), si >= 0 && await badge(ctx, r[si], statusVariant(r[si])));
      add(list2, add(item, main, side));
    }
    return list2;
  }
  async function table(ctx, b) {
    const columns = b.columns.map(parseColumn);
    const count2 = ctx.state === "loading" ? Math.min(b.rows || 8, 6) : b.rows || 8;
    const rows = b.data || fakeRows(b.columns, count2, (b.seed || 7) + ctx.seed, b.statuses);
    const head = b.title ? await cardTitle(ctx, b.title, b.subtitle) : null;
    if (ctx.vp === "mobile") {
      const wrap = box(ctx, "Table (mobile)", { gap: 12, w: "fill" });
      return add(wrap, head, await mobileRows(ctx, b, columns, rows));
    }
    const t = card(ctx, b.title || "Table", { gap: 0, pad: 0, clip: true });
    if (head) add(t, add(box(ctx, "Head", { pad: [20, 24], w: "fill" }), head));
    const sel = b.selectable ? 44 : 0;
    const total = columns.reduce((s, c) => s + (WEIGHT[c.type] || 1), 0);
    const avail = ctx.width - 2 - sel;
    const widths = columns.map((c) => Math.floor(avail * (WEIGHT[c.type] || 1) / total));
    const hr = box(ctx, "Header row", { dir: "H", fill: "muted", fillOpacity: 0.5, w: "fill" });
    if (sel) add(hr, add(box(ctx, "Select", { pad: [0, 14], align: "CENTER", justify: "CENTER", h: 40 }), await checkbox(ctx)));
    for (let i = 0; i < columns.length; i++) {
      const th = await place(ctx, "table-head", { props: { sort: "none" }, label: columns[i].label, w: widths[i], h: 40 });
      if (th) {
        th.name = `Head / ${columns[i].label}`;
        add(hr, th);
        continue;
      }
      count(ctx, "table-head", false);
      const h = box(ctx, `Head / ${columns[i].label}`, { dir: "H", pad: [10, 12], align: "CENTER", w: widths[i], h: 40 });
      if (columns[i].type === "money") h.primaryAxisAlignItems = "MAX";
      add(hr, add(h, await text(ctx, columns[i].label, { size: "xs", weight: "medium", color: "muted-foreground" })));
    }
    add(t, hr);
    for (const [ri, r] of rows.entries()) {
      const row = link(box(ctx, `Row ${ri + 1}`, { dir: "H", w: "fill", align: "CENTER" }), b.link && `row:${b.link}`);
      add(t, sizing(rect(ctx, "Divider", avail + sel, 1, "border"), "fill"));
      if (sel) add(row, add(box(ctx, "Select", { pad: [0, 14], align: "CENTER", justify: "CENTER", h: 52 }), await checkbox(ctx, ri === 1)));
      for (let i = 0; i < columns.length; i++) add(row, await cell(ctx, columns[i].type, r[i], widths[i]));
      add(t, row);
    }
    return t;
  }
  async function kanban(ctx, b) {
    const board = box(ctx, "Kanban", { dir: ctx.vp === "mobile" ? "V" : "H", gap: 16, w: "fill" });
    const list2 = ctx.vp === "mobile" ? b.columns.slice(0, 2) : b.columns;
    const colW = ctx.vp === "mobile" ? ctx.width : Math.floor((ctx.width - 16 * (list2.length - 1)) / list2.length);
    const r = rng(11 + ctx.seed);
    for (const [ci, col] of list2.entries()) {
      const name = typeof col === "string" ? col : col.title;
      const n = ctx.state === "empty" ? 0 : typeof col === "object" && col.count != null ? col.count : 2 + Math.floor(r() * 3);
      const c = box(ctx, `Column / ${name}`, { gap: 12, pad: 12, fill: "muted", fillOpacity: 0.6, radius: "xl", w: colW });
      const head = box(ctx, "Head", { dir: "H", gap: 8, align: "CENTER", w: "fill" });
      add(head, await text(ctx, name, { size: "sm", weight: "semibold" }), await badge(ctx, String(n), "outline"));
      add(c, head);
      const shown = Math.min(n, ctx.state === "loading" ? 2 : 3);
      for (let i = 0; i < shown; i++) {
        const k = link(card(ctx, "Card", { gap: 8, pad: 12 }), b.link && `row:${b.link}`);
        if (ctx.state === "loading") add(k, await skeleton(ctx, 80, 10), await skeleton(ctx, "fill", 12), await skeleton(ctx, 60, 10));
        else {
          const [id, who, sum, product] = fakeRows([":id", ":person", ":money", ":product"], ci * 3 + i + 1, 31 + ci * 5 + i + ctx.seed).at(-1);
          const late = i === 0 && ci === 1;
          const app = await place(ctx, "crm-application-card", {
            texts: { ID: id, Time: b.badge !== false ? late ? "SLA" : `${10 + i * 7} \u043C\u0438\u043D` : null, Name: who, Amount: sum, Meta: product },
            colors: late ? { Time: "destructive" } : {},
            nested: { "Badge-status": { label: name } },
            w: "fill"
          });
          if (app) {
            k.remove();
            add(c, link(app, b.link && `row:${b.link}`));
            continue;
          }
          count(ctx, "crm-application-card", false);
          const inner = colW - 48;
          const top = box(ctx, "Top", { dir: "H", align: "CENTER", justify: "SPACE_BETWEEN", w: inner });
          add(top, await text(ctx, id, { size: "xs", color: "muted-foreground" }), b.badge !== false && await badge(ctx, late ? "SLA" : `${10 + i * 7} \u043C\u0438\u043D`, late ? "destructive" : "secondary"));
          const who_ = box(ctx, "Client", { dir: "H", gap: 8, align: "CENTER", w: inner });
          add(who_, await avatar(ctx, who, 24), await text(ctx, who, { size: "sm", weight: "medium", w: "fill", truncate: true }));
          const foot = box(ctx, "Sum", { gap: 2, w: inner });
          add(foot, await text(ctx, sum, { size: "sm", weight: "semibold" }), await text(ctx, product, { size: "xs", color: "muted-foreground" }));
          add(k, top, who_, foot);
        }
        add(c, k);
      }
      if (n > shown && ctx.state === "default") add(c, await text(ctx, `\u0415\u0449\u0451 ${n - shown}`, { size: "xs", weight: "medium", color: "muted-foreground" }));
      add(board, c);
    }
    return board;
  }
  async function chart(ctx, b) {
    const c = card(ctx, b.title || "Chart");
    const head = box(ctx, "Chart head", { dir: ctx.vp === "mobile" ? "V" : "H", gap: 12, align: ctx.vp === "mobile" ? "MIN" : "CENTER", w: "fill" });
    add(head, await cardTitle(ctx, b.title || "\u0414\u0438\u043D\u0430\u043C\u0438\u043A\u0430", b.subtitle));
    const series = b.series || [];
    if (series.length) {
      const legend = box(ctx, "Legend", { dir: "H", gap: 16, align: "CENTER" });
      for (const [i, name] of series.entries()) add(legend, add(box(ctx, `Legend / ${name}`, { dir: "H", gap: 6, align: "CENTER" }), rect(ctx, "Dot", 8, 8, `chart-${i + 1}`, "full"), await text(ctx, name, { size: "xs", color: "muted-foreground" })));
      add(head, legend);
    }
    add(c, head);
    const labels = b.labels || (ctx.vp === "mobile" ? ["09", "11", "13", "15", "17", "19", "21"] : ["09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"]);
    const n = ctx.vp === "mobile" ? Math.min(7, labels.length) : labels.length;
    const k = Math.max(1, series.length);
    const gap = ctx.vp === "mobile" ? 6 : 12;
    const slot = Math.floor((ctx.width - 48 - (n - 1) * gap) / n);
    const barW = Math.max(4, Math.floor((slot - (k - 1) * 3) / k));
    const H = b.height || 200;
    const plot = box(ctx, "Plot", { dir: "H", gap, align: "MAX", w: "fill" });
    const r = rng(5 + ctx.seed);
    for (let i = 0; i < n; i++) {
      const col = box(ctx, `Slot / ${labels[i]}`, { gap: 8, align: "CENTER", w: slot });
      const bars = box(ctx, "Bars", { dir: "H", gap: 3, align: "MAX", h: H });
      for (let j = 0; j < k; j++) {
        const h = ctx.state === "loading" ? 40 + (i * 37 + j * 19) % 120 : Math.round((j ? 0.25 : 0.45) * H + r() * (j ? 0.25 : 0.5) * H);
        const tone = ctx.state === "loading" ? "muted" : k > 1 ? `chart-${j + 1}` : i === n - 2 ? "chart-1" : "chart-2";
        add(bars, rect(ctx, "Bar", barW, h, tone, "sm"));
      }
      add(col, bars, await text(ctx, labels[i], { size: "xs", color: "muted-foreground" }));
      add(plot, col);
    }
    return add(c, plot);
  }
  var STATUS_TONE = { success: "primary", destructive: "destructive", warning: "muted-foreground", info: "primary", secondary: "muted-foreground" };
  var initials = (name) => String(name).split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  async function list(ctx, b) {
    const c = card(ctx, b.title || "List", { gap: 0, pad: 0 });
    if (b.title) add(c, add(box(ctx, "Head", { pad: [20, 24, 8, 24], w: "fill" }), await cardTitle(ctx, b.title, b.subtitle)));
    const items = b.items || fakeRows([":person", ":text", ":status"], b.rows || 5, 21 + ctx.seed, b.statuses);
    for (const it of items) {
      const [who, what, st] = Array.isArray(it) ? it : [it.title, it.subtitle, it.status];
      const row = link(box(ctx, "Item", { dir: "H", gap: 12, pad: [12, 24], align: "CENTER", w: "fill" }), b.link && `row:${b.link}`);
      if (ctx.state === "loading") {
        add(row, await skeleton(ctx, 32, 32, "full"), add(box(ctx, "Lines", { gap: 6, w: "fill" }), await skeleton(ctx, 140, 12), await skeleton(ctx, 90, 10)));
        add(c, row);
        continue;
      }
      const item = await place(ctx, "crm-list-item", { texts: { Title: who, Subtitle: what || null, Meta: st || null }, colors: st ? { Meta: STATUS_TONE[statusVariant(st)] } : {}, nested: { Avatar: { label: initials(who) } }, w: "fill" });
      if (item) {
        row.remove();
        add(c, link(item, b.link && `row:${b.link}`));
        continue;
      }
      count(ctx, "crm-list-item", false);
      const main = box(ctx, "Text", { gap: 2, w: "fill" });
      add(main, await text(ctx, who, { size: "sm", weight: "medium", w: "fill", truncate: true }), what && await text(ctx, what, { size: "xs", color: "muted-foreground", w: "fill" }));
      add(c, add(row, await avatar(ctx, who), main, st && await badge(ctx, st, statusVariant(st))));
    }
    return c;
  }
  async function timeline(ctx, b) {
    const c = card(ctx, b.title || "Timeline", { gap: 0 });
    add(c, await cardTitle(ctx, b.title || "\u0418\u0441\u0442\u043E\u0440\u0438\u044F"));
    const items = b.items || [["\u0417\u0430\u044F\u0432\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0430", "21.10.2026, 09:12"], ["\u0421\u043A\u043E\u0440\u0438\u043D\u0433 \u043F\u0440\u043E\u0439\u0434\u0435\u043D", "21.10.2026, 09:40"], ["\u041F\u0435\u0440\u0435\u0434\u0430\u043D\u0430 \u0432 \u0421\u0411", "21.10.2026, 10:05"]];
    for (const [i, it] of items.entries()) {
      const [title, when] = Array.isArray(it) ? it : [it.title, it.time];
      const ev = ctx.state !== "loading" && await place(ctx, "crm-timeline-item", { texts: { Title: title, Meta: when }, w: "fill" });
      if (ev) {
        ev.name = "Event";
        add(c, ev);
        continue;
      }
      if (ctx.state !== "loading") count(ctx, "crm-timeline-item", false);
      const row = box(ctx, "Event", { dir: "H", gap: 12, pad: [12, 0, 0, 0], w: "fill" });
      add(row, rect(ctx, "Dot", 8, 8, i === items.length - 1 ? "primary" : "border", "full"));
      const t = box(ctx, "Text", { gap: 2, w: "fill" });
      if (ctx.state === "loading") add(t, await skeleton(ctx, 160, 12), await skeleton(ctx, 100, 10));
      else add(t, await text(ctx, title, { size: "sm", weight: "medium" }), await text(ctx, when, { size: "xs", color: "muted-foreground" }));
      add(c, add(row, t));
    }
    return c;
  }
  async function cards(ctx, b) {
    const grid = box(ctx, "Cards", { dir: "H", gap: 16, w: ctx.width, wrap: true });
    const per = cols(ctx, b.columns || 3);
    const w = Math.floor((ctx.width - 16 * (per - 1)) / per);
    for (const it of b.items) {
      const c = link(card(ctx, `Card / ${it.title}`, { gap: 8, pad: 20, w }), (it.link || b.link) && `row:${it.link || b.link}`);
      if (ctx.state === "loading") add(c, await skeleton(ctx, 120, 14), await skeleton(ctx, "fill", 10), await skeleton(ctx, 160, 10));
      else add(c, await text(ctx, it.title, { size: "base", weight: "semibold" }), it.text && await text(ctx, it.text, { size: "sm", color: "muted-foreground", w: "fill" }), it.badge && await badge(ctx, it.badge, statusVariant(it.badge)));
      add(grid, c);
    }
    return grid;
  }
  async function details(ctx, b) {
    const c = card(ctx, b.title || "Details");
    if (b.title) add(c, await cardTitle(ctx, b.title, b.subtitle));
    const per = cols(ctx, b.columns || 2);
    const grid = box(ctx, "Fields", { dir: "H", gap: 16, w: ctx.width - 48, wrap: true });
    const w = Math.floor((ctx.width - 48 - 16 * (per - 1)) / per);
    for (const it of b.items) {
      const [label2, value] = Array.isArray(it) ? it : typeof it === "string" ? it.split(":") : [it.label, it.value];
      const v = value && !["money", "person", "phone", "date", "id", "product", "city", "company"].includes(value) ? value : fakeRows([`x:${value || "text"}`], 1, label2.length + ctx.seed)[0][0];
      const kv = ctx.state !== "loading" && await place(ctx, "crm-key-value-row", { texts: { Label: label2, Value: v }, w });
      if (kv) {
        kv.name = `Field / ${label2}`;
        add(grid, kv);
        continue;
      }
      if (ctx.state !== "loading") count(ctx, "crm-key-value-row", false);
      const f = box(ctx, `Field / ${label2}`, { gap: 4, w });
      add(f, await text(ctx, label2, { size: "xs", color: "muted-foreground" }), ctx.state === "loading" ? await skeleton(ctx, 120, 12) : await text(ctx, v, { size: "sm", weight: "medium", w: "fill" }));
      add(grid, f);
    }
    return add(c, grid);
  }

  // plugin/src/blocks-ui.js
  var blocks_ui_exports = {};
  __export(blocks_ui_exports, {
    SPLIT_GAP: () => SPLIT_GAP,
    alert: () => alert,
    empty: () => empty,
    form: () => form,
    header: () => header,
    login: () => login,
    pagination: () => pagination,
    stepper: () => stepper,
    tabs: () => tabs,
    toolbar: () => toolbar
  });

  // core/links.js
  var ARROW = /\s*(?:→|->)\s*([\w-]+)\s*$/;
  function parseAction(a) {
    var _a;
    if (a && typeof a === "object") return { label: String((_a = a.label) != null ? _a : ""), to: a.to || null };
    const s = String(a != null ? a : "");
    const m = s.match(ARROW);
    return m ? { label: s.slice(0, m.index), to: m[1] } : { label: s, to: null };
  }
  var actionLabel = (a) => parseAction(a).label.replace(/^\+\s*/, "").trim();
  var isPrimaryAction = (a) => parseAction(a).label.trim().startsWith("+");
  var LISTS = ["table", "list", "kanban", "cards"];
  var KINDS2 = ["nav", "action", "row", "back", "submit", "cancel", "text"];
  function walkBlocks(blocks, fn) {
    for (const b of blocks || []) {
      if (!b || typeof b !== "object") continue;
      fn(b);
      if (b.type === "split") for (const col of b.columns || []) walkBlocks(col, fn);
    }
  }
  function linkKey(on) {
    const s = String(on != null ? on : "").trim();
    const kind = s.split(":")[0];
    if (KINDS2.includes(s) || s.includes(":") && KINDS2.includes(kind)) return s;
    return `text:${s.replace(/^\+\s*/, "")}`;
  }
  function linkTargets(spec) {
    const out = [];
    const act = (a, path) => {
      const { to } = parseAction(a);
      if (to) out.push({ path, to });
    };
    (spec.screens || []).forEach((s, i) => {
      var _a;
      const p = `screens[${i}]`;
      if (s.parent) out.push({ path: `${p}.parent`, to: s.parent });
      if ((_a = s.empty) == null ? void 0 : _a.action) act(s.empty.action, `${p}.empty.action`);
      walkBlocks(s.blocks, (b) => {
        const bp = `${p}.${b.type}`;
        if (b.link) out.push({ path: `${bp}.link`, to: b.link });
        if (b.to) out.push({ path: `${bp}.to`, to: b.to });
        if (b.cancelTo) out.push({ path: `${bp}.cancelTo`, to: b.cancelTo });
        for (const it of b.type === "cards" ? b.items || [] : []) if (it == null ? void 0 : it.link) out.push({ path: `${bp}.items.link`, to: it.link });
        for (const a of b.actions || []) act(a, `${bp}.actions`);
        if (b.action) act(b.action, `${bp}.action`);
        if (b.more) act(b.more, `${bp}.more`);
      });
    });
    (spec.links || []).forEach((l, i) => {
      out.push({ path: `links[${i}].from`, to: l == null ? void 0 : l.from });
      out.push({ path: `links[${i}].to`, to: l == null ? void 0 : l.to });
    });
    return out;
  }
  function validateLinks(spec) {
    const errors = [];
    if (!spec || !Array.isArray(spec.screens)) return errors;
    if (spec.links != null && !Array.isArray(spec.links)) return ["links: array of { from, on, to }"];
    const ids = new Set(spec.screens.map((s) => s == null ? void 0 : s.id));
    (spec.links || []).forEach((l, i) => {
      if (!(l == null ? void 0 : l.on)) errors.push(`links[${i}].on: required (text on the screen or a key like "action:\u042D\u043A\u0441\u043F\u043E\u0440\u0442")`);
    });
    for (const t of linkTargets(spec)) if (!ids.has(t.to)) errors.push(`${t.path}: unknown screen "${t.to}"`);
    return errors;
  }
  function resolveLinks(spec) {
    var _a, _b, _c;
    const screens = spec.screens;
    const first = {};
    for (const s of screens) if (s.nav && !first[s.nav]) first[s.nav] = s.id;
    const parentOf2 = (s) => s.parent || (s.nav && first[s.nav] !== s.id ? first[s.nav] : null);
    const hasForm = (s) => {
      let f = false;
      walkBlocks(s.blocks, (b) => {
        if (b.type === "form") f = true;
      });
      return f;
    };
    const formIn = (s) => {
      const c = screens.filter((x) => x.id !== s.id && x.nav && x.nav === s.nav && hasForm(x));
      return c.length === 1 ? c[0].id : null;
    };
    const home = first[(_a = spec.nav[0]) == null ? void 0 : _a.id] || ((_b = screens.find((s) => s.shell !== "plain")) == null ? void 0 : _b.id) || null;
    const map = /* @__PURE__ */ new Map();
    for (const s of screens) {
      const put = (on, to) => {
        if (to && to !== s.id && !map.has(`${s.id}|${on}`)) map.set(`${s.id}|${on}`, { from: s.id, on, to, auto: true });
      };
      const action = (a) => {
        const { to } = parseAction(a);
        put(`action:${actionLabel(a)}`, to || (isPrimaryAction(a) ? formIn(s) : null));
      };
      if (s.shell !== "plain") for (const n of spec.nav) put(`nav:${n.id}`, first[n.id]);
      put("back", parentOf2(s));
      if ((_c = s.empty) == null ? void 0 : _c.action) action(s.empty.action);
      walkBlocks(s.blocks, (b) => {
        if (LISTS.includes(b.type) && b.link) put(`row:${b.link}`, b.link);
        if (b.type === "cards") {
          for (const it of b.items || []) if (it == null ? void 0 : it.link) put(`row:${it.link}`, it.link);
        }
        for (const a of b.actions || []) action(a);
        if (b.action && ["empty", "alert"].includes(b.type)) action(b.action);
        if (b.more) action(b.more);
        if (b.type === "form") {
          put("submit", b.to || parentOf2(s));
          put("cancel", b.cancelTo || b.to || parentOf2(s));
        }
        if (b.type === "login") put("submit", b.to || home);
      });
    }
    for (const l of spec.links || []) map.set(`${l.from}|${linkKey(l.on)}`, { from: l.from, on: linkKey(l.on), to: l.to, auto: false });
    return [...map.values()];
  }

  // plugin/src/blocks-ui.js
  var actionButton = async (ctx, a, variant, sz) => link(await button(ctx, actionLabel(a), variant, sz), `action:${actionLabel(a)}`);
  async function breadcrumbs(ctx, items) {
    const row = box(ctx, "Breadcrumbs", { dir: "H", gap: 6, align: "CENTER" });
    for (const [i, label2] of items.entries()) {
      const inst = await place(ctx, "breadcrumb-item", { props: { current: i === items.length - 1 ? "true" : "false" }, label: label2 });
      if (!inst) {
        row.remove();
        for (let k = i; k < items.length; k++) count(ctx, "breadcrumb-item", false);
        return link(await text(ctx, items.join("  /  "), { size: "sm", color: "muted-foreground" }), "back");
      }
      add(row, inst);
    }
    return link(row, "back");
  }
  async function header(ctx, b) {
    var _a, _b, _c;
    const mobile = ctx.vp === "mobile";
    const h = box(ctx, "Page header", { dir: mobile ? "V" : "H", gap: 16, align: mobile ? "MIN" : "CENTER", justify: "SPACE_BETWEEN", w: "fill" });
    const left = box(ctx, "Title", { gap: 6, w: mobile ? "fill" : "hug" });
    if (b.breadcrumbs) add(left, await breadcrumbs(ctx, b.breadcrumbs));
    const titleRow = box(ctx, "Title row", { dir: "H", gap: 12, align: "CENTER" });
    add(titleRow, await text(ctx, b.title, { size: mobile ? "xl" : "2xl", weight: "bold" }), b.badge && await badge(ctx, b.badge, "secondary"));
    add(left, titleRow, b.subtitle && await text(ctx, b.subtitle, { size: "sm", color: "muted-foreground" }));
    add(h, left);
    if (mobile && b.period) add(h, await tabs(ctx, { items: b.period.slice(0, 3), active: (_a = b.periodActive) != null ? _a : 0 }));
    if (((_b = b.actions) == null ? void 0 : _b.length) || b.period && !mobile) {
      const acts = box(ctx, "Actions", { dir: "H", gap: 8, align: "CENTER", wrap: mobile, w: mobile ? ctx.width : "hug" });
      if (b.period && !mobile) add(acts, await tabs(ctx, { items: b.period, active: (_c = b.periodActive) != null ? _c : 0 }));
      for (const a of b.actions || []) add(acts, await actionButton(ctx, a, isPrimaryAction(a) ? "default" : "outline"));
      add(h, acts);
    }
    return h;
  }
  async function toolbar(ctx, b) {
    var _a, _b;
    const mobile = ctx.vp === "mobile";
    const t = box(ctx, "Toolbar", { dir: mobile ? "V" : "H", gap: 8, align: mobile ? "MIN" : "CENTER", w: "fill" });
    const search = await input(ctx, b.search || "\u041F\u043E\u0438\u0441\u043A\u2026", { w: mobile ? "fill" : 320, kind: "search-input" });
    add(t, search);
    if (mobile && "layoutSizingHorizontal" in search) search.layoutSizingHorizontal = "FILL";
    const filters = box(ctx, "Filters", { dir: "H", gap: 8, wrap: true, w: mobile ? "fill" : "hug" });
    for (const f of b.filters || []) {
      const chip = await place(ctx, "filter-chip", { props: { state: "default" }, label: f });
      if (!chip) count(ctx, "filter-chip", "stand-in");
      add(filters, chip || await button(ctx, `${f}  \u25BE`, "outline", "sm"));
    }
    if (((_a = b.filters) == null ? void 0 : _a.length) && !mobile) add(filters, await button(ctx, "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C", "ghost", "sm"));
    add(t, filters);
    if (((_b = b.actions) == null ? void 0 : _b.length) && !mobile) {
      add(t, box(ctx, "Spacer", { w: "fill", h: 1 }));
      for (const a of b.actions) add(t, await actionButton(ctx, a, isPrimaryAction(a) ? "default" : "outline", "sm"));
    }
    return t;
  }
  async function pagination(ctx, b) {
    const p = box(ctx, "Pagination", { dir: "H", gap: 8, align: "CENTER", justify: "SPACE_BETWEEN", w: "fill" });
    add(p, ctx.state === "loading" ? await skeleton(ctx, 140, 12) : await text(ctx, b.summary || "\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E 1\u20138 \u0438\u0437 128", { size: "sm", color: "muted-foreground" }));
    const pages = box(ctx, "Pages", { dir: "H", gap: 4, align: "CENTER" });
    add(pages, await button(ctx, "\u2039 \u041D\u0430\u0437\u0430\u0434", "ghost", "sm"));
    if (ctx.vp !== "mobile") {
      for (const n of ["1", "2", "3", "\u2026", "16"]) {
        const item = await place(ctx, "pagination", { props: { state: n === "1" ? "selected" : "default", size: "sm" }, label: n });
        if (!item) count(ctx, "pagination", "stand-in");
        add(pages, item || await button(ctx, n, n === "1" ? "outline" : "ghost", "sm"));
      }
    }
    add(pages, await button(ctx, "\u0412\u043F\u0435\u0440\u0451\u0434 \u203A", "ghost", "sm"));
    return add(p, pages);
  }
  var tabState = (i, active) => ({ variant: "segment", state: i === active ? "selected" : "default" });
  async function tabs(ctx, b) {
    var _a;
    const active = (_a = b.active) != null ? _a : 0;
    const items = ctx.vp === "mobile" ? b.items.slice(0, 3) : b.items;
    if (items.length === 3) {
      const nested = Object.fromEntries(items.map((label2, i) => [`tab-${i + 1}`, { label: label2, props: tabState(i, active) }]));
      const list2 = await place(ctx, "tabs-list", { props: { variant: "segment" }, nested });
      if (list2) {
        list2.name = "Tabs";
        return list2;
      }
    }
    const t = box(ctx, "Tabs", { dir: "H", gap: 4, pad: 4, fill: "muted", radius: "lg" });
    for (const [i, label2] of items.entries()) {
      const trigger = await place(ctx, "tabs-trigger", { props: tabState(i, active), label: label2 });
      if (trigger) {
        trigger.name = `Tab / ${label2}`;
        add(t, trigger);
        continue;
      }
      count(ctx, "tabs-trigger", false);
      const tab = box(ctx, `Tab / ${label2}`, { dir: "H", pad: [6, 12], radius: "md", fill: i === active ? "background" : null, align: "CENTER" });
      add(t, add(tab, await text(ctx, label2, { size: "sm", weight: "medium", color: i === active ? "foreground" : "muted-foreground" })));
    }
    return t;
  }
  var FIELD_KIND = { select: "select-trigger", textarea: "textarea", date: "date-picker-trigger" };
  async function field(ctx, f, w, error) {
    const spec = typeof f === "string" ? { label: f.split(":")[0], type: f.split(":")[1] || "text" } : f;
    const wrap = box(ctx, `Field / ${spec.label}`, { gap: 6, w });
    if (spec.type === "checkbox") {
      const row = box(ctx, "Checkbox row", { dir: "H", gap: 8, align: "CENTER" });
      return add(wrap, add(row, await checkbox(ctx, true), await text(ctx, spec.label, { size: "sm" })));
    }
    if (spec.type === "radio") {
      const row = box(ctx, "Radio row", { dir: "H", gap: 8, align: "CENTER" });
      return add(wrap, add(row, await radio(ctx, true), await text(ctx, spec.label, { size: "sm" })));
    }
    add(wrap, await text(ctx, spec.label + (spec.required ? " *" : ""), { size: "sm", weight: "medium" }));
    const kind = FIELD_KIND[spec.type];
    const own = !!(kind && ctx.sets && ctx.sets[kind]);
    const ph = spec.placeholder || (spec.type === "select" ? own ? "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435\u2026" : "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435\u2026  \u25BE" : spec.type === "date" ? "\u0434\u0434.\u043C\u043C.\u0433\u0433\u0433\u0433" : spec.type === "money" ? "0 \u0441" : spec.type === "phone" ? "+996 ___ ___ ___" : "");
    const inp = await input(ctx, ph, { error, kind });
    if (spec.type === "textarea" && !own) inp.resize(inp.width, 88);
    add(wrap, inp);
    if (error) add(wrap, await text(ctx, spec.error || "\u041E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u043F\u043E\u043B\u0435", { size: "xs", color: "destructive" }));
    else if (spec.hint) add(wrap, await text(ctx, spec.hint, { size: "xs", color: "muted-foreground" }));
    return wrap;
  }
  async function form(ctx, b) {
    const c = card(ctx, b.title || "Form", { gap: 20, w: b.width && ctx.vp === "desktop" ? b.width : "fill" });
    const inner = (b.width && ctx.vp === "desktop" ? b.width : ctx.width) - 48;
    if (b.title) add(c, add(box(ctx, "Head", { gap: 4, w: "fill" }), await text(ctx, b.title, { size: "lg", weight: "semibold" }), b.subtitle && await text(ctx, b.subtitle, { size: "sm", color: "muted-foreground" })));
    const per = ctx.vp === "mobile" ? 1 : b.columns || 2;
    const grid = box(ctx, "Fields", { dir: "H", gap: 16, w: inner, wrap: true });
    const w = Math.floor((inner - 16 * (per - 1)) / per);
    for (const [i, f] of b.fields.entries()) add(grid, await field(ctx, f, w, ctx.state === "error" && i === 0));
    add(c, grid);
    const acts = box(ctx, "Form actions", { dir: "H", gap: 8, justify: "MAX", w: "fill" });
    add(acts, link(await button(ctx, b.cancel || "\u041E\u0442\u043C\u0435\u043D\u0430", "outline"), "cancel"), link(await button(ctx, b.submit || "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C", "default"), "submit"));
    return add(c, acts);
  }
  async function stepper(ctx, b) {
    var _a;
    const s = box(ctx, "Stepper", { dir: ctx.vp === "mobile" ? "V" : "H", gap: 8, align: "CENTER", w: "fill" });
    const cur = (_a = b.current) != null ? _a : 1;
    for (const [i, label2] of b.steps.entries()) {
      const done = i < cur;
      const status = done ? "done" : i === cur ? "current" : "upcoming";
      const step = await place(ctx, "stepper-step", { props: { status }, label: label2, texts: { Number: String(i + 1), Description: null } });
      if (step) {
        step.name = `Step / ${label2}`;
        add(s, step);
      } else {
        count(ctx, "stepper-step", false);
        const st = box(ctx, `Step / ${label2}`, { dir: "H", gap: 8, align: "CENTER" });
        const dot = box(ctx, "Dot", { dir: "H", w: 24, h: 24, radius: "full", align: "CENTER", justify: "CENTER", fill: i <= cur ? "primary" : "muted" });
        add(dot, await text(ctx, done ? "\u2713" : String(i + 1), { size: "xs", weight: "semibold", color: i <= cur ? "primary-foreground" : "muted-foreground" }));
        add(st, dot, await text(ctx, label2, { size: "sm", weight: i === cur ? "semibold" : "regular", color: i <= cur ? "foreground" : "muted-foreground" }));
        add(s, st);
      }
      if (i < b.steps.length - 1 && ctx.vp !== "mobile") add(s, rect(ctx, "Line", 32, 1, done ? "primary" : "border"));
    }
    return s;
  }
  var ALERT = { destructive: ["destructive", "destructive"], warning: ["border", "foreground"], info: ["border", "foreground"], success: ["border", "foreground"] };
  var ALERT_TONE = { destructive: "error" };
  async function alert(ctx, b) {
    const inst = await place(ctx, "alert", { props: { tone: ALERT_TONE[b.variant] || "clear" }, texts: { Title: b.title || null, Description: b.text }, w: "fill" });
    if (inst) {
      inst.name = `Alert / ${b.variant || "info"}`;
      if (!b.action) return inst;
      const row = box(ctx, `Alert / ${b.variant || "info"}`, { dir: "H", gap: 12, align: "CENTER", w: "fill" });
      return add(row, inst, await actionButton(ctx, b.action, "outline", "sm"));
    }
    count(ctx, "alert", false);
    const [accent, tc] = ALERT[b.variant] || ALERT.info;
    const a = box(ctx, `Alert / ${b.variant || "info"}`, { dir: "H", gap: 12, pad: 16, stroke: accent, radius: "lg", fill: "background", w: "fill" });
    add(a, rect(ctx, "Mark", 4, 36, accent, "full"));
    const t = box(ctx, "Text", { gap: 2, w: "fill" });
    add(t, b.title && await text(ctx, b.title, { size: "sm", weight: "semibold", color: tc }), await text(ctx, b.text, { size: "sm", color: "muted-foreground", w: "fill" }));
    return add(a, t, b.action && await actionButton(ctx, b.action, "outline", "sm"));
  }
  async function empty(ctx, b) {
    const title = b.title || "\u041F\u043E\u043A\u0430 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435\u0442";
    const body = b.text || "\u0417\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0430\u043F\u0438\u0441\u0438, \u043A\u043E\u0433\u0434\u0430 \u043E\u043D\u0438 \u0431\u0443\u0434\u0443\u0442 \u0441\u043E\u0437\u0434\u0430\u043D\u044B.";
    const act = b.action && actionLabel(b.action);
    const inst = await place(ctx, "empty-state", { texts: { Title: title, Description: body, Action: act ? true : null }, nested: act ? { Action: { label: act } } : {}, w: "fill" });
    if (inst) {
      inst.name = "Empty state";
      return act ? link(inst, `action:${act}`) : inst;
    }
    count(ctx, "empty-state", false);
    const c = box(ctx, "Empty state", { gap: 12, pad: [56, 24], align: "CENTER", stroke: "border", radius: "xl", fill: "card", w: "fill" });
    c.dashPattern = [6, 4];
    const icon2 = box(ctx, "Icon", { dir: "H", w: 48, h: 48, radius: "full", fill: "muted", align: "CENTER", justify: "CENTER" });
    add(icon2, await text(ctx, b.icon || "\u2205", { size: "lg", color: "muted-foreground" }));
    add(
      c,
      icon2,
      await text(ctx, b.title || "\u041F\u043E\u043A\u0430 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435\u0442", { size: "base", weight: "semibold", align: "CENTER" }),
      await text(ctx, b.text || "\u0417\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0430\u043F\u0438\u0441\u0438, \u043A\u043E\u0433\u0434\u0430 \u043E\u043D\u0438 \u0431\u0443\u0434\u0443\u0442 \u0441\u043E\u0437\u0434\u0430\u043D\u044B.", { size: "sm", color: "muted-foreground", align: "CENTER" }),
      b.action && await actionButton(ctx, b.action, "default")
    );
    return c;
  }
  async function login(ctx, b) {
    const wrap = box(ctx, "Login", { align: "CENTER", pad: [ctx.vp === "mobile" ? 32 : 96, 0], w: "fill" });
    const w = Math.min(400, ctx.width);
    const c = card(ctx, "Login card", { gap: 20, pad: 32, w });
    add(c, add(box(ctx, "Head", { gap: 6, w: "fill" }), await text(ctx, b.title || "\u0412\u0445\u043E\u0434 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0443", { size: "2xl", weight: "bold" }), await text(ctx, b.subtitle || "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0440\u0430\u0431\u043E\u0447\u0443\u044E \u043F\u043E\u0447\u0442\u0443 \u0438 \u043F\u0430\u0440\u043E\u043B\u044C", { size: "sm", color: "muted-foreground" })));
    const err = ctx.state === "error";
    if (err) add(c, await alert(ctx, { variant: "destructive", text: b.error || "\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u043F\u043E\u0447\u0442\u0430 \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C" }));
    for (const f of b.fields || ["\u041F\u043E\u0447\u0442\u0430:email", "\u041F\u0430\u0440\u043E\u043B\u044C:password"]) {
      const [label2, type] = f.split(":");
      const fw = box(ctx, `Field / ${label2}`, { gap: 6, w: "fill" });
      add(c, add(fw, await text(ctx, label2, { size: "sm", weight: "medium" }), await input(ctx, type === "password" ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "name@company.kg", { error: err })));
    }
    const btn = link(await button(ctx, b.submit || "\u0412\u043E\u0439\u0442\u0438", "default"), "submit");
    add(c, btn);
    if ("layoutSizingHorizontal" in btn) btn.layoutSizingHorizontal = "FILL";
    if (b.footer !== false) add(c, await text(ctx, b.footer || "\u0417\u0430\u0431\u044B\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C?", { size: "sm", color: "muted-foreground", align: "CENTER", w: "fill" }));
    return add(wrap, c);
  }
  var SPLIT_GAP = 24;

  // plugin/src/blocks-crm.js
  var blocks_crm_exports = {};
  __export(blocks_crm_exports, {
    breakdown: () => breakdown,
    cardHead: () => cardHead,
    checks: () => checks,
    comments: () => comments,
    decision: () => decision,
    files: () => files,
    funnel: () => funnel,
    meters: () => meters,
    profile: () => profile,
    score: () => score
  });
  var CHART = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];
  var TONE = { success: "primary", warning: "muted-foreground", danger: "destructive", destructive: "destructive", info: "primary", default: "primary" };
  var loading = (ctx) => ctx.state === "loading";
  var pairOf = (it) => Array.isArray(it) ? it : typeof it === "string" ? it.split(":") : [it.label, it.value];
  async function cardHead(ctx, b) {
    const h = box(ctx, "Card header", { dir: "H", gap: 12, align: "CENTER", w: "fill" });
    const t = box(ctx, "Titles", { gap: 2, w: "fill" });
    add(t, await text(ctx, b.title, { size: "base", weight: "semibold", w: "fill" }), b.subtitle && await text(ctx, b.subtitle, { size: "sm", color: "muted-foreground", w: "fill" }));
    add(h, t);
    if (b.more) add(h, link(await text(ctx, `${actionLabel(b.more)} \u2192`, { size: "sm", weight: "medium", color: "foreground" }), `action:${actionLabel(b.more)}`));
    return h;
  }
  function bar(ctx, width, share, token, h = 8) {
    const track = box(ctx, "Track", { dir: "H", fill: "muted", radius: "full", w: width, h, clip: true });
    add(track, rect(ctx, "Fill", Math.max(h, Math.round(width * Math.min(1, share))), h, token, "full"));
    return track;
  }
  async function meterBar(ctx, width, share, tone) {
    const p = await place(ctx, "progress", { props: { size: "md", shape: "rounded" }, colors: { indicator: tone }, w: width });
    if (!p) {
      count(ctx, "progress", false);
      return bar(ctx, width, share, tone);
    }
    const ind = p.findOne((n) => n.name.toLowerCase() === "indicator");
    if (ind) try {
      ind.resize(Math.max(1, Math.round(width * Math.min(1, share))), ind.height);
    } catch (e) {
    }
    return p;
  }
  async function funnel(ctx, b) {
    const c = card(ctx, b.title || "Funnel");
    add(c, await cardHead(ctx, b));
    const max = Math.max(...b.items.map((it) => Number(String(it.value).replace(/\D/g, "")) || 0), 1);
    const barW = ctx.width - 48 - (ctx.vp === "mobile" ? 0 : 220);
    for (const [i, it] of b.items.entries()) {
      const row = box(ctx, `Stage / ${it.label}`, { dir: ctx.vp === "mobile" ? "V" : "H", gap: ctx.vp === "mobile" ? 6 : 16, align: ctx.vp === "mobile" ? "MIN" : "CENTER", w: "fill" });
      if (loading(ctx)) {
        add(c, add(row, await skeleton(ctx, 120, 12), await skeleton(ctx, Math.round(barW * (1 - i * 0.15)), 28, "md")));
        continue;
      }
      const label2 = box(ctx, "Label", { gap: 2, w: ctx.vp === "mobile" ? "fill" : 140 });
      add(label2, await text(ctx, it.label, { size: "sm", weight: "medium", w: "fill" }), it.hint && await text(ctx, it.hint, { size: "xs", color: "muted-foreground", w: "fill" }));
      const share = (Number(String(it.value).replace(/\D/g, "")) || 0) / max;
      const w = Math.max(8, Math.round((barW - 64) * share));
      const lane = box(ctx, "Lane", { dir: "H", gap: 10, align: "CENTER", w: ctx.vp === "mobile" ? "fill" : barW });
      add(lane, rect(ctx, "Bar", w, 28, "chart-1", "md"), await text(ctx, String(it.value), { size: "sm", weight: "semibold" }));
      add(row, label2, lane);
      if (ctx.vp !== "mobile") add(row, add(box(ctx, "Rate", { dir: "H", justify: "MAX", w: 56 }), it.rate ? await text(ctx, it.rate, { size: "sm", weight: "medium", color: "muted-foreground" }) : null));
      add(c, row);
    }
    return c;
  }
  async function meters(ctx, b) {
    var _a, _b;
    const c = card(ctx, b.title || "Meters");
    add(c, await cardHead(ctx, b));
    const inner = ctx.width - 48;
    for (const it of b.items) {
      const m = box(ctx, `Meter / ${it.label}`, { gap: 8, w: "fill" });
      if (loading(ctx)) {
        add(c, add(m, await skeleton(ctx, 160, 12), await skeleton(ctx, inner, 8, "full")));
        continue;
      }
      const top = box(ctx, "Top", { dir: "H", gap: 8, align: "CENTER", w: "fill" });
      const pct = Number(String((_a = it.percent) != null ? _a : 0).replace(/[^\d.]/g, "")) || 0;
      const tone = TONE[it.tone] || (pct >= 90 ? "destructive" : pct >= 75 ? "muted-foreground" : "primary");
      add(top, await text(ctx, it.label, { size: "sm", weight: "medium", w: "fill", truncate: true }), await text(ctx, (_b = it.value) != null ? _b : `${pct}%`, { size: "sm", weight: "semibold", color: tone === "primary" ? "foreground" : tone }));
      add(m, top, await meterBar(ctx, inner, pct / 100, tone), it.hint && await text(ctx, it.hint, { size: "xs", color: "muted-foreground" }));
      add(c, m);
    }
    return c;
  }
  async function score(ctx, b) {
    var _a;
    const c = card(ctx, b.title || "\u0421\u043A\u043E\u0440\u0438\u043D\u0433", { gap: 20 });
    add(c, await cardHead(ctx, { title: b.title || "\u0421\u043A\u043E\u0440\u0438\u043D\u0433", subtitle: b.subtitle, more: b.more }));
    const inner = ctx.width - 48;
    if (loading(ctx)) return add(c, await skeleton(ctx, 120, 40, "md"), await skeleton(ctx, inner, 10, "full"), await skeleton(ctx, 200, 12), await skeleton(ctx, 160, 12));
    const max = b.max || 850;
    const top = box(ctx, "Value", { dir: "H", gap: 12, align: "MAX", w: "fill" });
    add(top, await text(ctx, String(b.value), { size: "4xl", weight: "bold" }), await text(ctx, `\u0438\u0437 ${max}`, { size: "sm", color: "muted-foreground" }), box(ctx, "Spacer", { w: "fill", h: 1 }), b.grade && await badge(ctx, b.grade, statusVariant(b.grade)));
    const zones = ["destructive", "chart-4", "chart-3", "chart-2", "primary"];
    const gap = 4;
    const zw = Math.floor((inner - gap * 4) / 5);
    const scale = box(ctx, "Scale", { dir: "H", gap, w: "fill" });
    for (const z of zones) add(scale, rect(ctx, "Zone", zw, 8, z, "full"));
    const markerRow = box(ctx, "Marker row", { dir: "H", w: "fill", h: 12 });
    const pos = Math.round(Math.min(1, b.value / max) * inner);
    add(markerRow, box(ctx, "Offset", { w: Math.max(0, pos - 6), h: 1 }), rect(ctx, "Marker", 12, 12, "foreground", "full"));
    const legend = box(ctx, "Legend", { dir: "H", justify: "SPACE_BETWEEN", w: "fill" });
    add(legend, await text(ctx, "\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u0440\u0438\u0441\u043A", { size: "xs", color: "muted-foreground" }), await text(ctx, "\u041D\u0438\u0437\u043A\u0438\u0439 \u0440\u0438\u0441\u043A", { size: "xs", color: "muted-foreground" }));
    add(c, top, add(box(ctx, "Gauge", { gap: 6, w: "fill" }), markerRow, scale, legend));
    if ((_a = b.items) == null ? void 0 : _a.length) {
      const list2 = box(ctx, "Factors", { gap: 10, w: "fill" });
      add(list2, await text(ctx, b.factorsTitle || "\u0427\u0442\u043E \u043F\u043E\u0432\u043B\u0438\u044F\u043B\u043E", { size: "xs", weight: "medium", color: "muted-foreground" }));
      for (const it of b.items) {
        const [label2, impact] = pairOf(it);
        const good = /^[+▲]/.test(String(impact).trim());
        const row = box(ctx, `Factor / ${label2}`, { dir: "H", gap: 10, align: "CENTER", w: "fill" });
        add(row, rect(ctx, "Dot", 8, 8, good ? "primary" : "destructive", "full"), await text(ctx, label2, { size: "sm", w: "fill" }), await text(ctx, impact, { size: "sm", weight: "semibold", color: good ? "primary" : "destructive" }));
        add(list2, row);
      }
      add(c, list2);
    }
    return c;
  }
  async function decision(ctx, b) {
    const c = card(ctx, b.title || "\u0420\u0435\u0448\u0435\u043D\u0438\u0435", { gap: 20 });
    add(c, await cardHead(ctx, { title: b.title || "\u0420\u0435\u0448\u0435\u043D\u0438\u0435", subtitle: b.subtitle }));
    const per = ctx.vp === "mobile" ? 2 : b.columns || 2;
    const inner = ctx.width - 48;
    const w = Math.floor((inner - 12 * (per - 1)) / per);
    const grid = box(ctx, "Terms", { dir: "H", gap: 12, wrap: true, w: inner });
    for (const it of b.items) {
      const [label2, value] = pairOf(it);
      const cell2 = box(ctx, `Term / ${label2}`, { gap: 4, pad: [12, 14], fill: "muted", fillOpacity: 0.5, radius: "lg", w });
      add(cell2, await text(ctx, label2, { size: "xs", color: "muted-foreground" }), loading(ctx) ? await skeleton(ctx, 80, 14) : await text(ctx, value, { size: "base", weight: "semibold" }));
      add(grid, cell2);
    }
    add(c, grid);
    if (b.note) add(c, await text(ctx, b.note, { size: "sm", color: "muted-foreground", w: "fill" }));
    const list2 = b.actions || ["\u041E\u0434\u043E\u0431\u0440\u0438\u0442\u044C", "\u041D\u0430 \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0443", "\u041E\u0442\u043A\u0430\u0437\u0430\u0442\u044C"];
    if (!list2.length) return c;
    const acts = box(ctx, "Decision actions", { dir: "H", gap: 8, wrap: true, w: ctx.width - 48 });
    for (const a of list2) {
      const variant = /отказ|отклон|reject/i.test(a) ? "destructive" : isPrimaryAction(a) || a === list2[0] ? "default" : "outline";
      add(acts, link(await button(ctx, actionLabel(a), variant), `action:${actionLabel(a)}`));
    }
    return add(c, acts);
  }
  async function files(ctx, b) {
    const c = card(ctx, b.title || "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B", { gap: 4 });
    add(c, add(box(ctx, "Head", { pad: [0, 0, 8, 0], w: "fill" }), await cardHead(ctx, { title: b.title || "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B", subtitle: b.subtitle, more: b.more })));
    for (const it of b.items) {
      const f = typeof it === "string" ? { name: it } : it;
      const row = box(ctx, `File / ${f.name}`, { dir: "H", gap: 12, pad: [10, 0], align: "CENTER", w: "fill" });
      const tile = box(ctx, "File icon", { dir: "H", w: 36, h: 36, radius: "md", fill: "muted", align: "CENTER", justify: "CENTER" });
      add(tile, icon(ctx, "file", "muted-foreground", 18));
      const t = box(ctx, "Name", { gap: 2, w: "fill" });
      if (loading(ctx)) add(t, await skeleton(ctx, 160, 12), await skeleton(ctx, 90, 10));
      else add(t, await text(ctx, f.name, { size: "sm", weight: "medium", w: "fill", truncate: true }), f.meta && await text(ctx, f.meta, { size: "xs", color: "muted-foreground" }));
      add(c, add(row, tile, t, !loading(ctx) && f.status && await badge(ctx, f.status, statusVariant(f.status)), icon(ctx, "more", "muted-foreground", 16)));
    }
    return c;
  }
  var CHECK = { ok: ["check", "primary"], warn: ["info", "muted-foreground"], fail: ["shield", "destructive"], wait: ["history", "muted-foreground"] };
  async function checks(ctx, b) {
    const c = card(ctx, b.title || "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0438", { gap: 0 });
    add(c, add(box(ctx, "Head", { pad: [0, 0, 12, 0], w: "fill" }), await cardHead(ctx, { title: b.title || "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0438", subtitle: b.subtitle, more: b.more })));
    for (const [i, it] of b.items.entries()) {
      const ch = typeof it === "string" ? { label: it, status: "ok" } : it;
      const [ic, tone] = CHECK[ch.status] || CHECK.ok;
      const row = box(ctx, `Check / ${ch.label}`, { dir: "H", gap: 12, pad: [12, 0], align: "CENTER", w: "fill" });
      if (i) add(c, rect(ctx, "Divider", ctx.width - 48, 1, "border"));
      const dot = box(ctx, "Status", { dir: "H", w: 28, h: 28, radius: "full", align: "CENTER", justify: "CENTER" });
      fill(dot, ctx, "muted");
      add(dot, icon(ctx, ic, tone, 16));
      const t = box(ctx, "Text", { gap: 2, w: "fill" });
      if (loading(ctx)) add(t, await skeleton(ctx, 180, 12), await skeleton(ctx, 100, 10));
      else add(t, await text(ctx, ch.label, { size: "sm", weight: "medium", w: "fill" }), ch.hint && await text(ctx, ch.hint, { size: "xs", color: "muted-foreground", w: "fill" }));
      add(c, add(row, dot, t, !loading(ctx) && ch.result && await text(ctx, ch.result, { size: "sm", weight: "medium", color: tone === "muted-foreground" ? "muted-foreground" : tone })));
    }
    return c;
  }
  async function comments(ctx, b) {
    const c = card(ctx, b.title || "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0438", { gap: 16 });
    add(c, await cardHead(ctx, { title: b.title || "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0438", subtitle: b.subtitle }));
    for (const it of b.items) {
      const m = Array.isArray(it) ? { who: it[0], time: it[1], text: it[2] } : it;
      const row = box(ctx, `Comment / ${m.who}`, { dir: "H", gap: 12, w: "fill" });
      const body = box(ctx, "Body", { gap: 4, w: "fill" });
      if (loading(ctx)) {
        add(c, add(row, await skeleton(ctx, 32, 32, "full"), add(body, await skeleton(ctx, 140, 12), await skeleton(ctx, "fill", 10))));
        continue;
      }
      const head = box(ctx, "Who", { dir: "H", gap: 8, align: "CENTER", w: "fill" });
      add(head, await text(ctx, m.who, { size: "sm", weight: "semibold" }), m.time && await text(ctx, m.time, { size: "xs", color: "muted-foreground" }));
      const bubble = box(ctx, "Bubble", { pad: [10, 12], fill: "muted", fillOpacity: 0.6, radius: "lg", w: "fill" });
      add(bubble, await text(ctx, m.text, { size: "sm", w: "fill" }));
      add(c, add(row, await avatar(ctx, m.who), add(body, head, bubble)));
    }
    const reply = box(ctx, "Reply", { dir: "H", gap: 8, align: "CENTER", w: "fill" });
    const field2 = await input(ctx, b.placeholder || "\u041D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439\u2026");
    add(reply, field2, await button(ctx, "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C", "default"));
    if ("layoutSizingHorizontal" in field2) field2.layoutSizingHorizontal = "FILL";
    return add(c, reply);
  }
  async function profile(ctx, b) {
    var _a, _b, _c;
    const mobile = ctx.vp === "mobile";
    const c = card(ctx, `Profile / ${b.name}`, { gap: 20 });
    const top = box(ctx, "Top", { dir: mobile ? "V" : "H", gap: 16, align: mobile ? "MIN" : "CENTER", w: "fill" });
    const who = box(ctx, "Who", { dir: "H", gap: 16, align: "CENTER", w: mobile ? "fill" : "hug" });
    const t = box(ctx, "Name", { gap: 4 });
    const badges = box(ctx, "Badges", { dir: "H", gap: 6, wrap: true });
    for (const x of b.badges || []) add(badges, await badge(ctx, x, statusVariant(x)));
    add(t, await text(ctx, b.name, { size: "xl", weight: "bold" }), b.meta && await text(ctx, b.meta, { size: "sm", color: "muted-foreground" }), ((_a = b.badges) == null ? void 0 : _a.length) && badges);
    add(who, await avatar(ctx, b.name, 56), t);
    add(top, who);
    if ((_b = b.actions) == null ? void 0 : _b.length) {
      if (!mobile) add(top, box(ctx, "Spacer", { w: "fill", h: 1 }));
      const acts = box(ctx, "Actions", { dir: "H", gap: 8, wrap: true });
      for (const a of b.actions) add(acts, link(await button(ctx, actionLabel(a), isPrimaryAction(a) ? "default" : "outline"), `action:${actionLabel(a)}`));
      add(top, acts);
    }
    add(c, top);
    if ((_c = b.items) == null ? void 0 : _c.length) {
      const per = mobile ? 2 : Math.min(b.items.length, 5);
      const inner = ctx.width - 48;
      const w = Math.floor((inner - 16 * (per - 1)) / per);
      const facts = box(ctx, "Facts", { dir: "H", gap: 16, wrap: true, pad: [16, 0, 0, 0], w: inner });
      for (const it of b.items) {
        const [label2, value] = pairOf(it);
        const f = box(ctx, `Fact / ${label2}`, { gap: 4, w });
        add(f, await text(ctx, label2, { size: "xs", color: "muted-foreground" }), loading(ctx) ? await skeleton(ctx, 90, 14) : await text(ctx, value, { size: "sm", weight: "semibold", w: "fill" }));
        add(facts, f);
      }
      add(c, rect(ctx, "Divider", inner, 1, "border"), facts);
    }
    return c;
  }
  async function breakdown(ctx, b) {
    const c = card(ctx, b.title || "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430");
    add(c, await cardHead(ctx, b));
    const inner = ctx.width - 48;
    if (loading(ctx)) return add(c, await skeleton(ctx, inner, 12, "full"), await skeleton(ctx, 180, 12), await skeleton(ctx, 160, 12), await skeleton(ctx, 140, 12));
    const shares = b.items.map((it) => Number(String(it.share).replace(/[^\d.]/g, "")) || 0);
    const total = shares.reduce((a, x) => a + x, 0) || 1;
    const stack = box(ctx, "Stack", { dir: "H", gap: 2, w: "fill", radius: "full", clip: true });
    b.items.forEach((it, i) => add(stack, rect(ctx, `Part / ${it.label}`, Math.max(4, Math.floor((inner - 2 * (b.items.length - 1)) * shares[i] / total)), 12, CHART[i % CHART.length])));
    add(c, stack);
    for (const [i, it] of b.items.entries()) {
      const row = box(ctx, `Legend / ${it.label}`, { dir: "H", gap: 10, align: "CENTER", w: "fill" });
      add(
        row,
        rect(ctx, "Dot", 10, 10, CHART[i % CHART.length], "full"),
        await text(ctx, it.label, { size: "sm", w: "fill" }),
        it.value && await text(ctx, it.value, { size: "sm", weight: "medium" }),
        add(box(ctx, "Share", { dir: "H", justify: "MAX", w: 48 }), await text(ctx, String(it.share), { size: "sm", color: "muted-foreground" }))
      );
      add(c, row);
    }
    return c;
  }

  // plugin/src/prototype.js
  var PROTO_PAGE = "\u041F\u0440\u043E\u0442\u043E\u0442\u0438\u043F";
  var SCREEN_KEY = "mbank-screen";
  var PROTO_KEY = "mbank-proto";
  var GAP2 = 160;
  async function pageFor(name) {
    await figma.loadAllPagesAsync();
    return figma.root.children.find((p) => p.name === name) || Object.assign(figma.createPage(), { name });
  }
  var protoState = (s) => s.states.includes("default") ? "default" : s.states[0];
  var reaction = (destinationId) => ({
    trigger: { type: "ON_CLICK" },
    actions: [{ type: "NODE", destinationId, navigation: "NAVIGATE", transition: { type: "DISSOLVE", easing: { type: "EASE_OUT" }, duration: 0.2 } }]
  });
  async function setReactions(node, list2) {
    if (typeof node.setReactionsAsync === "function") await node.setReactionsAsync(list2);
    else node.reactions = list2;
  }
  function clickable(frame, key) {
    if (!key.startsWith("text:")) return frame.findAll((n) => n.getPluginData(LINK_KEY) === key);
    const want = key.slice(5);
    return frame.findAll((n) => n.type === "TEXT" && String(n.characters).trim().replace(/^\+\s*/, "") === want).map((t) => {
      let tagged = null;
      let inst = null;
      for (let n = t.parent; n && n !== frame; n = n.parent) {
        if (!tagged && n.getPluginData(LINK_KEY)) tagged = n;
        if (n.type === "INSTANCE") inst = n;
      }
      return inst || tagged || t;
    });
  }
  async function wireFrames(frames, links) {
    const out = { wired: 0, missing: [] };
    for (const [id, frame] of frames) {
      const plan = /* @__PURE__ */ new Map();
      for (const l of links) {
        if (l.from !== id || !frames.has(l.to)) continue;
        const nodes = clickable(frame, l.on);
        if (!nodes.length && !l.auto) out.missing.push(`${l.from}: ${l.on} \u2192 ${l.to}`);
        for (const n of nodes) plan.set(n, frames.get(l.to).id);
      }
      for (const [n, dest] of plan) {
        await setReactions(n, [reaction(dest)]);
        out.wired++;
      }
    }
    return out;
  }
  function setFlows(page, flows) {
    const names = flows.map((f) => f.name);
    const nodes = new Set(flows.map((f) => f.nodeId));
    const seen = /* @__PURE__ */ new Set();
    page.flowStartingPoints = [...(page.flowStartingPoints || []).filter((f) => !names.includes(f.name) && !nodes.has(f.nodeId)), ...flows].filter((f) => seen.has(f.nodeId) ? false : seen.add(f.nodeId));
  }
  var flowName = (spec, vp, where) => [spec.project, where, vp === "desktop" ? null : vp].filter(Boolean).join(" \xB7 ");
  async function wirePage(page, spec, links) {
    const byVp = {};
    for (const sec of page.children) for (const f of sec.type === "SECTION" ? sec.children : [sec]) {
      const [project, id, state, vp] = (f.getPluginData(SCREEN_KEY) || "").split("|");
      const s = project === spec.project && spec.screens.find((x) => x.id === id);
      if (!s || state !== protoState(s)) continue;
      (byVp[vp] = byVp[vp] || /* @__PURE__ */ new Map()).set(id, f);
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
  function startOf(spec, screens) {
    const login2 = screens.find((s) => s.blocks.some((b) => b.type === "login"));
    return login2 || screens.find((s) => {
      var _a;
      return s.nav && s.nav === ((_a = spec.nav[0]) == null ? void 0 : _a.id);
    }) || screens[0];
  }
  async function buildPrototype(spec, links, base, make) {
    const page = await pageFor(PROTO_PAGE);
    await figma.setCurrentPageAsync(page);
    page.children.filter((n) => n.getPluginData(PROTO_KEY) === spec.project).forEach((n) => n.remove());
    let y = Math.max(0, ...page.children.map((n) => n.y + n.height + GAP2));
    const all = spec.screens.flatMap((s) => s.viewports);
    const vps = ["desktop", "mobile", "tablet"].filter((v) => all.includes(v)).slice(0, all.includes("desktop") ? 2 : 1);
    const tag = (n) => {
      n.setPluginData(PROTO_KEY, spec.project);
      page.appendChild(n);
      return n;
    };
    const label2 = async (value, size3, py) => {
      const t = tag(await text(base, value, { size: size3, weight: "bold", color: "muted-foreground" }));
      t.x = 0;
      t.y = py;
      return t.height;
    };
    const res = { page: page.name, frames: [], wired: 0, missing: [] };
    const flows = [];
    for (const vp of vps) {
      const screens = spec.screens.filter((s) => s.viewports.includes(vp));
      y += await label2(flowName(spec, vp, vp === "desktop" ? "\u0434\u0435\u0441\u043A\u0442\u043E\u043F" : null), "3xl", y) + 48;
      const frames = /* @__PURE__ */ new Map();
      for (const section of [...new Set(screens.map((s) => s.page))]) {
        y += await label2(section, "xl", y) + 24;
        let x = 0;
        let rowH = 0;
        for (const s of screens.filter((x2) => x2.page === section)) {
          const f = tag(await make(s, protoState(s), vp));
          f.name = s.title;
          f.x = x;
          f.y = y;
          f.setPluginData(SCREEN_KEY, [spec.project, s.id, protoState(s), vp].join("|"));
          x += f.width + GAP2 / 2;
          rowH = Math.max(rowH, f.height);
          frames.set(s.id, f);
          res.frames.push({ id: f.id, screen: s.id, viewport: vp });
        }
        y += rowH + GAP2;
      }
      const r = await wireFrames(frames, links);
      res.wired += r.wired;
      res.missing.push(...r.missing);
      flows.push({ nodeId: frames.get(startOf(spec, screens).id).id, name: flowName(spec, vp) });
      y += GAP2;
    }
    setFlows(page, flows);
    return res;
  }

  // plugin/src/screens.js
  var BUILDERS = __spreadValues(__spreadValues(__spreadValues({}, blocks_data_exports), blocks_ui_exports), blocks_crm_exports);
  var GAP3 = 120;
  var LISTS2 = ["table", "list", "kanban", "cards"];
  function blocksForState(screen, state) {
    const blocks = screen.blocks;
    const emptyText = screen.empty || {};
    if (state === "no-access") {
      const head = blocks.find((b) => b.type === "header");
      return [
        head && { type: "header", title: head.title, breadcrumbs: head.breadcrumbs },
        { type: "empty", icon: "\u{1F512}", title: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430", text: "\u0423 \u0432\u0430\u0448\u0435\u0439 \u0440\u043E\u043B\u0438 \u043D\u0435\u0442 \u043F\u0440\u0430\u0432 \u043D\u0430 \u044D\u0442\u043E\u0442 \u0440\u0430\u0437\u0434\u0435\u043B. \u041E\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044C \u043A \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0443.", action: "\u0417\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u044C \u0434\u043E\u0441\u0442\u0443\u043F" }
      ].filter(Boolean);
    }
    if (state === "empty") {
      let replaced = false;
      return blocks.flatMap((b) => {
        if (LISTS2.includes(b.type)) {
          if (replaced) return [];
          replaced = true;
          return [{ type: "empty", title: emptyText.title || b.emptyTitle || "\u041F\u043E\u043A\u0430 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435\u0442", text: emptyText.text || b.emptyText, action: emptyText.action || b.emptyAction }];
        }
        return b.type === "pagination" ? [] : [b];
      });
    }
    if (state === "error") {
      const out = [];
      let replaced = false;
      for (const b of blocks) {
        if (b.type === "header") {
          out.push(b, { type: "alert", variant: "destructive", title: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435", text: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.", action: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C" });
          continue;
        }
        if (DATA_BLOCKS.includes(b.type) && b.type !== "details") {
          if (!replaced && LISTS2.includes(b.type)) {
            replaced = true;
            out.push({ type: "empty", icon: "!", title: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438", text: "\u0414\u0430\u043D\u043D\u044B\u0435 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B." });
          }
          continue;
        }
        if (b.type !== "pagination") out.push(b);
      }
      if (!blocks.some((b) => b.type === "header")) out.unshift({ type: "alert", variant: "destructive", title: "\u041E\u0448\u0438\u0431\u043A\u0430", text: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435." });
      return out;
    }
    return blocks;
  }
  async function renderBlock(ctx, b) {
    if (b.type === "split") {
      const row = box(ctx, "Split", { dir: ctx.vp === "mobile" ? "V" : "H", gap: SPLIT_GAP, w: "fill" });
      const ratio = (b.ratio || b.columns.map(() => 1).join(":")).split(":").map(Number);
      const total = ratio.reduce((a, c) => a + c, 0);
      const avail = ctx.width - SPLIT_GAP * (b.columns.length - 1);
      const cols2 = [];
      for (const [i, col] of b.columns.entries()) {
        const w = ctx.vp === "mobile" ? ctx.width : Math.floor(avail * (ratio[i] || 1) / total);
        const c = box(ctx, `Column ${i + 1}`, { gap: 24, w: ctx.vp === "mobile" ? "fill" : w });
        const sub = __spreadProps(__spreadValues({}, ctx), { width: w });
        const nodes = [];
        for (const x of blocksForState({ blocks: col }, ctx.state === "loading" ? "default" : ctx.state)) nodes.push(await renderBlock(sub, x));
        add(c, nodes);
        add(row, c);
        cols2.push({ c, nodes });
      }
      if (ctx.vp !== "mobile") {
        const tallest = Math.max(...cols2.map((x) => x.c.height));
        for (const { c, nodes } of cols2) {
          if (nodes.length !== 1 || nodes[0].type !== "FRAME" || c.height >= tallest) continue;
          c.layoutSizingVertical = "FILL";
          nodes[0].layoutSizingVertical = "FILL";
        }
      }
      return row;
    }
    const fn = BUILDERS[b.type];
    if (!fn) throw new Error(`No builder for block "${b.type}"`);
    const node = await fn(ctx, b);
    return node;
  }
  async function buildFrame(base, spec, screen, state, vp, seed) {
    const width = VIEWPORTS[vp];
    const ctx = __spreadProps(__spreadValues({}, base), { vp, state, seed });
    const { frame, content, width: inner, push } = await shell(ctx, spec, screen, vp, width);
    ctx.width = inner;
    for (const b of blocksForState(screen, state)) {
      const node = await renderBlock(ctx, b);
      add(content, node);
      if (node.type === "FRAME" && node.layoutSizingHorizontal !== "FIXED" && b.type !== "tabs" && b.type !== "stepper") size(node, "fill");
    }
    if (screen.shell === "sidebar" && vp !== "mobile" && frame.height < 900) {
      frame.counterAxisSizingMode = "FIXED";
      frame.resize(width, 900);
    }
    if (push && frame.height < 812) {
      frame.primaryAxisSizingMode = "FIXED";
      frame.resize(width, 812);
      push.layoutSizingVertical = "FILL";
    }
    frame.name = `[draft] ${screen.title} / ${state} / ${width}`;
    return frame;
  }
  async function buildSpec(rawSpec, opts, onProgress = () => {
  }) {
    const spec = normalizeSpec(rawSpec);
    const font = await loadFonts(opts.font || "Inter");
    const base = createCtx({ vars: opts.vars, radius: opts.radius, font, kit: opts.kit || {} });
    base.kitStyles = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
    base.sets = opts.contracts || await contractRegistry();
    const screens = spec.screens.filter((s) => {
      var _a;
      return !((_a = opts.only) == null ? void 0 : _a.length) || opts.only.includes(s.id);
    });
    const total = screens.reduce((n, s) => n + s.states.length * s.viewports.length, 0);
    const result = { frames: [], sections: [], stats: base.stats, font, fallbackFonts: false };
    let done = 0;
    const yByPage = {};
    const touched = /* @__PURE__ */ new Map();
    for (const screen of screens) {
      const page = await pageFor(screen.page);
      await figma.setCurrentPageAsync(page);
      const title = `${spec.project} / ${screen.title}`;
      page.findAll((n) => n.type === "SECTION" && n.name === title).forEach((n) => n.remove());
      if (yByPage[page.id] == null) yByPage[page.id] = Math.max(0, ...page.children.map((n) => n.y + n.height + GAP3));
      const section = figma.createSection();
      section.name = title;
      page.appendChild(section);
      let y = GAP3;
      for (const state of screen.states) {
        let x = GAP3;
        let rowH = 0;
        for (const vp of screen.viewports) {
          const f = await buildFrame(base, spec, screen, state, vp, spec.screens.indexOf(screen) * 13);
          f.setPluginData(SCREEN_KEY, [spec.project, screen.id, state, vp].join("|"));
          section.appendChild(f);
          f.x = x;
          f.y = y;
          await setFrameModes(f, { theme: opts.theme || "light" });
          x += f.width + GAP3;
          rowH = Math.max(rowH, f.height);
          result.frames.push({ id: f.id, name: f.name, page: page.name });
          onProgress(++done, total, f.name);
        }
        y += rowH + GAP3;
      }
      const w = Math.max(...section.children.map((n) => n.x + n.width)) + GAP3;
      section.resizeWithoutConstraints(w, y);
      section.x = 0;
      section.y = yByPage[page.id];
      yByPage[page.id] += y + GAP3;
      result.sections.push({ id: section.id, name: title, page: page.name });
      touched.set(page.id, page);
    }
    if (opts.prototype !== false) {
      const links = resolveLinks(spec);
      for (const page of touched.values()) await wirePage(page, spec, links);
      result.prototype = await buildPrototype(spec, links, base, async (screen, state, vp) => {
        const f = await buildFrame(base, spec, screen, state, vp, spec.screens.indexOf(screen) * 13);
        await setFrameModes(f, { theme: opts.theme || "light" });
        return f;
      });
      result.links = links.length;
    }
    result.fallbackFonts = base.stats.fallbackFonts;
    result.roles = rolesReport(base.stats);
    result.handDrawn = handDrawn(base.stats);
    return result;
  }

  // plugin/src/audit.js
  function auditNode(root) {
    const issues = { rawFills: 0, rawStrokes: 0, unstyledText: 0, samples: [] };
    const raw = (paints) => Array.isArray(paints) && paints.some((p) => p.type === "SOLID" && p.visible !== false && !(p.boundVariables && p.boundVariables.color));
    const walk = (n) => {
      if (n.type === "INSTANCE") return;
      if ("fills" in n && raw(n.fills)) {
        issues.rawFills++;
        if (issues.samples.length < 10) issues.samples.push(`fill: ${n.name}`);
      }
      if ("strokes" in n && raw(n.strokes)) {
        issues.rawStrokes++;
        if (issues.samples.length < 10) issues.samples.push(`stroke: ${n.name}`);
      }
      if (n.type === "TEXT" && !n.textStyleId) {
        issues.unstyledText++;
        if (issues.samples.length < 10) issues.samples.push(`text: ${n.name}`);
      }
      if ("children" in n) n.children.forEach(walk);
    };
    walk(root);
    return issues;
  }
  async function auditFrames(ids) {
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

  // core/css.js
  var block = (selector, t, theme, extra = []) => [`${selector} {`, ...extra, ...COLOR_TOKENS.filter((k) => t.colors[k]).map((k) => `  --${k}: ${t.colors[k][theme]};`), "}"].join("\n");
  function toShadcnCss(t = SHADCN_TOKENS, name = "shadcn") {
    const scale = t.radiusScale || SHADCN_TOKENS.radiusScale;
    const font = t.font || SHADCN_TOKENS.font;
    const theme = [
      "@theme inline {",
      `  --font-sans: ${font.sans};`,
      `  --font-heading: ${font.heading};`,
      ...COLOR_TOKENS.map((k) => `  --color-${k}: var(--${k});`),
      ...Object.entries(scale).map(([k, v]) => `  --radius-${k}: ${v};`),
      "}"
    ].join("\n");
    return [
      `/* ${name}: shadcn/ui tokens generated by ds-builder, do not edit by hand */`,
      '@import "tailwindcss";',
      '@import "tw-animate-css";',
      "",
      "@custom-variant dark (&:is(.dark *));",
      "",
      block(":root", t, "light", [`  --radius: ${t.radius || SHADCN_TOKENS.radius};`]),
      "",
      block(".dark", t, "dark"),
      "",
      theme,
      "",
      "@layer base {",
      "  * { @apply border-border outline-ring/50; }",
      "  body { @apply bg-background text-foreground; }",
      "}",
      ""
    ].join("\n");
  }

  // core/contract-templates.js
  var SIZES = { xs: [8, 3, "xs"], sm: [9, 3, "sm"], md: [11, 4, "sm"], lg: [14, 6, "base"], xl: [16, 8, "lg"] };
  var TEMPLATES = {
    "button-like": {
      title: "\u041A\u043D\u043E\u043F\u043A\u0430: \u0444\u043E\u043D, \u043F\u043E\u0434\u043F\u0438\u0441\u044C, \u0438\u043A\u043E\u043D\u043A\u0430; hover/active/focus/disabled",
      parts: ["root", "label", "icon"],
      base: {
        root: { layout: "row", align: "center", gap: 2, px: 4, height: 11, radius: "md", text: "sm", weight: "medium", bg: "primary", fg: "primary-foreground", "bg:hover": "primary/90", "bg:active": "primary/80", "focus-ring": "ring/50", "opacity:disabled": 50 },
        icon: { size: 5 }
      },
      states: ["default", "hover", "active", "focus", "disabled"]
    },
    "input-like": {
      title: "\u041F\u043E\u043B\u0435: \u0440\u0430\u043C\u043A\u0430, \u043F\u043B\u0435\u0439\u0441\u0445\u043E\u043B\u0434\u0435\u0440; hover/focus/disabled",
      parts: ["root", "placeholder"],
      base: {
        root: { layout: "row", align: "center", px: 3, height: 11, radius: "md", text: "sm", bg: "background", fg: "foreground", border: "input", "border:hover": "ring/50", "border:focus": "ring", "focus-ring": "ring/30", "bg:disabled": "muted", "border:disabled": "input/50" },
        placeholder: { fg: "muted-foreground", "fg:disabled": "muted-foreground/50" }
      },
      states: ["default", "hover", "focus", "disabled"]
    },
    "badge-like": {
      title: "\u0411\u0435\u0439\u0434\u0436: \u0437\u0430\u043B\u0438\u0432\u043A\u0430 \u0438 \u043F\u043E\u0434\u043F\u0438\u0441\u044C, \u0431\u0435\u0437 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439",
      parts: ["root", "label"],
      base: { root: { layout: "row", align: "center", gap: 1, px: 2, height: 6, radius: "full", text: "xs", weight: "medium", bg: "secondary", fg: "secondary-foreground" } },
      states: ["default"]
    },
    "card-like": {
      title: "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430: \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A, \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435, \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435",
      parts: ["root", "title", "description", "content"],
      base: {
        root: { layout: "column", gap: 2, px: 6, py: 6, radius: "xl", bg: "card", fg: "foreground", border: "border" },
        title: { text: "base", weight: "semibold" },
        description: { text: "sm", fg: "muted-foreground" },
        content: { layout: "column", gap: 2, "min-height": 16 }
      },
      states: ["default"]
    }
  };
  var kebab = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  function parseProps(input2) {
    if (typeof input2 !== "string") return input2 || {};
    const out = {};
    for (const chunk of input2.split(/[;\n]/)) {
      const [k, v] = chunk.split("=");
      if (!k || !v) continue;
      const values = v.split(",").map((x) => kebab(x)).filter(Boolean);
      if (values.length) out[kebab(k)] = values;
    }
    return out;
  }
  function newContract({ name, title, template = "button-like", props = {} }) {
    const t = TEMPLATES[template];
    if (!t) throw new Error(`\u041D\u0435\u0442 \u0448\u0430\u0431\u043B\u043E\u043D\u0430 \xAB${template}\xBB: ${Object.keys(TEMPLATES).join(", ")}`);
    const id = kebab(name);
    const c = {
      $schema: SCHEMA,
      name: id,
      title: title || name,
      parts: [...t.parts],
      props: {},
      base: JSON.parse(JSON.stringify(t.base)),
      variants: {},
      states: [...t.states],
      code: { file: `${id}.tsx`, export: `${id.replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase())}Variants` }
    };
    for (const [p, values] of Object.entries(parseProps(props))) {
      c.props[p] = { values, default: values[0] };
      c.variants[p] = {};
      for (const v of values) {
        const sz = p === "size" && SIZES[v];
        c.variants[p][v] = sz ? { root: { height: sz[0], px: sz[1], text: sz[2] } } : {};
      }
    }
    const errors = validateContract(c);
    if (errors.length) throw new Error(errors.join("; "));
    return c;
  }

  // plugin/src/kit-sheet.js
  var GROUPS = [
    { title: "\u041E\u0441\u043D\u043E\u0432\u0430", names: ["button", "badge", "avatar", "card", "separator"] },
    { title: "\u0424\u043E\u0440\u043C\u044B", names: ["input", "textarea", "search-input", "select-trigger", "date-picker-trigger", "checkbox", "radio", "switch", "filter-chip"] },
    { title: "\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F", names: ["nav-item", "tabbar-item", "breadcrumb-item", "tabs-list", "tabs-trigger", "pagination", "stepper-step"] },
    { title: "\u0414\u0430\u043D\u043D\u044B\u0435", names: ["table-head", "table-cell"] },
    { title: "\u041E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C", names: ["alert", "toast", "progress", "spinner", "skeleton", "empty-state"] },
    { title: "\u041E\u0432\u0435\u0440\u043B\u0435\u0438", names: ["dialog", "tooltip", "dropdown-menu-item"] },
    { title: "CRM", names: ["crm-kpi-card", "crm-application-card", "crm-key-value-row", "crm-timeline-item", "crm-transfer-row", "crm-list-item"] }
  ];
  var DOC = "mbank-doc";
  var GAP4 = 48;
  var SECTION_GAP = 160;
  var PAD2 = 64;
  var ROW_WIDTH = 2400;
  var groupOf = (name) => (GROUPS.find((g) => g.names.includes(name)) || { title: "\u0414\u0440\u0443\u0433\u043E\u0435" }).title;
  function propsLine(c) {
    const parts = Object.entries(c.props || {}).map(([p, d]) => `${p}: ${(d.values || []).join(", ")}`);
    const states = (c.states || []).filter((s) => s !== "default");
    if (states.length) parts.push(`\u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F: ${states.join(", ")}`);
    return parts.join("   \xB7   ");
  }
  async function paint2(t, token, fallback) {
    const v = await colorVar(t, token, { create: false });
    const base = { type: "SOLID", color: fallback };
    return v ? figma.variables.setBoundVariableForPaint(base, "color", v) : base;
  }
  function label(font, chars, size3, style, fills) {
    const n = figma.createText();
    n.fontName = { family: font, style };
    n.fontSize = size3;
    n.characters = chars;
    n.fills = fills;
    return n;
  }
  async function card2(page, c, set, look) {
    let doc = page.findOne((n) => n.type === "FRAME" && n.getPluginData(DOC) === c.name);
    if (!doc) {
      doc = figma.createFrame();
      doc.setPluginData(DOC, c.name);
      page.appendChild(doc);
    }
    doc.name = `Doc / ${c.title || c.name}`;
    doc.layoutMode = "VERTICAL";
    doc.primaryAxisSizingMode = "AUTO";
    doc.counterAxisSizingMode = "AUTO";
    doc.itemSpacing = 16;
    doc.paddingTop = doc.paddingBottom = doc.paddingLeft = doc.paddingRight = 32;
    doc.cornerRadius = 24;
    doc.fills = [look.card];
    doc.strokes = [look.border];
    doc.strokeWeight = 1;
    for (const n of [...doc.children]) if (n !== set) n.remove();
    const variants = set.type === "COMPONENT_SET" ? set.children.length : 1;
    doc.insertChild(0, label(look.font, c.title || c.name, 28, "Bold", [look.text]));
    doc.insertChild(1, label(look.font, [`${variants} ${variants === 1 ? "\u0432\u0430\u0440\u0438\u0430\u043D\u0442" : "\u0432\u0430\u0440\u0438\u0430\u043D\u0442\u043E\u0432"}`, propsLine(c)].filter(Boolean).join("   \xB7   "), 14, "Regular", [look.muted]));
    if (set.type === "COMPONENT_SET") {
      set.fills = [look.surface];
      set.cornerRadius = 16;
    }
    if (set.parent !== doc) doc.appendChild(set);
    return doc;
  }
  async function kitSheet(page, items) {
    const t = await tokenIndex();
    const font = await loadFonts("Inter");
    const look = {
      font,
      card: await paint2(t, "card", { r: 1, g: 1, b: 1 }),
      surface: await paint2(t, "muted", { r: 0.96, g: 0.96, b: 0.97 }),
      border: await paint2(t, "border", { r: 0.9, g: 0.9, b: 0.92 }),
      text: await paint2(t, "foreground", { r: 0.06, g: 0.06, b: 0.07 }),
      muted: await paint2(t, "muted-foreground", { r: 0.45, g: 0.47, b: 0.5 }),
      page: await paint2(t, "background", { r: 0.97, g: 0.97, b: 0.98 })
    };
    const byGroup = /* @__PURE__ */ new Map();
    for (const it of items) {
      const g = groupOf(it.contract.name);
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g).push(it);
    }
    const order = [...GROUPS.map((g) => g.title), "\u0414\u0440\u0443\u0433\u043E\u0435"].filter((g) => byGroup.has(g));
    const sections = [];
    let y = 0;
    for (const g of order) {
      let section = page.findOne((n) => n.type === "SECTION" && n.getPluginData(DOC) === `group:${g}`);
      if (!section) {
        section = figma.createSection();
        section.setPluginData(DOC, `group:${g}`);
        page.appendChild(section);
      }
      section.name = g;
      section.fills = [look.page];
      const list2 = byGroup.get(g).sort((a, b) => {
        var _a, _b;
        return (((_a = GROUPS.find((x2) => x2.title === g)) == null ? void 0 : _a.names) || []).indexOf(a.contract.name) - (((_b = GROUPS.find((x2) => x2.title === g)) == null ? void 0 : _b.names) || []).indexOf(b.contract.name);
      });
      let x = PAD2;
      let rowY = PAD2 + 40;
      let rowH = 0;
      let maxX = 0;
      for (const it of list2) {
        const set = await figma.getNodeByIdAsync(it.setId);
        if (!set) continue;
        const doc = await card2(page, it.contract, set, look);
        section.appendChild(doc);
        if (x > PAD2 && x + doc.width > ROW_WIDTH) {
          x = PAD2;
          rowY += rowH + GAP4;
          rowH = 0;
        }
        doc.x = x;
        doc.y = rowY;
        x += doc.width + GAP4;
        rowH = Math.max(rowH, doc.height);
        maxX = Math.max(maxX, doc.x + doc.width);
      }
      section.resizeWithoutConstraints(Math.max(maxX + PAD2, 800), rowY + rowH + PAD2);
      section.x = 0;
      section.y = y;
      y += section.height + SECTION_GAP;
      sections.push(section);
    }
    return sections;
  }

  // plugin/src/shared-contracts.js
  var NAMESPACE = "mbank";
  var PREFIX = "contract:";
  function sharedContracts() {
    const out = {};
    for (const key of figma.root.getSharedPluginDataKeys(NAMESPACE).filter((k) => k.startsWith(PREFIX))) {
      const raw = figma.root.getSharedPluginData(NAMESPACE, key);
      if (!raw) continue;
      try {
        out[key.slice(PREFIX.length)] = JSON.parse(raw);
      } catch (e) {
      }
    }
    return out;
  }
  function putSharedContract(contract) {
    figma.root.setSharedPluginData(NAMESPACE, PREFIX + contract.name, JSON.stringify(contract));
  }
  function dropSharedContract(name) {
    figma.root.setSharedPluginData(NAMESPACE, PREFIX + name, "");
  }

  // plugin/src/contracts.js
  var PREFIX2 = "contract:";
  async function dropStrays(page, names) {
    let removed = 0;
    await figma.loadAllPagesAsync();
    for (const other of figma.root.children.filter((p) => p !== page)) {
      for (const n of other.findAll((x) => (x.type === "COMPONENT_SET" || x.type === "COMPONENT") && names.includes(x.getPluginData("mbank-contract")))) {
        const parts = n.type === "COMPONENT_SET" ? n.children : [n];
        let used = false;
        for (const p of parts) if ((await p.getInstancesAsync()).length) {
          used = true;
          break;
        }
        if (!used) {
          n.remove();
          removed++;
        }
      }
    }
    return removed;
  }
  function stored() {
    const out = {};
    for (const key of figma.root.getPluginDataKeys().filter((k) => k.startsWith(PREFIX2))) {
      try {
        out[key.slice(PREFIX2.length)] = JSON.parse(figma.root.getPluginData(key));
      } catch (e) {
      }
    }
    return __spreadValues(__spreadValues({}, out), sharedContracts());
  }
  function putContract(c) {
    putSharedContract(c);
    figma.root.setPluginData(PREFIX2 + c.name, "");
  }
  function allContracts(bundled) {
    const out = /* @__PURE__ */ new Map();
    for (const c of bundled) out.set(c.name, { contract: c, source: c.example ? "example" : "bundled" });
    for (const [name, c] of Object.entries(stored())) {
      const own = out.get(name);
      if (own && !c.edited) out.set(name, { contract: __spreadProps(__spreadValues({}, own.contract), { figma: __spreadValues(__spreadValues({}, own.contract.figma || {}), c.figma || {}) }), source: own.source });
      else out.set(name, { contract: c, source: own ? "edited" : "file" });
    }
    return out;
  }
  function get(bundled, name) {
    const hit = allContracts(bundled).get(name);
    if (!hit) throw new Error(`\u041D\u0435\u0442 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430 \xAB${name}\xBB`);
    return hit.contract;
  }
  var strip = (_a) => {
    var _b = _a, { example } = _b, c = __objRest(_b, ["example"]);
    return c;
  };
  async function summary(bundled) {
    const pageNamed = (name) => figma.root.children.find((p) => p.name === name);
    const list2 = [...allContracts(bundled).values()];
    for (const name of new Set(list2.map(({ contract }) => pageOf(contract)))) {
      const p = pageNamed(name);
      if (p && p.loadAsync) await p.loadAsync();
    }
    return list2.map(({ contract: c, source }) => ({
      name: c.name,
      title: c.title || c.name,
      source,
      errors: validateContract(c),
      variants: validateContract(c).length ? 0 : variantList(c).length,
      rendered: !!(pageNamed(pageOf(c)) && findSet(pageNamed(pageOf(c)), c))
    }));
  }
  async function render(c, m) {
    const res = await renderContract(c, { font: m.font, prune: m.prune, create: m.create });
    if (res.errors) return res;
    putContract(__spreadValues(__spreadValues({}, strip(res.contract)), c.edited ? { edited: true } : {}));
    const node = await figma.getNodeByIdAsync(res.report.setId);
    if (node && m.focus !== false) {
      await figma.setCurrentPageAsync(await componentsPage(pageOf(c)));
      figma.viewport.scrollAndZoomIntoView([node]);
    }
    return res;
  }
  function contractHandlers(bundled) {
    return {
      async "contracts-list"() {
        return { contracts: await summary(bundled), templates: Object.entries(TEMPLATES).map(([id, t]) => ({ id, title: t.title })) };
      },
      async "contract-import"(m) {
        const list2 = Array.isArray(m.json) ? m.json : [m.json];
        const errors = {};
        for (const c of list2) {
          const e = validateContract(c);
          if (e.length) errors[(c == null ? void 0 : c.name) || "?"] = e;
          else putContract(__spreadProps(__spreadValues({}, strip(c)), { edited: true }));
        }
        return { errors, contracts: await summary(bundled) };
      },
      async "contract-render"(m) {
        let c = get(bundled, m.name);
        if (m.states) c = __spreadProps(__spreadValues({}, c), { states: m.states, edited: true });
        const res = await render(c, m);
        return __spreadProps(__spreadValues({}, res), { contracts: await summary(bundled) });
      },
      // New project: every component on one page (PAGE), laid out in a grid; again = update in place.
      async "contract-render-all"(m) {
        resetLibraryImports();
        const done = [];
        const failed = [];
        const missing = /* @__PURE__ */ new Set();
        const usesKit = (c) => Object.values(c.anatomy || {}).some((a) => a && a.kind === "instance");
        const list2 = [...allContracts(bundled).values()].sort((a, b) => usesKit(a.contract) - usesKit(b.contract));
        for (const { contract } of list2) {
          if (validateContract(contract).length) {
            failed.push(contract.name);
            continue;
          }
          const c = __spreadProps(__spreadValues({}, contract), { figma: __spreadProps(__spreadValues({}, contract.figma || {}), { page: PAGE }) });
          const res = await render(c, __spreadProps(__spreadValues({}, m), { focus: false }));
          if (res.errors) failed.push(c.name);
          else done.push({ contract: res.contract, setId: res.report.setId });
          for (const x of res.report && res.report.missing || []) missing.add(`${x.kind}:${x.token}`);
        }
        const page = await componentsPage(PAGE);
        const removed = await dropStrays(page, done.map((d) => d.contract.name));
        const sections = await kitSheet(page, done);
        await figma.setCurrentPageAsync(page);
        if (sections.length) figma.viewport.scrollAndZoomIntoView(sections);
        return { built: done.length, failed, removed, missing: [...missing], page: page.name, contracts: await summary(bundled) };
      },
      async "contract-rows"(m) {
        const c = get(bundled, m.name);
        return { name: c.name, contract: c, rows: bindingRows(c), vars: await listVariables() };
      },
      async "contract-bind"(m) {
        const c = __spreadProps(__spreadValues({}, setBinding(get(bundled, m.name), m.path, m.key, m.value)), { edited: true });
        const errors = validateContract(c);
        if (errors.length) return { errors };
        putContract(strip(c));
        const page = await componentsPage(pageOf(c));
        const res = findSet(page, c) ? await render(c, __spreadProps(__spreadValues({}, m), { focus: false })) : { contract: c };
        return { name: c.name, rows: bindingRows(res.contract || c), report: res.report, contract: res.contract || c };
      },
      async "contract-new"(m) {
        const c = newContract(m);
        if (allContracts(bundled).has(c.name) && !m.replace) throw new Error(`\u041A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 \xAB${c.name}\xBB \u0443\u0436\u0435 \u0435\u0441\u0442\u044C`);
        putContract(c);
        const res = await render(c, m);
        return __spreadProps(__spreadValues({}, res), { contracts: await summary(bundled) });
      },
      async "contract-reset"(m) {
        figma.root.setPluginData(PREFIX2 + m.name, "");
        dropSharedContract(m.name);
        return { contracts: await summary(bundled) };
      },
      async "contract-export"(m) {
        const all = [...allContracts(bundled).values()].map((x) => strip(x.contract));
        const list2 = m.name ? all.filter((c) => c.name === m.name) : all;
        return { schema: SCHEMA, contracts: list2 };
      },
      async "vars-list"() {
        return { vars: await listVariables() };
      }
    };
  }

  // ds:contracts
  var contracts_default = [{ "$schema": "mbank/component@1", "name": "alert", "title": "Alert", "figma": { "name": "alert-text", "key": "862527fc2fc9aad902f137eb72e3d82620897a9d", "nodeId": "3012:33" }, "parts": ["root", "icon", "body", "title", "description"], "anatomy": { "root": { "width": 360 }, "icon": { "icon": "info" }, "body": { "fill": true }, "title": { "parent": "body", "sample": "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F", "fill": true }, "description": { "parent": "body", "sample": "\u041A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u0442\u0435\u043A\u0441\u0442: \u0447\u0442\u043E \u0441\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u0438 \u0447\u0442\u043E \u0434\u0435\u043B\u0430\u0442\u044C \u0434\u0430\u043B\u044C\u0448\u0435.", "fill": true } }, "props": { "tone": { "values": ["clear", "error"], "default": "clear" } }, "base": { "root": { "radius": "lg", "px": 4, "py": 3, "text": "sm", "align": "start", "gap": 3, "border-width": 1, "border": "border" }, "icon": { "size": 5 }, "title": { "weight": "bold" }, "body": { "layout": "column", "gap": 1 }, "description": { "weight": "regular" } }, "variants": { "tone": { "clear": { "root": { "bg": "card", "fg": "card-foreground" } }, "error": { "root": { "bg": "card", "fg": "destructive" } } } }, "states": ["default"], "code": { "file": "alert.tsx", "export": "alertVariants", "template": "card-like", "parts": { "icon": "[&>svg]" }, "blocks": ["title"], "extra": "relative grid w-full grid-cols-[0_1fr] gap-y-0.5 has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3 [&>svg]:translate-y-0.5 [&>svg]:text-current", "extras": { "title": "col-start-2" }, "figmaOnly": ["body", "description"], "overrides": { "root": { "gap": null } } } }, { "$schema": "mbank/component@1", "name": "avatar", "title": "Avatar", "figma": { "name": "Avatars", "key": "a3d5e7947473b09bf719839c62a18d751927d7a8", "nodeId": "3174:1503" }, "parts": ["root", "fallback", "text"], "anatomy": { "fallback": { "fill": true }, "text": { "parent": "fallback", "sample": "\u0410\u0422" } }, "props": { "size": { "values": ["xs", "sm", "md", "lg", "xl"], "default": "md" } }, "base": { "root": { "radius": "full", "layout": "row" }, "fallback": { "radius": "full", "bg": "muted", "weight": "medium", "fg": "muted-foreground", "layout": "row", "align": "center" }, "text": { "fg": "muted-foreground", "weight": "medium" } }, "variants": { "size": { "xs": { "root": { "size": 6, "text": "xs" } }, "sm": { "root": { "size": 8, "text": "xs" } }, "md": { "root": { "size": 10, "text": "sm" } }, "lg": { "root": { "size": 14, "text": "base" } }, "xl": { "root": { "size": 18, "text": "xl" } } } }, "states": ["default"], "code": { "file": "avatar.tsx", "export": "avatarVariants", "template": "badge-like", "blocks": ["fallback"], "extra": "relative shrink-0 overflow-hidden", "extras": { "fallback": "size-full justify-center" }, "figmaOnly": ["text"] } }, { "$schema": "mbank/component@1", "name": "badge", "title": "Badge", "figma": { "name": "Badge-status", "key": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "nodeId": "2348:2631" }, "parts": ["root", "icon", "label"], "props": { "tone": { "values": ["neutral", "accent", "error", "clear"], "default": "neutral" }, "shape": { "values": ["rounded", "square"], "default": "rounded" }, "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 1, "weight": "medium", "align": "center" }, "icon": { "size": 3, "hidden": true } }, "variants": { "tone": { "neutral": { "root": { "bg": "secondary", "fg": "secondary-foreground" } }, "accent": { "root": { "bg": "primary", "fg": "primary-foreground" } }, "error": { "root": { "bg": "destructive/10", "fg": "destructive" } }, "clear": { "root": { "border-width": 1, "border": "border", "fg": "foreground" } } }, "shape": { "rounded": { "root": { "radius": "full" } }, "square": { "root": { "radius": "sm" } } }, "size": { "sm": { "root": { "height": 5, "px": 1.5, "text": "xs" } }, "md": { "root": { "height": 6, "px": 2, "text": "xs" } }, "lg": { "root": { "height": 7, "px": 2.5, "text": "sm" } } } }, "states": ["default"], "code": { "file": "badge.tsx", "export": "badgeVariants", "template": "badge-like", "parts": { "icon": "[&>svg]" }, "extra": "inline-flex w-fit shrink-0 justify-center overflow-hidden whitespace-nowrap [&>svg]:pointer-events-none", "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "breadcrumb-item", "title": "Breadcrumb item", "figma": { "name": "Breadcrumb", "key": "385c08c28fbb4a95a06b073d1fc99963af0c26c8", "nodeId": "4240:4717" }, "parts": ["root", "label", "separator"], "anatomy": { "label": { "kind": "text", "layer": "Label", "sample": "\u0417\u0430\u044F\u0432\u043A\u0438" }, "separator": { "kind": "text", "layer": "Separator", "sample": "/" } }, "props": { "current": { "values": ["false", "true"], "default": "false" } }, "base": { "root": { "align": "center", "gap": 2, "text": "sm", "fg": "muted-foreground" } }, "variants": { "current": { "false": {}, "true": { "root": { "fg": "foreground", "weight": "medium" }, "separator": { "hidden": true } } } }, "states": ["default"], "code": { "file": "breadcrumb-item.tsx", "template": "badge-like", "extra": "inline-flex min-w-0 whitespace-nowrap", "figmaOnly": ["label", "separator"] } }, { "$schema": "mbank/component@1", "name": "button", "title": "Button", "figma": { "name": "button/default", "key": "713c90401df3b5d7ddf00e3af4d7ea5870c4c120", "nodeId": "2077:341" }, "parts": ["root", "icon", "label"], "props": { "variant": { "values": ["primary", "secondary", "destructive", "outline", "ghost", "link"], "default": "primary" }, "size": { "values": ["xs", "sm", "md", "lg", "icon-sm", "icon", "icon-lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "weight": "medium", "opacity:disabled": 50, "align": "center", "focus-ring": "ring/50" }, "icon": { "size": 5, "hidden": true } }, "variants": { "variant": { "primary": { "root": { "bg": "primary", "fg": "primary-foreground", "bg:hover": "primary/90" } }, "secondary": { "root": { "bg": "secondary", "fg": "secondary-foreground", "bg:hover": "secondary/80" } }, "destructive": { "root": { "bg": "destructive/10", "fg": "destructive", "bg:hover": "destructive/20" } }, "ghost": { "root": { "fg": "foreground", "bg:hover": "accent", "fg:hover": "accent-foreground" } }, "outline": { "root": { "border-width": 1, "border": "border", "bg": "background", "fg": "foreground", "bg:hover": "accent", "fg:hover": "accent-foreground" } }, "link": { "root": { "px": 0, "fg": "primary" } } }, "size": { "xs": { "root": { "height": 8, "px": 3, "text": "xs" }, "icon": { "size": 4 } }, "sm": { "root": { "height": 9, "px": 3, "text": "sm" }, "icon": { "size": 4 } }, "md": { "root": { "height": 11, "px": 4, "text": "sm" } }, "lg": { "root": { "height": 14, "px": 6, "text": "base" } }, "icon-sm": { "root": { "size": 9 }, "label": { "hidden": true }, "icon": { "hidden": false } }, "icon": { "root": { "size": 11 }, "label": { "hidden": true }, "icon": { "hidden": false } }, "icon-lg": { "root": { "size": 14 }, "label": { "hidden": true }, "icon": { "hidden": false } } } }, "states": ["default", "hover", "focus", "disabled"], "code": { "file": "button.tsx", "export": "buttonVariants", "template": "button-like", "parts": { "icon": "[&_svg:not([class*='size-'])]" }, "extra": "inline-flex shrink-0 justify-center whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", "extras": { "variant=link": "h-auto underline-offset-4 hover:underline" }, "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "card", "title": "Card", "parts": ["root", "header", "title", "description", "content", "body", "footer", "action"], "anatomy": { "root": { "width": 320 }, "header": { "fill": true }, "title": { "parent": "header", "sample": "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438" }, "description": { "parent": "header", "sample": "\u041A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0433\u043E" }, "content": { "fill": true }, "footer": { "fill": true }, "body": { "parent": "content", "kind": "text", "sample": "\u0417\u0434\u0435\u0441\u044C \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438: \u0442\u0435\u043A\u0441\u0442, \u0441\u043F\u0438\u0441\u043E\u043A \u0438\u043B\u0438 \u0442\u0430\u0431\u043B\u0438\u0446\u0430.", "fill": true }, "action": { "parent": "footer", "kind": "instance", "component": { "name": "Button" }, "sample": "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435" } }, "props": {}, "base": { "root": { "gap": 4, "radius": "lg", "border-width": 1, "border": "border", "bg": "card", "py": 5, "fg": "card-foreground", "layout": "column" }, "header": { "gap": 1, "px": 5, "align": "start", "layout": "column" }, "title": { "text": "base", "weight": "bold" }, "description": { "text": "sm", "fg": "muted-foreground" }, "content": { "px": 5, "layout": "column" }, "footer": { "gap": 2, "px": 5, "layout": "row", "align": "start" }, "body": { "text": "sm", "fg": "muted-foreground" } }, "variants": {}, "states": ["default"], "code": { "file": "card.tsx", "shape": "classes", "template": "card-like", "blocks": ["header", "title", "description", "content", "footer"], "extras": { "header": "grid auto-rows-min grid-rows-[auto_auto] has-data-[slot=card-action]:grid-cols-[1fr_auto]", "footer": "[.border-t]:pt-4" }, "figmaOnly": ["body", "action"], "overrides": { "header": { "layout": null }, "content": { "layout": null }, "footer": { "align": "center" } } } }, { "$schema": "mbank/component@1", "name": "checkbox", "title": "Checkbox", "figma": { "name": "Switchers - Check", "key": "be053b3924b63e289a38bfd661b7180deb83236e", "nodeId": "2280:9729" }, "parts": ["root", "icon", "icon-minus"], "anatomy": { "icon": { "icon": "check" }, "icon-minus": { "icon": "minus" } }, "props": {}, "base": { "root": { "size": 5, "radius": "sm", "border-width": 1, "border": "input", "bg": "background", "border:invalid": "destructive", "border:checked": "primary", "bg:checked": "primary", "fg:checked": "primary-foreground", "border:indeterminate": "primary", "bg:indeterminate": "primary", "fg:indeterminate": "primary-foreground", "focus-ring": "ring/50", "align": "center", "opacity:disabled": 50 }, "icon": { "size": 4, "hidden": true, "hidden:checked": false }, "icon-minus": { "size": 4, "hidden": true, "hidden:indeterminate": false } }, "variants": {}, "states": ["default", "focus", "disabled", "invalid", "checked", "indeterminate"], "code": { "file": "checkbox.tsx", "shape": "classes", "template": "button-like", "modifiers": { "checked": "data-[state=checked]", "indeterminate": "data-[state=indeterminate]" }, "extra": "peer shrink-0 transition-colors outline-none disabled:cursor-not-allowed", "figmaOnly": ["icon", "icon-minus"], "overrides": { "root": { "align": null, "layout": null } } } }, { "$schema": "mbank/component@1", "name": "crm-application-card", "title": "CRM / Application card", "figma": { "name": "CRM / Application card", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "33:28", "uses": 15 } }, "parts": ["root", "top", "id", "time", "name", "amount", "meta", "footer", "badge"], "anatomy": { "root": { "width": 200 }, "top": { "kind": "frame", "layer": "Top", "fill": true }, "id": { "kind": "text", "layer": "ID", "parent": "top", "sample": "CL-240118" }, "time": { "kind": "text", "layer": "Time", "parent": "top", "sample": "09:14" }, "name": { "kind": "text", "layer": "Name", "fill": true, "sample": "\u0410\u0441\u0430\u043D\u043E\u0432 \u041D\u0443\u0440\u043B\u0430\u043D" }, "amount": { "kind": "text", "layer": "Amount", "sample": "450 000 KGS" }, "meta": { "kind": "text", "layer": "Meta", "fill": true, "sample": "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \xB7 24 \u043C\u0435\u0441" }, "footer": { "kind": "frame", "layer": "Footer", "fill": true }, "badge": { "kind": "instance", "layer": "Badge-status", "parent": "footer", "sample": "SLA 25 \u043C\u0438\u043D", "component": { "name": "Badge-status", "set": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "key": "b68afd3e0714ecefd38ee21793292c14ae240015", "variant": "Size=S, Form=rounded, Appearance=Info, Status=Off, Icon=Off, Solid=off" } } }, "props": {}, "base": { "root": { "layout": "column", "gap": 1, "px": 3, "py": 3, "radius": "md", "bg": "card", "fg": "foreground" }, "top": { "layout": "row", "align": "between" }, "id": { "text": "xs", "fg": "muted-foreground", "weight": "regular" }, "time": { "text": "xs", "fg": "muted-foreground", "weight": "regular" }, "name": { "text": "sm", "weight": "medium", "fg": "foreground" }, "amount": { "text": "base", "weight": "bold", "fg": "foreground" }, "meta": { "text": "xs", "fg": "muted-foreground", "weight": "regular" }, "footer": { "layout": "row", "align": "start", "pt": 1 } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/ApplicationCard.tsx", "slot": "application-card" } }, { "$schema": "mbank/component@1", "name": "crm-key-value-row", "title": "CRM / Key-value row", "figma": { "name": "CRM / Key-value row", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "24:6539", "uses": 26 } }, "parts": ["root", "label", "value"], "anatomy": { "root": { "width": 480 }, "label": { "kind": "text", "layer": "Label", "width": 180, "sample": "\u041A\u043B\u044E\u0447" }, "value": { "kind": "text", "layer": "Value", "fill": true, "sample": "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435" } }, "props": {}, "base": { "root": { "layout": "row", "align": "start", "gap": 4, "px": 0, "py": 2, "text": "sm" }, "label": { "text": "sm", "fg": "muted-foreground", "weight": "regular" }, "value": { "text": "sm", "weight": "medium", "fg": "foreground" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/KeyValueRow.tsx", "slot": "key-value-row" } }, { "$schema": "mbank/component@1", "name": "crm-kpi-card", "title": "CRM / KPI card", "figma": { "name": "CRM / KPI card", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "21:1819", "uses": 8 } }, "parts": ["root", "label", "value", "delta", "delta-value", "delta-label"], "anatomy": { "root": { "width": 260 }, "label": { "kind": "text", "layer": "Label", "sample": "\u041F\u0435\u0440\u0435\u0432\u043E\u0434\u043E\u0432 \u0441\u0435\u0433\u043E\u0434\u043D\u044F" }, "value": { "kind": "text", "layer": "Value", "sample": "12 480" }, "delta": { "kind": "frame", "layer": "Delta" }, "delta-value": { "kind": "text", "layer": "Delta value", "parent": "delta", "sample": "+8,2%" }, "delta-label": { "kind": "text", "layer": "Delta label", "parent": "delta", "sample": "\u043A \u0432\u0447\u0435\u0440\u0430" } }, "props": {}, "base": { "root": { "layout": "column", "gap": 2, "px": 5, "py": 5, "radius": "lg", "bg": "card", "fg": "foreground" }, "label": { "text": "sm", "fg": "muted-foreground", "weight": "regular" }, "value": { "text": "2xl", "weight": "bold", "fg": "foreground" }, "delta": { "layout": "row", "align": "center", "gap": 1 }, "delta-value": { "text": "sm", "weight": "medium", "fg": "foreground" }, "delta-label": { "text": "xs", "fg": "muted-foreground", "weight": "regular" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/KpiCard.tsx", "slot": "kpi-card" } }, { "$schema": "mbank/component@1", "name": "crm-list-item", "title": "CRM / List item", "figma": { "name": "CRM / List item", "page": "\u2630 CRM blocks" }, "parts": ["root", "avatar", "content", "title", "subtitle", "meta"], "anatomy": { "root": { "width": 360, "sides": ["bottom"] }, "avatar": { "kind": "instance", "layer": "Avatar", "sample": "\u0410\u041D", "component": { "name": "Avatar", "set": "a3d5e7947473b09bf719839c62a18d751927d7a8", "key": "2c3fca6917c56c5d664a8c1a8159dedb38cc26ac", "variant": "Size=40 px, Placeholder=False, Upload=False, Name=False" } }, "content": { "kind": "frame", "layer": "Content", "fill": true }, "title": { "kind": "text", "layer": "Title", "sample": "\u0410\u0441\u0430\u043D\u043E\u0432 \u041D\u0443\u0440\u043B\u0430\u043D", "parent": "content", "fill": true }, "subtitle": { "kind": "text", "layer": "Subtitle", "sample": "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \xB7 450 000 KGS", "parent": "content", "fill": true }, "meta": { "kind": "text", "layer": "Meta", "sample": "09:14" } }, "props": {}, "base": { "root": { "layout": "row", "align": "center", "gap": 3, "px": 4, "py": 3, "bg": "card", "border-width": 1, "border": "border" }, "content": { "layout": "column", "gap": 1 }, "title": { "text": "sm", "weight": "medium", "fg": "foreground" }, "subtitle": { "text": "xs", "weight": "regular", "fg": "muted-foreground" }, "meta": { "text": "xs", "weight": "regular", "fg": "muted-foreground" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/ListItem.tsx", "slot": "crm-list-item" } }, { "$schema": "mbank/component@1", "name": "crm-timeline-item", "title": "CRM / Timeline item", "figma": { "name": "CRM / Timeline item", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "24:6542", "uses": 8 } }, "parts": ["root", "marker", "dot", "content", "title", "meta"], "anatomy": { "root": { "width": 320 }, "marker": { "kind": "frame", "layer": "Marker" }, "dot": { "kind": "frame", "layer": "Dot", "parent": "marker" }, "content": { "kind": "frame", "layer": "Content", "fill": true }, "title": { "kind": "text", "layer": "Title", "parent": "content", "fill": true, "sample": "\u0421\u043E\u0431\u044B\u0442\u0438\u0435" }, "meta": { "kind": "text", "layer": "Meta", "parent": "content", "sample": "12.10.2026, 14:32 \xB7 \u0421\u0438\u0441\u0442\u0435\u043C\u0430" } }, "props": {}, "base": { "root": { "layout": "row", "align": "start", "gap": 3 }, "marker": { "layout": "column", "px": 0, "pt": 1, "pb": 0 }, "dot": { "size": 3, "radius": "full", "bg": "primary" }, "content": { "layout": "column", "gap": 1 }, "title": { "text": "sm", "weight": "medium", "fg": "foreground" }, "meta": { "text": "xs", "fg": "muted-foreground", "weight": "regular" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/TimelineItem.tsx", "slot": "timeline-item" } }, { "$schema": "mbank/component@1", "name": "crm-transfer-row", "title": "CRM / Transfer row", "figma": { "name": "CRM / Transfer row", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "23:10079", "uses": 10 } }, "parts": ["root", "id-cell", "id-content", "id", "date-cell", "date-content", "date", "sender-cell", "sender-content", "sender", "recipient-cell", "recipient-content", "recipient", "country-cell", "country-content", "country", "amount-cell", "amount-content", "amount", "channel-cell", "channel-content", "channel", "status-cell", "status"], "anatomy": { "root": { "sides": ["bottom"] }, "id-cell": { "kind": "frame", "layer": "TableCell 1", "width": 124, "sides": ["right"] }, "id-content": { "kind": "frame", "layer": "TextContent", "parent": "id-cell", "fill": true }, "id": { "kind": "text", "layer": "Label", "parent": "id-content", "fill": true, "sample": "TR-80421951" }, "date-cell": { "kind": "frame", "layer": "TableCell 2", "width": 156, "sides": ["right"] }, "date-content": { "kind": "frame", "layer": "TextContent", "parent": "date-cell", "fill": true }, "date": { "kind": "text", "layer": "Label", "parent": "date-content", "fill": true, "sample": "12.10.2026, 14:32" }, "sender-cell": { "kind": "frame", "layer": "TableCell 3", "width": 160, "sides": ["right"] }, "sender-content": { "kind": "frame", "layer": "TextContent", "parent": "sender-cell", "fill": true }, "sender": { "kind": "text", "layer": "Label", "parent": "sender-content", "fill": true, "sample": "\u0411\u0430\u043A\u044B\u0442 \u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B\u043E\u0432" }, "recipient-cell": { "kind": "frame", "layer": "TableCell 4", "width": 170, "sides": ["right"] }, "recipient-content": { "kind": "frame", "layer": "TextContent", "parent": "recipient-cell", "fill": true }, "recipient": { "kind": "text", "layer": "Label", "parent": "recipient-content", "fill": true, "sample": "\u0418\u0432\u0430\u043D \u041F\u0435\u0442\u0440\u043E\u0432" }, "country-cell": { "kind": "frame", "layer": "TableCell 5", "width": 116, "sides": ["right"] }, "country-content": { "kind": "frame", "layer": "TextContent", "parent": "country-cell", "fill": true }, "country": { "kind": "text", "layer": "Label", "parent": "country-content", "fill": true, "sample": "\u0420\u043E\u0441\u0441\u0438\u044F" }, "amount-cell": { "kind": "frame", "layer": "TableCell 6", "width": 124, "sides": ["right"] }, "amount-content": { "kind": "frame", "layer": "TextContent", "parent": "amount-cell", "fill": true }, "amount": { "kind": "text", "layer": "Label", "parent": "amount-content", "fill": true, "sample": "185 000 KGS" }, "channel-cell": { "kind": "frame", "layer": "TableCell 7", "width": 128, "sides": ["right"] }, "channel-content": { "kind": "frame", "layer": "TextContent", "parent": "channel-cell", "fill": true }, "channel": { "kind": "text", "layer": "Label", "parent": "channel-content", "fill": true, "sample": "\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435" }, "status-cell": { "kind": "frame", "layer": "TableCell 8", "width": 138, "sides": ["right"] }, "status": { "kind": "instance", "layer": "Badge-status", "parent": "status-cell", "sample": "\u0423\u0441\u043F\u0435\u0448\u043D\u043E", "component": { "name": "Badge-status", "set": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "key": "4c16cc198bc2c10f229898b330166c1db17200b6", "variant": "Size=S, Form=rounded, Appearance=Success, Status=Off, Icon=Off, Solid=off" } } }, "props": {}, "base": { "root": { "layout": "row", "align": "center", "bg": "background", "border": "border", "border-width": 1, "text": "sm" }, "id-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "id-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "id": { "text": "sm", "weight": "regular", "fg": "foreground" }, "date-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "date-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "date": { "text": "sm", "weight": "regular", "fg": "foreground" }, "sender-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "sender-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "sender": { "text": "sm", "weight": "regular", "fg": "foreground" }, "recipient-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "recipient-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "recipient": { "text": "sm", "weight": "regular", "fg": "foreground" }, "country-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "country-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "country": { "text": "sm", "weight": "regular", "fg": "foreground" }, "amount-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "amount-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "amount": { "text": "sm", "weight": "regular", "fg": "foreground" }, "channel-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "channel-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "channel": { "text": "sm", "weight": "regular", "fg": "foreground" }, "status-cell": { "layout": "row", "align": "center", "gap": 2, "px": 3, "border": "border", "border-width": 1, "py": 3 } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/TransferRow.tsx", "slot": "transfer-row", "inline": ["id-content", "id", "date-content", "date", "sender-content", "sender", "recipient-content", "recipient", "country-content", "country", "amount-content", "amount", "channel-content", "channel"] } }, { "$schema": "mbank/component@1", "name": "date-picker-trigger", "title": "Date picker trigger", "figma": { "name": "input/calendar-single", "key": "9015ffe0c43d059151c3c414323b4e24e9140985", "nodeId": "2250:4032" }, "parts": ["root", "placeholder", "icon"], "anatomy": { "root": { "width": 240 }, "placeholder": { "kind": "text", "layer": "Placeholder", "sample": "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443", "fill": true }, "icon": { "kind": "icon", "icon": "calendar" } }, "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "text": "sm", "fg": "foreground", "border:focus": "ring", "layout": "row", "align": "between", "focus-ring": "ring/50", "border:invalid": "destructive", "opacity:disabled": 50 }, "placeholder": { "fg": "muted-foreground" }, "icon": { "size": 5, "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9 } }, "md": { "root": { "height": 11 } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "focus", "disabled", "invalid"], "code": { "file": "date-picker.tsx", "shape": "classes", "template": "button-like", "parts": { "placeholder": "data-[placeholder]" }, "maps": { "size": { "const": "pickerSizes", "part": "root" } }, "extra": "w-full text-left whitespace-nowrap transition-colors outline-none disabled:pointer-events-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", "figmaOnly": ["icon"] } }, { "$schema": "mbank/component@1", "name": "dialog", "title": "Dialog", "figma": { "name": "dialogInfo", "key": "12ed29cbe7be8badd626f5b83ad2a37ab905ebd8", "nodeId": "2405:4807" }, "parts": ["root", "header", "title", "description", "content", "footer", "cancel", "confirm"], "anatomy": { "root": { "width": 480 }, "header": { "kind": "frame", "layer": "Header", "fill": true }, "title": { "kind": "text", "layer": "Title", "sample": "\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443?", "parent": "header", "fill": true }, "description": { "kind": "text", "layer": "Description", "sample": "\u041A\u043B\u0438\u0435\u043D\u0442 \u043F\u043E\u043B\u0443\u0447\u0438\u0442 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0441 \u043F\u0440\u0438\u0447\u0438\u043D\u043E\u0439 \u043E\u0442\u043A\u0430\u0437\u0430", "parent": "header", "fill": true }, "content": { "kind": "frame", "layer": "Content", "fill": true }, "footer": { "kind": "frame", "layer": "Footer", "fill": true }, "cancel": { "kind": "instance", "layer": "Cancel", "parent": "footer", "sample": "\u041E\u0442\u043C\u0435\u043D\u0430", "component": { "name": "Button" } }, "confirm": { "kind": "instance", "layer": "Confirm", "parent": "footer", "sample": "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C", "component": { "name": "Button" } } }, "props": {}, "base": { "root": { "layout": "column", "gap": 4, "px": 6, "py": 6, "radius": "lg", "bg": "card", "fg": "foreground", "shadow": "lg" }, "header": { "layout": "column", "gap": 2 }, "title": { "text": "xl", "weight": "bold" }, "description": { "text": "sm", "fg": "muted-foreground" }, "content": { "layout": "column", "gap": 2, "min-height": 16 }, "footer": { "layout": "row", "align": "end", "gap": 2 } }, "variants": {}, "states": ["default"], "code": { "file": "dialog.tsx", "shape": "classes", "template": "card-like", "blocks": ["header", "title", "description", "footer"], "extra": "fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none", "extras": { "header": "pr-8", "footer": "flex flex-col-reverse sm:flex-row sm:justify-end" }, "figmaOnly": ["content", "cancel", "confirm"], "overrides": { "root": { "layout": null }, "footer": { "layout": null, "align": null } } } }, { "$schema": "mbank/component@1", "name": "dropdown-menu-item", "title": "Dropdown menu item", "figma": { "name": "Item / dropdown / simple", "key": "79cec158925db00a687b7dc969846592cf4cb98f", "nodeId": "5020:11626" }, "parts": ["root", "icon", "label", "shortcut"], "anatomy": { "root": { "width": 220 }, "icon": { "kind": "icon", "icon": "file" }, "label": { "kind": "text", "layer": "Label", "sample": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C", "fill": true }, "shortcut": { "kind": "text", "layer": "Shortcut", "sample": "\u2318O" } }, "props": { "variant": { "values": ["default", "destructive"], "default": "default" } }, "base": { "root": { "align": "center", "gap": 2, "px": 2, "height": 8, "radius": "sm", "text": "sm", "fg": "foreground", "bg:hover": "accent", "opacity:disabled": 50, "fg:hover": "accent-foreground" }, "icon": { "size": 4, "fg": "muted-foreground" }, "shortcut": { "text": "xs", "fg": "muted-foreground" } }, "variants": { "variant": { "default": {}, "destructive": { "root": { "fg": "destructive", "bg:hover": "destructive/10", "fg:hover": "destructive" }, "icon": { "fg": "destructive" } } } }, "states": ["default", "hover", "disabled"], "code": { "file": "dropdown-menu.tsx", "shape": "classes", "template": "button-like", "modifiers": { "hover": "data-[highlighted]", "disabled": "data-[disabled]" }, "parts": { "icon": "[&_svg]" }, "prefix": { "variant": "data-[variant={value}]" }, "extra": "relative flex cursor-default outline-none select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0", "figmaOnly": ["label", "shortcut"] } }, { "$schema": "mbank/component@1", "name": "empty-state", "title": "Empty state", "figma": { "name": "Empty state" }, "parts": ["root", "icon", "title", "description", "action"], "anatomy": { "root": { "width": 400 }, "icon": { "kind": "icon", "icon": "inbox" }, "title": { "kind": "text", "layer": "Title", "sample": "\u0417\u0430\u044F\u0432\u043E\u043A \u043F\u043E\u043A\u0430 \u043D\u0435\u0442" }, "description": { "kind": "text", "layer": "Description", "sample": "\u041D\u043E\u0432\u044B\u0435 \u0437\u0430\u044F\u0432\u043A\u0438 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C" }, "action": { "kind": "instance", "layer": "Action", "sample": "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443", "component": { "name": "Button" } } }, "props": {}, "base": { "root": { "layout": "column", "align": "center", "gap": 3, "px": 6, "py": 16, "radius": "lg", "border-width": 1, "border": "border" }, "icon": { "size": 7, "fg": "muted-foreground" }, "title": { "text": "base", "weight": "bold", "fg": "foreground" }, "description": { "text": "sm", "fg": "muted-foreground" } }, "variants": {}, "states": ["default"], "code": { "file": "EmptyState.tsx", "shape": "classes", "template": "card-like", "extra": "border-dashed text-center", "figmaOnly": ["icon", "title", "description", "action"] } }, { "$schema": "mbank/component@1", "name": "filter-chip", "title": "Filter chip", "figma": { "name": "Item / chipsButton", "key": "a2f7f17786d9e319cebd76c4fe36b067d6f7654f", "nodeId": "2426:13606" }, "parts": ["root", "label", "icon"], "anatomy": { "label": { "kind": "text", "layer": "Label", "sample": "\u0421\u0442\u0430\u0442\u0443\u0441" }, "icon": { "kind": "icon", "icon": "chevron" } }, "props": {}, "base": { "root": { "align": "center", "gap": 1, "px": 3, "height": 9, "radius": "sm", "border-width": 1, "border": "border", "bg": "background", "text": "sm", "weight": "medium", "fg": "foreground", "bg:selected": "primary", "border:selected": "primary", "fg:selected": "primary-foreground", "bg:hover": "accent" }, "icon": { "size": 5 } }, "variants": {}, "states": ["default", "hover", "selected"], "code": { "file": "filter-chip.tsx", "template": "button-like", "modifiers": { "selected": "aria-pressed" }, "parts": { "icon": "[&_svg]" }, "extra": "inline-flex shrink-0 whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:shrink-0", "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "input", "title": "Input", "figma": { "name": "input/default", "key": "9b99d128100afd0ac499d5fc2cfdedf0ae6aa44b", "nodeId": "2184:1939" }, "parts": ["root", "placeholder"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "fg": "foreground", "border:focus": "ring", "border:invalid": "destructive", "layout": "row", "focus-ring": "ring/50", "opacity:disabled": 50 }, "placeholder": { "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9, "text": "sm" } }, "md": { "root": { "height": 11, "text": "sm" } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "focus", "disabled", "invalid"], "code": { "file": "input.tsx", "export": "inputVariants", "template": "input-like", "parts": { "placeholder": "placeholder" }, "extra": "w-full min-w-0 transition-colors outline-none disabled:pointer-events-none file:border-0 file:bg-transparent file:text-sm file:font-medium aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40" } }, { "$schema": "mbank/component@1", "name": "nav-item", "title": "Nav item", "figma": { "name": "item-sidemenu-menu-tree-1", "key": "9789323b5edf20b5384e1623e5d2f75cf7df0c57", "nodeId": "410:11518" }, "parts": ["root", "icon", "label", "count"], "anatomy": { "root": { "width": 256 }, "icon": { "kind": "icon", "icon": "home" }, "label": { "kind": "text", "layer": "Label", "sample": "\u0417\u0430\u044F\u0432\u043A\u0438", "fill": true }, "count": { "kind": "text", "layer": "Count", "sample": "12" } }, "props": {}, "base": { "root": { "gap": 3, "px": 3, "height": 11, "radius": "md", "text": "sm", "weight": "medium", "fg": "muted-foreground", "align": "center", "bg:hover": "accent", "bg:selected": "accent", "fg:selected": "accent-foreground", "focus-ring": "ring/50", "opacity:disabled": 50, "fg:hover": "accent-foreground" }, "icon": { "size": 5, "fg": "muted-foreground", "fg:selected": "accent-foreground" }, "count": { "text": "xs", "weight": "medium", "fg": "muted-foreground" } }, "variants": {}, "states": ["default", "hover", "selected", "disabled"], "code": { "file": "nav-item.tsx", "template": "button-like", "modifiers": { "selected": "aria-[current=page]", "disabled": "aria-disabled" }, "parts": { "icon": "[&_svg]" }, "extra": "flex w-full min-w-0 transition-colors outline-none aria-disabled:pointer-events-none [&_svg]:shrink-0", "figmaOnly": ["label", "count"] } }, { "$schema": "mbank/component@1", "name": "pagination", "title": "Pagination item", "figma": { "name": "item/pagintaion / buttons", "key": "2255ec920c853b652f1389adbc4bd30779ee35d7", "nodeId": "4141:5990" }, "parts": ["root", "icon", "label"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "radius": "sm", "weight": "medium", "fg": "foreground", "bg:hover": "accent", "bg:selected": "background", "fg:selected": "foreground", "align": "center", "focus-ring": "ring/50", "opacity:disabled": 50, "border:selected": "border", "fg:hover": "accent-foreground" }, "icon": { "size": 5, "hidden": true } }, "variants": { "size": { "sm": { "root": { "height": 8, "px": 1.5, "text": "xs" } }, "md": { "root": { "height": 9, "px": 2, "text": "sm" } }, "lg": { "root": { "height": 10, "px": 2.5, "text": "sm" } } } }, "states": ["default", "hover", "focus", "disabled", "selected"], "code": { "file": "pagination.tsx", "export": "paginationItemVariants", "template": "button-like", "parts": { "icon": "[&_svg]" }, "modifiers": { "selected": "aria-[current=page]" }, "extra": "inline-flex shrink-0 justify-center tabular-nums transition-colors outline-none select-none disabled:pointer-events-none [&_svg]:shrink-0", "extras": { "size=sm": "min-w-8", "size=md": "min-w-9", "size=lg": "min-w-10" }, "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "progress", "title": "Progress", "figma": { "name": "Progress bar / Determinate", "key": "cf47478133f9b8625225affab7ae57b7b022c9bd", "nodeId": "4823:334" }, "parts": ["root", "indicator"], "anatomy": { "root": { "width": 240 }, "indicator": { "width": 144 } }, "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" }, "shape": { "values": ["rounded", "square"], "default": "rounded" } }, "base": { "root": { "bg": "primary/20" }, "indicator": { "bg": "primary" } }, "variants": { "size": { "sm": { "root": { "height": 1 } }, "md": { "root": { "height": 2 } }, "lg": { "root": { "height": 3 } } }, "shape": { "rounded": { "root": { "radius": "full" }, "indicator": { "radius": "full" } }, "square": { "root": { "radius": "none" }, "indicator": { "radius": "none" } } } }, "states": ["default"], "code": { "file": "progress.tsx", "export": "progressVariants", "template": "card-like", "extra": "relative w-full overflow-hidden", "figmaOnly": ["indicator"] } }, { "$schema": "mbank/component@1", "name": "radio", "title": "Radio", "figma": { "name": "Switchers - Check", "key": "be053b3924b63e289a38bfd661b7180deb83236e", "nodeId": "2280:9729" }, "parts": ["root", "dot"], "anatomy": { "dot": { "kind": "frame", "layer": "Dot" } }, "props": {}, "base": { "root": { "size": 5, "radius": "full", "border-width": 1, "border": "input", "bg": "background", "align": "center", "border:checked": "primary", "bg:checked": "primary", "focus-ring": "ring/50", "opacity:disabled": 50 }, "dot": { "size": 2, "radius": "full", "bg": "primary-foreground", "hidden": true, "hidden:checked": false } }, "variants": {}, "states": ["default", "focus", "disabled", "checked"], "code": { "file": "radio.tsx", "template": "button-like", "modifiers": { "checked": "data-[state=checked]" }, "extra": "peer inline-flex shrink-0 justify-center transition-colors outline-none disabled:cursor-not-allowed", "figmaOnly": ["dot"] } }, { "$schema": "mbank/component@1", "name": "search-input", "title": "Search input", "figma": { "name": "input/search", "key": "bdc52ccb245ef127e0ce609859f7b0347207a94b", "nodeId": "4001:1384" }, "parts": ["root", "icon", "placeholder"], "anatomy": { "root": { "width": 272 }, "icon": { "kind": "icon", "icon": "search" }, "placeholder": { "kind": "text", "layer": "Placeholder", "sample": "\u041F\u043E\u0438\u0441\u043A", "fill": true } }, "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "text": "sm", "fg": "foreground", "border:focus": "ring", "layout": "row", "align": "center", "focus-ring": "ring/50", "opacity:disabled": 50 }, "placeholder": { "fg": "muted-foreground" }, "icon": { "size": 5, "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9, "radius": "sm" } }, "md": { "root": { "height": 11 } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "focus", "disabled"], "code": { "file": "search-input.tsx", "template": "card-like", "modifiers": { "focus": "focus-within", "disabled": "has-disabled" }, "parts": { "icon": "[&_svg]" }, "extra": "w-full transition-colors has-disabled:pointer-events-none [&_svg]:shrink-0", "figmaOnly": ["placeholder"] } }, { "$schema": "mbank/component@1", "name": "select-trigger", "title": "Select trigger", "figma": { "name": "input/dropdown", "key": "a51f7990a9914a36e511d08aeb2684c412634c09", "nodeId": "2431:11731" }, "parts": ["root", "placeholder", "icon"], "anatomy": { "root": { "width": 240 }, "icon": { "icon": "chevron" } }, "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "text": "sm", "fg": "foreground", "border:focus": "ring", "border:invalid": "destructive", "layout": "row", "align": "between", "focus-ring": "ring/50", "opacity:disabled": 50 }, "placeholder": { "fg": "muted-foreground" }, "icon": { "size": 4, "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9 } }, "md": { "root": { "height": 11 } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "focus", "disabled", "invalid"], "code": { "file": "select.tsx", "shape": "classes", "template": "button-like", "parts": { "placeholder": "data-[placeholder]" }, "maps": { "size": { "const": "triggerSizes", "part": "root" } }, "extra": "w-full whitespace-nowrap transition-colors outline-none disabled:pointer-events-none *:data-[slot=select-value]:truncate aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", "figmaOnly": ["icon"] } }, { "$schema": "mbank/component@1", "name": "separator", "title": "Separator", "figma": { "name": "Separator" }, "parts": ["root"], "props": { "orientation": { "values": ["horizontal", "vertical"], "default": "horizontal" } }, "base": { "root": { "bg": "border" } }, "variants": { "orientation": { "horizontal": { "root": { "layout": "row", "height": 0.25, "px": 30 } }, "vertical": { "root": { "layout": "row", "height": 6, "px": 0.125 } } } }, "states": ["default"], "code": { "file": "separator.tsx", "template": "card-like", "extra": "shrink-0", "extras": { "orientation=horizontal": "h-px w-full", "orientation=vertical": "h-full w-px" }, "overrides": { "root": { "layout": null, "height": null, "px": null } } } }, { "$schema": "mbank/component@1", "name": "skeleton", "title": "Skeleton", "parts": ["root"], "anatomy": { "root": { "width": 240 } }, "props": { "shape": { "values": ["line", "circle", "block"], "default": "line" } }, "base": { "root": { "radius": "md", "bg": "accent" } }, "variants": { "shape": { "line": { "root": { "height": 4, "radius": "sm" } }, "circle": { "root": { "size": 10, "radius": "full" } }, "block": { "root": { "height": 24, "radius": "lg" } } } }, "states": ["default"], "code": { "file": "skeleton.tsx", "shape": "classes", "template": "card-like", "extra": "animate-pulse motion-reduce:animate-none" } }, { "$schema": "mbank/component@1", "name": "spinner", "title": "Spinner", "figma": { "name": "spinner", "key": "03ca97e314c9e429cb882a5f42b978718bc3070d", "nodeId": "2153:1584" }, "parts": ["root"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "sm" } }, "base": { "root": { "radius": "full", "border-width": 2, "border": "primary" } }, "variants": { "size": { "sm": { "root": { "size": 4 } }, "md": { "root": { "size": 5 } }, "lg": { "root": { "size": 6 } } } }, "states": ["default"], "code": { "file": "spinner.tsx", "template": "card-like", "extra": "shrink-0 animate-spin motion-reduce:animate-none", "overrides": { "root": { "radius": null, "border-width": null, "border": null } } } }, { "$schema": "mbank/component@1", "name": "stepper-step", "title": "Stepper step", "figma": { "name": "item-stepper-basic", "key": "954b3a3b55fce287426091c632d9f1e6e84b1a13", "nodeId": "3098:7661" }, "parts": ["root", "marker", "number", "label", "description"], "anatomy": { "marker": { "kind": "frame", "layer": "Marker" }, "number": { "kind": "text", "layer": "Number", "sample": "2", "parent": "marker" }, "label": { "kind": "text", "layer": "Label", "sample": "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430" }, "description": { "kind": "text", "layer": "Description", "sample": "\u0434\u043E 2 \u0434\u043D\u0435\u0439" } }, "props": { "status": { "values": ["done", "current", "upcoming"], "default": "upcoming" } }, "base": { "root": { "align": "center", "gap": 2, "py": 2, "text": "base", "fg": "foreground" }, "marker": { "size": 8, "radius": "full", "align": "center" }, "number": { "text": "sm", "weight": "medium" }, "description": { "text": "xs", "fg": "muted-foreground" } }, "variants": { "status": { "done": { "marker": { "bg": "primary/10" }, "number": { "fg": "primary" } }, "current": { "root": { "weight": "medium" }, "marker": { "bg": "primary" }, "number": { "fg": "primary-foreground" } }, "upcoming": { "root": { "fg": "muted-foreground" }, "marker": { "bg": "muted" }, "number": { "fg": "muted-foreground" } } } }, "states": ["default"], "code": { "file": "stepper-step.tsx", "template": "card-like", "parts": { "marker": "*:data-[slot=stepper-step-marker]", "number": "**:data-[slot=stepper-step-number]" }, "extra": "inline-flex min-w-0 *:data-[slot=stepper-step-marker]:inline-flex *:data-[slot=stepper-step-marker]:shrink-0 *:data-[slot=stepper-step-marker]:justify-center", "figmaOnly": ["label", "description"] } }, { "$schema": "mbank/component@1", "name": "switch", "title": "Switch", "parts": ["root", "thumb"], "anatomy": { "root": { "width": 44 } }, "props": {}, "base": { "root": { "border-width": 2, "height": 6, "radius": "full", "opacity:disabled": 50, "bg:checked": "primary", "bg:unchecked": "input", "align": "start", "focus-ring": "ring/50", "bg": "input", "px": 0.5, "align:checked": "end" }, "thumb": { "size": 5, "radius": "full", "bg": "background" } }, "variants": {}, "states": ["default", "focus", "disabled", "checked", "unchecked"], "code": { "file": "switch.tsx", "shape": "classes", "template": "button-like", "modifiers": { "checked": "data-[state=checked]", "unchecked": "data-[state=unchecked]" }, "extra": "peer inline-flex w-10 shrink-0 border-transparent transition-colors outline-none disabled:cursor-not-allowed aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", "figmaOnly": ["thumb"], "overrides": { "root": { "align": "center", "align:checked": null, "bg": null, "px": null } } } }, { "$schema": "mbank/component@1", "name": "tabbar-item", "title": "Tabbar item", "figma": { "name": "Tabbar item" }, "parts": ["root", "icon", "label"], "anatomy": { "root": { "width": 80 }, "icon": { "kind": "icon", "icon": "home" }, "label": { "kind": "text", "layer": "Label", "sample": "\u0413\u043B\u0430\u0432\u043D\u0430\u044F" } }, "props": {}, "base": { "root": { "layout": "column", "align": "center", "gap": 1, "px": 2, "py": 2, "text": "xs", "weight": "medium", "fg": "muted-foreground", "fg:selected": "primary", "focus-ring": "ring/50" }, "icon": { "size": 6 } }, "variants": {}, "states": ["default", "selected"], "code": { "file": "tabbar-item.tsx", "template": "button-like", "modifiers": { "selected": "aria-[current=page]" }, "parts": { "icon": "[&_svg]" }, "extra": "min-w-0 flex-1 justify-center transition-colors outline-none [&_svg]:shrink-0", "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "table-cell", "title": "Table cell", "figma": { "name": "TableCell", "key": "75d931d4c1075a08c944e2a7ba1b34b1c4e787d0", "nodeId": "1309:22504" }, "parts": ["root", "text"], "anatomy": { "root": { "width": 160 }, "text": { "sample": "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435" } }, "props": {}, "base": { "root": { "height": 11, "px": 3, "py": 3, "text": "sm" } }, "variants": {}, "states": ["default"], "code": { "file": "table.tsx", "shape": "classes", "template": "card-like", "extra": "align-middle leading-5 whitespace-nowrap tabular-nums [&:has([role=checkbox])]:pr-0" } }, { "$schema": "mbank/component@1", "name": "table-head", "title": "Table head", "figma": { "name": "item/cell/header", "key": "e28abae96eaece6a3a3ca39eb048b04f138c2c0c", "nodeId": "1113:46703" }, "parts": ["root", "text", "icon"], "anatomy": { "root": { "width": 160, "sides": ["bottom"] }, "text": { "kind": "text", "layer": "Text", "sample": "\u041A\u043B\u0438\u0435\u043D\u0442" }, "icon": { "kind": "icon", "icon": "chevron" } }, "props": { "sort": { "values": ["none", "asc", "desc"], "default": "none" } }, "base": { "root": { "gap": 1, "height": 11, "px": 3, "text": "sm", "weight": "medium", "fg": "muted-foreground", "border-width": 1, "border": "border" }, "icon": { "size": 4, "fg": "muted-foreground" } }, "variants": { "sort": { "none": { "icon": { "hidden": true } }, "asc": { "root": { "fg": "foreground" }, "icon": { "fg": "foreground" } }, "desc": { "root": { "fg": "foreground" }, "icon": { "fg": "foreground" } } } }, "states": ["default"], "code": { "file": "table.tsx", "shape": "classes", "template": "card-like", "extra": "text-left align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", "figmaOnly": ["icon"], "overrides": { "root": { "align": null, "border": null, "border-width": null } } } }, { "$schema": "mbank/component@1", "name": "tabs-list", "title": "Tabs list", "figma": { "name": "segment", "key": "f28915a7224a6ba85128b9cbab0b9d706c9285a8", "nodeId": "2371:564" }, "parts": ["root", "tab-1", "tab-2", "tab-3"], "anatomy": { "tab-1": { "kind": "instance", "component": { "name": "Tabs trigger" }, "sample": "\u0412\u0441\u0435" }, "tab-2": { "kind": "instance", "component": { "name": "Tabs trigger" }, "sample": "\u041C\u043E\u0438" }, "tab-3": { "kind": "instance", "component": { "name": "Tabs trigger" }, "sample": "\u0410\u0440\u0445\u0438\u0432" } }, "props": { "variant": { "values": ["segment", "outline", "line"], "default": "segment" } }, "base": { "root": { "align": "center", "px": 1, "py": 1 } }, "variants": { "variant": { "segment": { "root": { "gap": 1, "radius": "md", "bg": "muted" } }, "outline": { "root": { "gap": 2 } }, "line": { "root": { "gap": 6, "border": "border" } } } }, "states": ["default"], "code": { "file": "tabs.tsx", "export": "tabsListVariants", "template": "card-like", "extra": "group/tabs-list inline-flex w-fit", "extras": { "variant=segment": "p-1", "variant=line": "border-b" }, "overrides": { "root": { "px": null, "py": null } } } }, { "$schema": "mbank/component@1", "name": "tabs-trigger", "title": "Tabs trigger", "figma": { "name": "Item / segmentButtons", "key": "d3dce4a16063872d9bd8a43a3a4901ca546452a5", "nodeId": "2370:4860" }, "parts": ["root", "icon", "label"], "props": { "variant": { "values": ["segment", "outline", "line"], "default": "segment" } }, "base": { "root": { "height": 9, "gap": 2, "px": 3, "text": "sm", "weight": "medium", "fg": "muted-foreground", "fg:hover": "foreground", "align": "center", "focus-ring": "ring/50", "opacity:disabled": 50 }, "icon": { "size": 4, "hidden": true } }, "variants": { "variant": { "segment": { "root": { "radius": "sm", "bg:selected": "background", "fg:selected": "foreground", "shadow:selected": "xs" } }, "outline": { "root": { "radius": "md", "border-width": 1, "border": "border", "border:selected": "primary", "bg:selected": "primary", "fg:selected": "primary-foreground" } }, "line": { "root": { "px": 0, "border:selected": "foreground", "fg:selected": "foreground" } } } }, "states": ["default", "hover", "focus", "disabled", "selected"], "code": { "file": "tabs.tsx", "shape": "classes", "template": "button-like", "parts": { "icon": "[&_svg]" }, "modifiers": { "selected": "data-[state=active]" }, "prefix": { "variant": "group-data-[variant={value}]/tabs-list" }, "extra": "inline-flex justify-center whitespace-nowrap transition-colors outline-none disabled:pointer-events-none [&_svg]:shrink-0", "extras": { "variant=line": "-mb-px border-b-2 border-transparent" }, "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "textarea", "title": "Textarea", "figma": { "name": "TextArea", "key": "f5e8ed2faaef70b5702fa5e0f70d9c65a370a8ed", "nodeId": "3069:1804" }, "parts": ["root", "placeholder"], "props": {}, "base": { "root": { "min-height": 24, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "py": 2.5, "text": "sm", "fg": "foreground", "border:focus": "ring", "border:invalid": "destructive", "layout": "row", "focus-ring": "ring/50", "opacity:disabled": 50 }, "placeholder": { "fg": "muted-foreground" } }, "variants": {}, "states": ["default", "focus", "disabled", "invalid"], "code": { "file": "textarea.tsx", "shape": "classes", "template": "input-like", "parts": { "placeholder": "placeholder" }, "extra": "field-sizing-content w-full min-w-0 transition-colors outline-none disabled:pointer-events-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40" } }, { "$schema": "mbank/component@1", "name": "toast", "title": "Toast", "figma": { "name": "toast", "key": "17ef4420d2a9d9159bfc9f5668936bd87fdb216a", "nodeId": "4316:3805" }, "parts": ["root", "icon", "title", "description"], "anatomy": { "root": { "width": 400 }, "icon": { "kind": "icon", "icon": "info" }, "title": { "kind": "text", "layer": "Title", "sample": "\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430", "fill": true }, "description": { "kind": "text", "layer": "Description", "sample": "\u0421\u0442\u0430\u0442\u0443\u0441 \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u0447\u0435\u0440\u0435\u0437 \u043C\u0438\u043D\u0443\u0442\u0443", "fill": true } }, "props": { "type": { "values": ["default", "success", "error"], "default": "default" } }, "base": { "root": { "layout": "column", "align": "start", "gap": 1, "px": 4, "py": 4, "radius": "md", "border-width": 1, "border": "border", "bg": "card", "fg": "foreground", "text": "sm", "shadow": "lg" }, "icon": { "size": 5, "fg": "foreground" }, "title": { "text": "base", "weight": "bold" }, "description": { "fg": "muted-foreground" } }, "variants": { "type": { "default": {}, "success": {}, "error": { "icon": { "fg": "destructive" }, "title": { "fg": "destructive" } } } }, "states": ["default"], "code": { "file": "sonner.tsx", "shape": "classes", "template": "card-like", "extra": "group/toast w-full [&_[data-icon]]:mt-0.5 [&_[data-icon]]:size-5 [&_[data-icon]]:shrink-0", "figmaOnly": ["icon", "title", "description"], "overrides": { "root": { "layout": "row", "gap": 3 } } } }, { "$schema": "mbank/component@1", "name": "tooltip", "title": "Tooltip", "figma": { "name": "tooltip", "key": "cb5b8f83bc82080cd014efcd0b3778415b083b36", "nodeId": "2266:2623" }, "parts": ["root", "label"], "anatomy": { "label": { "kind": "text", "layer": "Label", "sample": "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430" } }, "props": {}, "base": { "root": { "align": "center", "px": 3, "py": 2, "radius": "sm", "bg": "foreground", "fg": "background", "text": "xs" } }, "variants": {}, "states": ["default"], "code": { "file": "tooltip.tsx", "shape": "classes", "template": "card-like", "extra": "z-50 max-w-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none", "overrides": { "root": { "align": null } } } }];

  // examples/credit-crm.spec.json
  var credit_crm_spec_default = {
    $schema: "ds-builder/spec@1",
    project: "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u044B\u0439 \u043A\u043E\u043D\u0432\u0435\u0439\u0435\u0440",
    subtitle: "CRM \xB7 \u0420\u043E\u0437\u043D\u0438\u0447\u043D\u043E\u0435 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432\u0430\u043D\u0438\u0435",
    platform: "web",
    viewports: [
      "desktop",
      "mobile"
    ],
    searchPlaceholder: "\u041F\u043E\u0438\u0441\u043A \u0437\u0430\u044F\u0432\u043A\u0438, \u043A\u043B\u0438\u0435\u043D\u0442\u0430, \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u0430\u2026",
    user: {
      name: "\u0410\u0439\u0433\u0443\u043B\u044C \u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B\u043E\u0432\u0430",
      role: "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u044B\u0439 \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A"
    },
    nav: [
      {
        id: "dashboard",
        label: "\u041E\u0431\u0437\u043E\u0440",
        icon: "home",
        group: "\u0420\u0430\u0431\u043E\u0442\u0430"
      },
      {
        id: "apps",
        label: "\u0417\u0430\u044F\u0432\u043A\u0438",
        icon: "inbox",
        badge: 24
      },
      {
        id: "underwriting",
        label: "\u0410\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433",
        icon: "check",
        badge: 7
      },
      {
        id: "security",
        label: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0421\u0411",
        icon: "shield",
        badge: 3
      },
      {
        id: "clients",
        label: "\u041A\u043B\u0438\u0435\u043D\u0442\u044B",
        icon: "users",
        group: "\u041F\u043E\u0440\u0442\u0444\u0435\u043B\u044C"
      },
      {
        id: "loans",
        label: "\u041A\u0440\u0435\u0434\u0438\u0442\u044B",
        icon: "wallet"
      },
      {
        id: "collection",
        label: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0430",
        icon: "history",
        badge: 12
      },
      {
        id: "reports",
        label: "\u041E\u0442\u0447\u0451\u0442\u044B",
        icon: "chart",
        group: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430"
      },
      {
        id: "products",
        label: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u044B",
        icon: "layers",
        group: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430"
      },
      {
        id: "staff",
        label: "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438",
        icon: "users"
      },
      {
        id: "settings",
        label: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
        icon: "settings"
      }
    ],
    screens: [
      {
        id: "login",
        title: "\u0412\u0445\u043E\u0434",
        page: "\u0412\u0445\u043E\u0434",
        shell: "plain",
        states: [
          "default",
          "error"
        ],
        blocks: [
          {
            type: "login",
            title: "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u044B\u0439 \u043A\u043E\u043D\u0432\u0435\u0439\u0435\u0440",
            subtitle: "\u0412\u043E\u0439\u0434\u0438\u0442\u0435 \u0440\u0430\u0431\u043E\u0447\u0435\u0439 \u043F\u043E\u0447\u0442\u043E\u0439 \u0431\u0430\u043D\u043A\u0430"
          }
        ]
      },
      {
        id: "dashboard",
        title: "\u041E\u0431\u0437\u043E\u0440",
        nav: "dashboard",
        states: [
          "default",
          "loading"
        ],
        blocks: [
          {
            type: "header",
            title: "\u0414\u043E\u0431\u0440\u043E\u0435 \u0443\u0442\u0440\u043E, \u0410\u0439\u0433\u0443\u043B\u044C",
            subtitle: "\u041A\u043E\u043D\u0432\u0435\u0439\u0435\u0440 \u043D\u0430 2 \u043D\u043E\u044F\u0431\u0440\u044F \xB7 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E \u0432 09:40",
            period: [
              "\u0421\u0435\u0433\u043E\u0434\u043D\u044F",
              "\u041D\u0435\u0434\u0435\u043B\u044F",
              "\u041C\u0435\u0441\u044F\u0446",
              "\u041A\u0432\u0430\u0440\u0442\u0430\u043B"
            ],
            actions: [
              "\u042D\u043A\u0441\u043F\u043E\u0440\u0442",
              "+ \u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u2192 app-new"
            ]
          },
          {
            type: "stats",
            items: [
              {
                label: "\u041D\u043E\u0432\u044B\u0435 \u0437\u0430\u044F\u0432\u043A\u0438",
                value: "86",
                delta: "+14% \u043A \u0432\u0447\u0435\u0440\u0430",
                icon: "inbox"
              },
              {
                label: "\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u043E",
                value: "64%",
                delta: "+3 \u043F.\u043F. \u043A \u043F\u0440\u043E\u0448\u043B\u043E\u0439 \u043D\u0435\u0434\u0435\u043B\u0435",
                icon: "check"
              },
              {
                label: "\u0412\u0440\u0435\u043C\u044F \u0434\u043E \u0440\u0435\u0448\u0435\u043D\u0438\u044F",
                value: "2 \u0447 14 \u043C\u0438\u043D",
                delta: "\u221218 \u043C\u0438\u043D \u043A \u0432\u0447\u0435\u0440\u0430",
                better: "down",
                icon: "history"
              },
              {
                label: "\u0412\u044B\u0434\u0430\u043D\u043E",
                value: "41,2 \u043C\u043B\u043D \u0441",
                delta: "+8% \u043A \u043F\u043B\u0430\u043D\u0443",
                icon: "wallet"
              }
            ]
          },
          {
            type: "split",
            ratio: "2:1",
            columns: [
              [
                {
                  type: "chart",
                  title: "\u0420\u0435\u0448\u0435\u043D\u0438\u044F \u043F\u043E \u0447\u0430\u0441\u0430\u043C",
                  subtitle: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F, \u0432\u0441\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B",
                  series: [
                    "\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u043E",
                    "\u041E\u0442\u043A\u0430\u0437"
                  ]
                }
              ],
              [
                {
                  type: "meters",
                  title: "SLA \u043F\u043E \u044D\u0442\u0430\u043F\u0430\u043C",
                  subtitle: "\u0414\u043E\u043B\u044F \u0437\u0430\u044F\u0432\u043E\u043A \u0432 \u0441\u0440\u043E\u043A",
                  items: [
                    {
                      label: "\u0421\u043A\u043E\u0440\u0438\u043D\u0433",
                      value: "98%",
                      percent: 98,
                      tone: "success",
                      hint: "\u043D\u043E\u0440\u043C\u0430\u0442\u0438\u0432 15 \u043C\u0438\u043D"
                    },
                    {
                      label: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0421\u0411",
                      value: "86%",
                      percent: 86,
                      tone: "warning",
                      hint: "\u043D\u043E\u0440\u043C\u0430\u0442\u0438\u0432 2 \u0447"
                    },
                    {
                      label: "\u0410\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433",
                      value: "71%",
                      percent: 71,
                      tone: "danger",
                      hint: "\u043D\u043E\u0440\u043C\u0430\u0442\u0438\u0432 4 \u0447 \xB7 9 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E"
                    },
                    {
                      label: "\u0412\u044B\u0434\u0430\u0447\u0430",
                      value: "94%",
                      percent: 94,
                      tone: "success",
                      hint: "\u043D\u043E\u0440\u043C\u0430\u0442\u0438\u0432 1 \u0434\u0435\u043D\u044C"
                    }
                  ]
                }
              ]
            ]
          },
          {
            type: "split",
            ratio: "3:2",
            columns: [
              [
                {
                  type: "funnel",
                  title: "\u0412\u043E\u0440\u043E\u043D\u043A\u0430 \u043A\u043E\u043D\u0432\u0435\u0439\u0435\u0440\u0430",
                  subtitle: "\u0417\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F",
                  more: "\u041E\u0442\u0447\u0451\u0442 \u2192 reports",
                  items: [
                    {
                      label: "\u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u043E",
                      value: "312",
                      rate: "100%"
                    },
                    {
                      label: "\u0421\u043A\u043E\u0440\u0438\u043D\u0433 \u043F\u0440\u043E\u0439\u0434\u0435\u043D",
                      value: "241",
                      rate: "77%"
                    },
                    {
                      label: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0421\u0411",
                      value: "198",
                      rate: "63%"
                    },
                    {
                      label: "\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u043E",
                      value: "152",
                      rate: "49%"
                    },
                    {
                      label: "\u0412\u044B\u0434\u0430\u043D\u043E",
                      value: "118",
                      rate: "38%"
                    }
                  ]
                }
              ],
              [
                {
                  type: "list",
                  title: "\u0422\u0440\u0435\u0431\u0443\u044E\u0442 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F",
                  subtitle: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D SLA \u0438\u043B\u0438 \u043D\u0443\u0436\u0435\u043D \u043E\u0442\u0432\u0435\u0442",
                  link: "app-card",
                  rows: 5,
                  statuses: [
                    "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D SLA",
                    "\u041D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435",
                    "\u041D\u043E\u0432\u0430\u044F"
                  ]
                }
              ]
            ]
          },
          {
            type: "table",
            title: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0437\u0430\u044F\u0432\u043A\u0438",
            subtitle: "\u041E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438",
            link: "app-card",
            rows: 5,
            columns: [
              "\u041D\u043E\u043C\u0435\u0440:id",
              "\u041A\u043B\u0438\u0435\u043D\u0442:person",
              "\u041F\u0440\u043E\u0434\u0443\u043A\u0442:product",
              "\u0421\u0443\u043C\u043C\u0430:money",
              "\u0421\u0442\u0430\u0442\u0443\u0441:status",
              "\u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u0430:datetime"
            ],
            statuses: [
              "\u041D\u043E\u0432\u0430\u044F",
              "\u0421\u043A\u043E\u0440\u0438\u043D\u0433",
              "\u041D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435",
              "\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u0430",
              "\u041E\u0442\u043A\u0430\u0437"
            ]
          }
        ]
      },
      {
        id: "apps",
        title: "\u0417\u0430\u044F\u0432\u043A\u0438",
        nav: "apps",
        states: [
          "default",
          "loading",
          "empty"
        ],
        empty: {
          title: "\u0417\u0430\u044F\u0432\u043E\u043A \u043F\u043E\u043A\u0430 \u043D\u0435\u0442",
          text: "\u041D\u043E\u0432\u044B\u0435 \u0437\u0430\u044F\u0432\u043A\u0438 \u0438\u0437 \u043E\u0442\u0434\u0435\u043B\u0435\u043D\u0438\u0439 \u0438 \u043E\u043D\u043B\u0430\u0439\u043D\u0430 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438",
          action: "+ \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443 \u2192 app-new"
        },
        blocks: [
          {
            type: "header",
            title: "\u0417\u0430\u044F\u0432\u043A\u0438",
            subtitle: "128 \u0437\u0430\u044F\u0432\u043E\u043A \u0432 \u0440\u0430\u0431\u043E\u0442\u0435",
            actions: [
              "\u041A\u043E\u043D\u0432\u0435\u0439\u0435\u0440 \u2192 pipeline",
              "\u042D\u043A\u0441\u043F\u043E\u0440\u0442",
              "+ \u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u2192 app-new"
            ]
          },
          {
            type: "tabs",
            items: [
              "\u0412\u0441\u0435 \xB7 128",
              "\u041C\u043E\u0438 \xB7 24",
              "\u041D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435 \xB7 31",
              "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D SLA \xB7 9",
              "\u0410\u0440\u0445\u0438\u0432"
            ]
          },
          {
            type: "toolbar",
            search: "\u0424\u0418\u041E, \u0442\u0435\u043B\u0435\u0444\u043E\u043D, \u0418\u041D\u041D \u0438\u043B\u0438 \u043D\u043E\u043C\u0435\u0440 \u0437\u0430\u044F\u0432\u043A\u0438",
            filters: [
              "\u0421\u0442\u0430\u0442\u0443\u0441",
              "\u041F\u0440\u043E\u0434\u0443\u043A\u0442",
              "\u041A\u0430\u043D\u0430\u043B",
              "\u041F\u0435\u0440\u0438\u043E\u0434"
            ]
          },
          {
            type: "table",
            link: "app-card",
            selectable: true,
            rows: 10,
            columns: [
              "\u041D\u043E\u043C\u0435\u0440:id",
              "\u041A\u043B\u0438\u0435\u043D\u0442:person",
              "\u041F\u0440\u043E\u0434\u0443\u043A\u0442:product",
              "\u0421\u0443\u043C\u043C\u0430:money",
              "\u0421\u0442\u0430\u0442\u0443\u0441:status",
              "\u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u0430:datetime",
              ":actions"
            ],
            statuses: [
              "\u041D\u043E\u0432\u0430\u044F",
              "\u0421\u043A\u043E\u0440\u0438\u043D\u0433",
              "\u041D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435",
              "\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u0430",
              "\u041E\u0442\u043A\u0430\u0437"
            ]
          },
          {
            type: "pagination",
            summary: "\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E 1\u201310 \u0438\u0437 128"
          }
        ]
      },
      {
        id: "pipeline",
        title: "\u041A\u043E\u043D\u0432\u0435\u0439\u0435\u0440",
        nav: "apps",
        viewports: [
          "desktop"
        ],
        blocks: [
          {
            type: "header",
            title: "\u041A\u043E\u043D\u0432\u0435\u0439\u0435\u0440 \u0437\u0430\u044F\u0432\u043E\u043A",
            breadcrumbs: [
              "\u0417\u0430\u044F\u0432\u043A\u0438",
              "\u041A\u043E\u043D\u0432\u0435\u0439\u0435\u0440"
            ],
            actions: [
              "\u0421\u043F\u0438\u0441\u043E\u043A \u2192 apps",
              "+ \u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u2192 app-new"
            ]
          },
          {
            type: "toolbar",
            search: "\u041D\u0430\u0439\u0442\u0438 \u043D\u0430 \u0434\u043E\u0441\u043A\u0435",
            filters: [
              "\u041F\u0440\u043E\u0434\u0443\u043A\u0442",
              "\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439"
            ]
          },
          {
            type: "kanban",
            link: "app-card",
            columns: [
              {
                title: "\u041D\u043E\u0432\u044B\u0435",
                count: 18
              },
              {
                title: "\u0421\u043A\u043E\u0440\u0438\u043D\u0433",
                count: 12
              },
              {
                title: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0421\u0411",
                count: 9
              },
              {
                title: "\u0410\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433",
                count: 7
              },
              {
                title: "\u0412\u044B\u0434\u0430\u0447\u0430",
                count: 5
              }
            ]
          }
        ]
      },
      {
        id: "app-card",
        title: "\u0417\u0430\u044F\u0432\u043A\u0430 CL-240118",
        nav: "apps",
        parent: "apps",
        states: [
          "default",
          "no-access"
        ],
        blocks: [
          {
            type: "header",
            title: "\u0417\u0430\u044F\u0432\u043A\u0430 CL-240118",
            badge: "\u0410\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433",
            breadcrumbs: [
              "\u0417\u0430\u044F\u0432\u043A\u0438",
              "CL-240118"
            ],
            subtitle: "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \u043A\u0440\u0435\u0434\u0438\u0442 \xB7 \u043F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u0430 21.10.2026 \u0432 09:12 \xB7 \u043A\u0430\u043D\u0430\u043B: \u043C\u043E\u0431\u0438\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u043D\u043A",
            actions: [
              "\u041D\u0430\u0437\u043D\u0430\u0447\u0438\u0442\u044C",
              "\u0420\u0435\u0448\u0435\u043D\u0438\u0435 \u2192 uw-decision"
            ]
          },
          {
            type: "stepper",
            steps: [
              "\u0417\u0430\u044F\u0432\u043A\u0430",
              "\u0421\u043A\u043E\u0440\u0438\u043D\u0433",
              "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0421\u0411",
              "\u0410\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433",
              "\u0412\u044B\u0434\u0430\u0447\u0430"
            ],
            current: 3
          },
          {
            type: "split",
            ratio: "2:1",
            columns: [
              [
                {
                  type: "details",
                  title: "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0437\u0430\u044F\u0432\u043A\u0438",
                  columns: 3,
                  items: [
                    [
                      "\u041F\u0440\u043E\u0434\u0443\u043A\u0442",
                      "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439"
                    ],
                    [
                      "\u0421\u0443\u043C\u043C\u0430",
                      "450 000 \u0441"
                    ],
                    [
                      "\u0421\u0440\u043E\u043A",
                      "24 \u043C\u0435\u0441"
                    ],
                    [
                      "\u0421\u0442\u0430\u0432\u043A\u0430",
                      "21,5%"
                    ],
                    [
                      "\u041F\u043B\u0430\u0442\u0451\u0436",
                      "23 180 \u0441/\u043C\u0435\u0441"
                    ],
                    [
                      "\u0426\u0435\u043B\u044C",
                      "\u0420\u0435\u043C\u043E\u043D\u0442 \u0436\u0438\u043B\u044C\u044F"
                    ]
                  ]
                },
                {
                  type: "details",
                  title: "\u041A\u043B\u0438\u0435\u043D\u0442",
                  columns: 3,
                  items: [
                    [
                      "\u0424\u0418\u041E",
                      "\u0411\u0430\u043A\u044B\u0442 \u0410\u0441\u0430\u043D\u043E\u0432"
                    ],
                    [
                      "\u0418\u041D\u041D",
                      "20512199000123"
                    ],
                    [
                      "\u0422\u0435\u043B\u0435\u0444\u043E\u043D",
                      "phone"
                    ],
                    [
                      "\u0420\u0430\u0431\u043E\u0442\u0430",
                      "\u041E\u0441\u041E\u041E \xAB\u0410\u043B\u0430-\u0422\u043E\u043E \u0422\u0440\u0435\u0439\u0434\xBB"
                    ],
                    [
                      "\u0414\u043E\u0445\u043E\u0434",
                      "96 000 \u0441/\u043C\u0435\u0441"
                    ],
                    [
                      "\u0421\u0442\u0430\u0436",
                      "4 \u0433\u043E\u0434\u0430"
                    ]
                  ]
                },
                {
                  type: "files",
                  title: "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B",
                  subtitle: "4 \u0438\u0437 5 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E",
                  items: [
                    {
                      name: "\u041F\u0430\u0441\u043F\u043E\u0440\u0442 ID-\u043A\u0430\u0440\u0442\u0430.pdf",
                      meta: "1,2 \u041C\u0411 \xB7 21.10.2026",
                      status: "\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D"
                    },
                    {
                      name: "\u0421\u043F\u0440\u0430\u0432\u043A\u0430 \u043E \u0434\u043E\u0445\u043E\u0434\u0430\u0445.pdf",
                      meta: "640 \u041A\u0411 \xB7 21.10.2026",
                      status: "\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D"
                    },
                    {
                      name: "\u0412\u044B\u043F\u0438\u0441\u043A\u0430 \u0413\u041D\u0421.pdf",
                      meta: "380 \u041A\u0411 \xB7 21.10.2026",
                      status: "\u041D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435"
                    },
                    {
                      name: "\u0421\u043E\u0433\u043B\u0430\u0441\u0438\u0435 \u043D\u0430 \u0437\u0430\u043F\u0440\u043E\u0441 \u0432 \u041A\u0418\u0411.pdf",
                      meta: "120 \u041A\u0411 \xB7 21.10.2026",
                      status: "\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D"
                    },
                    {
                      name: "\u0414\u043E\u0433\u043E\u0432\u043E\u0440 \u0437\u0430\u043B\u043E\u0433\u0430",
                      meta: "\u041D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D",
                      status: "\u041E\u0436\u0438\u0434\u0430\u0435\u0442"
                    }
                  ]
                },
                {
                  type: "comments",
                  items: [
                    [
                      "\u041D\u0443\u0440\u043B\u0430\u043D \u0418\u0441\u0430\u043A\u043E\u0432",
                      "\u0441\u0435\u0433\u043E\u0434\u043D\u044F, 10:05",
                      "\u0414\u043E\u0445\u043E\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D \u0432\u044B\u043F\u0438\u0441\u043A\u043E\u0439 \u0413\u041D\u0421, \u0440\u0430\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0439 \u043D\u0435\u0442."
                    ],
                    [
                      "\u0410\u0441\u0435\u043B\u044C \u0421\u0430\u0434\u044B\u043A\u043E\u0432\u0430",
                      "\u0441\u0435\u0433\u043E\u0434\u043D\u044F, 10:42",
                      "\u0421\u0411: \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0439 \u043F\u043E \u0441\u0442\u043E\u043F-\u043B\u0438\u0441\u0442\u0430\u043C \u043D\u0435\u0442, \u043C\u043E\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u0434\u0430\u0432\u0430\u0442\u044C \u0432 \u0430\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433."
                    ]
                  ]
                }
              ],
              [
                {
                  type: "score",
                  title: "\u0421\u043A\u043E\u0440\u0438\u043D\u0433",
                  subtitle: "\u041C\u043E\u0434\u0435\u043B\u044C \u0440\u043E\u0437\u043D\u0438\u0446\u0430 v3.2",
                  value: 712,
                  max: 850,
                  grade: "\u041D\u0438\u0437\u043A\u0438\u0439 \u0440\u0438\u0441\u043A",
                  items: [
                    [
                      "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u0430\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F \u0431\u0435\u0437 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043A",
                      "+48"
                    ],
                    [
                      "\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B\u0439 \u0434\u043E\u0445\u043E\u0434 4 \u0433\u043E\u0434\u0430",
                      "+31"
                    ],
                    [
                      "\u041F\u0414\u041D 38%",
                      "\u221212"
                    ],
                    [
                      "2 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u0432 \u041A\u0418\u0411 \u0437\u0430 \u043C\u0435\u0441\u044F\u0446",
                      "\u22129"
                    ]
                  ]
                },
                {
                  type: "checks",
                  title: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0438",
                  items: [
                    {
                      label: "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u043E\u0435 \u0431\u044E\u0440\u043E (\u041A\u0418\u0411)",
                      hint: "2 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u043A\u0440\u0435\u0434\u0438\u0442\u0430",
                      result: "\u041F\u0440\u043E\u0439\u0434\u0435\u043D\u0430",
                      status: "ok"
                    },
                    {
                      label: "\u0421\u0442\u043E\u043F-\u043B\u0438\u0441\u0442\u044B \u0438 \u0441\u0430\u043D\u043A\u0446\u0438\u0438",
                      hint: "\u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0439 \u043D\u0435\u0442",
                      result: "\u041F\u0440\u043E\u0439\u0434\u0435\u043D\u0430",
                      status: "ok"
                    },
                    {
                      label: "\u0412\u0435\u0440\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F \u0434\u043E\u0445\u043E\u0434\u0430",
                      hint: "\u0432\u044B\u043F\u0438\u0441\u043A\u0430 \u0413\u041D\u0421",
                      result: "\u041F\u0440\u043E\u0439\u0434\u0435\u043D\u0430",
                      status: "ok"
                    },
                    {
                      label: "\u0417\u0430\u043B\u043E\u0433",
                      hint: "\u0434\u043E\u0433\u043E\u0432\u043E\u0440 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D",
                      result: "\u041E\u0436\u0438\u0434\u0430\u0435\u0442",
                      status: "wait"
                    }
                  ]
                },
                {
                  type: "timeline",
                  title: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F",
                  items: [
                    [
                      "\u0417\u0430\u044F\u0432\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0430",
                      "21.10.2026, 09:12"
                    ],
                    [
                      "\u0421\u043A\u043E\u0440\u0438\u043D\u0433 \u043F\u0440\u043E\u0439\u0434\u0435\u043D \xB7 712",
                      "21.10.2026, 09:14"
                    ],
                    [
                      "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0421\u0411 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430",
                      "21.10.2026, 10:42"
                    ],
                    [
                      "\u041F\u0435\u0440\u0435\u0434\u0430\u043D\u0430 \u0432 \u0430\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433",
                      "21.10.2026, 10:45"
                    ]
                  ]
                }
              ]
            ]
          }
        ]
      },
      {
        id: "app-new",
        title: "\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430",
        nav: "apps",
        parent: "apps",
        states: [
          "default",
          "error"
        ],
        blocks: [
          {
            type: "header",
            title: "\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430",
            breadcrumbs: [
              "\u0417\u0430\u044F\u0432\u043A\u0438",
              "\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430"
            ],
            subtitle: "\u0428\u0430\u0433 2 \u0438\u0437 4 \u2014 \u043F\u0440\u043E\u0434\u0443\u043A\u0442 \u0438 \u0443\u0441\u043B\u043E\u0432\u0438\u044F"
          },
          {
            type: "stepper",
            steps: [
              "\u041A\u043B\u0438\u0435\u043D\u0442",
              "\u041F\u0440\u043E\u0434\u0443\u043A\u0442",
              "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B",
              "\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430"
            ],
            current: 1
          },
          {
            type: "split",
            ratio: "2:1",
            columns: [
              [
                {
                  type: "form",
                  title: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442 \u0438 \u0443\u0441\u043B\u043E\u0432\u0438\u044F",
                  subtitle: "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u043F\u043E\u0434\u0431\u0438\u0440\u0430\u044E\u0442\u0441\u044F \u043F\u043E \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0430\u043C \u0431\u0430\u043D\u043A\u0430",
                  submit: "\u0414\u0430\u043B\u0435\u0435",
                  cancel: "\u041D\u0430\u0437\u0430\u0434",
                  to: "app-card",
                  fields: [
                    {
                      label: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442",
                      type: "select",
                      required: true
                    },
                    {
                      label: "\u0426\u0435\u043B\u044C \u043A\u0440\u0435\u0434\u0438\u0442\u0430",
                      type: "select"
                    },
                    {
                      label: "\u0421\u0443\u043C\u043C\u0430",
                      type: "money",
                      required: true,
                      hint: "\u043E\u0442 10 000 \u0434\u043E 3 000 000 \u0441"
                    },
                    {
                      label: "\u0421\u0440\u043E\u043A, \u043C\u0435\u0441",
                      type: "select",
                      required: true
                    },
                    {
                      label: "\u0415\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u044B\u0439 \u0434\u043E\u0445\u043E\u0434",
                      type: "money",
                      required: true
                    },
                    {
                      label: "\u041A\u0430\u043D\u0430\u043B",
                      type: "select"
                    },
                    {
                      label: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u0434\u043B\u044F \u0430\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0435\u0440\u0430",
                      type: "textarea"
                    }
                  ]
                }
              ],
              [
                {
                  type: "decision",
                  title: "\u041F\u0440\u0435\u0434\u0432\u0430\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0440\u0430\u0441\u0447\u0451\u0442",
                  subtitle: "\u041E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043F\u0440\u0438 \u0432\u0432\u043E\u0434\u0435",
                  columns: 2,
                  actions: [],
                  items: [
                    [
                      "\u041F\u043B\u0430\u0442\u0451\u0436",
                      "23 180 \u0441"
                    ],
                    [
                      "\u0421\u0442\u0430\u0432\u043A\u0430",
                      "21,5%"
                    ],
                    [
                      "\u041F\u0435\u0440\u0435\u043F\u043B\u0430\u0442\u0430",
                      "106 320 \u0441"
                    ],
                    [
                      "\u041F\u0414\u041D",
                      "38%"
                    ]
                  ],
                  note: "\u0418\u0442\u043E\u0433\u043E\u0432\u044B\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F \u0437\u0430\u0432\u0438\u0441\u044F\u0442 \u043E\u0442 \u0441\u043A\u043E\u0440\u0438\u043D\u0433\u0430 \u0438 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u0430\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0435\u0440\u0430."
                }
              ]
            ]
          }
        ]
      },
      {
        id: "underwriting",
        title: "\u0410\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433",
        nav: "underwriting",
        viewports: [
          "desktop"
        ],
        blocks: [
          {
            type: "header",
            title: "\u041E\u0447\u0435\u0440\u0435\u0434\u044C \u0430\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433\u0430",
            subtitle: "\u0417\u0430\u044F\u0432\u043A\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u043C \u043D\u0443\u0436\u043D\u043E \u0440\u0443\u0447\u043D\u043E\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u0435",
            actions: [
              "\u0412\u0437\u044F\u0442\u044C \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0443\u044E \u2192 uw-decision"
            ]
          },
          {
            type: "stats",
            items: [
              {
                label: "\u0412 \u043E\u0447\u0435\u0440\u0435\u0434\u0438",
                value: "7",
                hint: "2 \u0441 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u043C SLA",
                icon: "inbox"
              },
              {
                label: "\u041C\u043E\u0451 \u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0441\u0435\u0433\u043E\u0434\u043D\u044F",
                value: "23",
                delta: "+5 \u043A \u0432\u0447\u0435\u0440\u0430",
                icon: "check"
              },
              {
                label: "\u0421\u0440\u0435\u0434\u043D\u0435\u0435 \u0432\u0440\u0435\u043C\u044F",
                value: "38 \u043C\u0438\u043D",
                delta: "\u22126 \u043C\u0438\u043D \u043A \u043D\u043E\u0440\u043C\u0435",
                better: "down",
                icon: "history"
              },
              {
                label: "\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u043E \u043C\u043D\u043E\u0439",
                value: "71%",
                hint: "\u043F\u043E \u0431\u0430\u043D\u043A\u0443 64%",
                icon: "chart"
              }
            ]
          },
          {
            type: "table",
            title: "\u041E\u0447\u0435\u0440\u0435\u0434\u044C",
            link: "uw-decision",
            rows: 7,
            columns: [
              "\u041D\u043E\u043C\u0435\u0440:id",
              "\u041A\u043B\u0438\u0435\u043D\u0442:person",
              "\u041F\u0440\u043E\u0434\u0443\u043A\u0442:product",
              "\u0421\u0443\u043C\u043C\u0430:money",
              "\u0421\u043A\u043E\u0440\u0438\u043D\u0433:number",
              "SLA:status",
              "\u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u0430:datetime"
            ],
            statuses: [
              "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D SLA",
              "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C 40 \u043C\u0438\u043D",
              "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C 2 \u0447",
              "\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C 3 \u0447"
            ]
          }
        ]
      },
      {
        id: "uw-decision",
        title: "\u0420\u0435\u0448\u0435\u043D\u0438\u0435 \u043F\u043E \u0437\u0430\u044F\u0432\u043A\u0435",
        nav: "underwriting",
        parent: "underwriting",
        blocks: [
          {
            type: "header",
            title: "\u0420\u0435\u0448\u0435\u043D\u0438\u0435 \xB7 CL-240118",
            badge: "SLA 1 \u0447 12 \u043C\u0438\u043D",
            breadcrumbs: [
              "\u0410\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433",
              "CL-240118"
            ],
            subtitle: "\u0411\u0430\u043A\u044B\u0442 \u0410\u0441\u0430\u043D\u043E\u0432 \xB7 \u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \xB7 450 000 \u0441 \u043D\u0430 24 \u043C\u0435\u0441",
            actions: [
              "\u0417\u0430\u044F\u0432\u043A\u0430 \u2192 app-card"
            ]
          },
          {
            type: "split",
            ratio: "3:2",
            columns: [
              [
                {
                  type: "score",
                  title: "\u0421\u043A\u043E\u0440\u0438\u043D\u0433",
                  subtitle: "\u041C\u043E\u0434\u0435\u043B\u044C \u0440\u043E\u0437\u043D\u0438\u0446\u0430 v3.2 \xB7 21.10.2026",
                  value: 712,
                  max: 850,
                  grade: "\u041D\u0438\u0437\u043A\u0438\u0439 \u0440\u0438\u0441\u043A",
                  items: [
                    [
                      "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u0430\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F \u0431\u0435\u0437 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043A",
                      "+48"
                    ],
                    [
                      "\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B\u0439 \u0434\u043E\u0445\u043E\u0434 4 \u0433\u043E\u0434\u0430",
                      "+31"
                    ],
                    [
                      "\u041F\u0414\u041D 38%",
                      "\u221212"
                    ],
                    [
                      "2 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u0432 \u041A\u0418\u0411 \u0437\u0430 \u043C\u0435\u0441\u044F\u0446",
                      "\u22129"
                    ]
                  ]
                },
                {
                  type: "details",
                  title: "\u0424\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044C",
                  columns: 3,
                  items: [
                    [
                      "\u0414\u043E\u0445\u043E\u0434",
                      "96 000 \u0441/\u043C\u0435\u0441"
                    ],
                    [
                      "\u0420\u0430\u0441\u0445\u043E\u0434\u044B",
                      "31 000 \u0441/\u043C\u0435\u0441"
                    ],
                    [
                      "\u0414\u0435\u0439\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0435 \u043A\u0440\u0435\u0434\u0438\u0442\u044B",
                      "2 \xB7 18 400 \u0441/\u043C\u0435\u0441"
                    ],
                    [
                      "\u041F\u0414\u041D \u0441 \u043D\u043E\u0432\u044B\u043C \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u043C",
                      "38%"
                    ],
                    [
                      "\u041C\u0430\u043A\u0441. \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0430",
                      "\u043D\u0435\u0442"
                    ],
                    [
                      "\u041A\u043B\u0438\u0435\u043D\u0442 \u0431\u0430\u043D\u043A\u0430",
                      "\u0441 2019 \u0433\u043E\u0434\u0430"
                    ]
                  ]
                },
                {
                  type: "meters",
                  title: "\u041B\u0438\u043C\u0438\u0442\u044B",
                  items: [
                    {
                      label: "\u041F\u0414\u041D",
                      value: "38% \u0438\u0437 50%",
                      percent: 76
                    },
                    {
                      label: "\u041B\u0438\u043C\u0438\u0442 \u043D\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
                      value: "450 000 \u0438\u0437 1 000 000 \u0441",
                      percent: 45
                    },
                    {
                      label: "\u041A\u043E\u043D\u0446\u0435\u043D\u0442\u0440\u0430\u0446\u0438\u044F \u043F\u043E \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0443",
                      value: "12% \u0438\u0437 20%",
                      percent: 60
                    }
                  ]
                }
              ],
              [
                {
                  type: "decision",
                  title: "\u0420\u0435\u0448\u0435\u043D\u0438\u0435",
                  subtitle: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u043C\u043E\u0436\u043D\u043E \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0435\u0440\u0435\u0434 \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0435\u043C",
                  items: [
                    [
                      "\u0421\u0443\u043C\u043C\u0430",
                      "450 000 \u0441"
                    ],
                    [
                      "\u0421\u0440\u043E\u043A",
                      "24 \u043C\u0435\u0441"
                    ],
                    [
                      "\u0421\u0442\u0430\u0432\u043A\u0430",
                      "21,5%"
                    ],
                    [
                      "\u041F\u043B\u0430\u0442\u0451\u0436",
                      "23 180 \u0441"
                    ]
                  ],
                  actions: [
                    "\u041E\u0434\u043E\u0431\u0440\u0438\u0442\u044C \u2192 app-card",
                    "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0443\u0441\u043B\u043E\u0432\u0438\u044F",
                    "\u041E\u0442\u043A\u0430\u0437\u0430\u0442\u044C"
                  ]
                },
                {
                  type: "checks",
                  title: "\u0421\u0442\u043E\u043F-\u0444\u0430\u043A\u0442\u043E\u0440\u044B",
                  items: [
                    {
                      label: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0438 > 30 \u0434\u043D\u0435\u0439",
                      result: "\u041D\u0435\u0442",
                      status: "ok"
                    },
                    {
                      label: "\u0421\u0443\u0434\u0435\u0431\u043D\u044B\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u044F",
                      result: "\u041D\u0435\u0442",
                      status: "ok"
                    },
                    {
                      label: "\u041F\u0414\u041D \u0432\u044B\u0448\u0435 50%",
                      result: "38%",
                      status: "ok"
                    },
                    {
                      label: "\u041D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442",
                      result: "\u041D\u0435\u0442",
                      status: "ok"
                    }
                  ]
                },
                {
                  type: "comments",
                  title: "\u041E\u0431\u0441\u0443\u0436\u0434\u0435\u043D\u0438\u0435",
                  items: [
                    [
                      "\u0410\u0441\u0435\u043B\u044C \u0421\u0430\u0434\u044B\u043A\u043E\u0432\u0430",
                      "\u0441\u0435\u0433\u043E\u0434\u043D\u044F, 10:42",
                      "\u0421\u0411: \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0439 \u043D\u0435\u0442."
                    ]
                  ]
                }
              ]
            ]
          }
        ]
      },
      {
        id: "security",
        title: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0421\u0411",
        nav: "security",
        viewports: [
          "desktop"
        ],
        blocks: [
          {
            type: "header",
            title: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u043B\u0443\u0436\u0431\u044B \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438",
            subtitle: "\u0421\u0442\u043E\u043F-\u043B\u0438\u0441\u0442\u044B, \u0441\u0430\u043D\u043A\u0446\u0438\u0438, \u043C\u043E\u0448\u0435\u043D\u043D\u0438\u0447\u0435\u0441\u0442\u0432\u043E"
          },
          {
            type: "tabs",
            items: [
              "\u041E\u0436\u0438\u0434\u0430\u044E\u0442 \xB7 3",
              "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435 \xB7 5",
              "\u0417\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u044B\u0435"
            ]
          },
          {
            type: "split",
            ratio: "2:1",
            columns: [
              [
                {
                  type: "table",
                  title: "\u0417\u0430\u044F\u0432\u043A\u0438 \u043D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435",
                  link: "app-card",
                  rows: 6,
                  columns: [
                    "\u041D\u043E\u043C\u0435\u0440:id",
                    "\u041A\u043B\u0438\u0435\u043D\u0442:person",
                    "\u0421\u0443\u043C\u043C\u0430:money",
                    "\u0420\u0438\u0441\u043A:status",
                    "\u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u0430:datetime"
                  ],
                  statuses: [
                    "\u041D\u0438\u0437\u043A\u0438\u0439 \u0440\u0438\u0441\u043A",
                    "\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u0440\u0438\u0441\u043A",
                    "\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u0440\u0438\u0441\u043A"
                  ]
                }
              ],
              [
                {
                  type: "checks",
                  title: "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438",
                  subtitle: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0439",
                  items: [
                    {
                      label: "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u043E\u0435 \u0431\u044E\u0440\u043E (\u041A\u0418\u0411)",
                      hint: "\u043E\u0442\u0432\u0435\u0442 1,2 \u0441",
                      result: "\u0420\u0430\u0431\u043E\u0442\u0430\u0435\u0442",
                      status: "ok"
                    },
                    {
                      label: "\u0421\u0430\u043D\u043A\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u0441\u043F\u0438\u0441\u043A\u0438",
                      hint: "\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E \u0441\u0435\u0433\u043E\u0434\u043D\u044F 06:00",
                      result: "\u0420\u0430\u0431\u043E\u0442\u0430\u0435\u0442",
                      status: "ok"
                    },
                    {
                      label: "\u0413\u041D\u0421: \u0434\u043E\u0445\u043E\u0434\u044B",
                      hint: "\u043E\u0442\u0432\u0435\u0442 8,4 \u0441",
                      result: "\u041C\u0435\u0434\u043B\u0435\u043D\u043D\u043E",
                      status: "warn"
                    },
                    {
                      label: "\u0420\u0435\u0435\u0441\u0442\u0440 \u0437\u0430\u043B\u043E\u0433\u043E\u0432",
                      hint: "\u043D\u0435\u0442 \u043E\u0442\u0432\u0435\u0442\u0430 14 \u043C\u0438\u043D",
                      result: "\u0421\u0431\u043E\u0439",
                      status: "fail"
                    }
                  ]
                }
              ]
            ]
          }
        ]
      },
      {
        id: "clients",
        title: "\u041A\u043B\u0438\u0435\u043D\u0442\u044B",
        nav: "clients",
        states: [
          "default",
          "empty"
        ],
        empty: {
          title: "\u041A\u043B\u0438\u0435\u043D\u0442\u043E\u0432 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E",
          text: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u0435 \u0444\u0438\u043B\u044C\u0442\u0440\u044B \u0438\u043B\u0438 \u0434\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
          action: "+ \u041D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442 \u2192 client-new"
        },
        blocks: [
          {
            type: "header",
            title: "\u041A\u043B\u0438\u0435\u043D\u0442\u044B",
            subtitle: "3 412 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432",
            actions: [
              "\u0418\u043C\u043F\u043E\u0440\u0442",
              "+ \u041D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442 \u2192 client-new"
            ]
          },
          {
            type: "toolbar",
            search: "\u0424\u0418\u041E, \u0418\u041D\u041D, \u0442\u0435\u043B\u0435\u0444\u043E\u043D",
            filters: [
              "\u0421\u0435\u0433\u043C\u0435\u043D\u0442",
              "\u0413\u043E\u0440\u043E\u0434",
              "\u041F\u0440\u043E\u0434\u0443\u043A\u0442"
            ]
          },
          {
            type: "table",
            link: "client-card",
            rows: 10,
            columns: [
              "\u041A\u043B\u0438\u0435\u043D\u0442:person",
              "\u0422\u0435\u043B\u0435\u0444\u043E\u043D:phone",
              "\u0413\u043E\u0440\u043E\u0434:city",
              "\u041A\u0440\u0435\u0434\u0438\u0442\u043E\u0432:number",
              "\u0417\u0430\u0434\u043E\u043B\u0436\u0435\u043D\u043D\u043E\u0441\u0442\u044C:money",
              "\u0421\u0442\u0430\u0442\u0443\u0441:status"
            ],
            statuses: [
              "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439",
              "\u041D\u043E\u0432\u044B\u0439",
              "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0430"
            ]
          },
          {
            type: "pagination",
            summary: "\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E 1\u201310 \u0438\u0437 3 412"
          }
        ]
      },
      {
        id: "client-card",
        title: "\u0411\u0430\u043A\u044B\u0442 \u0410\u0441\u0430\u043D\u043E\u0432",
        nav: "clients",
        parent: "clients",
        blocks: [
          {
            type: "profile",
            name: "\u0411\u0430\u043A\u044B\u0442 \u0410\u0441\u0430\u043D\u043E\u0432",
            meta: "\u041A\u043B\u0438\u0435\u043D\u0442 \u0441 2019 \u0433\u043E\u0434\u0430 \xB7 \u0411\u0438\u0448\u043A\u0435\u043A \xB7 \u0418\u041D\u041D 20512199000123",
            badges: [
              "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439",
              "\u0417\u0430\u0440\u043F\u043B\u0430\u0442\u043D\u044B\u0439 \u043F\u0440\u043E\u0435\u043A\u0442"
            ],
            actions: [
              "\u041F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u044C",
              "+ \u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u2192 app-new"
            ],
            items: [
              [
                "\u041A\u0440\u0435\u0434\u0438\u0442\u043E\u0432",
                "2 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445"
              ],
              [
                "\u0417\u0430\u0434\u043E\u043B\u0436\u0435\u043D\u043D\u043E\u0441\u0442\u044C",
                "312 400 \u0441"
              ],
              [
                "\u041F\u043B\u0430\u0442\u0451\u0436 \u0432 \u043C\u0435\u0441\u044F\u0446",
                "18 400 \u0441"
              ],
              [
                "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0438",
                "\u043D\u0435\u0442"
              ],
              [
                "\u0421\u043A\u043E\u0440\u0438\u043D\u0433",
                "712"
              ]
            ]
          },
          {
            type: "tabs",
            items: [
              "\u041A\u0440\u0435\u0434\u0438\u0442\u044B",
              "\u0417\u0430\u044F\u0432\u043A\u0438",
              "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B",
              "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B",
              "\u0418\u0441\u0442\u043E\u0440\u0438\u044F"
            ]
          },
          {
            type: "split",
            ratio: "2:1",
            columns: [
              [
                {
                  type: "table",
                  title: "\u041A\u0440\u0435\u0434\u0438\u0442\u044B \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
                  link: "loan-card",
                  columns: [
                    "\u0414\u043E\u0433\u043E\u0432\u043E\u0440:id",
                    "\u041F\u0440\u043E\u0434\u0443\u043A\u0442:product",
                    "\u041E\u0441\u0442\u0430\u0442\u043E\u043A:money",
                    "\u041F\u043B\u0430\u0442\u0451\u0436:money",
                    "\u0421\u0442\u0430\u0442\u0443\u0441:status"
                  ],
                  data: [
                    [
                      "CR-90412",
                      "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439",
                      "212 400 \u0441",
                      "15 210 \u0441",
                      "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
                    ],
                    [
                      "CR-89977",
                      "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430",
                      "100 000 \u0441",
                      "3 190 \u0441",
                      "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
                    ],
                    [
                      "CR-88120",
                      "\u0410\u0432\u0442\u043E\u043A\u0440\u0435\u0434\u0438\u0442",
                      "0 \u0441",
                      "\u2014",
                      "\u041F\u043E\u0433\u0430\u0448\u0435\u043D"
                    ]
                  ]
                },
                {
                  type: "files",
                  title: "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
                  items: [
                    {
                      name: "\u041F\u0430\u0441\u043F\u043E\u0440\u0442 ID-\u043A\u0430\u0440\u0442\u0430.pdf",
                      meta: "\u0434\u043E 12.2031",
                      status: "\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D"
                    },
                    {
                      name: "\u0421\u043F\u0440\u0430\u0432\u043A\u0430 \u043E \u0434\u043E\u0445\u043E\u0434\u0430\u0445.pdf",
                      meta: "\u043E\u043A\u0442\u044F\u0431\u0440\u044C 2026",
                      status: "\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D"
                    }
                  ]
                }
              ],
              [
                {
                  type: "details",
                  title: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B",
                  columns: 1,
                  items: [
                    [
                      "\u0422\u0435\u043B\u0435\u0444\u043E\u043D",
                      "phone"
                    ],
                    [
                      "\u041F\u043E\u0447\u0442\u0430",
                      "b.asanov@mail.kg"
                    ],
                    [
                      "\u0410\u0434\u0440\u0435\u0441",
                      "\u0411\u0438\u0448\u043A\u0435\u043A, \u043C\u043A\u0440. \u0410\u0441\u0430\u043D\u0431\u0430\u0439, 12"
                    ],
                    [
                      "\u0420\u0430\u0431\u043E\u0442\u0430",
                      "\u041E\u0441\u041E\u041E \xAB\u0410\u043B\u0430-\u0422\u043E\u043E \u0422\u0440\u0435\u0439\u0434\xBB, \u043B\u043E\u0433\u0438\u0441\u0442"
                    ]
                  ]
                },
                {
                  type: "timeline",
                  title: "\u0412\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F",
                  items: [
                    [
                      "\u0417\u0432\u043E\u043D\u043E\u043A: \u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u0435 \u043E \u043F\u043B\u0430\u0442\u0435\u0436\u0435",
                      "28.10.2026, 11:20"
                    ],
                    [
                      "\u0417\u0430\u044F\u0432\u043A\u0430 CL-240118 \u0441\u043E\u0437\u0434\u0430\u043D\u0430",
                      "21.10.2026, 09:12"
                    ],
                    [
                      "\u041A\u0440\u0435\u0434\u0438\u0442 CR-88120 \u043F\u043E\u0433\u0430\u0448\u0435\u043D",
                      "02.09.2026"
                    ]
                  ]
                }
              ]
            ]
          }
        ]
      },
      {
        id: "client-new",
        title: "\u041D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442",
        nav: "clients",
        parent: "clients",
        states: [
          "default",
          "error"
        ],
        blocks: [
          {
            type: "header",
            title: "\u041D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442",
            breadcrumbs: [
              "\u041A\u043B\u0438\u0435\u043D\u0442\u044B",
              "\u041D\u043E\u0432\u044B\u0439 \u043A\u043B\u0438\u0435\u043D\u0442"
            ]
          },
          {
            type: "form",
            title: "\u0414\u0430\u043D\u043D\u044B\u0435 \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
            subtitle: "\u041F\u043E\u043B\u044F \u0441\u043E \u0437\u0432\u0451\u0437\u0434\u043E\u0447\u043A\u043E\u0439 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B",
            width: 760,
            submit: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
            to: "client-card",
            fields: [
              {
                label: "\u0424\u0430\u043C\u0438\u043B\u0438\u044F",
                required: true
              },
              {
                label: "\u0418\u043C\u044F",
                required: true
              },
              {
                label: "\u0418\u041D\u041D",
                required: true,
                hint: "14 \u0446\u0438\u0444\u0440"
              },
              {
                label: "\u0414\u0430\u0442\u0430 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F",
                type: "date",
                required: true
              },
              {
                label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D",
                type: "phone",
                required: true
              },
              {
                label: "\u041F\u043E\u0447\u0442\u0430",
                type: "email"
              },
              {
                label: "\u0413\u043E\u0440\u043E\u0434",
                type: "select"
              },
              {
                label: "\u041C\u0435\u0441\u0442\u043E \u0440\u0430\u0431\u043E\u0442\u044B"
              },
              {
                label: "\u0421\u043E\u0433\u043B\u0430\u0441\u0438\u0435 \u043D\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443 \u0434\u0430\u043D\u043D\u044B\u0445",
                type: "checkbox"
              }
            ]
          }
        ]
      },
      {
        id: "loans",
        title: "\u041A\u0440\u0435\u0434\u0438\u0442\u044B",
        nav: "loans",
        viewports: [
          "desktop"
        ],
        blocks: [
          {
            type: "header",
            title: "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u044B\u0439 \u043F\u043E\u0440\u0442\u0444\u0435\u043B\u044C",
            period: [
              "\u041C\u0435\u0441\u044F\u0446",
              "\u041A\u0432\u0430\u0440\u0442\u0430\u043B",
              "\u0413\u043E\u0434"
            ],
            actions: [
              "\u042D\u043A\u0441\u043F\u043E\u0440\u0442"
            ]
          },
          {
            type: "stats",
            items: [
              {
                label: "\u041F\u043E\u0440\u0442\u0444\u0435\u043B\u044C",
                value: "2,84 \u043C\u043B\u0440\u0434 \u0441",
                delta: "+4,1% \u043A \u043F\u0440\u043E\u0448\u043B\u043E\u043C\u0443 \u043C\u0435\u0441\u044F\u0446\u0443",
                icon: "wallet"
              },
              {
                label: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432",
                value: "18 240",
                delta: "+612 \u0437\u0430 \u043C\u0435\u0441\u044F\u0446",
                icon: "file"
              },
              {
                label: "\u0421\u0440\u0435\u0434\u043D\u044F\u044F \u0441\u0442\u0430\u0432\u043A\u0430",
                value: "19,8%",
                hint: "\u0432\u0437\u0432\u0435\u0448\u0435\u043D\u043D\u0430\u044F \u043F\u043E \u043E\u0441\u0442\u0430\u0442\u043A\u0443",
                icon: "chart"
              },
              {
                label: "NPL 90+",
                value: "3,2%",
                delta: "\u22120,4 \u043F.\u043F. \u043A \u043F\u0440\u043E\u0448\u043B\u043E\u043C\u0443 \u043C\u0435\u0441\u044F\u0446\u0443",
                better: "down",
                icon: "shield"
              }
            ]
          },
          {
            type: "split",
            ratio: "2:1",
            columns: [
              [
                {
                  type: "chart",
                  title: "\u0412\u044B\u0434\u0430\u0447\u0438 \u043F\u043E \u043C\u0435\u0441\u044F\u0446\u0430\u043C",
                  subtitle: "\u043C\u043B\u043D \u0441",
                  labels: [
                    "\u042F\u043D\u0432",
                    "\u0424\u0435\u0432",
                    "\u041C\u0430\u0440",
                    "\u0410\u043F\u0440",
                    "\u041C\u0430\u0439",
                    "\u0418\u044E\u043D",
                    "\u0418\u044E\u043B",
                    "\u0410\u0432\u0433",
                    "\u0421\u0435\u043D",
                    "\u041E\u043A\u0442",
                    "\u041D\u043E\u044F",
                    "\u0414\u0435\u043A"
                  ]
                }
              ],
              [
                {
                  type: "breakdown",
                  title: "\u0421\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u043F\u043E\u0440\u0442\u0444\u0435\u043B\u044F",
                  subtitle: "\u043F\u043E \u043E\u0441\u0442\u0430\u0442\u043A\u0443 \u0434\u043E\u043B\u0433\u0430",
                  items: [
                    {
                      label: "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0435",
                      value: "1,12 \u043C\u043B\u0440\u0434",
                      share: "39%"
                    },
                    {
                      label: "\u0418\u043F\u043E\u0442\u0435\u043A\u0430",
                      value: "0,86 \u043C\u043B\u0440\u0434",
                      share: "30%"
                    },
                    {
                      label: "\u0411\u0438\u0437\u043D\u0435\u0441",
                      value: "0,51 \u043C\u043B\u0440\u0434",
                      share: "18%"
                    },
                    {
                      label: "\u0410\u0432\u0442\u043E",
                      value: "0,23 \u043C\u043B\u0440\u0434",
                      share: "8%"
                    },
                    {
                      label: "\u041A\u0430\u0440\u0442\u044B",
                      value: "0,12 \u043C\u043B\u0440\u0434",
                      share: "5%"
                    }
                  ]
                }
              ]
            ]
          },
          {
            type: "table",
            title: "\u041A\u0440\u0435\u0434\u0438\u0442\u044B",
            link: "loan-card",
            columns: [
              "\u0414\u043E\u0433\u043E\u0432\u043E\u0440:id",
              "\u041A\u043B\u0438\u0435\u043D\u0442:person",
              "\u041F\u0440\u043E\u0434\u0443\u043A\u0442:product",
              "\u041E\u0441\u0442\u0430\u0442\u043E\u043A:money",
              "\u0421\u0442\u0430\u0432\u043A\u0430:percent",
              "\u0421\u0442\u0430\u0442\u0443\u0441:status"
            ],
            data: [
              [
                "CR-90412",
                "\u0411\u0430\u043A\u044B\u0442 \u0410\u0441\u0430\u043D\u043E\u0432",
                "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439",
                "212 400 \u0441",
                "19,5%",
                "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
              ],
              [
                "CR-90388",
                "\u0410\u0441\u0435\u043B\u044C \u0421\u0430\u0434\u044B\u043A\u043E\u0432\u0430",
                "\u0418\u043F\u043E\u0442\u0435\u043A\u0430",
                "4 860 000 \u0441",
                "12,0%",
                "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
              ],
              [
                "CR-90351",
                "\u0422\u0438\u043C\u0443\u0440 \u0411\u0435\u043A\u043C\u0443\u0440\u0430\u0442\u043E\u0432",
                "\u0410\u0432\u0442\u043E\u043A\u0440\u0435\u0434\u0438\u0442",
                "1 240 000 \u0441",
                "16,5%",
                "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0430"
              ],
              [
                "CR-90297",
                "\u0416\u044B\u043B\u0434\u044B\u0437 \u041E\u0441\u043C\u043E\u043D\u043E\u0432\u0430",
                "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430",
                "86 300 \u0441",
                "24,0%",
                "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
              ],
              [
                "CR-90244",
                "\u041E\u0441\u041E\u041E \xAB\u041D\u0443\u0440 \u0410\u0433\u0440\u043E\xBB",
                "\u0411\u0438\u0437\u043D\u0435\u0441-\u043A\u0440\u0435\u0434\u0438\u0442",
                "7 400 000 \u0441",
                "17,0%",
                "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
              ],
              [
                "CR-90183",
                "\u042D\u043C\u0438\u043B\u044C \u0416\u0443\u043C\u0430\u0431\u0435\u043A\u043E\u0432",
                "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439",
                "0 \u0441",
                "21,5%",
                "\u041F\u043E\u0433\u0430\u0448\u0435\u043D"
              ]
            ]
          }
        ]
      },
      {
        id: "loan-card",
        title: "\u041A\u0440\u0435\u0434\u0438\u0442 CR-90412",
        nav: "loans",
        parent: "loans",
        viewports: [
          "desktop"
        ],
        blocks: [
          {
            type: "header",
            title: "\u041A\u0440\u0435\u0434\u0438\u0442 CR-90412",
            badge: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439",
            breadcrumbs: [
              "\u041A\u0440\u0435\u0434\u0438\u0442\u044B",
              "CR-90412"
            ],
            subtitle: "\u0411\u0430\u043A\u044B\u0442 \u0410\u0441\u0430\u043D\u043E\u0432 \xB7 \u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \xB7 \u0432\u044B\u0434\u0430\u043D 15.03.2026",
            actions: [
              "\u0414\u043E\u0441\u0440\u043E\u0447\u043D\u043E\u0435 \u043F\u043E\u0433\u0430\u0448\u0435\u043D\u0438\u0435",
              "\u0421\u043F\u0440\u0430\u0432\u043A\u0430"
            ]
          },
          {
            type: "split",
            ratio: "2:1",
            columns: [
              [
                {
                  type: "details",
                  title: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F",
                  columns: 3,
                  items: [
                    [
                      "\u0421\u0443\u043C\u043C\u0430",
                      "300 000 \u0441"
                    ],
                    [
                      "\u041E\u0441\u0442\u0430\u0442\u043E\u043A",
                      "212 400 \u0441"
                    ],
                    [
                      "\u0421\u0442\u0430\u0432\u043A\u0430",
                      "19,5%"
                    ],
                    [
                      "\u0421\u0440\u043E\u043A",
                      "24 \u043C\u0435\u0441"
                    ],
                    [
                      "\u041F\u043B\u0430\u0442\u0451\u0436",
                      "15 210 \u0441"
                    ],
                    [
                      "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u043F\u043B\u0430\u0442\u0451\u0436",
                      "15.11.2026"
                    ]
                  ]
                },
                {
                  type: "table",
                  title: "\u0413\u0440\u0430\u0444\u0438\u043A \u043F\u043B\u0430\u0442\u0435\u0436\u0435\u0439",
                  columns: [
                    "\u0414\u0430\u0442\u0430:date",
                    "\u041F\u043B\u0430\u0442\u0451\u0436:money",
                    "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0434\u043E\u043B\u0433:money",
                    "\u041F\u0440\u043E\u0446\u0435\u043D\u0442\u044B:money",
                    "\u0421\u0442\u0430\u0442\u0443\u0441:status"
                  ],
                  data: [
                    [
                      "15.08.2026",
                      "15 210 \u0441",
                      "11 480 \u0441",
                      "3 730 \u0441",
                      "\u041E\u043F\u043B\u0430\u0447\u0435\u043D"
                    ],
                    [
                      "15.09.2026",
                      "15 210 \u0441",
                      "11 670 \u0441",
                      "3 540 \u0441",
                      "\u041E\u043F\u043B\u0430\u0447\u0435\u043D"
                    ],
                    [
                      "15.10.2026",
                      "15 210 \u0441",
                      "11 860 \u0441",
                      "3 350 \u0441",
                      "\u041E\u043F\u043B\u0430\u0447\u0435\u043D"
                    ],
                    [
                      "15.11.2026",
                      "15 210 \u0441",
                      "12 050 \u0441",
                      "3 160 \u0441",
                      "\u041E\u0436\u0438\u0434\u0430\u0435\u0442"
                    ],
                    [
                      "15.12.2026",
                      "15 210 \u0441",
                      "12 250 \u0441",
                      "2 960 \u0441",
                      "\u041E\u0436\u0438\u0434\u0430\u0435\u0442"
                    ]
                  ]
                }
              ],
              [
                {
                  type: "meters",
                  title: "\u041F\u043E\u0433\u0430\u0448\u0435\u043D\u0438\u0435",
                  items: [
                    {
                      label: "\u041F\u043E\u0433\u0430\u0448\u0435\u043D\u043E \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0433\u043E \u0434\u043E\u043B\u0433\u0430",
                      value: "29%",
                      percent: 29,
                      tone: "success"
                    },
                    {
                      label: "\u041F\u0440\u043E\u0448\u043B\u043E \u0441\u0440\u043E\u043A\u0430",
                      value: "8 \u0438\u0437 24 \u043C\u0435\u0441",
                      percent: 33
                    }
                  ]
                },
                {
                  type: "timeline",
                  title: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0438",
                  items: [
                    [
                      "\u041F\u043B\u0430\u0442\u0451\u0436 15 210 \u0441",
                      "15.10.2026"
                    ],
                    [
                      "\u041F\u043B\u0430\u0442\u0451\u0436 15 210 \u0441",
                      "15.09.2026"
                    ],
                    [
                      "\u0412\u044B\u0434\u0430\u0447\u0430 300 000 \u0441",
                      "15.03.2026"
                    ]
                  ]
                }
              ]
            ]
          }
        ]
      },
      {
        id: "collection",
        title: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0430",
        nav: "collection",
        viewports: [
          "desktop"
        ],
        blocks: [
          {
            type: "header",
            title: "\u0420\u0430\u0431\u043E\u0442\u0430 \u0441 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u043E\u0439",
            subtitle: "Soft collection \xB7 \u043E\u0431\u0437\u0432\u043E\u043D \u0438 \u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u044F",
            actions: [
              "\u041D\u0430\u0437\u043D\u0430\u0447\u0438\u0442\u044C \u043E\u0431\u0437\u0432\u043E\u043D",
              "\u042D\u043A\u0441\u043F\u043E\u0440\u0442"
            ]
          },
          {
            type: "stats",
            items: [
              {
                label: "1\u201330 \u0434\u043D\u0435\u0439",
                value: "184",
                hint: "6,1 \u043C\u043B\u043D \u0441",
                icon: "history"
              },
              {
                label: "31\u201360 \u0434\u043D\u0435\u0439",
                value: "52",
                hint: "2,4 \u043C\u043B\u043D \u0441",
                icon: "history"
              },
              {
                label: "61\u201390 \u0434\u043D\u0435\u0439",
                value: "19",
                hint: "1,1 \u043C\u043B\u043D \u0441",
                icon: "shield"
              },
              {
                label: "90+ \u0434\u043D\u0435\u0439",
                value: "41",
                hint: "3,8 \u043C\u043B\u043D \u0441",
                icon: "shield"
              }
            ]
          },
          {
            type: "toolbar",
            search: "\u041A\u043B\u0438\u0435\u043D\u0442 \u0438\u043B\u0438 \u0434\u043E\u0433\u043E\u0432\u043E\u0440",
            filters: [
              "\u041A\u043E\u0440\u0437\u0438\u043D\u0430",
              "\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439",
              "\u041E\u0431\u0435\u0449\u0430\u043D\u0438\u0435 \u043E\u043F\u043B\u0430\u0442\u044B"
            ]
          },
          {
            type: "table",
            link: "client-card",
            selectable: true,
            columns: [
              "\u0414\u043E\u0433\u043E\u0432\u043E\u0440:id",
              "\u041A\u043B\u0438\u0435\u043D\u0442:person",
              "\u0422\u0435\u043B\u0435\u0444\u043E\u043D:phone",
              "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E:money",
              "\u0414\u043D\u0435\u0439:number",
              "\u0421\u0442\u0430\u0442\u0443\u0441:status"
            ],
            data: [
              [
                "CR-88412",
                "\u0422\u0438\u043C\u0443\u0440 \u0411\u0435\u043A\u043C\u0443\u0440\u0430\u0442\u043E\u0432",
                "+996 700 412 118",
                "46 200 \u0441",
                "12",
                "\u041E\u0431\u0435\u0449\u0430\u043B \u043E\u043F\u043B\u0430\u0442\u0438\u0442\u044C"
              ],
              [
                "CR-87990",
                "\u041C\u044D\u044D\u0440\u0438\u043C \u041A\u0430\u0434\u044B\u0440\u043E\u0432\u0430",
                "+996 555 301 774",
                "18 900 \u0441",
                "5",
                "\u041D\u043E\u0432\u044B\u0439"
              ],
              [
                "CR-87512",
                "\u0420\u0443\u0441\u043B\u0430\u043D \u0418\u0441\u0430\u043A\u043E\u0432",
                "+996 777 240 905",
                "124 600 \u0441",
                "38",
                "\u041D\u0435 \u0434\u043E\u0437\u0432\u043E\u043D\u0438\u043B\u0438\u0441\u044C"
              ],
              [
                "CR-87104",
                "\u0414\u0438\u043D\u0430\u0440\u0430 \u0410\u043B\u0438\u0435\u0432\u0430",
                "+996 702 118 336",
                "31 050 \u0441",
                "21",
                "\u041E\u0431\u0435\u0449\u0430\u043B \u043E\u043F\u043B\u0430\u0442\u0438\u0442\u044C"
              ],
              [
                "CR-86833",
                "\u042D\u043C\u0438\u043B\u044C \u041E\u0441\u043C\u043E\u043D\u043E\u0432",
                "+996 550 907 412",
                "212 000 \u0441",
                "64",
                "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0430"
              ],
              [
                "CR-86271",
                "\u041A\u0430\u043C\u0438\u043B\u0430 \u0421\u0430\u0434\u044B\u043A\u043E\u0432\u0430",
                "+996 701 455 090",
                "9 800 \u0441",
                "3",
                "\u041D\u043E\u0432\u044B\u0439"
              ],
              [
                "CR-85960",
                "\u041D\u0443\u0440\u043B\u0430\u043D \u0416\u0443\u043C\u0430\u0431\u0435\u043A\u043E\u0432",
                "+996 773 612 248",
                "386 400 \u0441",
                "97",
                "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0430"
              ],
              [
                "CR-85544",
                "\u0410\u0441\u0435\u043B\u044C \u041C\u0430\u043C\u044B\u0442\u043E\u0432\u0430",
                "+996 556 228 017",
                "57 300 \u0441",
                "27",
                "\u041D\u0435 \u0434\u043E\u0437\u0432\u043E\u043D\u0438\u043B\u0438\u0441\u044C"
              ]
            ]
          },
          {
            type: "pagination",
            summary: "\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E 1\u20138 \u0438\u0437 296"
          }
        ]
      },
      {
        id: "reports",
        title: "\u041E\u0442\u0447\u0451\u0442\u044B",
        nav: "reports",
        viewports: [
          "desktop"
        ],
        blocks: [
          {
            type: "header",
            title: "\u041E\u0442\u0447\u0451\u0442\u044B",
            period: [
              "\u041D\u0435\u0434\u0435\u043B\u044F",
              "\u041C\u0435\u0441\u044F\u0446",
              "\u041A\u0432\u0430\u0440\u0442\u0430\u043B",
              "\u0413\u043E\u0434"
            ],
            periodActive: 1,
            actions: [
              "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0432 Excel"
            ]
          },
          {
            type: "split",
            ratio: "1:1",
            columns: [
              [
                {
                  type: "funnel",
                  title: "\u041A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u044F \u043A\u043E\u043D\u0432\u0435\u0439\u0435\u0440\u0430",
                  subtitle: "\u041E\u043A\u0442\u044F\u0431\u0440\u044C 2026",
                  items: [
                    {
                      label: "\u041F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u043E",
                      value: "8 412",
                      rate: "100%"
                    },
                    {
                      label: "\u0421\u043A\u043E\u0440\u0438\u043D\u0433",
                      value: "6 590",
                      rate: "78%"
                    },
                    {
                      label: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0421\u0411",
                      value: "5 870",
                      rate: "70%"
                    },
                    {
                      label: "\u041E\u0434\u043E\u0431\u0440\u0435\u043D\u043E",
                      value: "4 310",
                      rate: "51%"
                    },
                    {
                      label: "\u0412\u044B\u0434\u0430\u043D\u043E",
                      value: "3 640",
                      rate: "43%"
                    }
                  ]
                }
              ],
              [
                {
                  type: "breakdown",
                  title: "\u041F\u0440\u0438\u0447\u0438\u043D\u044B \u043E\u0442\u043A\u0430\u0437\u043E\u0432",
                  subtitle: "\u041E\u043A\u0442\u044F\u0431\u0440\u044C 2026",
                  items: [
                    {
                      label: "\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u041F\u0414\u041D",
                      value: "1 204",
                      share: "39%"
                    },
                    {
                      label: "\u041D\u0435\u0433\u0430\u0442\u0438\u0432\u043D\u0430\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F",
                      value: "861",
                      share: "28%"
                    },
                    {
                      label: "\u0414\u043E\u0445\u043E\u0434 \u043D\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D",
                      value: "520",
                      share: "17%"
                    },
                    {
                      label: "\u0421\u0442\u043E\u043F-\u043B\u0438\u0441\u0442\u044B",
                      value: "286",
                      share: "9%"
                    },
                    {
                      label: "\u041F\u0440\u043E\u0447\u0435\u0435",
                      value: "231",
                      share: "7%"
                    }
                  ]
                }
              ]
            ]
          },
          {
            type: "cards",
            columns: 3,
            items: [
              {
                title: "\u0412\u044B\u0434\u0430\u0447\u0438 \u043F\u043E \u0444\u0438\u043B\u0438\u0430\u043B\u0430\u043C",
                text: "\u041E\u0431\u044A\u0451\u043C \u0438 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0432\u044B\u0434\u0430\u0447, \u043F\u043B\u0430\u043D/\u0444\u0430\u043A\u0442 \u043F\u043E \u043E\u0442\u0434\u0435\u043B\u0435\u043D\u0438\u044F\u043C",
                badge: "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E"
              },
              {
                title: "\u042D\u0444\u0444\u0435\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u0430\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0435\u0440\u043E\u0432",
                text: "\u0420\u0435\u0448\u0435\u043D\u0438\u044F, \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u043F\u043E\u0440\u0442\u0444\u0435\u043B\u044F \u043F\u043E \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430\u043C",
                badge: "\u0415\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u043E"
              },
              {
                title: "\u0412\u0438\u043D\u0442\u0430\u0436\u043D\u044B\u0439 \u0430\u043D\u0430\u043B\u0438\u0437",
                text: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0430 \u043F\u043E \u043F\u043E\u043A\u043E\u043B\u0435\u043D\u0438\u044F\u043C \u0432\u044B\u0434\u0430\u0447 \u0434\u043B\u044F \u0440\u0438\u0441\u043A-\u043C\u0435\u043D\u0435\u0434\u0436\u043C\u0435\u043D\u0442\u0430",
                badge: "\u0415\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u043E"
              },
              {
                title: "\u041E\u0442\u0447\u0451\u0442 \u0434\u043B\u044F \u041D\u0411\u041A\u0420",
                text: "\u0420\u0435\u0433\u0443\u043B\u044F\u0442\u043E\u0440\u043D\u0430\u044F \u0444\u043E\u0440\u043C\u0430 \u043F\u043E \u043A\u0440\u0435\u0434\u0438\u0442\u043D\u043E\u043C\u0443 \u043F\u043E\u0440\u0442\u0444\u0435\u043B\u044E",
                badge: "\u0415\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u043E"
              },
              {
                title: "\u041A\u0430\u043D\u0430\u043B\u044B \u043F\u0440\u0438\u0432\u043B\u0435\u0447\u0435\u043D\u0438\u044F",
                text: "\u041A\u043E\u043D\u0432\u0435\u0440\u0441\u0438\u044F \u043E\u043D\u043B\u0430\u0439\u043D, \u043E\u0442\u0434\u0435\u043B\u0435\u043D\u0438\u0439 \u0438 \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u043E\u0432",
                badge: "\u0415\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u043E"
              },
              {
                title: "SLA \u043A\u043E\u043D\u0432\u0435\u0439\u0435\u0440\u0430",
                text: "\u0412\u0440\u0435\u043C\u044F \u043D\u0430 \u043A\u0430\u0436\u0434\u043E\u043C \u044D\u0442\u0430\u043F\u0435 \u0438 \u043D\u0430\u0440\u0443\u0448\u0435\u043D\u0438\u044F \u043D\u043E\u0440\u043C\u0430\u0442\u0438\u0432\u0430",
                badge: "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E"
              }
            ]
          }
        ]
      },
      {
        id: "products",
        title: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u044B",
        nav: "products",
        viewports: [
          "desktop"
        ],
        blocks: [
          {
            type: "header",
            title: "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u044B\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B",
            subtitle: "\u0423\u0441\u043B\u043E\u0432\u0438\u044F, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0432\u0438\u0434\u0438\u0442 \u043A\u043E\u043D\u0432\u0435\u0439\u0435\u0440 \u043F\u0440\u0438 \u0440\u0430\u0441\u0447\u0451\u0442\u0435",
            actions: [
              "+ \u041D\u043E\u0432\u044B\u0439 \u043F\u0440\u043E\u0434\u0443\u043A\u0442"
            ]
          },
          {
            type: "cards",
            columns: 3,
            items: [
              {
                title: "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439",
                text: "10 000 \u2013 3 000 000 \u0441 \xB7 6\u201360 \u043C\u0435\u0441 \xB7 \u043E\u0442 19,5%",
                badge: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
              },
              {
                title: "\u0418\u043F\u043E\u0442\u0435\u043A\u0430",
                text: "\u0434\u043E 15 000 000 \u0441 \xB7 \u0434\u043E 20 \u043B\u0435\u0442 \xB7 \u043E\u0442 12%",
                badge: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
              },
              {
                title: "\u0410\u0432\u0442\u043E\u043A\u0440\u0435\u0434\u0438\u0442",
                text: "\u0434\u043E 5 000 000 \u0441 \xB7 \u0434\u043E 7 \u043B\u0435\u0442 \xB7 \u043E\u0442 16%",
                badge: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
              },
              {
                title: "\u0411\u0438\u0437\u043D\u0435\u0441-\u043A\u0440\u0435\u0434\u0438\u0442",
                text: "\u0434\u043E 20 000 000 \u0441 \xB7 \u0434\u043E 5 \u043B\u0435\u0442 \xB7 \u043E\u0442 17%",
                badge: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
              },
              {
                title: "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430",
                text: "\u043B\u0438\u043C\u0438\u0442 \u0434\u043E 500 000 \u0441 \xB7 \u043B\u044C\u0433\u043E\u0442\u043D\u044B\u0439 \u043F\u0435\u0440\u0438\u043E\u0434 55 \u0434\u043D\u0435\u0439",
                badge: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439"
              },
              {
                title: "\u0420\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0430 \u0443 \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u043E\u0432",
                text: "0% \xB7 3\u201312 \u043C\u0435\u0441 \xB7 \u043A\u043E\u043C\u0438\u0441\u0441\u0438\u044F \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u0430",
                badge: "\u0427\u0435\u0440\u043D\u043E\u0432\u0438\u043A"
              }
            ]
          }
        ]
      },
      {
        id: "staff",
        title: "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438",
        nav: "staff",
        viewports: [
          "desktop"
        ],
        blocks: [
          {
            type: "header",
            title: "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438 \u0438 \u0440\u043E\u043B\u0438",
            actions: [
              "+ \u041F\u0440\u0438\u0433\u043B\u0430\u0441\u0438\u0442\u044C"
            ]
          },
          {
            type: "tabs",
            items: [
              "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438 \xB7 46",
              "\u0420\u043E\u043B\u0438 \xB7 6",
              "\u0416\u0443\u0440\u043D\u0430\u043B \u0434\u043E\u0441\u0442\u0443\u043F\u0430"
            ]
          },
          {
            type: "table",
            rows: 8,
            columns: [
              "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A:person",
              "\u041F\u043E\u0447\u0442\u0430:email",
              "\u0420\u043E\u043B\u044C:product",
              "\u041E\u0442\u0434\u0435\u043B\u0435\u043D\u0438\u0435:city",
              "\u0421\u0442\u0430\u0442\u0443\u0441:status"
            ],
            statuses: [
              "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439",
              "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439",
              "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0451\u043D",
              "\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D"
            ]
          }
        ]
      },
      {
        id: "settings",
        title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
        nav: "settings",
        viewports: [
          "desktop"
        ],
        blocks: [
          {
            type: "header",
            title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043A\u043E\u043D\u0432\u0435\u0439\u0435\u0440\u0430",
            subtitle: "\u041D\u043E\u0440\u043C\u0430\u0442\u0438\u0432\u044B SLA \u0438 \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0446\u0438\u0438"
          },
          {
            type: "split",
            ratio: "3:2",
            columns: [
              [
                {
                  type: "form",
                  title: "\u041D\u043E\u0440\u043C\u0430\u0442\u0438\u0432\u044B SLA",
                  submit: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
                  fields: [
                    {
                      label: "\u0421\u043A\u043E\u0440\u0438\u043D\u0433, \u043C\u0438\u043D",
                      hint: "\u0441\u0435\u0439\u0447\u0430\u0441 15"
                    },
                    {
                      label: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0421\u0411, \u0447",
                      hint: "\u0441\u0435\u0439\u0447\u0430\u0441 2"
                    },
                    {
                      label: "\u0410\u043D\u0434\u0435\u0440\u0440\u0430\u0439\u0442\u0438\u043D\u0433, \u0447",
                      hint: "\u0441\u0435\u0439\u0447\u0430\u0441 4"
                    },
                    {
                      label: "\u0412\u044B\u0434\u0430\u0447\u0430, \u0434\u043D\u0435\u0439",
                      hint: "\u0441\u0435\u0439\u0447\u0430\u0441 1"
                    },
                    {
                      label: "\u0410\u0432\u0442\u043E\u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0438\u0435 \u043F\u0440\u0438 \u0441\u043A\u043E\u0440\u0438\u043D\u0433\u0435 \u043E\u0442",
                      hint: "\u0431\u0430\u043B\u043B\u043E\u0432 \u0438\u0437 850"
                    },
                    {
                      label: "\u0410\u0432\u0442\u043E\u043E\u0442\u043A\u0430\u0437 \u043F\u0440\u0438 \u0441\u043A\u043E\u0440\u0438\u043D\u0433\u0435 \u043D\u0438\u0436\u0435",
                      hint: "\u0431\u0430\u043B\u043B\u043E\u0432 \u0438\u0437 850"
                    },
                    {
                      label: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u044F\u0442\u044C \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F \u043E \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0435 SLA",
                      type: "checkbox"
                    }
                  ]
                }
              ],
              [
                {
                  type: "checks",
                  title: "\u0418\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438",
                  items: [
                    {
                      label: "\u0410\u0411\u0421 \u0431\u0430\u043D\u043A\u0430",
                      result: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0430",
                      status: "ok"
                    },
                    {
                      label: "\u041A\u0440\u0435\u0434\u0438\u0442\u043D\u043E\u0435 \u0431\u044E\u0440\u043E",
                      result: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043E",
                      status: "ok"
                    },
                    {
                      label: "\u0413\u041D\u0421",
                      result: "\u041C\u0435\u0434\u043B\u0435\u043D\u043D\u043E",
                      status: "warn"
                    },
                    {
                      label: "SMS-\u0448\u043B\u044E\u0437",
                      result: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D",
                      status: "ok"
                    }
                  ]
                }
              ]
            ]
          }
        ]
      }
    ]
  };

  // plugin/src/bridge.js
  var URL_BASE = "http://localhost:3055";
  var BRIDGE_HTML = `<!doctype html><meta charset="utf-8"><body style="font:12px Inter,system-ui;margin:12px;color:#111">
<b>\u041C\u043E\u0441\u0442 \u0434\u043B\u044F Claude</b><div id="s">\u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0430\u044E\u0441\u044C \u043A ${URL_BASE}\u2026</div><div id="l" style="color:#666;margin-top:6px"></div>
<script>
const s = document.getElementById('s'), l = document.getElementById('l');
let file = '';
const waits = {};
onmessage = (e) => { const m = e.data.pluginMessage; if (!m) return; if (m.type === 'file') file = m.name; if (m.type === 'done' && waits[m.id]) { waits[m.id](m); delete waits[m.id]; } };
async function loop() {
  for (;;) {
    try {
      const r = await fetch('${URL_BASE}/poll?file=' + encodeURIComponent(file));
      const cmd = await r.json();
      s.textContent = '\u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u043E \xB7 ' + new Date().toLocaleTimeString();
      if (cmd.type === 'idle') continue;
      l.textContent = '\u25B6 ' + cmd.type;
      const res = await new Promise((ok) => { waits[cmd.id] = ok; parent.postMessage({ pluginMessage: { type: 'bridge-cmd', cmd } }, '*'); });
      await fetch('${URL_BASE}/result', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: cmd.id, ok: res.ok, result: res.result, error: res.error }) });
      l.textContent = (res.ok ? '\u2713 ' : '\u2717 ') + cmd.type;
    } catch (e) { s.textContent = '\u043D\u0435\u0442 \u0441\u0435\u0440\u0432\u0435\u0440\u0430 \u043C\u043E\u0441\u0442\u0430 (node bridge/server.mjs) \u2014 \u043F\u043E\u0432\u0442\u043E\u0440 \u0447\u0435\u0440\u0435\u0437 3 \u0441'; await new Promise((r) => setTimeout(r, 3000)); }
  }
}
loop();
<\/script>`;
  async function findNodes({ ids = [], names = [], page }) {
    const out = [];
    for (const id of ids) {
      const n = await figma.getNodeByIdAsync(id);
      if (n) out.push(n);
    }
    if (names.length) {
      const pages = page ? figma.root.children.filter((p) => p.name === page) : figma.root.children;
      for (const p of pages) {
        await p.loadAsync();
        for (const name of names) {
          const n = p.findOne((x) => x.name === name);
          if (n) out.push(n);
        }
      }
    }
    return out;
  }
  var BRIDGE_COMMANDS = {
    async export(a) {
      const images = [];
      for (const n of await findNodes(a)) {
        const bytes = await n.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: a.scale || 1 } });
        images.push({ id: n.id, name: n.name, width: Math.round(n.width), height: Math.round(n.height), base64: figma.base64Encode(bytes) });
      }
      return { images };
    },
    async eval(a) {
      const fn = new (Object.getPrototypeOf(async () => {
      })).constructor("figma", a.code);
      return fn(figma);
    },
    async inspect() {
      const pages = [];
      for (const p of figma.root.children) {
        await p.loadAsync();
        pages.push({ name: p.name, id: p.id, children: p.children.map((n) => `${n.type}:${n.name}`).slice(0, 40) });
      }
      const cols2 = await figma.variables.getLocalVariableCollectionsAsync();
      return { file: figma.root.name, pages, collections: cols2.map((c) => ({ name: c.name, modes: c.modes.map((m) => m.name), variables: c.variableIds.length })) };
    },
    // Creates / completes the «shadcn» collection (canonical values); reset: true rewrites every value.
    async "tokens-apply"(a) {
      const r = await ensureShadcn({ reset: !!a.reset });
      return { created: r.created.length, reset: r.reset, collection: r.collection };
    }
  };
  function startBridge(handlers2) {
    figma.showUI(BRIDGE_HTML, { width: 260, height: 90, title: "\u041C\u043E\u0441\u0442 \u0434\u043B\u044F Claude" });
    figma.ui.postMessage({ type: "file", name: figma.root.name });
    figma.ui.onmessage = async (m) => {
      if (!m || m.type !== "bridge-cmd") return;
      const { id, type, args } = m.cmd;
      const fn = BRIDGE_COMMANDS[type] || handlers2[type];
      try {
        if (!fn) throw new Error(`\u043D\u0435\u0442 \u043A\u043E\u043C\u0430\u043D\u0434\u044B ${type}`);
        figma.ui.postMessage({ type: "done", id, ok: true, result: await fn(args || {}) });
      } catch (e) {
        figma.ui.postMessage({ type: "done", id, ok: false, error: String(e && e.message ? e.message : e) });
      }
    };
  }

  // plugin/src/assemble.js
  var BLOCK_CONTRACTS = {
    header: ["breadcrumb-item", "button", "badge", "tabs-list", "tabs-trigger"],
    toolbar: ["search-input", "input", "filter-chip", "button"],
    table: ["table-head", "table-cell", "badge", "avatar", "checkbox"],
    pagination: ["pagination", "button"],
    tabs: ["tabs-list", "tabs-trigger"],
    form: ["input", "select-trigger", "textarea", "date-picker-trigger", "checkbox", "radio", "button"],
    stepper: ["stepper-step"],
    alert: ["alert", "button"],
    empty: ["empty-state", "button"],
    login: ["input", "button", "alert"],
    stats: ["crm-kpi-card"],
    details: ["crm-key-value-row"],
    timeline: ["crm-timeline-item"],
    list: ["crm-list-item", "avatar", "badge"],
    kanban: ["crm-application-card", "badge", "avatar"],
    cards: ["badge"],
    meters: ["progress"],
    score: ["badge"],
    decision: ["button"],
    files: ["badge"],
    comments: ["avatar", "input", "button"],
    profile: ["avatar", "badge", "button"]
  };
  var SHELL_CONTRACTS = { sidebar: ["nav-item", "search-input", "input", "avatar", "badge"], mobile: ["tabbar-item"] };
  var STATE_CONTRACTS = { loading: ["skeleton"], empty: ["empty-state", "button"], error: ["alert", "empty-state", "button"], "no-access": ["empty-state", "button"] };
  function neededContracts(rawSpec) {
    const spec = normalizeSpec(rawSpec);
    const out = /* @__PURE__ */ new Set();
    const walk = (blocks) => blocks.forEach((b) => {
      for (const n of BLOCK_CONTRACTS[b.type] || []) out.add(n);
      if (b.type === "split") b.columns.forEach(walk);
    });
    for (const s of spec.screens) {
      walk(s.blocks);
      for (const n of SHELL_CONTRACTS[s.shell] || []) out.add(n);
      if (s.shell === "sidebar" && s.viewports.includes("mobile")) out.add("search-input");
      for (const st of s.states) for (const n of STATE_CONTRACTS[st] || []) out.add(n);
    }
    return [...out].sort();
  }
  var pageOfNode = (n) => {
    let p = n;
    while (p && p.type !== "PAGE") p = p.parent;
    return p;
  };
  var strip2 = (_a) => {
    var _b = _a, { example } = _b, c = __objRest(_b, ["example"]);
    return c;
  };
  async function ensureContracts(spec, bundled, opts = {}) {
    const sets = await contractRegistry();
    const all = allContracts(bundled);
    const needed = neededContracts(spec);
    const usesKit = (c) => Object.values(c.anatomy || {}).some((a) => a && a.kind === "instance");
    const todo = needed.filter((n) => !sets[n] && all.has(n)).map((n) => all.get(n).contract).sort((a, b) => usesKit(a) - usesKit(b));
    const built = [];
    const failed = [];
    for (const contract of todo) {
      if (validateContract(contract).length) {
        failed.push(contract.name);
        continue;
      }
      const c = __spreadProps(__spreadValues({}, contract), { figma: __spreadProps(__spreadValues({}, contract.figma || {}), { page: PAGE }) });
      const res = await renderContract(c, { font: opts.font, create: opts.create === true });
      if (res.errors) {
        failed.push(c.name);
        continue;
      }
      putContract(__spreadValues(__spreadValues({}, strip2(res.contract)), c.edited ? { edited: true } : {}));
      built.push(c.name);
    }
    const fresh = built.length ? await contractRegistry() : sets;
    if (built.length) {
      const page = await componentsPage(PAGE);
      const items = [];
      for (const [name, ref] of Object.entries(fresh)) {
        const node = await figma.getNodeByIdAsync(ref.id);
        if (node && pageOfNode(node) === page && all.has(name)) items.push({ contract: all.get(name).contract, setId: ref.id });
      }
      await kitSheet(page, items);
    }
    return { built, failed, present: needed.filter((n) => sets[n]), unknown: needed.filter((n) => !fresh[n]), sets: fresh };
  }

  // plugin/src/code.js
  var COMMAND = figma.command && figma.command !== "open" ? figma.command : null;
  if (COMMAND !== "bridge") figma.showUI(__html__, { width: 520, height: 720, themeColors: true, visible: !COMMAND });
  var kitCache = null;
  var post = (type, data) => figma.ui.postMessage(__spreadValues({ type }, data));
  async function kit() {
    if (!kitCache) kitCache = await scanKit();
    return kitCache;
  }
  function screensReport(res) {
    const s = res.stats;
    const hand = (res.handDrawn || []).map((x) => `${x.role} ${x.count}`).join(", ");
    const built = res.components && res.components.built.length ? ` \xB7 \u0441\u043E\u0431\u0440\u0430\u043D\u044B \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B: ${res.components.built.join(", ")}` : "";
    return `\u042D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u044B \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043E\u0432 ${s.instances}, \u043D\u0430\u0440\u0438\u0441\u043E\u0432\u0430\u043D\u043E \u0432\u0440\u0443\u0447\u043D\u0443\u044E ${s.fallbacks}${hand ? ` (${hand})` : ""}${built} \xB7 \u043F\u043E \u0440\u043E\u043B\u044F\u043C (\u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u044B/\u0432\u0440\u0443\u0447\u043D\u0443\u044E): ${res.roles}`;
  }
  var handlers = __spreadValues({
    async init() {
      return { status: await inspect() };
    },
    async "tokens-apply"(m) {
      const report2 = await ensureShadcn({ reset: !!m.reset });
      return { report: report2, status: await inspect(), tokens: await readShadcn() };
    },
    async "tokens-read"() {
      return { tokens: await readShadcn() };
    },
    async "scan-kit"() {
      kitCache = null;
      const k = await kit();
      return { kit: k.kit, count: k.components.length, components: k.components };
    },
    async "export-css"() {
      const tokens = await readShadcn();
      return { tokens, css: toShadcnCss(tokens) };
    },
    async build(m) {
      const errors = [...validateSpec(m.spec), ...validateLinks(m.spec)];
      if (errors.length) return { errors };
      await ensureShadcn();
      const { vars, radius } = await screenVars(await modeVars());
      const components = m.components === false ? null : await ensureContracts(m.spec, contracts_default, { font: m.font, create: m.create });
      if (components && components.built.length) kitCache = null;
      const k = await kit();
      const res = await buildSpec(
        m.spec,
        { vars, radius, kit: k.kit, font: m.font, theme: m.theme, only: m.only, contracts: components ? components.sets : void 0 },
        (done, total, label2) => post("progress", { done, total, label: label2 })
      );
      res.components = components && { built: components.built, failed: components.failed, unknown: components.unknown };
      res.report = screensReport(res);
      const audit = await auditFrames(res.frames.map((f) => f.id));
      const first = res.sections[0] && await figma.getNodeByIdAsync(res.sections[0].id);
      if (first) {
        let page = first.parent;
        while (page && page.type !== "PAGE") page = page.parent;
        if (page) await figma.setCurrentPageAsync(page);
        figma.viewport.scrollAndZoomIntoView([first]);
      }
      return { result: res, audit };
    }
  }, contractHandlers(contracts_default));
  if (COMMAND !== "bridge") figma.ui.onmessage = async (m) => {
    const fn = handlers[m.type];
    if (!fn) return;
    try {
      post(`${m.type}:done`, await fn(m));
    } catch (e) {
      post("error", { for: m.type, message: String(e && e.message ? e.message : e) });
    }
  };
  var COMMANDS = {
    async "render-all"() {
      const r = await handlers["contract-render-all"]({ create: false });
      return `\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B: ${r.built} \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \xAB${r.page}\xBB${r.failed.length ? `, \u043D\u0435 \u0441\u043E\u0431\u0440\u0430\u043D\u044B: ${r.failed.join(", ")}` : ""}${r.missing.length ? ` \xB7 \u043D\u0435\u0442 \u0442\u043E\u043A\u0435\u043D\u043E\u0432 (${r.missing.length}): ${r.missing.slice(0, 8).join(", ")}` : " \xB7 \u0432\u0441\u0435 \u0442\u043E\u043A\u0435\u043D\u044B \u043D\u0430\u0439\u0434\u0435\u043D\u044B"}`;
    },
    async "build-example"() {
      const r = await handlers.build({ spec: credit_crm_spec_default, theme: "light" });
      if (r.errors) return `\u0421\u043F\u0435\u043A\u0430 \u0441 \u043E\u0448\u0438\u0431\u043A\u0430\u043C\u0438: ${r.errors.slice(0, 3).join("; ")}`;
      return `\u042D\u043A\u0440\u0430\u043D\u044B: ${r.result.frames.length} \u0444\u0440\u0435\u0439\u043C\u043E\u0432, ${r.result.sections.length} \u044D\u043A\u0440\u0430\u043D\u043E\u0432 \xB7 ${r.result.report}`;
    }
  };
  if (COMMAND === "bridge") {
    startBridge(__spreadProps(__spreadValues({}, handlers), { "render-all": () => handlers["contract-render-all"]({ create: false }) }));
  } else if (COMMAND) {
    (async () => {
      try {
        const msg = await COMMANDS[COMMAND]();
        console.log(`[DS Builder] ${msg}`);
        figma.closePlugin(msg);
      } catch (e) {
        figma.closePlugin(`\u041E\u0448\u0438\u0431\u043A\u0430: ${String(e && e.message ? e.message : e)}`);
      }
    })();
  }
})();
