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
  function hexToOklch(hex) {
    const { r, g, b } = hexToRgb(hex);
    const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const C2 = Math.sqrt(A * A + B * B);
    const H = C2 < 1e-4 ? 0 : (Math.atan2(B, A) * 180 / Math.PI + 360) % 360;
    return { l: L, c: C2, h: H };
  }

  // core/tokens.js
  var COLOR_TOKENS = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "destructive-foreground",
    "border",
    "input",
    "ring",
    "chart-1",
    "chart-2",
    "chart-3",
    "chart-4",
    "chart-5",
    "sidebar",
    "sidebar-foreground",
    "sidebar-primary",
    "sidebar-primary-foreground",
    "sidebar-accent",
    "sidebar-accent-foreground",
    "sidebar-border",
    "sidebar-ring",
    // Team extension: statuses every CRM needs, shadcn has no slot for them.
    "success",
    "success-foreground",
    "warning",
    "warning-foreground",
    "info",
    "info-foreground"
  ];
  var EXTENSION_TOKENS = ["destructive-foreground", "success", "success-foreground", "warning", "warning-foreground", "info", "info-foreground"];
  function scopesFor(token) {
    const t = token.split("/").pop();
    if (/(^|-)foreground$/.test(t) || /(^|-)(txt|text)(-|$)/.test(t)) return ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"];
    if (/^(border|input|ring|ring-offset)$|-(border|ring)$|(^|-)border-/.test(t)) return ["STROKE_COLOR", "FRAME_FILL", "SHAPE_FILL"];
    if (/^chart-/.test(t)) return ["SHAPE_FILL", "FRAME_FILL", "STROKE_COLOR"];
    return ["FRAME_FILL", "SHAPE_FILL"];
  }
  function radiusScale(radius) {
    const r = Number(radius);
    return { sm: Math.max(0, r - 4), md: Math.max(0, r - 2), lg: r, xl: r + 4 };
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

  // core/palette.js
  function lab(hex) {
    const { l, c, h } = hexToOklch(hex);
    const r = h * Math.PI / 180;
    return [l, c * Math.cos(r), c * Math.sin(r)];
  }
  function deltaE(a, b) {
    const [l1, a1, b1] = lab(a);
    const [l2, a2, b2] = lab(b);
    return Math.hypot(l1 - l2, a1 - a2, b1 - b2) * 100;
  }
  function snap(hex, palette, maxDE = 2.5) {
    if (hexToRgb(hex).a < 1) return null;
    let best = null;
    for (const [name, value] of Object.entries(palette)) {
      if (hexToRgb(value).a < 1) continue;
      const de = deltaE(hex, value);
      if (!best || de < best.de) best = { name, hex: value, de };
    }
    return best && best.de <= maxDE ? best : null;
  }

  // core/naming.js
  var kebab = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-").replace(/^-+|-+$/g, "");
  function customName(project, role) {
    const p = kebab(project);
    let r = kebab(role);
    if (r.startsWith(`${p}-`)) r = r.slice(p.length + 1);
    if (!/^[a-z]/.test(p) || !/^[a-z0-9]/.test(r)) throw new Error(`Bad token name: project "${project}", role "${role}" (latin, kebab-case)`);
    return `custom/${p}/${r}`;
  }
  function cssVar(name) {
    const parts = name.split("/");
    return parts[0] === "custom" ? `--${parts.slice(1).join("-")}` : `--${parts[parts.length - 1]}`;
  }
  function fixLegacyName(name) {
    const parts = name.split("/");
    if (parts[0] !== "custom" || parts.length < 3) return name;
    try {
      return customName(parts[1], parts.slice(2).join("-"));
    } catch (e) {
      return name;
    }
  }

  // plugin/src/brand.js
  var C = { tailwind: "Tailwind", style: "Style", mode: "Mode", brand: "Brand" };
  var THEMES = ["light", "dark"];
  var EXT_DEFAULTS = {
    "destructive-foreground": ["white", "white"],
    success: ["green/600", "green/500"],
    "success-foreground": ["white", "green/950"],
    warning: ["amber/500", "amber/400"],
    "warning-foreground": ["amber/950", "amber/950"],
    info: ["blue/600", "blue/500"],
    "info-foreground": ["white", "white"]
  };
  var alias = (v) => figma.variables.createVariableAlias(v);
  var isAlias = (x) => x && typeof x === "object" && x.type === "VARIABLE_ALIAS";
  var rgba = (hex) => {
    const { r, g, b, a } = hexToRgb(hex);
    return { r, g, b, a };
  };
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
    const palette = {};
    for (const [name, v] of named[C.tailwind] || []) {
      if (v.resolvedType !== "COLOR" || !name.startsWith("colors/")) continue;
      const val = v.valuesByMode[col[C.tailwind].defaultModeId];
      if (!isAlias(val)) palette[name.slice(7)] = rgbToHex(val);
    }
    return { col, named, byId, palette };
  }
  var themeMode = (c, theme) => (c.modes.find((m) => (theme === "dark" ? /dark/i : /light/i).test(m.name)) || c.modes[theme === "dark" ? 1 : 0]).modeId;
  async function inspect() {
    var _a;
    const ix = await loadIndex();
    const mode = ix.col[C.mode];
    const brand = ix.col[C.brand];
    const out = {
      kit: !!(ix.col[C.style] && mode),
      collections: Object.keys(ix.col),
      brands: brand ? brand.modes.map((m) => m.name) : [],
      styles: ix.col[C.style] ? ix.col[C.style].modes.map((m) => m.name) : [],
      migrated: 0,
      total: 0,
      legacyNames: [],
      missingExtensions: []
    };
    if (!mode) return out;
    for (const [name, v] of ix.named[C.mode]) {
      if (v.resolvedType !== "COLOR") continue;
      out.total++;
      const val = v.valuesByMode[themeMode(mode, "light")];
      if (isAlias(val) && brand && ((_a = ix.byId.get(val.id)) == null ? void 0 : _a.variableCollectionId) === brand.id) out.migrated++;
      if (fixLegacyName(name) !== name) out.legacyNames.push(name);
    }
    out.missingExtensions = EXTENSION_TOKENS.filter((t) => !ix.named[C.mode].has(t));
    return out;
  }
  async function ensureBrandVar(ix, name, type = "COLOR") {
    let v = ix.named[C.brand].get(name);
    if (!v) {
      v = figma.variables.createVariable(name, ix.col[C.brand], type);
      v.scopes = [];
      ix.named[C.brand].set(name, v);
      ix.byId.set(v.id, v);
    }
    return v;
  }
  var setAllModes = (ix, v, value) => {
    for (const m of ix.col[C.brand].modes) v.setValueForMode(m.modeId, value);
  };
  function twAlias(ix, ref) {
    var _a;
    const v = (_a = ix.named[C.tailwind]) == null ? void 0 : _a.get(`colors/${ref}`);
    return v ? alias(v) : rgba(ref === "white" ? "#ffffff" : "#000000");
  }
  async function setupBrand(opts = {}) {
    const ix = await loadIndex();
    const mode = ix.col[C.mode];
    if (!mode || !ix.col[C.style]) throw new Error("\u041D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D shadcn-\u043A\u0438\u0442: \u043D\u0443\u0436\u043D\u044B \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0438 Style \u0438 Mode");
    if (!ix.col[C.brand]) {
      const b = figma.variables.createVariableCollection(C.brand);
      b.renameMode(b.modes[0].modeId, "Base");
      ix.col[C.brand] = b;
      ix.named[C.brand] = /* @__PURE__ */ new Map();
    }
    const brand = ix.col[C.brand];
    const report2 = { linked: 0, created: 0, renamed: 0, scoped: 0, extensions: [] };
    for (const [name, mv] of [...ix.named[C.mode]]) {
      if (mv.resolvedType !== "COLOR") continue;
      const clean = opts.fixNames ? fixLegacyName(name) : name;
      if (clean !== name) {
        mv.name = clean;
        report2.renamed++;
      }
      for (const theme of THEMES) {
        const mId = themeMode(mode, theme);
        const val = mv.valuesByMode[mId];
        const target = isAlias(val) ? ix.byId.get(val.id) : null;
        if (target && target.variableCollectionId === brand.id) continue;
        if (target && target.variableCollectionId === mode.id) continue;
        const fromStyle = target && target.variableCollectionId === ix.col[C.style].id && target.name.startsWith(`color/${theme}/`);
        const bName = fromStyle ? target.name : `color/${theme}/${clean}`;
        const isNew = !ix.named[C.brand].has(bName);
        const bv = await ensureBrandVar(ix, bName);
        if (isNew) {
          setAllModes(ix, bv, val);
          report2.created++;
        }
        mv.setValueForMode(mId, alias(bv));
        report2.linked++;
      }
      mv.setVariableCodeSyntax("WEB", `var(${cssVar(clean)})`);
      if (opts.fixScopes) {
        mv.scopes = scopesFor(clean);
        report2.scoped++;
      }
    }
    for (const t of EXTENSION_TOKENS) {
      if (ix.named[C.mode].has(t)) continue;
      const mv = figma.variables.createVariable(t, mode, "COLOR");
      mv.setPluginData("ds", "extension");
      for (const [i, theme] of THEMES.entries()) {
        const bv = await ensureBrandVar(ix, `color/${theme}/${t}`);
        setAllModes(ix, bv, twAlias(ix, EXT_DEFAULTS[t][i]));
        mv.setValueForMode(themeMode(mode, theme), alias(bv));
      }
      mv.scopes = scopesFor(t);
      mv.setVariableCodeSyntax("WEB", `var(--${t})`);
      ix.named[C.mode].set(t, mv);
      report2.extensions.push(t);
    }
    for (const key of ["sans", "heading"]) {
      const name = `font/${key}`;
      if (ix.named[C.brand].has(name)) continue;
      const sv = ix.named[C.style].get(`font/family/${key}`);
      const fv = await ensureBrandVar(ix, name, "STRING");
      setAllModes(ix, fv, sv ? alias(sv) : "Inter");
    }
    return report2;
  }
  async function rollbackBrand() {
    const ix = await loadIndex();
    const brand = ix.col[C.brand];
    const mode = ix.col[C.mode];
    if (!brand) return { restored: 0 };
    let restored = 0;
    for (const [, mv] of ix.named[C.mode]) {
      if (mv.getPluginData("ds") === "extension") {
        mv.remove();
        continue;
      }
      for (const theme of THEMES) {
        const mId = themeMode(mode, theme);
        const val = mv.valuesByMode[mId];
        const bv = isAlias(val) && ix.byId.get(val.id);
        if (bv && bv.variableCollectionId === brand.id) {
          mv.setValueForMode(mId, bv.valuesByMode[brand.defaultModeId]);
          restored++;
        }
      }
    }
    brand.remove();
    return { restored };
  }
  async function addBrand(name) {
    const ix = await loadIndex();
    const b = ix.col[C.brand];
    if (!b) throw new Error("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0441\u043B\u043E\u0439 Brand");
    if (b.modes.some((m) => m.name === name)) throw new Error(`\u0411\u0440\u0435\u043D\u0434 \xAB${name}\xBB \u0443\u0436\u0435 \u0435\u0441\u0442\u044C`);
    const id = b.addMode(name);
    for (const [, v] of ix.named[C.brand]) v.setValueForMode(id, v.valuesByMode[b.defaultModeId]);
    return { modeId: id };
  }
  async function removeBrand(name) {
    const ix = await loadIndex();
    const b = ix.col[C.brand];
    const m = b && b.modes.find((x) => x.name === name);
    if (!m || m.modeId === b.defaultModeId) throw new Error("\u041D\u0435\u043B\u044C\u0437\u044F \u0443\u0434\u0430\u043B\u0438\u0442\u044C Base \u0438\u043B\u0438 \u043D\u0435\u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0439 \u0431\u0440\u0435\u043D\u0434");
    b.removeMode(m.modeId);
  }
  function resolve(ix, v, modes, depth = 0) {
    const c = Object.values(ix.col).find((x) => x.id === v.variableCollectionId);
    const val = v.valuesByMode[modes[c.id] || c.defaultModeId];
    if (isAlias(val) && depth < 10) {
      const next = ix.byId.get(val.id);
      return next ? resolve(ix, next, modes, depth + 1) : null;
    }
    return val;
  }
  var describe = (ix, val) => {
    if (!isAlias(val)) return typeof val === "object" ? rgbToHex(val) : val;
    const t = ix.byId.get(val.id);
    return t ? `\u2192 ${t.name.replace(/^colors\//, "")}` : "\u2192 ?";
  };
  async function readBrand(brandName, styleName) {
    var _a;
    const ix = await loadIndex();
    const b = ix.col[C.brand];
    const bm = b.modes.find((m) => m.name === brandName) || b.modes[0];
    const sm = ix.col[C.style].modes.find((m) => m.name === styleName) || ix.col[C.style].modes[0];
    const modes = { [b.id]: bm.modeId, [ix.col[C.style].id]: sm.modeId };
    const rows = [];
    for (const token of COLOR_TOKENS) for (const theme of THEMES) {
      const bv = ix.named[C.brand].get(`color/${theme}/${token}`);
      if (!bv) continue;
      const raw = bv.valuesByMode[bm.modeId];
      const inherited2 = isAlias(raw) && ((_a = ix.byId.get(raw.id)) == null ? void 0 : _a.variableCollectionId) === ix.col[C.style].id;
      const res = resolve(ix, bv, modes);
      rows.push({ token, theme, value: describe(ix, raw), hex: res && typeof res === "object" ? rgbToHex(res) : null, inherited: inherited2 });
    }
    const font = ix.named[C.brand].get("font/sans");
    return { brand: bm.name, style: sm.name, rows, font: font ? resolve(ix, font, modes) : null, palette: ix.palette };
  }
  async function applyBrand(brandName, tokens, keys, opts = {}) {
    var _a, _b, _c;
    const ix = await loadIndex();
    const b = ix.col[C.brand];
    const bm = b.modes.find((m) => m.name === brandName);
    if (!bm) throw new Error(`\u041D\u0435\u0442 \u0431\u0440\u0435\u043D\u0434\u0430 \xAB${brandName}\xBB`);
    const out = [];
    for (const token of COLOR_TOKENS) for (const theme of THEMES) {
      const bv = ix.named[C.brand].get(`color/${theme}/${token}`);
      if (!bv) continue;
      const sv = ix.named[C.style].get(`color/${theme}/${token}`);
      if (!keys.includes(token)) {
        if (opts.reset && sv) bv.setValueForMode(bm.modeId, alias(sv));
        continue;
      }
      const hex = tokens.colors[theme][token];
      const hit = opts.snap === false ? null : snap(hex, ix.palette, (_a = opts.maxDE) != null ? _a : 2.5);
      const tw = hit && ix.named[C.tailwind].get(`colors/${hit.name}`);
      bv.setValueForMode(bm.modeId, tw ? alias(tw) : rgba(hex));
      out.push({ token, theme, hex, alias: tw ? hit.name : null });
    }
    for (const [key, val] of [["sans", (_b = tokens.font) == null ? void 0 : _b.sans], ["heading", (_c = tokens.font) == null ? void 0 : _c.heading]]) {
      const fv = ix.named[C.brand].get(`font/${key}`);
      if (fv && val) fv.setValueForMode(bm.modeId, val);
    }
    return out;
  }
  async function addCustomToken({ project, role, light, dark, scopes }) {
    const ix = await loadIndex();
    if (!ix.col[C.brand]) throw new Error("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0441\u043B\u043E\u0439 Brand");
    const name = customName(project, role);
    const mode = ix.col[C.mode];
    const mv = ix.named[C.mode].get(name) || figma.variables.createVariable(name, mode, "COLOR");
    for (const [theme, value] of [["light", light], ["dark", dark || light]]) {
      const bv = await ensureBrandVar(ix, `color/${theme}/${name}`);
      const tw = !String(value).startsWith("#") && ix.named[C.tailwind].get(`colors/${value}`);
      if (!tw && !String(value).startsWith("#")) throw new Error(`\u041D\u0435\u0442 \u0446\u0432\u0435\u0442\u0430 Tailwind \xAB${value}\xBB`);
      setAllModes(ix, bv, tw ? alias(tw) : rgba(value));
      mv.setValueForMode(themeMode(mode, theme), alias(bv));
    }
    mv.scopes = (scopes == null ? void 0 : scopes.length) ? scopes : scopesFor(name);
    mv.setVariableCodeSyntax("WEB", `var(${cssVar(name)})`);
    return { name, css: cssVar(name) };
  }
  async function ensureModeColor(name, like) {
    const ix = await loadIndex();
    if (!ix.col[C.brand] || !ix.col[C.mode]) return null;
    const mode = ix.col[C.mode];
    const mv = figma.variables.createVariable(name, mode, "COLOR");
    const base = like && ix.named[C.mode].get(like);
    for (const theme of THEMES) {
      const bv = await ensureBrandVar(ix, `color/${theme}/${name}`);
      const src = base && ix.named[C.brand].get(`color/${theme}/${like}`);
      setAllModes(ix, bv, src ? alias(src) : rgba("#ff00ff"));
      mv.setValueForMode(themeMode(mode, theme), alias(bv));
    }
    mv.setPluginData("ds", "contract-placeholder");
    mv.scopes = scopesFor(name);
    mv.setVariableCodeSyntax("WEB", `var(${cssVar(name)})`);
    return mv;
  }
  async function resolveCustom(brandName, styleName) {
    const ix = await loadIndex();
    const b = ix.col[C.brand];
    const s = ix.col[C.style];
    const modes = {
      [b.id]: (b.modes.find((m) => m.name === brandName) || b.modes[0]).modeId,
      [s.id]: (s.modes.find((m) => m.name === styleName) || s.modes[0]).modeId
    };
    const out = {};
    for (const name of [...ix.named[C.mode].keys()].filter((n) => n.startsWith("custom/"))) {
      const entry = {};
      for (const theme of THEMES) {
        const bv = ix.named[C.brand].get(`color/${theme}/${name}`);
        const val = bv && resolve(ix, bv, modes);
        if (val && typeof val === "object" && "r" in val) entry[theme] = rgbToHex(val);
      }
      out[cssVar(name).slice(2)] = entry;
    }
    return out;
  }
  async function listCustom() {
    const ix = await loadIndex();
    return [...(ix.named[C.mode] || /* @__PURE__ */ new Map()).keys()].filter((n) => n.startsWith("custom/")).sort();
  }
  async function modeVars() {
    var _a, _b;
    const ix = await loadIndex();
    const vars = {};
    for (const t of COLOR_TOKENS) vars[t] = ((_a = ix.named[C.mode]) == null ? void 0 : _a.get(t)) || null;
    const radius = {};
    for (const r of ["sm", "md", "lg", "xl"]) radius[r] = ((_b = ix.named[C.style]) == null ? void 0 : _b.get(`radius/${r}`)) || null;
    radius.full = 999;
    return { vars, radius, ix };
  }
  async function setFrameModes(frame, { brand, style, theme }) {
    const ix = await loadIndex();
    const pin = (name, test) => {
      const c = ix.col[name];
      const m = c && c.modes.find(test);
      if (m) frame.setExplicitVariableModeForCollection(c, m.modeId);
    };
    if (brand) pin(C.brand, (m) => m.name === brand);
    if (style) pin(C.style, (m) => m.name === style);
    if (theme) pin(C.mode, (m) => (theme === "dark" ? /dark/i : /light/i).test(m.name));
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

  // core/token-map.js
  var TOKEN_MAP = {
    colors: {
      "background": { "figma": "background/surface/light", "collection": "2.theme" },
      "foreground": { "figma": "text/default", "collection": "2.theme" },
      "muted": { "figma": "background/surface/soft", "collection": "2.theme" },
      "muted-foreground": { "figma": "text/muted", "collection": "2.theme" },
      "soft-foreground": { "figma": "text/soft", "collection": "2.theme" },
      "disabled-foreground": { "figma": "text/disabled", "collection": "2.theme" },
      "inverse-foreground": { "figma": "text/inverse", "collection": "2.theme" },
      "card": { "figma": "background/onsurface/0", "collection": "2.theme" },
      "surface-0": { "figma": "background/onsurface/0", "collection": "2.theme" },
      "surface-1": { "figma": "background/onsurface/1", "collection": "2.theme" },
      "surface-2": { "figma": "background/onsurface/2", "collection": "2.theme" },
      "surface-3": { "figma": "background/onsurface/3", "collection": "2.theme" },
      "surface-4": { "figma": "background/onsurface/4", "collection": "2.theme" },
      "surface-5": { "figma": "background/onsurface/5", "collection": "2.theme" },
      "surface-6": { "figma": "background/onsurface/6", "collection": "2.theme" },
      "surface-inverse": { "figma": "background/onsurface/0-inverse", "collection": "2.theme" },
      "accent": { "figma": "background/global/soft/hover", "collection": "2.theme" },
      "accent-active": { "figma": "background/global/soft/active", "collection": "2.theme" },
      "border": { "figma": "border/divider/primary", "collection": "2.theme" },
      "border-secondary": { "figma": "border/divider/secondary", "collection": "2.theme" },
      "border-subtle": { "figma": "border/divider/tetriary", "collection": "2.theme" },
      "input": { "figma": "border/global/soft/default", "collection": "2.theme" },
      "input-hover": { "figma": "border/global/soft/hover", "collection": "2.theme" },
      "input-active": { "figma": "border/global/soft/active", "collection": "2.theme" },
      "input-disabled": { "figma": "border/global/soft/disabled", "collection": "2.theme" },
      "border-destructive": { "figma": "border/accent/danger", "collection": "2.theme" },
      "border-warning": { "figma": "border/accent/warning", "collection": "2.theme" },
      "border-success": { "figma": "border/accent/positive", "collection": "2.theme" },
      "primary": { "figma": "accent/primary/default", "collection": "2.theme" },
      "primary-hover": { "figma": "accent/primary/hover", "collection": "2.theme" },
      "primary-active": { "figma": "accent/primary/active", "collection": "2.theme" },
      "primary-foreground": { "figma": "accent/primary/on-accent", "collection": "2.theme" },
      "primary-foreground-muted": { "figma": "accent/primary/on-accent-muted", "collection": "2.theme" },
      "primary-muted": { "figma": "accent/primary/container-muted", "collection": "2.theme" },
      "secondary": { "figma": "neutral/primary/default", "collection": "2.theme" },
      "secondary-hover": { "figma": "neutral/primary/hover", "collection": "2.theme" },
      "secondary-active": { "figma": "neutral/primary/active", "collection": "2.theme" },
      "secondary-foreground": { "alias": "static-light" },
      "secondary-muted": { "figma": "neutral/primary/container-muted", "collection": "2.theme" },
      "soft": { "figma": "neutral/secondary/flat filled/default", "collection": "2.theme" },
      "soft-hover": { "figma": "neutral/secondary/flat filled/hover", "collection": "2.theme" },
      "soft-foreground-strong": { "figma": "neutral/secondary/flat filled/on-accent", "collection": "2.theme" },
      "ghost": { "figma": "neutral/secondary/flat/default", "collection": "2.theme" },
      "ghost-hover": { "figma": "neutral/secondary/flat/hover", "collection": "2.theme" },
      "ghost-foreground": { "figma": "neutral/secondary/flat/on-accent", "collection": "2.theme" },
      "outline": { "figma": "neutral/secondary/outline/default", "collection": "2.theme" },
      "outline-hover": { "figma": "neutral/secondary/outline/hover", "collection": "2.theme" },
      "outline-foreground": { "figma": "neutral/secondary/outline/on-accent", "collection": "2.theme" },
      "neutral-flat": { "figma": "neutral/secondary/flat default/default", "collection": "2.theme" },
      "neutral-flat-hover": { "figma": "neutral/secondary/flat default/hover", "collection": "2.theme" },
      "static": { "figma": "accent/static/default", "collection": "2.theme" },
      "static-hover": { "figma": "accent/static/hover", "collection": "2.theme" },
      "static-active": { "figma": "accent/static/active", "collection": "2.theme" },
      "static-foreground": { "figma": "accent/static/on-accent", "collection": "2.theme" },
      "static-muted": { "figma": "neutral/static/container-muted", "collection": "2.theme" },
      "static-light": { "figma": "static/light", "collection": "2.theme" },
      "static-dark": { "figma": "static/dark", "collection": "2.theme" },
      "success": { "figma": "accent/positive/default", "collection": "2.theme" },
      "success-hover": { "figma": "accent/positive/hover", "collection": "2.theme" },
      "success-active": { "figma": "accent/positive/active", "collection": "2.theme" },
      "success-foreground": { "figma": "accent/positive/on-accent", "collection": "2.theme" },
      "destructive": { "figma": "accent/negative/default", "collection": "2.theme" },
      "destructive-hover": { "figma": "accent/negative/hover", "collection": "2.theme" },
      "destructive-active": { "figma": "accent/negative/active", "collection": "2.theme" },
      "destructive-foreground": { "figma": "accent/negative/on-accent", "collection": "2.theme" },
      "destructive-soft": { "figma": "neutral/negative/default", "collection": "2.theme" },
      "destructive-soft-hover": { "figma": "neutral/negative/hover", "collection": "2.theme" },
      "destructive-soft-foreground": { "figma": "neutral/negative/on-accent", "collection": "2.theme" },
      "link": { "figma": "text/link", "collection": "2.theme" },
      "destructive-text": { "figma": "text/danger", "collection": "2.theme" },
      "warning-text": { "figma": "text/warning", "collection": "2.theme" },
      "success-text": { "figma": "text/positive", "collection": "2.theme" },
      "status-neutral": { "figma": "status/filled/bg/default", "collection": "2.theme" },
      "status-neutral-muted": { "figma": "status/ghost/bg/default", "collection": "2.theme" },
      "status-neutral-foreground": { "figma": "status/ghost/text/default", "collection": "2.theme" },
      "status-accent": { "figma": "status/filled/bg/accent", "collection": "2.theme" },
      "status-accent-muted": { "figma": "status/ghost/bg/accent", "collection": "2.theme" },
      "status-accent-foreground": { "figma": "status/ghost/text/accent", "collection": "2.theme" },
      "status-success": { "figma": "status/filled/bg/success", "collection": "2.theme" },
      "status-success-muted": { "figma": "status/ghost/bg/success", "collection": "2.theme" },
      "status-success-foreground": { "figma": "status/ghost/text/success", "collection": "2.theme" },
      "status-warning": { "figma": "status/filled/bg/warning", "collection": "2.theme" },
      "status-warning-muted": { "figma": "status/ghost/bg/warning", "collection": "2.theme" },
      "status-warning-foreground": { "figma": "status/ghost/text/warning", "collection": "2.theme" },
      "status-error": { "figma": "status/filled/bg/error", "collection": "2.theme" },
      "status-error-muted": { "figma": "status/ghost/bg/error", "collection": "2.theme" },
      "status-error-foreground": { "figma": "status/ghost/text/error", "collection": "2.theme" },
      "status-info": { "figma": "status/filled/bg/info", "collection": "2.theme" },
      "status-info-muted": { "figma": "status/ghost/bg/info", "collection": "2.theme" },
      "status-info-foreground": { "figma": "status/ghost/text/info", "collection": "2.theme" },
      "status-clear": { "figma": "status/filled/bg/clear", "collection": "2.theme" },
      "status-clear-muted": { "figma": "status/ghost/bg/clear", "collection": "2.theme" },
      "status-clear-foreground": { "figma": "status/ghost/text/clear", "collection": "2.theme" },
      "status-filled-foreground": { "figma": "status/filled/text/default", "collection": "2.theme" },
      "status-filled-foreground-inverse": { "figma": "status/filled/text/default-inverse", "collection": "2.theme" },
      "supportive-1": { "figma": "supportive/filled/1", "collection": "2.theme" },
      "supportive-2": { "figma": "supportive/filled/2", "collection": "2.theme" },
      "supportive-3": { "figma": "supportive/filled/3", "collection": "2.theme" },
      "supportive-4": { "figma": "supportive/filled/4", "collection": "2.theme" },
      "supportive-5": { "figma": "supportive/filled/5", "collection": "2.theme" },
      "supportive-6": { "figma": "supportive/filled/6", "collection": "2.theme" },
      "supportive-7": { "figma": "supportive/filled/7", "collection": "2.theme" },
      "supportive-8": { "figma": "supportive/filled/8", "collection": "2.theme" },
      "supportive-9": { "figma": "supportive/filled/9", "collection": "2.theme" },
      "supportive-10": { "figma": "supportive/filled/10", "collection": "2.theme" },
      "supportive-ghost-1": { "figma": "supportive/ghost/1", "collection": "2.theme" },
      "supportive-ghost-2": { "figma": "supportive/ghost/2", "collection": "2.theme" },
      "supportive-ghost-3": { "figma": "supportive/ghost/3", "collection": "2.theme" },
      "supportive-ghost-4": { "figma": "supportive/ghost/4", "collection": "2.theme" },
      "supportive-ghost-5": { "figma": "supportive/ghost/5", "collection": "2.theme" },
      "supportive-ghost-6": { "figma": "supportive/ghost/6", "collection": "2.theme" },
      "supportive-ghost-7": { "figma": "supportive/ghost/7", "collection": "2.theme" },
      "supportive-ghost-8": { "figma": "supportive/ghost/8", "collection": "2.theme" },
      "supportive-ghost-9": { "figma": "supportive/ghost/9", "collection": "2.theme" },
      "supportive-ghost-10": { "figma": "supportive/ghost/10", "collection": "2.theme" },
      "overlay": { "figma": "misc/overlay/default", "collection": "2.theme" },
      "brand-bank": { "figma": "brand/bank/default", "collection": "2.theme" },
      "brand-kassa": { "figma": "brand/kassa/default", "collection": "2.theme" },
      "brand-travel": { "figma": "brand/travel/default", "collection": "2.theme" },
      "brand-artwin": { "figma": "brand/artwin/default", "collection": "2.theme" },
      "brand": { "figma": "default", "collection": "1.brand" },
      "brand-hover": { "figma": "hover", "collection": "1.brand" },
      "brand-active": { "figma": "active", "collection": "1.brand" },
      "brand-foreground": { "figma": "on-accent", "collection": "1.brand" },
      "brand-foreground-muted": { "figma": "on-accent-muted", "collection": "1.brand" },
      "brand-container-muted": { "figma": "container-muted", "collection": "1.brand" },
      "brand-ghost": { "figma": "ghost-default", "collection": "1.brand" },
      "brand-ghost-hover": { "figma": "ghost-hover", "collection": "1.brand" },
      "brand-ghost-active": { "figma": "ghost-active", "collection": "1.brand" },
      "brand-ghost-foreground": { "figma": "ghost-on-accent", "collection": "1.brand" },
      "brand-ghost-foreground-muted": { "figma": "ghost-on-accent-muted", "collection": "1.brand" },
      "brand-muted": { "figma": "ghost-container-muted", "collection": "1.brand" },
      "card-foreground": { "alias": "foreground" },
      "popover": { "alias": "card" },
      "popover-foreground": { "alias": "foreground" },
      "accent-foreground": { "alias": "foreground" },
      "brand-text": { "figma": "text/brand", "collection": "2.theme" },
      "ring": { "figma": "border/accent/brand", "collection": "2.theme" }
    },
    radius: {
      "2xs": "radius/xss",
      "xs": "radius/xs",
      "sm": "radius/s",
      "md": "radius/m",
      "lg": "radius/l",
      "xl": "radius/xl",
      "2xl": "radius/xl-2",
      "3xl": "radius/xl-3",
      "4xl": "radius/xl-4"
    },
    text: {
      "2xs": "font/Label/s",
      "caption": "font/Label/m",
      "xs": "font/Body/xs",
      "sm": "font/Body/s",
      "md": "font/Body/m",
      "base": "font/Body/l",
      "lg": "font/Body/xl",
      "xl": "font/Heading/h5",
      "2xl": "font/Heading/h4",
      "3xl": "font/Heading/h3",
      "4xl": "font/Heading/h1",
      "5xl": "font/Display/s",
      "6xl": "font/Display/m",
      "7xl": "font/Display/l"
    },
    spacing: {
      "0": "spacing/none",
      "4": "spacing/xs",
      "8": "spacing/s-3",
      "10": "spacing/s-2",
      "12": "spacing/s-1",
      "16": "spacing/m-2-base",
      "20": "spacing/m-1",
      "24": "spacing/l-2",
      "28": "spacing/l-1",
      "32": "spacing/xl-2",
      "36": "spacing/xl-1",
      "40": "spacing/xxl-2",
      "48": "spacing/xxl-1"
    },
    keys: {
      "accent/negative/active": "a666254f7ddcc865dc06649724a798da5aaab422",
      "accent/negative/default": "3717327211c6b7f0a3f533f2f0c79f865b529f30",
      "accent/negative/hover": "746a41958228054bd386b27501bf85a033dc4891",
      "accent/negative/on-accent": "bc02a16da8fc10b5c20d8700fd21cc782d4af51d",
      "accent/positive/active": "9b091443a860ecd5a32379af21a579ffe59c5855",
      "accent/positive/default": "454762e6ceaea6431078b001351ace25d4e7e9dd",
      "accent/positive/hover": "6b9599885cefa8bc7cdf2a19f7a9f5629fda1ce4",
      "accent/positive/on-accent": "01b82dea3e963da6e01f4ca08923b0c14511705d",
      "accent/primary/active": "7dad401d284a0665062ccdb2af0f89b898fa911a",
      "accent/primary/container-muted": "f51910b07f47fce154594921a4fc339d6347ab13",
      "accent/primary/default": "2547333051bd1cffc8f9f2aba391bee960d750c9",
      "accent/primary/hover": "6b557bc7821bb9fc5b0d2b2fe933bbc9d9ed23c8",
      "accent/primary/on-accent": "5e755c94dc67c5dea2ec450f7eb50c4223859c47",
      "accent/primary/on-accent-muted": "cdd021e79fa64da6e795f524c455208a5dad21f8",
      "accent/static/active": "292a0dc7347bb1be5b4943ae40cc9e9a0d909ac4",
      "accent/static/default": "cc0476ada5bec7d0deac8b51f9ecf77183407a22",
      "accent/static/hover": "94226beb537849177b9556669e1ad5153bc192c2",
      "accent/static/on-accent": "c94073320949e77be47c3ce53eb51d104b5da43c",
      "background/global/soft/active": "a8a0895f496f7ceab6151e4663df72324cfadabc",
      "background/global/soft/hover": "da113c8a57297ff4ccc92c908b9e2e2c0407cad4",
      "background/onsurface/0": "597e34eb4635ee8b4625923be7f8b6496f987f1c",
      "background/onsurface/0-inverse": "b07141d92666bb6469056965114ce8385823763b",
      "background/onsurface/1": "6ff51ba6d871c88f2ab26ab3d74b76f72bfe63f1",
      "background/onsurface/2": "fbe8e32317aa0b95304841f2881d7d01c810fa33",
      "background/onsurface/3": "79215f526cdbdc48db8837e6d61048e072896d9f",
      "background/onsurface/4": "57ddc4d21ad7814cd9e5a04f2fb5505359e28ec9",
      "background/onsurface/5": "fce09485d8065467a5abed1c4f9854c683f69988",
      "background/onsurface/6": "6fa2c477f4797f975d8b37e89c55f35836b382f1",
      "background/surface/light": "6b620b0494f77db47571a4133623011b8f0fe3b5",
      "background/surface/soft": "9937a9232afab99fdc4fa020576aae016c3d7630",
      "border/accent/brand": "dc946628c987112c7727236e341ca1bc72acd278",
      "border/accent/danger": "a725b5229c21f98c37ffdbbd676b50ffd49c24be",
      "border/accent/positive": "41b2aaa3f8ca573a86354875fbbc2a681ff96979",
      "border/accent/warning": "6176d3a6b84d308ca2af1e0f3fa5db0c1e456e4e",
      "border/divider/primary": "51813af7717630a119a3ea6291e05b540359c8c5",
      "border/divider/secondary": "9da710ec28de3b2bcbdecc9da0d8e6a84ebd2710",
      "border/divider/tetriary": "a8277d111f27e8a58ff96ab381ad246898660068",
      "border/global/soft/active": "ae82d51efbabd022f3d5fb769cafb5693538676f",
      "border/global/soft/default": "2633ff7c179a75b585932d697e2c9c0967f7005e",
      "border/global/soft/disabled": "60b115ea0f2bea5f926325412bef066624af1020",
      "border/global/soft/hover": "0011f441b8c33d89cd6610c2325f3cf599248f34",
      "brand/artwin/default": "206601d34fec5059fc773cf49ce0338ac328c1ec",
      "brand/bank/default": "12e4e4596b58af08ecfc0c67c3075266c235e6d8",
      "brand/kassa/default": "5dd34baabc8a192769410ef7b2102a257b71892e",
      "brand/travel/default": "5e8ca0af3975d72bf9f2861a0aba97ff90dfe723",
      "misc/overlay/default": "7cbaa01f8f8a3416948ec7a58834a562dc379155",
      "neutral/negative/default": "7c507104d0f9c48829ed82d10239cee95eedc293",
      "neutral/negative/hover": "da22c2b67af546c841c5c3560105c00886474bb6",
      "neutral/negative/on-accent": "804f284adcaa6af59e8169642d3e5703cecf3dd3",
      "neutral/primary/active": "847bd8512d6dc19207b6b80674e053dd867f3df1",
      "neutral/primary/container-muted": "c1195d122ebce15eca2981b918e9fcbbaeca9f22",
      "neutral/primary/default": "082d1082b3a083bb57b8f0a9e7f2646e1285beed",
      "neutral/primary/hover": "2cb95313acd7575d217d9885f6a3ba0292e9fdd8",
      "neutral/secondary/flat default/default": "e964071fb5ae6d4ff91c17ec0bdc777265006f83",
      "neutral/secondary/flat default/hover": "17c06fabfe9e30851abdf22a9adecd9286d7eefc",
      "neutral/secondary/flat filled/default": "8807556f95b98cd30cac23158e361dbbabe046ee",
      "neutral/secondary/flat filled/hover": "8ab173cead104575db05fe41799b8ed78dba3db3",
      "neutral/secondary/flat filled/on-accent": "e42d34d9f287b5a0a54ec77db20ba1b24e39ec42",
      "neutral/secondary/flat/default": "3003ad655612547f33197428ae0b4f9442a02caa",
      "neutral/secondary/flat/hover": "2a4fa1126c90e06b620dabe023ab5b2844c58d80",
      "neutral/secondary/flat/on-accent": "9a09df272e93597bd204c33cbad9cb9c27ce75c8",
      "neutral/secondary/outline/default": "2461f38b7d19f180954432c22346812630cf0a0d",
      "neutral/secondary/outline/hover": "02e23e7b06ace1f4d2a0bc450cb5de50589f9ce0",
      "neutral/secondary/outline/on-accent": "02385f1e3d8489893bc403b83af0b3dc8b8859be",
      "neutral/static/container-muted": "97d53b3d31d05155981ddb40fc88581dba8812a4",
      "radius/l": "215a81ed22f0545e5c4e4bacdaba3f52506fc65e",
      "radius/m": "cff2d86748887ff2a64d9de8911be6e9c7c48f3e",
      "radius/s": "9d4b1d6c55e145f473e312025829306854a3a023",
      "radius/xl": "46ff3d87efcea0e8e529e8dbaa14ee9c81faafb2",
      "radius/xl-2": "5c0fd5fb1f56125215d6330cdee12086f32a53f7",
      "radius/xl-3": "b60fc0f5852bc96ca2f6c0cf1711f36f033d788d",
      "radius/xl-4": "0552e3addd4a74430e7c53b6718479b9aa6d60e6",
      "radius/xs": "e5e218dc0552b718be2cdcf3992ae8475ee3f492",
      "radius/xss": "243485996c0d982afbccdfdfc18c58ead796485b",
      "spacing/l-1": "139bc110af5978890090115e3686b93fa86dbef0",
      "spacing/l-2": "c25e02637c18d4b74c20014d98a2ee237c50749a",
      "spacing/m-1": "945c102a9deead688072a884e69d5b10932b013e",
      "spacing/m-2-base": "06f234ad59d196f83831e10bcb2ba0dda48564a8",
      "spacing/none": "469eae815f2cdfa1596c9cdb6701618e0030a899",
      "spacing/s-1": "b7f3190a4d32d94e37e2349ac0035f2b7a28ddf7",
      "spacing/s-2": "bd33cdc1be90ca2ac5f3d0beb7e6cd3dcbe826e9",
      "spacing/s-3": "25548a2aee9592223ee300340cc03b54847db6b8",
      "spacing/xl-1": "afc59ca2bae3e2c7b18935a7f518fe9a12aa6fcd",
      "spacing/xl-2": "d80486a8ad621a92eefd5fa6500a3ce339f6dd76",
      "spacing/xs": "49fe1d2a4517444f7f637ea69fad54c17decba64",
      "spacing/xxl-1": "f68a450bfa5d2d835a3493982430608b136b0692",
      "spacing/xxl-2": "5112dc6b296ab4e9d858030023ca5db8790524d2",
      "static/dark": "fbd4bfe877400ffe7e3af5a2572847c03e587e80",
      "static/light": "5c4810c36d8078c5314d391514845b5c5828b8df",
      "status/filled/bg/accent": "9cebb5a355608795a767ac9853404fbb43db5206",
      "status/filled/bg/clear": "93d33d613eab2d1b4d31a8e619b64b381d72a4e3",
      "status/filled/bg/default": "8e125a92ece57b864b1c321a805d389c15508618",
      "status/filled/bg/error": "27dee2b70f6e109a4b3a2ac5966cb8bfc42024eb",
      "status/filled/bg/info": "3ad196a6d3a682b186c23de842f6471b83370b08",
      "status/filled/bg/success": "fc1939007674cf3c93b1c94017470f8c6a87573a",
      "status/filled/bg/warning": "d2001fcbd94fb99277f5761d0d4f66072c415c5d",
      "status/filled/text/default": "5019f6f5b7ba914f887b62c93d5edb2e06fd69b2",
      "status/filled/text/default-inverse": "0949f04c7ab8b91faaa35136172c7e0557957d5e",
      "status/ghost/bg/accent": "3a9c3243f8607e33721507cd402401fbef257e79",
      "status/ghost/bg/clear": "4521c8dfedc48ebecfaf00b393f14950b2c93347",
      "status/ghost/bg/default": "a015840d61d7555752a6d553bfd5a27debbe72d4",
      "status/ghost/bg/error": "d6976782df00d03acc38f85fc707a23691a6e849",
      "status/ghost/bg/info": "4f0694156bf507c9d8489ac865d0958d83f3c3f0",
      "status/ghost/bg/success": "30ca12f279cfc6d8b82695c4b9449bbc9f03df41",
      "status/ghost/bg/warning": "8600b871f9331691b62a6251c38876f768dfd97b",
      "status/ghost/text/accent": "22f5b1784478aaac7409799c7e04470e54eca5c6",
      "status/ghost/text/clear": "3f7b0a622f408f0da56d95bdc81cd7d204db0cc2",
      "status/ghost/text/default": "f051b5799e28331ef340deb471b46ee61886739f",
      "status/ghost/text/error": "b0cd6e709e506da9ec9be38f3ba06fd0aab8a793",
      "status/ghost/text/info": "c82074870b69f984cc5be9a4928ef53f3d8e962c",
      "status/ghost/text/success": "d4e0020199320ae0b6795793a8624f31181dcb6f",
      "status/ghost/text/warning": "87c8cde7b5048a85bc5f7adecb3450c55e2be986",
      "supportive/filled/1": "ad6e033b05a95ceef888b7df75bf1060ff1cb587",
      "supportive/filled/10": "13c034aa449bbd2c49096178a31ed94b7ac94785",
      "supportive/filled/2": "b4b05bb60a566b12e934113a031100ce7cb0416b",
      "supportive/filled/3": "e8cf9a531d8f5ce6f31f0914dc0cc0f8a1a0ea62",
      "supportive/filled/4": "a3cd7b5cfd146e94e58f58b0b75aa6539347c05d",
      "supportive/filled/5": "20332c1546b7dae1ff61a602bc9df5a0a7cd44ee",
      "supportive/filled/6": "9e455d107e271b9181ad892fae1bb3ad5a291820",
      "supportive/filled/7": "5c42d1ac83e5e05827bce398e0859b61853b9bee",
      "supportive/filled/8": "6fee4e3e1523a572be5ffa0f28f66bafe20fe15e",
      "supportive/filled/9": "3a799ae89d05ac0f207c536b4409df418b15bb86",
      "supportive/ghost/1": "3792dad1e6dec20e68675dcbe5da9eabb675ef92",
      "supportive/ghost/10": "02facbf6f327fd1d3b542b2f4ccaf7a305e3af8b",
      "supportive/ghost/2": "6c8168b02aa970f7b6b94981412622aae4ac4395",
      "supportive/ghost/3": "2fe70ff7cd20a95af7a5993310eab993ec943a6f",
      "supportive/ghost/4": "82604b98cf358d6f5c4c008c66a0f0c0b464a3bf",
      "supportive/ghost/5": "fde585df00890604093b1d6af4b11932096f05f5",
      "supportive/ghost/6": "5575400919f04f4c4c36efb38492fc1dc8bf68d3",
      "supportive/ghost/7": "0d61b8f8b0fe06f7338815bafc12eb9204a7bdef",
      "supportive/ghost/8": "930d0154ef61f47c09b1b8aac9e1d53af3591d78",
      "supportive/ghost/9": "66481078c006617a3eba056480773f8ff20537ec",
      "text/brand": "9182775236adb96970d21e01ce9fbee25834e230",
      "text/danger": "c71864d1c0dbe42e85d945e45b2e8b2e07f2873b",
      "text/default": "8af86f380514faeacdc79b7a232d03723fab0bde",
      "text/disabled": "667c29a1ebfcefbc7be637b6c421c1f6fba79b51",
      "text/inverse": "f85ccfae4cfb11d0d3436726babf269a22afdd7e",
      "text/link": "3019aa5c09a3caaa6ef5a60a0aea282d659084ea",
      "text/muted": "8bb44dbea94883e123e8c8999072b7e40886ca68",
      "text/positive": "38f2afee24740dccbb19d9f5bd8488b50973c359",
      "text/soft": "f729c62f2c73030dcb2f5a7b78984146b05aea2b",
      "text/warning": "863eb2737166b081d843174d16b1842c62eea90c"
    },
    styleKeys: {
      "font/Label/s": "8fc90fb03d6fad3a47f660345698efd4b84e9c0d",
      "font/Label/m": "5ce2601a5d83c46550be0cc8999693e275c7c5f5",
      "font/Body/xs": "8850f7044628d2c0d22dd32323557ea8baa5e178",
      "font/Body/xs-md": "aa171a29710200f383227c5de81e8ac07bd72ed0",
      "font/Body/xs-strong": "fe0bc48b745d27ee08208ae8f35afda3e8206bd5",
      "font/Body/s": "476f8d56a3c3bcaa804a33fd3658f73dbbb06fa3",
      "font/Body/s-md": "6ebb3dab78e706c0f2ee21bd5fd79999aecc4862",
      "font/Body/s-strong": "8f1f4e2617b460a9982399f453c4d9baa952dc45",
      "font/Body/m": "4d1b7e47cbc9fc3531246736359f2c9325535de6",
      "font/Body/m-md": "a52537e7e015a8c7a857ad4c3c1527c811d582d1",
      "font/Body/m-strong": "473c82346b61cca42405ac66ec8888a5ceaa5112",
      "font/Body/l": "98dc7c792e61f09be4d5f519634aada8b52cfcd3",
      "font/Body/l-md": "a7b3a781c611400a807bdee354a39c3736df09bd",
      "font/Body/l-strong": "cac77d0fc4391374fa731efc663cc720e5049da4",
      "font/Body/xl": "aa8b7fbaa97839c3510a2fe501e42b210d3a872e",
      "font/Body/xl-md": "07863401d95c6f432ee9a03758fa0fc226d159ab",
      "font/Body/xl-strong": "9be63943b5c7f6b88df6340c47e73a3d6d2728fe",
      "font/Heading/h5": "d42185ecec5526dbd0305063826a760364c56df0",
      "font/Heading/h4": "3c1db2e1820e70adce82a63dc504382b52ee759a",
      "font/Heading/h3": "23dc9ab4ba71b905aa555d4aa563e364598fa40c",
      "font/Heading/h1": "e08e01dab2c6eb1e477b5e7bc9fd8bb7de4fd8a3",
      "font/Display/s": "6b7f650ff27b4c6c9d69163260725f86cfd4fca2",
      "font/Display/s-md": "e06696cc2138f91849ecab3b1db9f94381d41b82",
      "font/Display/s-strong": "c249d0bd029a93d6d6923dbf531dde2d3e4e11fe",
      "font/Display/m": "3e023dd0da2e1e176c3187b68196a6586d802b8a",
      "font/Display/m-md": "6fd5a97d91cc9a9de866ac0f36f7ad642b2d2b05",
      "font/Display/m-strong": "a95b07a2b43f24aa401f1ef8c1b32b489149392f",
      "font/Display/l": "e316e5b34dae81e60cc2ab97a1ab8cdef4563a98",
      "font/Display/l-md": "5ab7b80c54c4507d649b6306dd3e61b8f1721230",
      "font/Display/l-strong": "9b0ca8f78c395d4698e06d129e87dee3e6ead2b5"
    }
  };

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
    const timeout = new Promise((resolve3) => {
      timer = setTimeout(() => resolve3("timeout"), TIMEOUT);
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
    const cols2 = await figma.variables.getLocalVariableCollectionsAsync();
    const colName = new Map(cols2.map((c) => [c.id, c.name]));
    const all = [...ix.byId.values()];
    const byName = /* @__PURE__ */ new Map();
    for (const v of all) {
      const list2 = byName.get(v.name) || [];
      list2.push(v);
      byName.set(v.name, list2);
    }
    return { ix, all, byName, colName, cache: /* @__PURE__ */ new Map(), created: [], missing: [], imported: [] };
  }
  async function libraryVar(t, name) {
    const key = name && TOKEN_MAP.keys && TOKEN_MAP.keys[name];
    if (!key || !figma.variables.importVariableByKeyAsync) return null;
    const v = await importByKey(() => figma.variables.importVariableByKeyAsync(key));
    if (v && !t.imported.includes(name)) t.imported.push(name);
    return v;
  }
  function colorName(token, depth = 0) {
    const m = TOKEN_MAP.colors[token];
    if (m && m.alias && depth < 4) return colorName(m.alias, depth + 1);
    return m && m.figma;
  }
  function pick(t, name, type, collection) {
    const list2 = (t.byName.get(name) || []).filter((v) => v.resolvedType === type);
    if (!list2.length) return null;
    return collection && list2.find((v) => (t.colName.get(v.variableCollectionId) || "").startsWith(collection)) || list2[0];
  }
  var projectVar = (token) => {
    const i = String(token).indexOf("-");
    return i > 0 ? `custom/${token.slice(0, i)}/${token.slice(i + 1)}` : null;
  };
  function findColor(t, token, depth = 0) {
    var _a;
    const mode = (_a = t.ix.named[C.mode]) == null ? void 0 : _a.get(token);
    if (mode && mode.resolvedType === "COLOR") return mode;
    const m = TOKEN_MAP.colors[token];
    if (m && m.alias && depth < 4) return findColor(t, m.alias, depth + 1);
    if (m && m.figma) {
      const v = pick(t, m.figma, "COLOR", m.collection) || m.collection === "1.brand" && pick(t, `brand/${m.figma}`, "COLOR", m.collection);
      if (v) return v;
    }
    return pick(t, token, "COLOR") || pick(t, `color/${token}`, "COLOR") || pick(t, projectVar(token), "COLOR");
  }
  function findRadius(t, key) {
    var _a;
    const style = (_a = t.ix.named[C.style]) == null ? void 0 : _a.get(`radius/${key}`);
    if (style) return style;
    return TOKEN_MAP.radius[key] && pick(t, TOKEN_MAP.radius[key], "FLOAT") || pick(t, `radius/${key}`, "FLOAT") || pick(t, `rounded/${key}`, "FLOAT") || pick(t, projectVar(key), "FLOAT");
  }
  function findSpace(t, step) {
    const s = String(step).replace(".", "-");
    const mbank = TOKEN_MAP.spacing && TOKEN_MAP.spacing[String(step * STEP)];
    return pick(t, `spacing/${step}`, "FLOAT") || pick(t, `spacing/${s}`, "FLOAT") || pick(t, `spacing/${step * STEP}`, "FLOAT") || mbank && pick(t, mbank, "FLOAT");
  }
  var libraryName = (kind, value) => kind === "radius" ? TOKEN_MAP.radius[value] : TOKEN_MAP.spacing && TOKEN_MAP.spacing[String(value * STEP)];
  var report = (t, kind, token) => {
    if (!t.missing.some((m) => m.kind === kind && m.token === token)) t.missing.push({ kind, token });
  };
  async function colorVar(t, token, { create = true } = {}) {
    var _a;
    if (t.cache.has(`c:${token}`)) return t.cache.get(`c:${token}`);
    let v = findColor(t, token) || await libraryVar(t, colorName(token));
    if (!v && create) {
      const like = token.replace(/-(hover|active|disabled|muted)$/, "");
      v = await ensureModeColor(token, like !== token ? like : null);
      if (v) {
        t.created.push({ token, like: like !== token && ((_a = t.ix.named[C.mode]) == null ? void 0 : _a.has(like)) ? like : null });
        t.ix.named[C.mode].set(token, v);
        t.byName.set(token, [v]);
      }
    }
    if (!v) report(t, "color", token);
    t.cache.set(`c:${token}`, v || null);
    return v || null;
  }
  async function floatVar(t, kind, value) {
    const key = `${kind}:${value}`;
    if (t.cache.has(key)) return t.cache.get(key);
    const v = (kind === "radius" ? findRadius(t, value) : findSpace(t, value)) || await libraryVar(t, libraryName(kind, value));
    if (!v && !(kind === "radius" && (value === "full" || value === "none"))) report(t, kind, String(value));
    t.cache.set(key, v || null);
    return v || null;
  }
  function tokenForVariable(v, collectionName) {
    if (collectionName === C.mode) return v.name.startsWith("custom/") ? cssVar(v.name).slice(2) : v.name;
    for (const [token, m] of Object.entries(TOKEN_MAP.colors)) if (m.figma === v.name && (!m.collection || collectionName.startsWith(m.collection))) return token;
    for (const [key, name] of Object.entries(TOKEN_MAP.radius)) if (name === v.name) return key;
    const r = /^(?:radius|rounded)\/(.+)$/.exec(v.name);
    if (r) return r[1];
    const s = /^spacing\/([\d.-]+)$/.exec(v.name);
    if (s) return Number(s[1].replace("-", "."));
    for (const [px, name] of Object.entries(TOKEN_MAP.spacing || {})) if (name === v.name) return Number(px) / STEP;
    return v.name.replace(/^color\//, "").replace(/\//g, "-");
  }
  async function listVariables() {
    const t = await tokenIndex();
    return t.all.filter((v) => v.resolvedType === "COLOR" || v.resolvedType === "FLOAT").filter((v) => t.colName.get(v.variableCollectionId) !== C.brand).map((v) => {
      var _a;
      const collection = t.colName.get(v.variableCollectionId) || "";
      return { id: v.id, name: v.name, collection, type: v.resolvedType, token: tokenForVariable(v, collection), placeholder: ((_a = v.getPluginData) == null ? void 0 : _a.call(v, "ds")) === "contract-placeholder" };
    });
  }
  var SCREEN_ALIAS = {
    sidebar: "background",
    "sidebar-foreground": "foreground",
    "sidebar-primary": "primary",
    "sidebar-primary-foreground": "primary-foreground",
    "sidebar-accent": "accent",
    "sidebar-accent-foreground": "foreground",
    "sidebar-border": "border",
    "sidebar-ring": "ring",
    warning: "status-warning",
    "warning-foreground": "foreground",
    info: "status-info",
    "info-foreground": "foreground",
    // Charts take Mbank's supportive palette (five distinct hues); a file without it keeps the role colours.
    "chart-1": ["supportive-3", "success"],
    "chart-2": ["supportive-6", "primary"],
    "chart-3": ["supportive-2", "status-accent"],
    "chart-4": ["supportive-7", "secondary"],
    "chart-5": ["supportive-4", "muted-foreground"]
  };
  async function screenVars(base) {
    const t = await tokenIndex();
    const vars = __spreadValues({}, base.vars);
    const alias2 = (k) => [].concat(SCREEN_ALIAS[k] || []).reduce((v, a) => v || findColor(t, a), null);
    for (const k of Object.keys(vars)) if (!vars[k]) vars[k] = findColor(t, k) || alias2(k) || null;
    const radius = __spreadValues({}, base.radius);
    for (const k of Object.keys(radius)) if (!radius[k]) radius[k] = findRadius(t, k) || null;
    return { vars, radius };
  }

  // plugin/src/components.js
  var PAGE = "Components";
  var KEY = "mbank-contract";
  var GAP = 24;
  var RADIUS_PX = { none: 0, "2xs": 2, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, "2xl": 20, "3xl": 24, "4xl": 32, full: 9999 };
  var MAGENTA = { r: 1, g: 0, b: 1 };
  var WEIGHT_SUFFIX = { medium: "-md", semibold: "-strong", bold: "-strong" };
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
      } else node.cornerRadius = (_b = RADIUS_PX[s.radius]) != null ? _b : 8;
    } else node.cornerRadius = 0;
    node.opacity = s.opacity !== void 0 ? s.opacity / 100 : 1;
    node.effects = s["focus-ring"] ? [await ringFor(r, s["focus-ring"])] : [];
  }
  async function pickTextStyle(r, size3, weight) {
    const key = `${size3}/${weight}`;
    if (r.textStyles.has(key)) return r.textStyles.get(key);
    const local = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
    const mapped = TOKEN_MAP.text[size3];
    let st = null;
    for (const name of mapped ? [`${mapped}${WEIGHT_SUFFIX[weight] || ""}`, mapped] : []) {
      const hit = local.get(name) || await libraryStyle(name);
      if (!hit) continue;
      try {
        await figma.loadFontAsync(hit.fontName);
        st = hit;
        break;
      } catch (e) {
      }
    }
    if (!st) {
      const sz = TYPE_SCALE[size3] ? size3 : { "2xs": "xs", caption: "xs", md: "sm", "5xl": "4xl", "6xl": "4xl", "7xl": "4xl" }[size3] || "sm";
      st = await textStyle(r.ctx, sz, weight);
    }
    r.textStyles.set(key, st);
    return st;
  }
  async function libraryStyle(name) {
    const key = TOKEN_MAP.styleKeys && TOKEN_MAP.styleKeys[name];
    if (!key || !figma.importStyleByKeyAsync) return null;
    return importByKey(() => figma.importStyleByKeyAsync(key));
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
    destructive: ["destructive", "destructive-foreground", null]
  };
  var BTN_VARIANT = { default: "primary", secondary: "secondary", outline: "outline", ghost: "ghost", destructive: "destructive", link: "link" };
  var BTN_SIZE = { default: "md", sm: "sm", lg: "lg", icon: "icon" };
  var BADGE_TONE = { default: "accent", secondary: "neutral", outline: "clear", destructive: "error", success: "success", warning: "warning", info: "info" };
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
    destructive: ["destructive", "destructive-foreground"],
    success: ["success", "success-foreground"],
    warning: ["warning", "warning-foreground"],
    info: ["info", "info-foreground"]
  };
  async function badge(ctx, label2, variant = "secondary") {
    const props = { tone: BADGE_TONE[variant] || "neutral", fill: "ghost", shape: "rounded", size: "md" };
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
  var pick2 = (r, list2) => list2[Math.floor(r() * list2.length)];
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
    person: (r) => `${pick2(r, FIRST)} ${pick2(r, LAST)}`,
    company: (r) => pick2(r, COMPANIES),
    phone: (r) => `+996 ${700 + Math.floor(r() * 99)} ${String(Math.floor(r() * 999)).padStart(3, "0")} ${String(Math.floor(r() * 999)).padStart(3, "0")}`,
    email: (r) => `${pick2(r, ["a", "b", "n", "t", "d"])}.${pick2(r, ["asanov", "isakova", "bekov", "alieva"])}@mail.kg`,
    money,
    date: (r) => date(r, false),
    datetime: (r) => date(r, true),
    number: (r) => String(Math.floor(r() * 990 + 10)),
    percent: (r) => `${(r() * 40 + 55).toFixed(1)}%`,
    product: (r) => pick2(r, PRODUCTS),
    city: (r) => pick2(r, CITIES),
    text: (r) => pick2(r, WORDS)
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
  var DELTA_TONE = { positive: "success", negative: "destructive", neutral: "muted-foreground" };
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
        const tone = { positive: "success", negative: "destructive", neutral: "muted-foreground" };
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
  var STATUS_TONE = { success: "success", destructive: "destructive", warning: "warning", info: "info", secondary: "muted-foreground" };
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
  var ALERT = { destructive: ["destructive", "destructive"], warning: ["warning", "foreground"], info: ["info", "foreground"], success: ["success", "foreground"] };
  var ALERT_TONE = { destructive: "error", warning: "warning", info: "info", success: "success" };
  async function alert(ctx, b) {
    const inst = await place(ctx, "alert", { props: { tone: ALERT_TONE[b.variant] || "info" }, texts: { Title: b.title || null, Description: b.text }, w: "fill" });
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
  var TONE = { success: "success", warning: "warning", danger: "destructive", destructive: "destructive", info: "info", default: "primary" };
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
  var PROGRESS_TONE = { primary: "brand", destructive: "error", warning: "warning", success: "success", info: "brand" };
  async function meterBar(ctx, width, share, tone) {
    const p = await place(ctx, "progress", { props: { tone: PROGRESS_TONE[tone] || "brand", size: "md", shape: "rounded" }, w: width });
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
      const tone = TONE[it.tone] || (pct >= 90 ? "destructive" : pct >= 75 ? "warning" : "primary");
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
    const zones = ["destructive", "warning", "chart-3", "chart-1", "success"];
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
        add(row, rect(ctx, "Dot", 8, 8, good ? "success" : "destructive", "full"), await text(ctx, label2, { size: "sm", w: "fill" }), await text(ctx, impact, { size: "sm", weight: "semibold", color: good ? "success" : "destructive" }));
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
  var CHECK = { ok: ["check", "success"], warn: ["info", "warning"], fail: ["shield", "destructive"], wait: ["history", "muted-foreground"] };
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
          await setFrameModes(f, { brand: opts.brand, style: opts.style, theme: opts.theme || "light" });
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
        await setFrameModes(f, { brand: opts.brand, style: opts.style, theme: opts.theme || "light" });
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
  var customLines = (t, theme) => Object.entries(t.custom || {}).filter(([, v]) => v[theme]).map(([k, v]) => `  --${k}: ${v[theme]};`);
  var block = (selector, colors, extra = []) => [`${selector} {`, ...extra, ...COLOR_TOKENS.filter((k) => colors[k]).map((k) => `  --${k}: ${colors[k]};`), "}"].join("\n");
  function toShadcnCss(t) {
    const r = radiusScale(t.radius);
    const theme = [
      "@theme inline {",
      `  --font-sans: "${t.font.sans}", ui-sans-serif, system-ui, sans-serif;`,
      `  --font-mono: "${t.font.mono}", ui-monospace, monospace;`,
      ...COLOR_TOKENS.map((k) => `  --color-${k}: var(--${k});`),
      ...Object.keys(t.custom || {}).map((k) => `  --color-${k}: var(--${k});`),
      `  --radius-sm: ${r.sm}px;`,
      `  --radius-md: ${r.md}px;`,
      `  --radius-lg: ${r.lg}px;`,
      `  --radius-xl: ${r.xl}px;`,
      "}"
    ].join("\n");
    return [
      `/* ${t.name}: generated by ds-builder from tokens.json, do not edit by hand */`,
      '@import "tailwindcss";',
      '@import "tw-animate-css";',
      "",
      "@custom-variant dark (&:is(.dark *));",
      "",
      block(":root", t.colors.light, [`  --radius: ${t.radius}px;`, ...customLines(t, "light")]),
      "",
      block(".dark", t.colors.dark, customLines(t, "dark")),
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
        root: { layout: "row", align: "center", gap: 2, px: 4, height: 11, radius: "md", text: "sm", weight: "medium", bg: "primary", fg: "primary-foreground", "bg:hover": "primary-hover", "bg:active": "primary-active", "focus-ring": "ring/50", "opacity:disabled": 50 },
        icon: { size: 5 }
      },
      states: ["default", "hover", "active", "focus", "disabled"]
    },
    "input-like": {
      title: "\u041F\u043E\u043B\u0435: \u0440\u0430\u043C\u043A\u0430, \u043F\u043B\u0435\u0439\u0441\u0445\u043E\u043B\u0434\u0435\u0440; hover/focus/disabled",
      parts: ["root", "placeholder"],
      base: {
        root: { layout: "row", align: "center", px: 3, height: 11, radius: "md", text: "sm", bg: "background", fg: "foreground", border: "input", "border:hover": "input-hover", "border:focus": "ring", "focus-ring": "ring/30", "bg:disabled": "muted", "border:disabled": "input-disabled" },
        placeholder: { fg: "muted-foreground", "fg:disabled": "disabled-foreground" }
      },
      states: ["default", "hover", "focus", "disabled"]
    },
    "badge-like": {
      title: "\u0411\u0435\u0439\u0434\u0436: \u0437\u0430\u043B\u0438\u0432\u043A\u0430 \u0438 \u043F\u043E\u0434\u043F\u0438\u0441\u044C, \u0431\u0435\u0437 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439",
      parts: ["root", "label"],
      base: { root: { layout: "row", align: "center", gap: 1, px: 2, height: 6, radius: "full", text: "xs", weight: "medium", bg: "status-neutral-muted", fg: "status-neutral-foreground" } },
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
  var kebab2 = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  function parseProps(input2) {
    if (typeof input2 !== "string") return input2 || {};
    const out = {};
    for (const chunk of input2.split(/[;\n]/)) {
      const [k, v] = chunk.split("=");
      if (!k || !v) continue;
      const values = v.split(",").map((x) => kebab2(x)).filter(Boolean);
      if (values.length) out[kebab2(k)] = values;
    }
    return out;
  }
  function newContract({ name, title, template = "button-like", props = {} }) {
    const t = TEMPLATES[template];
    if (!t) throw new Error(`\u041D\u0435\u0442 \u0448\u0430\u0431\u043B\u043E\u043D\u0430 \xAB${template}\xBB: ${Object.keys(TEMPLATES).join(", ")}`);
    const id = kebab2(name);
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
  var contracts_default = [{ "$schema": "mbank/component@1", "name": "alert", "title": "Alert", "figma": { "name": "alert-text", "key": "862527fc2fc9aad902f137eb72e3d82620897a9d", "nodeId": "3012:33" }, "parts": ["root", "icon", "body", "title", "description"], "anatomy": { "root": { "width": 360 }, "icon": { "icon": "info" }, "body": { "fill": true }, "title": { "parent": "body", "sample": "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F", "fill": true }, "description": { "parent": "body", "sample": "\u041A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u0442\u0435\u043A\u0441\u0442: \u0447\u0442\u043E \u0441\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u0438 \u0447\u0442\u043E \u0434\u0435\u043B\u0430\u0442\u044C \u0434\u0430\u043B\u044C\u0448\u0435.", "fill": true } }, "props": { "tone": { "values": ["clear", "accent", "info", "success", "warning", "error"], "default": "clear" } }, "base": { "root": { "radius": "md", "px": 4, "py": 3, "text": "sm", "align": "start", "gap": 3 }, "icon": { "size": 5 }, "title": { "weight": "bold" }, "body": { "layout": "column", "gap": 1 }, "description": { "weight": "regular" } }, "variants": { "tone": { "clear": { "root": { "bg": "status-clear-muted", "fg": "status-clear-foreground" } }, "accent": { "root": { "bg": "status-accent-muted", "fg": "status-accent-foreground" } }, "info": { "root": { "bg": "status-info-muted", "fg": "status-info-foreground" } }, "success": { "root": { "bg": "status-success-muted", "fg": "status-success-foreground" } }, "warning": { "root": { "bg": "status-warning-muted", "fg": "status-warning-foreground" } }, "error": { "root": { "bg": "status-error-muted", "fg": "status-error-foreground" } } } }, "states": ["default"], "code": { "file": "alert.tsx", "export": "alertVariants", "template": "card-like", "parts": { "icon": "[&>svg]" }, "blocks": ["title"], "extra": "relative grid w-full grid-cols-[0_1fr] gap-y-0.5 has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3 [&>svg]:translate-y-0.5 [&>svg]:text-current", "extras": { "title": "col-start-2" }, "figmaOnly": ["body", "description"], "overrides": { "root": { "gap": null } } } }, { "$schema": "mbank/component@1", "name": "avatar", "title": "Avatar", "figma": { "name": "Avatars", "key": "a3d5e7947473b09bf719839c62a18d751927d7a8", "nodeId": "3174:1503" }, "parts": ["root", "fallback", "text"], "anatomy": { "fallback": { "fill": true }, "text": { "parent": "fallback", "sample": "\u0410\u0422" } }, "props": { "size": { "values": ["xs", "sm", "md", "lg", "xl"], "default": "md" } }, "base": { "root": { "radius": "full", "layout": "row" }, "fallback": { "radius": "full", "bg": "surface-2", "weight": "medium", "fg": "soft-foreground", "layout": "row", "align": "center" }, "text": { "fg": "muted-foreground", "weight": "medium" } }, "variants": { "size": { "xs": { "root": { "size": 6, "text": "xs" } }, "sm": { "root": { "size": 8, "text": "xs" } }, "md": { "root": { "size": 10, "text": "sm" } }, "lg": { "root": { "size": 14, "text": "base" } }, "xl": { "root": { "size": 18, "text": "xl" } } } }, "states": ["default"], "code": { "file": "avatar.tsx", "export": "avatarVariants", "template": "badge-like", "blocks": ["fallback"], "extra": "relative shrink-0 overflow-hidden", "extras": { "fallback": "size-full justify-center" }, "figmaOnly": ["text"] } }, { "$schema": "mbank/component@1", "name": "badge", "title": "Badge", "figma": { "name": "Badge-status", "key": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "nodeId": "2348:2631" }, "parts": ["root", "icon", "label"], "props": { "tone": { "values": ["neutral", "accent", "success", "warning", "error", "info", "clear"], "default": "neutral" }, "fill": { "values": ["ghost", "solid"], "default": "ghost" }, "shape": { "values": ["rounded", "square"], "default": "rounded" }, "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 1, "weight": "medium", "align": "center" }, "icon": { "size": 3, "hidden": true } }, "variants": { "tone": { "neutral": { "root": { "bg": "status-neutral-muted", "fg": "status-neutral-foreground" } }, "accent": { "root": { "bg": "status-accent-muted", "fg": "status-accent-foreground" } }, "success": { "root": { "bg": "status-success-muted", "fg": "status-success-foreground" } }, "warning": { "root": { "bg": "status-warning-muted", "fg": "status-warning-foreground" } }, "error": { "root": { "bg": "status-error-muted", "fg": "status-error-foreground" } }, "info": { "root": { "bg": "status-info-muted", "fg": "status-info-foreground" } }, "clear": { "root": { "bg": "status-clear-muted", "fg": "status-clear-foreground" } } }, "fill": { "ghost": {}, "solid": { "root": { "fg": "status-filled-foreground" } } }, "shape": { "rounded": { "root": { "radius": "full" } }, "square": { "root": { "radius": "xs" } } }, "size": { "sm": { "root": { "height": 5, "px": 1.5, "text": "xs" } }, "md": { "root": { "height": 6, "px": 2, "text": "xs" } }, "lg": { "root": { "height": 7, "px": 2.5, "text": "sm" } } } }, "compound": [{ "when": { "fill": "solid", "tone": "neutral" }, "root": { "bg": "status-neutral" } }, { "when": { "fill": "solid", "tone": "accent" }, "root": { "bg": "status-accent" } }, { "when": { "fill": "solid", "tone": "success" }, "root": { "bg": "status-success" } }, { "when": { "fill": "solid", "tone": "warning" }, "root": { "bg": "status-warning" } }, { "when": { "fill": "solid", "tone": "error" }, "root": { "bg": "status-error" } }, { "when": { "fill": "solid", "tone": "info" }, "root": { "bg": "status-info" } }, { "when": { "fill": "solid", "tone": "clear" }, "root": { "bg": "status-clear" } }], "states": ["default"], "code": { "file": "badge.tsx", "export": "badgeVariants", "template": "badge-like", "parts": { "icon": "[&>svg]" }, "extra": "inline-flex w-fit shrink-0 justify-center overflow-hidden whitespace-nowrap [&>svg]:pointer-events-none", "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "breadcrumb-item", "title": "Breadcrumb item", "figma": { "name": "Breadcrumb", "key": "385c08c28fbb4a95a06b073d1fc99963af0c26c8", "nodeId": "4240:4717" }, "parts": ["root", "label", "separator"], "anatomy": { "label": { "kind": "text", "layer": "Label", "sample": "\u0417\u0430\u044F\u0432\u043A\u0438" }, "separator": { "kind": "text", "layer": "Separator", "sample": "/" } }, "props": { "current": { "values": ["false", "true"], "default": "false" } }, "base": { "root": { "align": "center", "gap": 2, "text": "sm", "fg": "muted-foreground" } }, "variants": { "current": { "false": {}, "true": { "root": { "fg": "foreground", "weight": "medium" }, "separator": { "hidden": true } } } }, "states": ["default"], "code": { "file": "breadcrumb-item.tsx", "template": "badge-like", "extra": "inline-flex min-w-0 whitespace-nowrap", "figmaOnly": ["label", "separator"] } }, { "$schema": "mbank/component@1", "name": "button", "title": "Button", "figma": { "name": "button/default", "key": "713c90401df3b5d7ddf00e3af4d7ea5870c4c120", "nodeId": "2077:341" }, "parts": ["root", "icon", "label"], "props": { "variant": { "values": ["primary", "brand", "secondary", "destructive", "success", "soft", "ghost", "outline", "static", "link"], "default": "primary" }, "size": { "values": ["xs", "sm", "md", "lg", "icon-sm", "icon", "icon-lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "weight": "medium", "opacity:disabled": 50, "align": "center", "focus-ring": "ring/50" }, "icon": { "size": 5, "hidden": true } }, "variants": { "variant": { "primary": { "root": { "bg": "primary", "fg": "primary-foreground", "bg:hover": "primary-hover", "bg:active": "primary-active" } }, "brand": { "root": { "bg": "brand", "fg": "brand-foreground", "bg:hover": "brand-hover", "bg:active": "brand-active" } }, "secondary": { "root": { "bg": "secondary", "fg": "secondary-foreground", "bg:hover": "secondary-hover", "bg:active": "secondary-active" } }, "destructive": { "root": { "bg": "destructive", "fg": "destructive-foreground", "bg:hover": "destructive-hover", "bg:active": "destructive-active" } }, "success": { "root": { "bg": "success", "fg": "success-foreground", "bg:hover": "success-hover", "bg:active": "success-active" } }, "soft": { "root": { "bg": "soft", "fg": "soft-foreground-strong", "bg:hover": "soft-hover" } }, "ghost": { "root": { "bg": "ghost", "fg": "ghost-foreground", "bg:hover": "ghost-hover" } }, "outline": { "root": { "border-width": 1, "border": "outline", "bg": "background", "fg": "outline-foreground", "border:hover": "outline-hover", "bg:hover": "muted" } }, "static": { "root": { "bg": "static", "fg": "static-foreground", "bg:hover": "static-hover", "bg:active": "static-active" } }, "link": { "root": { "px": 0, "fg": "link" } } }, "size": { "xs": { "root": { "height": 8, "px": 3, "text": "xs" }, "icon": { "size": 4 } }, "sm": { "root": { "height": 9, "px": 3, "text": "sm" }, "icon": { "size": 4 } }, "md": { "root": { "height": 11, "px": 4, "text": "sm" } }, "lg": { "root": { "height": 14, "px": 6, "text": "base" } }, "icon-sm": { "root": { "size": 9 }, "label": { "hidden": true }, "icon": { "hidden": false } }, "icon": { "root": { "size": 11 }, "label": { "hidden": true }, "icon": { "hidden": false } }, "icon-lg": { "root": { "size": 14 }, "label": { "hidden": true }, "icon": { "hidden": false } } } }, "states": ["default", "hover", "active", "focus", "disabled"], "code": { "file": "button.tsx", "export": "buttonVariants", "template": "button-like", "parts": { "icon": "[&_svg:not([class*='size-'])]" }, "extra": "inline-flex shrink-0 justify-center whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 aria-invalid:ring-[3px] aria-invalid:ring-border-destructive/30", "extras": { "variant=link": "h-auto underline-offset-4 hover:underline" }, "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "card", "title": "Card", "parts": ["root", "header", "title", "description", "content", "body", "footer", "action"], "anatomy": { "root": { "width": 320 }, "header": { "fill": true }, "title": { "parent": "header", "sample": "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438" }, "description": { "parent": "header", "sample": "\u041A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0433\u043E" }, "content": { "fill": true }, "footer": { "fill": true }, "body": { "parent": "content", "kind": "text", "sample": "\u0417\u0434\u0435\u0441\u044C \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u0435 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438: \u0442\u0435\u043A\u0441\u0442, \u0441\u043F\u0438\u0441\u043E\u043A \u0438\u043B\u0438 \u0442\u0430\u0431\u043B\u0438\u0446\u0430.", "fill": true }, "action": { "parent": "footer", "kind": "instance", "component": { "name": "Button" }, "sample": "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435" } }, "props": {}, "base": { "root": { "gap": 4, "radius": "lg", "border-width": 1, "border": "border", "bg": "card", "py": 5, "fg": "card-foreground", "layout": "column" }, "header": { "gap": 1, "px": 5, "align": "start", "layout": "column" }, "title": { "text": "base", "weight": "bold" }, "description": { "text": "sm", "fg": "muted-foreground" }, "content": { "px": 5, "layout": "column" }, "footer": { "gap": 2, "px": 5, "layout": "row", "align": "start" }, "body": { "text": "sm", "fg": "muted-foreground" } }, "variants": {}, "states": ["default"], "code": { "file": "card.tsx", "shape": "classes", "template": "card-like", "blocks": ["header", "title", "description", "content", "footer"], "extras": { "header": "grid auto-rows-min grid-rows-[auto_auto] has-data-[slot=card-action]:grid-cols-[1fr_auto]", "footer": "[.border-t]:pt-4" }, "figmaOnly": ["body", "action"], "overrides": { "header": { "layout": null }, "content": { "layout": null }, "footer": { "align": "center" } } } }, { "$schema": "mbank/component@1", "name": "checkbox", "title": "Checkbox", "figma": { "name": "Switchers - Check", "key": "be053b3924b63e289a38bfd661b7180deb83236e", "nodeId": "2280:9729" }, "parts": ["root", "icon", "icon-minus"], "anatomy": { "icon": { "icon": "check" }, "icon-minus": { "icon": "minus" } }, "props": {}, "base": { "root": { "size": 5, "radius": "xs", "border-width": 1, "border": "input", "bg": "background", "border:hover": "input-hover", "border:disabled": "input-disabled", "bg:disabled": "muted", "border:invalid": "border-destructive", "border:checked": "brand", "bg:checked": "brand", "fg:checked": "brand-foreground", "border:indeterminate": "brand", "bg:indeterminate": "brand", "fg:indeterminate": "brand-foreground", "focus-ring": "ring/30", "align": "center" }, "icon": { "size": 4, "hidden": true, "hidden:checked": false }, "icon-minus": { "size": 4, "hidden": true, "hidden:indeterminate": false } }, "variants": {}, "states": ["default", "hover", "focus", "disabled", "invalid", "checked", "indeterminate"], "code": { "file": "checkbox.tsx", "shape": "classes", "template": "button-like", "modifiers": { "checked": "data-[state=checked]", "indeterminate": "data-[state=indeterminate]" }, "extra": "peer shrink-0 transition-colors outline-none disabled:cursor-not-allowed disabled:data-[state=checked]:opacity-50", "figmaOnly": ["icon", "icon-minus"], "overrides": { "root": { "align": null, "layout": null } } } }, { "$schema": "mbank/component@1", "name": "crm-application-card", "title": "CRM / Application card", "figma": { "name": "CRM / Application card", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "33:28", "uses": 15 } }, "parts": ["root", "top", "id", "time", "name", "amount", "meta", "footer", "badge"], "anatomy": { "root": { "width": 200 }, "top": { "kind": "frame", "layer": "Top", "fill": true }, "id": { "kind": "text", "layer": "ID", "parent": "top", "sample": "CL-240118" }, "time": { "kind": "text", "layer": "Time", "parent": "top", "sample": "09:14" }, "name": { "kind": "text", "layer": "Name", "fill": true, "sample": "\u0410\u0441\u0430\u043D\u043E\u0432 \u041D\u0443\u0440\u043B\u0430\u043D" }, "amount": { "kind": "text", "layer": "Amount", "sample": "450 000 KGS" }, "meta": { "kind": "text", "layer": "Meta", "fill": true, "sample": "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \xB7 24 \u043C\u0435\u0441" }, "footer": { "kind": "frame", "layer": "Footer", "fill": true }, "badge": { "kind": "instance", "layer": "Badge-status", "parent": "footer", "sample": "SLA 25 \u043C\u0438\u043D", "component": { "name": "Badge-status", "set": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "key": "b68afd3e0714ecefd38ee21793292c14ae240015", "variant": "Size=S, Form=rounded, Appearance=Info, Status=Off, Icon=Off, Solid=off" } } }, "props": {}, "base": { "root": { "layout": "column", "gap": 1, "px": 3, "py": 3, "radius": "md", "bg": "card", "fg": "foreground" }, "top": { "layout": "row", "align": "between" }, "id": { "text": "caption", "fg": "muted-foreground", "weight": "regular" }, "time": { "text": "caption", "fg": "muted-foreground", "weight": "regular" }, "name": { "text": "sm", "weight": "medium", "fg": "foreground" }, "amount": { "text": "base", "weight": "bold", "fg": "foreground" }, "meta": { "text": "caption", "fg": "muted-foreground", "weight": "regular" }, "footer": { "layout": "row", "align": "start", "pt": 1 } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/ApplicationCard.tsx", "slot": "application-card" } }, { "$schema": "mbank/component@1", "name": "crm-key-value-row", "title": "CRM / Key-value row", "figma": { "name": "CRM / Key-value row", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "24:6539", "uses": 26 } }, "parts": ["root", "label", "value"], "anatomy": { "root": { "width": 480 }, "label": { "kind": "text", "layer": "Label", "width": 180, "sample": "\u041A\u043B\u044E\u0447" }, "value": { "kind": "text", "layer": "Value", "fill": true, "sample": "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435" } }, "props": {}, "base": { "root": { "layout": "row", "align": "start", "gap": 4, "px": 0, "py": 2, "text": "sm" }, "label": { "text": "sm", "fg": "muted-foreground", "weight": "regular" }, "value": { "text": "sm", "weight": "medium", "fg": "foreground" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/KeyValueRow.tsx", "slot": "key-value-row" } }, { "$schema": "mbank/component@1", "name": "crm-kpi-card", "title": "CRM / KPI card", "figma": { "name": "CRM / KPI card", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "21:1819", "uses": 8 } }, "parts": ["root", "label", "value", "delta", "delta-value", "delta-label"], "anatomy": { "root": { "width": 260 }, "label": { "kind": "text", "layer": "Label", "sample": "\u041F\u0435\u0440\u0435\u0432\u043E\u0434\u043E\u0432 \u0441\u0435\u0433\u043E\u0434\u043D\u044F" }, "value": { "kind": "text", "layer": "Value", "sample": "12 480" }, "delta": { "kind": "frame", "layer": "Delta" }, "delta-value": { "kind": "text", "layer": "Delta value", "parent": "delta", "sample": "+8,2%" }, "delta-label": { "kind": "text", "layer": "Delta label", "parent": "delta", "sample": "\u043A \u0432\u0447\u0435\u0440\u0430" } }, "props": {}, "base": { "root": { "layout": "column", "gap": 2, "px": 5, "py": 5, "radius": "lg", "bg": "card", "fg": "foreground" }, "label": { "text": "sm", "fg": "muted-foreground", "weight": "regular" }, "value": { "text": "2xl", "weight": "bold", "fg": "foreground" }, "delta": { "layout": "row", "align": "center", "gap": 1 }, "delta-value": { "text": "sm", "weight": "medium", "fg": "success-text" }, "delta-label": { "text": "caption", "fg": "muted-foreground", "weight": "regular" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/KpiCard.tsx", "slot": "kpi-card" } }, { "$schema": "mbank/component@1", "name": "crm-list-item", "title": "CRM / List item", "figma": { "name": "CRM / List item", "page": "\u2630 CRM blocks" }, "parts": ["root", "avatar", "content", "title", "subtitle", "meta"], "anatomy": { "root": { "width": 360, "sides": ["bottom"] }, "avatar": { "kind": "instance", "layer": "Avatar", "sample": "\u0410\u041D", "component": { "name": "Avatar", "set": "a3d5e7947473b09bf719839c62a18d751927d7a8", "key": "2c3fca6917c56c5d664a8c1a8159dedb38cc26ac", "variant": "Size=40 px, Placeholder=False, Upload=False, Name=False" } }, "content": { "kind": "frame", "layer": "Content", "fill": true }, "title": { "kind": "text", "layer": "Title", "sample": "\u0410\u0441\u0430\u043D\u043E\u0432 \u041D\u0443\u0440\u043B\u0430\u043D", "parent": "content", "fill": true }, "subtitle": { "kind": "text", "layer": "Subtitle", "sample": "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \xB7 450 000 KGS", "parent": "content", "fill": true }, "meta": { "kind": "text", "layer": "Meta", "sample": "09:14" } }, "props": {}, "base": { "root": { "layout": "row", "align": "center", "gap": 3, "px": 4, "py": 3, "bg": "card", "border-width": 1, "border": "border" }, "content": { "layout": "column", "gap": 1 }, "title": { "text": "sm", "weight": "medium", "fg": "foreground" }, "subtitle": { "text": "caption", "weight": "regular", "fg": "muted-foreground" }, "meta": { "text": "caption", "weight": "regular", "fg": "muted-foreground" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/ListItem.tsx", "slot": "crm-list-item" } }, { "$schema": "mbank/component@1", "name": "crm-timeline-item", "title": "CRM / Timeline item", "figma": { "name": "CRM / Timeline item", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "24:6542", "uses": 8 } }, "parts": ["root", "marker", "dot", "content", "title", "meta"], "anatomy": { "root": { "width": 320 }, "marker": { "kind": "frame", "layer": "Marker" }, "dot": { "kind": "frame", "layer": "Dot", "parent": "marker" }, "content": { "kind": "frame", "layer": "Content", "fill": true }, "title": { "kind": "text", "layer": "Title", "parent": "content", "fill": true, "sample": "\u0421\u043E\u0431\u044B\u0442\u0438\u0435" }, "meta": { "kind": "text", "layer": "Meta", "parent": "content", "sample": "12.10.2026, 14:32 \xB7 \u0421\u0438\u0441\u0442\u0435\u043C\u0430" } }, "props": {}, "base": { "root": { "layout": "row", "align": "start", "gap": 3 }, "marker": { "layout": "column", "px": 0, "pt": 1, "pb": 0 }, "dot": { "size": 3, "radius": "full", "bg": "border-success" }, "content": { "layout": "column", "gap": 1 }, "title": { "text": "sm", "weight": "medium", "fg": "foreground" }, "meta": { "text": "caption", "fg": "muted-foreground", "weight": "regular" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/TimelineItem.tsx", "slot": "timeline-item" } }, { "$schema": "mbank/component@1", "name": "crm-transfer-row", "title": "CRM / Transfer row", "figma": { "name": "CRM / Transfer row", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "23:10079", "uses": 10 } }, "parts": ["root", "id-cell", "id-content", "id", "date-cell", "date-content", "date", "sender-cell", "sender-content", "sender", "recipient-cell", "recipient-content", "recipient", "country-cell", "country-content", "country", "amount-cell", "amount-content", "amount", "channel-cell", "channel-content", "channel", "status-cell", "status"], "anatomy": { "root": { "sides": ["bottom"] }, "id-cell": { "kind": "frame", "layer": "TableCell 1", "width": 124, "sides": ["right"] }, "id-content": { "kind": "frame", "layer": "TextContent", "parent": "id-cell", "fill": true }, "id": { "kind": "text", "layer": "Label", "parent": "id-content", "fill": true, "sample": "TR-80421951" }, "date-cell": { "kind": "frame", "layer": "TableCell 2", "width": 156, "sides": ["right"] }, "date-content": { "kind": "frame", "layer": "TextContent", "parent": "date-cell", "fill": true }, "date": { "kind": "text", "layer": "Label", "parent": "date-content", "fill": true, "sample": "12.10.2026, 14:32" }, "sender-cell": { "kind": "frame", "layer": "TableCell 3", "width": 160, "sides": ["right"] }, "sender-content": { "kind": "frame", "layer": "TextContent", "parent": "sender-cell", "fill": true }, "sender": { "kind": "text", "layer": "Label", "parent": "sender-content", "fill": true, "sample": "\u0411\u0430\u043A\u044B\u0442 \u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B\u043E\u0432" }, "recipient-cell": { "kind": "frame", "layer": "TableCell 4", "width": 170, "sides": ["right"] }, "recipient-content": { "kind": "frame", "layer": "TextContent", "parent": "recipient-cell", "fill": true }, "recipient": { "kind": "text", "layer": "Label", "parent": "recipient-content", "fill": true, "sample": "\u0418\u0432\u0430\u043D \u041F\u0435\u0442\u0440\u043E\u0432" }, "country-cell": { "kind": "frame", "layer": "TableCell 5", "width": 116, "sides": ["right"] }, "country-content": { "kind": "frame", "layer": "TextContent", "parent": "country-cell", "fill": true }, "country": { "kind": "text", "layer": "Label", "parent": "country-content", "fill": true, "sample": "\u0420\u043E\u0441\u0441\u0438\u044F" }, "amount-cell": { "kind": "frame", "layer": "TableCell 6", "width": 124, "sides": ["right"] }, "amount-content": { "kind": "frame", "layer": "TextContent", "parent": "amount-cell", "fill": true }, "amount": { "kind": "text", "layer": "Label", "parent": "amount-content", "fill": true, "sample": "185 000 KGS" }, "channel-cell": { "kind": "frame", "layer": "TableCell 7", "width": 128, "sides": ["right"] }, "channel-content": { "kind": "frame", "layer": "TextContent", "parent": "channel-cell", "fill": true }, "channel": { "kind": "text", "layer": "Label", "parent": "channel-content", "fill": true, "sample": "\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435" }, "status-cell": { "kind": "frame", "layer": "TableCell 8", "width": 138, "sides": ["right"] }, "status": { "kind": "instance", "layer": "Badge-status", "parent": "status-cell", "sample": "\u0423\u0441\u043F\u0435\u0448\u043D\u043E", "component": { "name": "Badge-status", "set": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "key": "4c16cc198bc2c10f229898b330166c1db17200b6", "variant": "Size=S, Form=rounded, Appearance=Success, Status=Off, Icon=Off, Solid=off" } } }, "props": {}, "base": { "root": { "layout": "row", "align": "center", "bg": "background", "border": "border", "border-width": 1, "text": "sm" }, "id-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "id-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "id": { "text": "sm", "weight": "regular", "fg": "foreground" }, "date-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "date-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "date": { "text": "sm", "weight": "regular", "fg": "foreground" }, "sender-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "sender-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "sender": { "text": "sm", "weight": "regular", "fg": "foreground" }, "recipient-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "recipient-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "recipient": { "text": "sm", "weight": "regular", "fg": "foreground" }, "country-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "country-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "country": { "text": "sm", "weight": "regular", "fg": "foreground" }, "amount-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "amount-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "amount": { "text": "sm", "weight": "regular", "fg": "foreground" }, "channel-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "channel-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "channel": { "text": "sm", "weight": "regular", "fg": "foreground" }, "status-cell": { "layout": "row", "align": "center", "gap": 2, "px": 3, "border": "border", "border-width": 1, "py": 3 } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/TransferRow.tsx", "slot": "transfer-row", "inline": ["id-content", "id", "date-content", "date", "sender-content", "sender", "recipient-content", "recipient", "country-content", "country", "amount-content", "amount", "channel-content", "channel"] } }, { "$schema": "mbank/component@1", "name": "date-picker-trigger", "title": "Date picker trigger", "figma": { "name": "input/calendar-single", "key": "9015ffe0c43d059151c3c414323b4e24e9140985", "nodeId": "2250:4032" }, "parts": ["root", "placeholder", "icon"], "anatomy": { "root": { "width": 240 }, "placeholder": { "kind": "text", "layer": "Placeholder", "sample": "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0430\u0442\u0443", "fill": true }, "icon": { "kind": "icon", "icon": "calendar" } }, "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "text": "sm", "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "layout": "row", "align": "between", "focus-ring": "ring/30", "border:invalid": "border-destructive" }, "placeholder": { "fg": "muted-foreground" }, "icon": { "size": 5, "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9 } }, "md": { "root": { "height": 11 } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "hover", "focus", "disabled", "invalid"], "code": { "file": "date-picker.tsx", "shape": "classes", "template": "button-like", "parts": { "placeholder": "data-[placeholder]" }, "maps": { "size": { "const": "pickerSizes", "part": "root" } }, "extra": "w-full text-left whitespace-nowrap transition-colors outline-none disabled:pointer-events-none", "figmaOnly": ["icon"] } }, { "$schema": "mbank/component@1", "name": "dialog", "title": "Dialog", "figma": { "name": "dialogInfo", "key": "12ed29cbe7be8badd626f5b83ad2a37ab905ebd8", "nodeId": "2405:4807" }, "parts": ["root", "header", "title", "description", "content", "footer", "cancel", "confirm"], "anatomy": { "root": { "width": 480 }, "header": { "kind": "frame", "layer": "Header", "fill": true }, "title": { "kind": "text", "layer": "Title", "sample": "\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443?", "parent": "header", "fill": true }, "description": { "kind": "text", "layer": "Description", "sample": "\u041A\u043B\u0438\u0435\u043D\u0442 \u043F\u043E\u043B\u0443\u0447\u0438\u0442 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u0441 \u043F\u0440\u0438\u0447\u0438\u043D\u043E\u0439 \u043E\u0442\u043A\u0430\u0437\u0430", "parent": "header", "fill": true }, "content": { "kind": "frame", "layer": "Content", "fill": true }, "footer": { "kind": "frame", "layer": "Footer", "fill": true }, "cancel": { "kind": "instance", "layer": "Cancel", "parent": "footer", "sample": "\u041E\u0442\u043C\u0435\u043D\u0430", "component": { "name": "Button" } }, "confirm": { "kind": "instance", "layer": "Confirm", "parent": "footer", "sample": "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C", "component": { "name": "Button" } } }, "props": {}, "base": { "root": { "layout": "column", "gap": 4, "px": 6, "py": 6, "radius": "lg", "bg": "card", "fg": "foreground", "shadow": "modal" }, "header": { "layout": "column", "gap": 2 }, "title": { "text": "xl", "weight": "bold" }, "description": { "text": "sm", "fg": "muted-foreground" }, "content": { "layout": "column", "gap": 2, "min-height": 16 }, "footer": { "layout": "row", "align": "end", "gap": 2 } }, "variants": {}, "states": ["default"], "code": { "file": "dialog.tsx", "shape": "classes", "template": "card-like", "blocks": ["header", "title", "description", "footer"], "extra": "fixed top-1/2 left-1/2 z-(--z-modal) grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none", "extras": { "header": "pr-8", "footer": "flex flex-col-reverse sm:flex-row sm:justify-end" }, "figmaOnly": ["content", "cancel", "confirm"], "overrides": { "root": { "layout": null }, "footer": { "layout": null, "align": null } } } }, { "$schema": "mbank/component@1", "name": "dropdown-menu-item", "title": "Dropdown menu item", "figma": { "name": "Item / dropdown / simple", "key": "79cec158925db00a687b7dc969846592cf4cb98f", "nodeId": "5020:11626" }, "parts": ["root", "icon", "label", "shortcut"], "anatomy": { "root": { "width": 220 }, "icon": { "kind": "icon", "icon": "file" }, "label": { "kind": "text", "layer": "Label", "sample": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C", "fill": true }, "shortcut": { "kind": "text", "layer": "Shortcut", "sample": "\u2318O" } }, "props": { "variant": { "values": ["default", "destructive"], "default": "default" } }, "base": { "root": { "align": "center", "gap": 2, "px": 2, "height": 8, "radius": "xs", "text": "sm", "fg": "foreground", "bg:hover": "accent", "fg:disabled": "disabled-foreground" }, "icon": { "size": 4, "fg": "muted-foreground" }, "shortcut": { "text": "xs", "fg": "muted-foreground" } }, "variants": { "variant": { "default": {}, "destructive": { "root": { "fg": "destructive-text", "bg:hover": "destructive-soft" }, "icon": { "fg": "destructive-text" } } } }, "states": ["default", "hover", "disabled"], "code": { "file": "dropdown-menu.tsx", "shape": "classes", "template": "button-like", "modifiers": { "hover": "data-[highlighted]", "disabled": "data-[disabled]" }, "parts": { "icon": "[&_svg]" }, "prefix": { "variant": "data-[variant={value}]" }, "extra": "relative flex cursor-default outline-none select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0", "figmaOnly": ["label", "shortcut"] } }, { "$schema": "mbank/component@1", "name": "empty-state", "title": "Empty state", "figma": { "name": "Empty state" }, "parts": ["root", "icon", "title", "description", "action"], "anatomy": { "root": { "width": 400 }, "icon": { "kind": "icon", "icon": "inbox" }, "title": { "kind": "text", "layer": "Title", "sample": "\u0417\u0430\u044F\u0432\u043E\u043A \u043F\u043E\u043A\u0430 \u043D\u0435\u0442" }, "description": { "kind": "text", "layer": "Description", "sample": "\u041D\u043E\u0432\u044B\u0435 \u0437\u0430\u044F\u0432\u043A\u0438 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C" }, "action": { "kind": "instance", "layer": "Action", "sample": "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443", "component": { "name": "Button" } } }, "props": {}, "base": { "root": { "layout": "column", "align": "center", "gap": 3, "px": 6, "py": 16, "radius": "lg", "border-width": 1, "border": "border-secondary" }, "icon": { "size": 7, "fg": "muted-foreground" }, "title": { "text": "base", "weight": "bold", "fg": "foreground" }, "description": { "text": "sm", "fg": "muted-foreground" } }, "variants": {}, "states": ["default"], "code": { "file": "EmptyState.tsx", "shape": "classes", "template": "card-like", "extra": "border-dashed text-center", "figmaOnly": ["icon", "title", "description", "action"] } }, { "$schema": "mbank/component@1", "name": "filter-chip", "title": "Filter chip", "figma": { "name": "Item / chipsButton", "key": "a2f7f17786d9e319cebd76c4fe36b067d6f7654f", "nodeId": "2426:13606" }, "parts": ["root", "label", "icon"], "anatomy": { "label": { "kind": "text", "layer": "Label", "sample": "\u0421\u0442\u0430\u0442\u0443\u0441" }, "icon": { "kind": "icon", "icon": "chevron" } }, "props": {}, "base": { "root": { "align": "center", "gap": 1, "px": 3, "height": 9, "radius": "sm", "border-width": 1, "border": "outline", "bg": "background", "text": "sm", "weight": "medium", "fg": "foreground", "border:hover": "border-secondary", "bg:selected": "secondary", "border:selected": "secondary", "fg:selected": "inverse-foreground" }, "icon": { "size": 5 } }, "variants": {}, "states": ["default", "hover", "selected"], "code": { "file": "filter-chip.tsx", "template": "button-like", "modifiers": { "selected": "aria-pressed" }, "parts": { "icon": "[&_svg]" }, "extra": "inline-flex shrink-0 whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30 [&_svg]:shrink-0", "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "input", "title": "Input", "figma": { "name": "input/default", "key": "9b99d128100afd0ac499d5fc2cfdedf0ae6aa44b", "nodeId": "2184:1939" }, "parts": ["root", "placeholder"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "border:invalid": "border-destructive", "layout": "row", "focus-ring": "ring/30" }, "placeholder": { "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9, "text": "sm" } }, "md": { "root": { "height": 11, "text": "sm" } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "hover", "focus", "disabled", "invalid"], "code": { "file": "input.tsx", "export": "inputVariants", "template": "input-like", "parts": { "placeholder": "placeholder" }, "extra": "w-full min-w-0 transition-colors outline-none disabled:pointer-events-none file:border-0 file:bg-transparent file:text-sm file:font-medium aria-invalid:ring-border-destructive/20" } }, { "$schema": "mbank/component@1", "name": "nav-item", "title": "Nav item", "figma": { "name": "item-sidemenu-menu-tree-1", "key": "9789323b5edf20b5384e1623e5d2f75cf7df0c57", "nodeId": "410:11518" }, "parts": ["root", "icon", "label", "count"], "anatomy": { "root": { "width": 256 }, "icon": { "kind": "icon", "icon": "home" }, "label": { "kind": "text", "layer": "Label", "sample": "\u0417\u0430\u044F\u0432\u043A\u0438", "fill": true }, "count": { "kind": "text", "layer": "Count", "sample": "12" } }, "props": {}, "base": { "root": { "gap": 3, "px": 3, "height": 11, "radius": "md", "text": "sm", "weight": "medium", "fg": "soft-foreground", "align": "center", "bg:hover": "accent", "bg:selected": "muted", "fg:selected": "foreground", "fg:disabled": "disabled-foreground", "focus-ring": "ring/30" }, "icon": { "size": 5, "fg": "muted-foreground", "fg:selected": "foreground", "fg:disabled": "disabled-foreground" }, "count": { "text": "caption", "weight": "medium", "fg": "muted-foreground" } }, "variants": {}, "states": ["default", "hover", "selected", "disabled"], "code": { "file": "nav-item.tsx", "template": "button-like", "modifiers": { "selected": "aria-[current=page]", "disabled": "aria-disabled" }, "parts": { "icon": "[&_svg]" }, "extra": "flex w-full min-w-0 transition-colors outline-none aria-disabled:pointer-events-none [&_svg]:shrink-0", "figmaOnly": ["label", "count"] } }, { "$schema": "mbank/component@1", "name": "pagination", "title": "Pagination item", "figma": { "name": "item/pagintaion / buttons", "key": "2255ec920c853b652f1389adbc4bd30779ee35d7", "nodeId": "4141:5990" }, "parts": ["root", "icon", "label"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "radius": "sm", "weight": "medium", "fg": "foreground", "bg:hover": "accent", "fg:disabled": "disabled-foreground", "bg:selected": "secondary", "fg:selected": "secondary-foreground", "align": "center", "focus-ring": "ring/30" }, "icon": { "size": 5, "hidden": true } }, "variants": { "size": { "sm": { "root": { "height": 8, "px": 1.5, "text": "xs" } }, "md": { "root": { "height": 9, "px": 2, "text": "sm" } }, "lg": { "root": { "height": 10, "px": 2.5, "text": "sm" } } } }, "states": ["default", "hover", "focus", "disabled", "selected"], "code": { "file": "pagination.tsx", "export": "paginationItemVariants", "template": "button-like", "parts": { "icon": "[&_svg]" }, "modifiers": { "selected": "aria-[current=page]" }, "extra": "inline-flex shrink-0 justify-center tabular-nums transition-colors outline-none select-none disabled:pointer-events-none [&_svg]:shrink-0", "extras": { "size=sm": "min-w-8", "size=md": "min-w-9", "size=lg": "min-w-10" }, "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "progress", "title": "Progress", "figma": { "name": "Progress bar / Determinate", "key": "cf47478133f9b8625225affab7ae57b7b022c9bd", "nodeId": "4823:334" }, "parts": ["root", "indicator"], "anatomy": { "root": { "width": 240 }, "indicator": { "width": 144 } }, "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" }, "shape": { "values": ["rounded", "square"], "default": "rounded" }, "tone": { "values": ["brand", "success", "error", "warning"], "default": "brand" } }, "base": { "root": { "bg": "surface-2" } }, "variants": { "size": { "sm": { "root": { "height": 1 } }, "md": { "root": { "height": 2 } }, "lg": { "root": { "height": 3 } } }, "shape": { "rounded": { "root": { "radius": "full" }, "indicator": { "radius": "full" } }, "square": { "root": { "radius": "none" }, "indicator": { "radius": "none" } } }, "tone": { "brand": { "indicator": { "bg": "brand" } }, "success": { "indicator": { "bg": "status-success" } }, "error": { "indicator": { "bg": "status-error" } }, "warning": { "indicator": { "bg": "status-warning" } } } }, "states": ["default"], "code": { "file": "progress.tsx", "export": "progressVariants", "template": "card-like", "maps": { "tone": { "const": "indicatorTones", "part": "indicator" } }, "extra": "relative w-full overflow-hidden", "figmaOnly": ["indicator"] } }, { "$schema": "mbank/component@1", "name": "radio", "title": "Radio", "figma": { "name": "Switchers - Check", "key": "be053b3924b63e289a38bfd661b7180deb83236e", "nodeId": "2280:9729" }, "parts": ["root", "dot"], "anatomy": { "dot": { "kind": "frame", "layer": "Dot" } }, "props": {}, "base": { "root": { "size": 5, "radius": "full", "border-width": 1, "border": "input", "bg": "background", "align": "center", "border:hover": "input-hover", "border:disabled": "input-disabled", "bg:disabled": "muted", "border:checked": "brand", "bg:checked": "brand", "focus-ring": "ring/30" }, "dot": { "size": 2, "radius": "full", "bg": "brand-foreground", "hidden": true, "hidden:checked": false } }, "variants": {}, "states": ["default", "hover", "focus", "disabled", "checked"], "code": { "file": "radio.tsx", "template": "button-like", "modifiers": { "checked": "data-[state=checked]" }, "extra": "peer inline-flex shrink-0 justify-center transition-colors outline-none disabled:cursor-not-allowed disabled:data-[state=checked]:opacity-50", "figmaOnly": ["dot"] } }, { "$schema": "mbank/component@1", "name": "search-input", "title": "Search input", "figma": { "name": "input/search", "key": "bdc52ccb245ef127e0ce609859f7b0347207a94b", "nodeId": "4001:1384" }, "parts": ["root", "icon", "placeholder"], "anatomy": { "root": { "width": 272 }, "icon": { "kind": "icon", "icon": "search" }, "placeholder": { "kind": "text", "layer": "Placeholder", "sample": "\u041F\u043E\u0438\u0441\u043A", "fill": true } }, "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "text": "sm", "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "layout": "row", "align": "center", "focus-ring": "ring/30" }, "placeholder": { "fg": "muted-foreground" }, "icon": { "size": 5, "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9, "radius": "sm" } }, "md": { "root": { "height": 11 } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "hover", "focus", "disabled"], "code": { "file": "search-input.tsx", "template": "card-like", "modifiers": { "focus": "focus-within", "disabled": "has-disabled" }, "parts": { "icon": "[&_svg]" }, "extra": "w-full transition-colors has-disabled:pointer-events-none [&_svg]:shrink-0", "figmaOnly": ["placeholder"] } }, { "$schema": "mbank/component@1", "name": "select-trigger", "title": "Select trigger", "figma": { "name": "input/dropdown", "key": "a51f7990a9914a36e511d08aeb2684c412634c09", "nodeId": "2431:11731" }, "parts": ["root", "placeholder", "icon"], "anatomy": { "root": { "width": 240 }, "icon": { "icon": "chevron" } }, "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "text": "sm", "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "border:invalid": "border-destructive", "layout": "row", "align": "between", "focus-ring": "ring/30" }, "placeholder": { "fg": "muted-foreground" }, "icon": { "size": 4, "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9 } }, "md": { "root": { "height": 11 } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "hover", "focus", "disabled", "invalid"], "code": { "file": "select.tsx", "shape": "classes", "template": "button-like", "parts": { "placeholder": "data-[placeholder]" }, "maps": { "size": { "const": "triggerSizes", "part": "root" } }, "extra": "w-full whitespace-nowrap transition-colors outline-none disabled:pointer-events-none *:data-[slot=select-value]:truncate", "figmaOnly": ["icon"] } }, { "$schema": "mbank/component@1", "name": "separator", "title": "Separator", "figma": { "name": "Separator" }, "parts": ["root"], "props": { "orientation": { "values": ["horizontal", "vertical"], "default": "horizontal" } }, "base": { "root": { "bg": "border" } }, "variants": { "orientation": { "horizontal": { "root": { "layout": "row", "height": 0.25, "px": 30 } }, "vertical": { "root": { "layout": "row", "height": 6, "px": 0.125 } } } }, "states": ["default"], "code": { "file": "separator.tsx", "template": "card-like", "extra": "shrink-0", "extras": { "orientation=horizontal": "h-px w-full", "orientation=vertical": "h-full w-px" }, "overrides": { "root": { "layout": null, "height": null, "px": null } } } }, { "$schema": "mbank/component@1", "name": "skeleton", "title": "Skeleton", "parts": ["root"], "anatomy": { "root": { "width": 240 } }, "props": { "shape": { "values": ["line", "circle", "block"], "default": "line" } }, "base": { "root": { "radius": "md", "bg": "surface-2" } }, "variants": { "shape": { "line": { "root": { "height": 4, "radius": "sm" } }, "circle": { "root": { "size": 10, "radius": "full" } }, "block": { "root": { "height": 24, "radius": "lg" } } } }, "states": ["default"], "code": { "file": "skeleton.tsx", "shape": "classes", "template": "card-like", "extra": "animate-pulse motion-reduce:animate-none" } }, { "$schema": "mbank/component@1", "name": "spinner", "title": "Spinner", "figma": { "name": "spinner", "key": "03ca97e314c9e429cb882a5f42b978718bc3070d", "nodeId": "2153:1584" }, "parts": ["root"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "sm" } }, "base": { "root": { "radius": "full", "border-width": 2, "border": "brand" } }, "variants": { "size": { "sm": { "root": { "size": 4 } }, "md": { "root": { "size": 5 } }, "lg": { "root": { "size": 6 } } } }, "states": ["default"], "code": { "file": "spinner.tsx", "template": "card-like", "extra": "shrink-0 animate-spin motion-reduce:animate-none", "overrides": { "root": { "radius": null, "border-width": null, "border": null } } } }, { "$schema": "mbank/component@1", "name": "stepper-step", "title": "Stepper step", "figma": { "name": "item-stepper-basic", "key": "954b3a3b55fce287426091c632d9f1e6e84b1a13", "nodeId": "3098:7661" }, "parts": ["root", "marker", "number", "label", "description"], "anatomy": { "marker": { "kind": "frame", "layer": "Marker" }, "number": { "kind": "text", "layer": "Number", "sample": "2", "parent": "marker" }, "label": { "kind": "text", "layer": "Label", "sample": "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430" }, "description": { "kind": "text", "layer": "Description", "sample": "\u0434\u043E 2 \u0434\u043D\u0435\u0439" } }, "props": { "status": { "values": ["done", "current", "upcoming"], "default": "upcoming" } }, "base": { "root": { "align": "center", "gap": 2, "py": 2, "text": "base", "fg": "foreground" }, "marker": { "size": 8, "radius": "full", "align": "center" }, "number": { "text": "sm", "weight": "medium" }, "description": { "text": "caption", "fg": "muted-foreground" } }, "variants": { "status": { "done": { "marker": { "bg": "status-success-muted" }, "number": { "fg": "status-success" } }, "current": { "root": { "weight": "medium" }, "marker": { "bg": "status-success" }, "number": { "fg": "static-light" } }, "upcoming": { "root": { "fg": "muted-foreground" }, "marker": { "bg": "soft" }, "number": { "fg": "muted-foreground" } } } }, "states": ["default"], "code": { "file": "stepper-step.tsx", "template": "card-like", "parts": { "marker": "*:data-[slot=stepper-step-marker]", "number": "**:data-[slot=stepper-step-number]" }, "extra": "inline-flex min-w-0 *:data-[slot=stepper-step-marker]:inline-flex *:data-[slot=stepper-step-marker]:shrink-0 *:data-[slot=stepper-step-marker]:justify-center", "figmaOnly": ["label", "description"] } }, { "$schema": "mbank/component@1", "name": "switch", "title": "Switch", "parts": ["root", "thumb"], "anatomy": { "root": { "width": 44 } }, "props": {}, "base": { "root": { "border-width": 2, "height": 6, "radius": "full", "opacity:disabled": 50, "bg:checked": "brand", "bg:unchecked": "surface-3", "align": "start", "focus-ring": "ring/30", "bg": "surface-3", "px": 0.5, "align:checked": "end" }, "thumb": { "size": 5, "radius": "full", "bg": "background" } }, "variants": {}, "states": ["default", "focus", "disabled", "checked", "unchecked"], "code": { "file": "switch.tsx", "shape": "classes", "template": "button-like", "modifiers": { "checked": "data-[state=checked]", "unchecked": "data-[state=unchecked]" }, "extra": "peer inline-flex w-10 shrink-0 border-transparent transition-colors outline-none disabled:cursor-not-allowed aria-invalid:ring-[3px] aria-invalid:ring-border-destructive/30", "figmaOnly": ["thumb"], "overrides": { "root": { "align": "center", "align:checked": null, "bg": null, "px": null } } } }, { "$schema": "mbank/component@1", "name": "tabbar-item", "title": "Tabbar item", "figma": { "name": "Tabbar item" }, "parts": ["root", "icon", "label"], "anatomy": { "root": { "width": 80 }, "icon": { "kind": "icon", "icon": "home" }, "label": { "kind": "text", "layer": "Label", "sample": "\u0413\u043B\u0430\u0432\u043D\u0430\u044F" } }, "props": {}, "base": { "root": { "layout": "column", "align": "center", "gap": 1, "px": 2, "py": 2, "text": "2xs", "weight": "medium", "fg": "muted-foreground", "fg:selected": "brand-text", "focus-ring": "ring/30" }, "icon": { "size": 6 } }, "variants": {}, "states": ["default", "selected"], "code": { "file": "tabbar-item.tsx", "template": "button-like", "modifiers": { "selected": "aria-[current=page]" }, "parts": { "icon": "[&_svg]" }, "extra": "min-w-0 flex-1 justify-center transition-colors outline-none [&_svg]:shrink-0", "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "table-cell", "title": "Table cell", "figma": { "name": "TableCell", "key": "75d931d4c1075a08c944e2a7ba1b34b1c4e787d0", "nodeId": "1309:22504" }, "parts": ["root", "text"], "anatomy": { "root": { "width": 160 }, "text": { "sample": "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435" } }, "props": {}, "base": { "root": { "height": 11, "px": 3, "py": 3, "text": "sm" } }, "variants": {}, "states": ["default"], "code": { "file": "table.tsx", "shape": "classes", "template": "card-like", "extra": "align-middle leading-5 whitespace-nowrap tabular-nums [&:has([role=checkbox])]:pr-0" } }, { "$schema": "mbank/component@1", "name": "table-head", "title": "Table head", "figma": { "name": "item/cell/header", "key": "e28abae96eaece6a3a3ca39eb048b04f138c2c0c", "nodeId": "1113:46703" }, "parts": ["root", "text", "icon"], "anatomy": { "root": { "width": 160, "sides": ["bottom"] }, "text": { "kind": "text", "layer": "Text", "sample": "\u041A\u043B\u0438\u0435\u043D\u0442" }, "icon": { "kind": "icon", "icon": "chevron" } }, "props": { "sort": { "values": ["none", "asc", "desc"], "default": "none" } }, "base": { "root": { "gap": 1, "height": 11, "px": 3, "text": "sm", "weight": "medium", "fg": "muted-foreground", "border-width": 1, "border": "border" }, "icon": { "size": 4, "fg": "muted-foreground" } }, "variants": { "sort": { "none": { "icon": { "hidden": true } }, "asc": { "root": { "fg": "foreground" }, "icon": { "fg": "foreground" } }, "desc": { "root": { "fg": "foreground" }, "icon": { "fg": "foreground" } } } }, "states": ["default"], "code": { "file": "table.tsx", "shape": "classes", "template": "card-like", "extra": "text-left align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", "figmaOnly": ["icon"], "overrides": { "root": { "align": null, "border": null, "border-width": null } } } }, { "$schema": "mbank/component@1", "name": "tabs-list", "title": "Tabs list", "figma": { "name": "segment", "key": "f28915a7224a6ba85128b9cbab0b9d706c9285a8", "nodeId": "2371:564" }, "parts": ["root", "tab-1", "tab-2", "tab-3"], "anatomy": { "tab-1": { "kind": "instance", "component": { "name": "Tabs trigger" }, "sample": "\u0412\u0441\u0435" }, "tab-2": { "kind": "instance", "component": { "name": "Tabs trigger" }, "sample": "\u041C\u043E\u0438" }, "tab-3": { "kind": "instance", "component": { "name": "Tabs trigger" }, "sample": "\u0410\u0440\u0445\u0438\u0432" } }, "props": { "variant": { "values": ["segment", "outline", "line"], "default": "segment" } }, "base": { "root": { "align": "center", "px": 1, "py": 1 } }, "variants": { "variant": { "segment": { "root": { "gap": 1, "radius": "md", "bg": "muted" } }, "outline": { "root": { "gap": 2 } }, "line": { "root": { "gap": 6, "border": "border" } } } }, "states": ["default"], "code": { "file": "tabs.tsx", "export": "tabsListVariants", "template": "card-like", "extra": "group/tabs-list inline-flex w-fit", "extras": { "variant=segment": "p-1", "variant=line": "border-b" }, "overrides": { "root": { "px": null, "py": null } } } }, { "$schema": "mbank/component@1", "name": "tabs-trigger", "title": "Tabs trigger", "figma": { "name": "Item / segmentButtons", "key": "d3dce4a16063872d9bd8a43a3a4901ca546452a5", "nodeId": "2370:4860" }, "parts": ["root", "icon", "label"], "props": { "variant": { "values": ["segment", "outline", "line"], "default": "segment" } }, "base": { "root": { "height": 9, "gap": 2, "px": 3, "text": "sm", "weight": "medium", "fg": "muted-foreground", "fg:hover": "foreground", "fg:disabled": "disabled-foreground", "align": "center", "focus-ring": "ring/30" }, "icon": { "size": 4, "hidden": true } }, "variants": { "variant": { "segment": { "root": { "radius": "sm", "bg:selected": "background", "fg:selected": "foreground", "shadow:selected": "xs" } }, "outline": { "root": { "radius": "md", "border-width": 1, "border": "border", "border:selected": "secondary", "bg:selected": "secondary", "fg:selected": "secondary-foreground" } }, "line": { "root": { "px": 0, "border:selected": "brand", "fg:selected": "foreground" } } } }, "states": ["default", "hover", "focus", "disabled", "selected"], "code": { "file": "tabs.tsx", "shape": "classes", "template": "button-like", "parts": { "icon": "[&_svg]" }, "modifiers": { "selected": "data-[state=active]" }, "prefix": { "variant": "group-data-[variant={value}]/tabs-list" }, "extra": "inline-flex justify-center whitespace-nowrap transition-colors outline-none disabled:pointer-events-none [&_svg]:shrink-0", "extras": { "variant=line": "-mb-px border-b-2 border-transparent" }, "figmaOnly": ["label"] } }, { "$schema": "mbank/component@1", "name": "textarea", "title": "Textarea", "figma": { "name": "TextArea", "key": "f5e8ed2faaef70b5702fa5e0f70d9c65a370a8ed", "nodeId": "3069:1804" }, "parts": ["root", "placeholder"], "props": {}, "base": { "root": { "min-height": 24, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "py": 2.5, "text": "sm", "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "border:invalid": "border-destructive", "layout": "row", "focus-ring": "ring/30" }, "placeholder": { "fg": "muted-foreground" } }, "variants": {}, "states": ["default", "hover", "focus", "disabled", "invalid"], "code": { "file": "textarea.tsx", "shape": "classes", "template": "input-like", "parts": { "placeholder": "placeholder" }, "extra": "field-sizing-content w-full min-w-0 transition-colors outline-none disabled:pointer-events-none aria-invalid:ring-border-destructive/20" } }, { "$schema": "mbank/component@1", "name": "toast", "title": "Toast", "figma": { "name": "toast", "key": "17ef4420d2a9d9159bfc9f5668936bd87fdb216a", "nodeId": "4316:3805" }, "parts": ["root", "icon", "title", "description"], "anatomy": { "root": { "width": 400 }, "icon": { "kind": "icon", "icon": "info" }, "title": { "kind": "text", "layer": "Title", "sample": "\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430", "fill": true }, "description": { "kind": "text", "layer": "Description", "sample": "\u0421\u0442\u0430\u0442\u0443\u0441 \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u0447\u0435\u0440\u0435\u0437 \u043C\u0438\u043D\u0443\u0442\u0443", "fill": true } }, "props": { "type": { "values": ["default", "success", "error"], "default": "default" } }, "base": { "root": { "layout": "column", "align": "start", "gap": 1, "px": 4, "py": 4, "radius": "md", "border-width": 1, "border": "border", "bg": "card", "fg": "foreground", "text": "sm", "shadow": "notification" }, "icon": { "size": 5, "fg": "soft-foreground" }, "title": { "text": "base", "weight": "bold" }, "description": { "fg": "muted-foreground" } }, "variants": { "type": { "default": {}, "success": { "icon": { "fg": "success-text" }, "title": { "fg": "success-text" } }, "error": { "icon": { "fg": "destructive-text" }, "title": { "fg": "destructive-text" } } } }, "states": ["default"], "code": { "file": "sonner.tsx", "shape": "classes", "template": "card-like", "extra": "group/toast w-full [&_[data-icon]]:mt-0.5 [&_[data-icon]]:size-5 [&_[data-icon]]:shrink-0", "figmaOnly": ["icon", "title", "description"], "overrides": { "root": { "layout": "row", "gap": 3 } } } }, { "$schema": "mbank/component@1", "name": "tooltip", "title": "Tooltip", "figma": { "name": "tooltip", "key": "cb5b8f83bc82080cd014efcd0b3778415b083b36", "nodeId": "2266:2623" }, "parts": ["root", "label"], "anatomy": { "label": { "kind": "text", "layer": "Label", "sample": "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430" } }, "props": {}, "base": { "root": { "align": "center", "px": 3, "py": 2, "radius": "sm", "bg": "surface-inverse", "fg": "inverse-foreground", "text": "xs", "shadow": "tooltip" } }, "variants": {}, "states": ["default"], "code": { "file": "tooltip.tsx", "shape": "classes", "template": "card-like", "extra": "z-(--z-tooltip) max-w-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none", "overrides": { "root": { "align": null } } } }];

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

  // ../skills/mbank-figma-patterns/references/tokens.json
  var tokens_default = {
    source: "Full-seat read of Foundation, Mobile KIT and Web components via use_figma (devmd8, 2026-10-09)",
    fonts: {
      availableToMCP: [
        "Nunito",
        "Nunito Sans",
        "Inter",
        "SF Pro",
        "SF Pro Rounded",
        "SF Compact",
        "Roboto"
      ],
      missing: [
        "Inter Mbank",
        "SF UI Display"
      ],
      web: "Inter Mbank",
      mobile: "Nunito (mobile collection modes: Nunito | Inter -> Inter Mbank)"
    },
    theme: {
      collection: "2.theme",
      key: "06493676b1b271285f2ff7d444d6ef08e9e0709c",
      modes: [
        "light",
        "dark"
      ],
      vars: [
        {
          name: "brand/bank/default",
          key: "12e4e4596b58af08ecfc0c67c3075266c235e6d8",
          light: "#16a34a",
          dark: "#189547",
          aliasLight: "green/70 solid"
        },
        {
          name: "brand/bank/hover",
          key: "171014cab90121189edc02101a38fc444d0b2084",
          light: "#189547",
          dark: "#22c55e",
          aliasLight: "green/75 solid"
        },
        {
          name: "brand/bank/active",
          key: "dee979923a63b7e630b81bd9928f1d0400c98800",
          light: "#16a34a",
          dark: "#22c55e",
          aliasLight: "green/70 solid"
        },
        {
          name: "brand/bank/on-accent",
          key: "03bc6482935f3fc98465a9b9e879fd12b523a9f6",
          light: "#ffffff",
          dark: "#ffffff",
          aliasLight: "white/100"
        },
        {
          name: "brand/bank/on-accent-muted",
          key: "7c91fabda64717d68fe0686136acd5cc45959f59",
          light: "#a9b4bc",
          dark: "#a9b4bc",
          aliasLight: "black/30 solid"
        },
        {
          name: "brand/bank/container-muted",
          key: "3791df61bfbcee5205255396ceb79c3f821dfff3",
          light: "#f0f3f4",
          dark: "#3f4146",
          aliasLight: "black/15 solid"
        },
        {
          name: "brand/bank/ghost-default",
          key: "4f19513acba69cbd31ef0b5e741c6b9345281b0a",
          light: "#f0fdf4",
          dark: "#16a34a1a",
          aliasLight: "green/10 solid"
        },
        {
          name: "brand/bank/ghost-hover",
          key: "8d57d4b3cb74579ea3e7d9c671348727e0f0abb6",
          light: "#e8fcee",
          dark: "#16a34a1a",
          aliasLight: "green/15 solid"
        },
        {
          name: "brand/bank/ghost-active",
          key: "a741becb0d755013843167392086c2ca753a493d",
          light: "#f0fdf4",
          dark: "#16a34a1a",
          aliasLight: "green/10 solid"
        },
        {
          name: "brand/bank/ghost-on-accent",
          key: "94f6942d3a1762a86c5bddbeb6437636689ad77c",
          light: "#16a34a",
          dark: "#189547",
          aliasLight: "green/70 solid"
        },
        {
          name: "brand/bank/ghost-on-accent-muted",
          key: "03c5d1cf769c90977351b9c41523e781d68a97b0",
          light: "#86efac",
          dark: "#16a34a1a",
          aliasLight: "green/40 solid"
        },
        {
          name: "brand/bank/ghost-container-muted",
          key: "9928396b12c637c90694aed070e0fd4c0ccd8084",
          light: "#f0fdf4",
          dark: "#16a34a1a",
          aliasLight: "green/10 solid"
        },
        {
          name: "brand/kassa/default",
          key: "5dd34baabc8a192769410ef7b2102a257b71892e",
          light: "#2563eb",
          dark: "#3b82f6",
          aliasLight: "blue/70 solid"
        },
        {
          name: "brand/kassa/hover",
          key: "9f6d43bd181b1af0efecb8ddd0d252fcad933889",
          light: "#1d4ed8",
          dark: "#1d4ed8",
          aliasLight: "blue/80 solid"
        },
        {
          name: "brand/kassa/active",
          key: "9495ccf8001c3651f0e8d416a7e58971c12eb0c7",
          light: "#1d4ed8",
          dark: "#2563eb",
          aliasLight: "blue/80 solid"
        },
        {
          name: "brand/kassa/on-accent",
          key: "5458fb3049697c6195554f1219b6e44851b24781",
          light: "#ffffff",
          dark: "#ffffff",
          aliasLight: "black/0 solid"
        },
        {
          name: "brand/kassa/on-accent-muted",
          key: "2323b160e675d6180d2e3275dec131497579a96c",
          light: "#a9b4bc",
          dark: "#a9b4bc",
          aliasLight: "black/30 solid"
        },
        {
          name: "brand/kassa/container-muted",
          key: "778497db53d43e3cee8b37992455d0b03c81857e",
          light: "#f0f3f4",
          dark: "#3f4146",
          aliasLight: "black/15 solid"
        },
        {
          name: "brand/kassa/ghost-default",
          key: "6833a82d76193190f62f27af4700d5d8482550aa",
          light: "#dbeafe",
          dark: "#13203d",
          aliasLight: "blue/20 solid"
        },
        {
          name: "brand/kassa/ghost-hover",
          key: "4db3961a3fc1eab8c783e7bc33ad67974962c868",
          light: "#bfdbfe",
          dark: "#162c5d",
          aliasLight: "blue/30 solid"
        },
        {
          name: "brand/kassa/ghost-active",
          key: "e1c384fb0fde2eeb0ca32843664a91a4bd64df89",
          light: "#dbeafe",
          dark: "#173168",
          aliasLight: "blue/20 solid"
        },
        {
          name: "brand/kassa/ghost-on-accent",
          key: "948c2e82b98ffb2b4d8bdcdf5f0d2dfed35e095d",
          light: "#1d4ed8",
          dark: "#2563eb",
          aliasLight: "blue/80 solid"
        },
        {
          name: "brand/kassa/ghost-on-accent-muted",
          key: "3644fb31a91b287acfeab9a77abca1918287b784",
          light: "#3b82f6",
          dark: "#60a5fa",
          aliasLight: "blue/60 solid"
        },
        {
          name: "brand/kassa/ghost-container-muted",
          key: "14ff6aab7166f335ad0e33ce5767a5af15ff6304",
          light: "#eff6ff",
          dark: "#101727",
          aliasLight: "blue/10 solid"
        },
        {
          name: "brand/travel/default",
          key: "5e8ca0af3975d72bf9f2861a0aba97ff90dfe723",
          light: "#60a5fa",
          dark: "#3b82f6",
          aliasLight: "blue/50 solid"
        },
        {
          name: "brand/artwin/default",
          key: "206601d34fec5059fc773cf49ce0338ac328c1ec",
          light: "#fddb2b",
          dark: "#f7c21c",
          aliasLight: "yellow/50 solid"
        },
        {
          name: "brand/artwin/hover",
          key: "c8025d51a4c30dae7e774345686ca04ee19e1e86",
          light: "#f7c21c",
          dark: "#fddb2b",
          aliasLight: "yellow/60 solid"
        },
        {
          name: "brand/artwin/active",
          key: "561fa0768650b686d1b4672a07510da9bc8988a6",
          light: "#fddb2b",
          dark: "#fddb2b",
          aliasLight: "yellow/50 solid"
        },
        {
          name: "brand/artwin/on-accent",
          key: "d4042687755e2092881eab03e6c41e15208017dd",
          light: "#0e0f11",
          dark: "#a9b4bc",
          aliasLight: "black/97 solid"
        },
        {
          name: "brand/artwin/on-accent-muted",
          key: "b1afb8a55de6093d959d3684b1d3728ea6272208",
          light: "#a9b4bc",
          dark: "#3f4146",
          aliasLight: "black/30 solid"
        },
        {
          name: "brand/artwin/container-muted",
          key: "32266133ec30b3f616728b6271c8ca9deeb2a787",
          light: "#f0f3f4",
          dark: "#f0f3f4",
          aliasLight: "black/15 solid"
        },
        {
          name: "brand/artwin/ghost-default",
          key: "bddcc2f203a19cdb1225e78b72cd033e720cced2",
          light: "#fef7b4",
          dark: "#2563eb33",
          aliasLight: "yellow/20 solid"
        },
        {
          name: "brand/artwin/ghost-hover",
          key: "f1b946191ef9d1f12a348ad700f6b489d5351b07",
          light: "#fef08a",
          dark: "#2563eb33",
          aliasLight: "yellow/30 solid"
        },
        {
          name: "brand/artwin/ghost-active",
          key: "727a5ea0cd028ba0cf9ceaf372b01922abe5f9fc",
          light: "#fef7b4",
          dark: "#2563eb33",
          aliasLight: "yellow/20 solid"
        },
        {
          name: "brand/artwin/ghost-on-accent",
          key: "97154a2943f9136c160c0d7ec7cddab4c3a7f80d",
          light: "#d9a607",
          dark: "#2563eb33",
          aliasLight: "yellow/70 solid"
        },
        {
          name: "brand/artwin/ghost-on-accent-muted",
          key: "eeae26c52d475650a250ab53ef592e6071ce05ca",
          light: "#f7c21c",
          dark: "#2563eb33",
          aliasLight: "yellow/60 solid"
        },
        {
          name: "brand/artwin/ghost-container-muted",
          key: "90447f587bce8232b882b3a2031e2b8282262a30",
          light: "#fefce8",
          dark: "#2563eb33",
          aliasLight: "yellow/10 solid"
        },
        {
          name: "brand/travel/hover",
          key: "b0d9734725216fd64b5b1c156ade8bae29856d5c",
          light: "#4d9af9",
          dark: "#3b82f6",
          aliasLight: "blue/55 solid"
        },
        {
          name: "brand/travel/active",
          key: "9622bdc1ea284c054c23c0cfb154ceb268983fed",
          light: "#60a5fa",
          dark: "#60a5fa",
          aliasLight: "blue/50 solid"
        },
        {
          name: "brand/travel/on-accent",
          key: "207149bf7d9b0f34ae31970e3583d10e85ea22e6",
          light: "#ffffff",
          dark: "#ffffff",
          aliasLight: "black/0 solid"
        },
        {
          name: "brand/travel/on-accent-muted",
          key: "4acd783d4e7bb82843a00d7e56fd6ba5f0d7e25a",
          light: "#a9b4bc",
          dark: "#a9b4bc",
          aliasLight: "black/30 solid"
        },
        {
          name: "brand/travel/container-muted",
          key: "411a2f33bb28b640e313538e383c1ce6e59a73cc",
          light: "#f0f3f4",
          dark: "#3f4146",
          aliasLight: "black/15 solid"
        },
        {
          name: "brand/travel/ghost-default",
          key: "52ac5354f5e1665977d6fe52790c5d05e664dbe9",
          light: "#eff6ff",
          dark: "#2563eb33",
          aliasLight: "blue/10 solid"
        },
        {
          name: "brand/travel/ghost-hover",
          key: "b18a86f98a0f8b2578c0f4b63681ba8378ef3e33",
          light: "#e5f1ff",
          dark: "#2563eb33",
          aliasLight: "blue/15 solid"
        },
        {
          name: "brand/travel/ghost-active",
          key: "bacc51429a04e6af5666b05bf65168abc2b3977b",
          light: "#eff6ff",
          dark: "#2563eb33",
          aliasLight: "blue/10 solid"
        },
        {
          name: "brand/travel/ghost-on-accent-muted",
          key: "545b7b1f5ed08e1bd2f8515913ac2c431d548126",
          light: "#93c5fd",
          dark: "#2563eb33",
          aliasLight: "blue/40 solid"
        },
        {
          name: "brand/travel/ghost-container-muted",
          key: "3f6e7c1341b4523a99e1eed9b752130c9d2e719c",
          light: "#eff6ff",
          dark: "#2563eb33",
          aliasLight: "blue/10 solid"
        },
        {
          name: "brand/travel/ghost-on-accent",
          key: "7c076c66db830c6de58eff2ef221cc41592e2e88",
          light: "#60a5fa",
          dark: "#2563eb33",
          aliasLight: "blue/50 solid"
        },
        {
          name: "accent/primary/default",
          key: "2547333051bd1cffc8f9f2aba391bee960d750c9",
          light: "#fddb2b",
          dark: "#f7c21c",
          aliasLight: "yellow/50 solid"
        },
        {
          name: "neutral/primary/default",
          key: "082d1082b3a083bb57b8f0a9e7f2646e1285beed",
          light: "#17191d",
          dark: "#26292e",
          aliasLight: "black/95 solid"
        },
        {
          name: "neutral/primary/hover",
          key: "2cb95313acd7575d217d9885f6a3ba0292e9fdd8",
          light: "#26292e",
          dark: "#464e58",
          aliasLight: "black/90 solid"
        },
        {
          name: "neutral/primary/active",
          key: "847bd8512d6dc19207b6b80674e053dd867f3df1",
          light: "#17191d",
          dark: "#464e58",
          aliasLight: "black/95 solid"
        },
        {
          name: "neutral/primary/on-accent",
          key: "850d035c748c1bafefc3fb2f9ce21a77f1e16afb",
          light: "#0e0f11f2",
          dark: "#0e0f11",
          aliasLight: "black/95"
        },
        {
          name: "neutral/primary/container-muted",
          key: "c1195d122ebce15eca2981b918e9fcbbaeca9f22",
          light: "#f0f3f4",
          dark: "#3a3c41",
          aliasLight: "black/15 solid"
        },
        {
          name: "neutral/primary/on-accent-muted",
          key: "1a6dcc903b732c0860254eb87f608d81914200e9",
          light: "#93a0a9",
          dark: "#0e0f11f2",
          aliasLight: "black/35 solid"
        },
        {
          name: "neutral/secondary/flat default/default",
          key: "e964071fb5ae6d4ff91c17ec0bdc777265006f83",
          light: "#e0e5e8",
          dark: "#26292e",
          aliasLight: "black/20 solid"
        },
        {
          name: "neutral/secondary/flat default/hover",
          key: "17c06fabfe9e30851abdf22a9adecd9286d7eefc",
          light: "#d7dce1",
          dark: "#1d2024",
          aliasLight: "black/22 solid"
        },
        {
          name: "neutral/secondary/flat default/active",
          key: "f3ad249ef22b723653e4a2d79e13784ec18f9fec",
          light: "#d7dce1",
          dark: "#1d2024",
          aliasLight: "black/22 solid"
        },
        {
          name: "neutral/secondary/flat default/on-accent",
          key: "7e997f25e8e9794d5ff681a827576b6dbc3bb36b",
          light: "#0e0f11",
          dark: "#f0f3f4",
          aliasLight: "black/97 solid"
        },
        {
          name: "neutral/secondary/flat default/container-muted",
          key: "b4c2ed6c82f71751ffb7495563974025e0bc4cb8",
          light: "#f6f8f9",
          dark: "#3a3c41",
          aliasLight: "black/5 solid"
        },
        {
          name: "neutral/secondary/flat default/on-accent-muted",
          key: "d74e7c9755451432691a266818d2ab5e0210da66",
          light: "#5d6c79",
          dark: "#a9b4bc",
          aliasLight: "black/63 solid"
        },
        {
          name: "neutral/secondary/flat/default",
          key: "3003ad655612547f33197428ae0b4f9442a02caa",
          light: "#ffffff00",
          dark: "#26292e",
          aliasLight: null
        },
        {
          name: "neutral/secondary/flat/hover",
          key: "2a4fa1126c90e06b620dabe023ab5b2844c58d80",
          light: "#d7dce1",
          dark: "#20232700",
          aliasLight: "black/22 solid"
        },
        {
          name: "neutral/secondary/flat/active",
          key: "1d5e1a28632b63519545234b2129f87a21ca9fb7",
          light: "#d7dce1",
          dark: "#20232700",
          aliasLight: "black/22 solid"
        },
        {
          name: "neutral/secondary/flat/on-accent",
          key: "9a09df272e93597bd204c33cbad9cb9c27ce75c8",
          light: "#0e0f11",
          dark: "#f0f3f4",
          aliasLight: "black/97 solid"
        },
        {
          name: "neutral/secondary/flat/container-muted",
          key: "08e4db70fed2d45423b386e1cc89f04d06c27f6e",
          light: "#ffffff00",
          dark: "#3a3c4100",
          aliasLight: null
        },
        {
          name: "neutral/secondary/flat/on-accent-muted",
          key: "7aecf76a9e77147f2b13df5b053d9d3d29e41e4a",
          light: "#0e0f11",
          dark: "#a9b4bc",
          aliasLight: "black/97 solid"
        },
        {
          name: "neutral/secondary/flat filled/default",
          key: "8807556f95b98cd30cac23158e361dbbabe046ee",
          light: "#e0e5e8",
          dark: "#26292e",
          aliasLight: "black/20 solid"
        },
        {
          name: "neutral/secondary/flat filled/hover",
          key: "8ab173cead104575db05fe41799b8ed78dba3db3",
          light: "#d7dce1",
          dark: "#202327",
          aliasLight: "black/22 solid"
        },
        {
          name: "neutral/secondary/flat filled/active",
          key: "c953dea4173c81ed5e3874f190031366b9920be2",
          light: "#d7dce1",
          dark: "#202327",
          aliasLight: "black/22 solid"
        },
        {
          name: "neutral/secondary/flat filled/on-accent",
          key: "e42d34d9f287b5a0a54ec77db20ba1b24e39ec42",
          light: "#0e0f11",
          dark: "#f0f3f4",
          aliasLight: "black/97 solid"
        },
        {
          name: "neutral/secondary/flat filled/container-muted",
          key: "bc6573643235e1a1923710a58642dd716bccb913",
          light: "#0e0f11f2",
          dark: "#3a3c41",
          aliasLight: "black/95"
        },
        {
          name: "neutral/secondary/flat filled/on-accent-muted",
          key: "dc77f3ec3c4713a12829aae2358650ea69940b3d",
          light: "#0e0f11",
          dark: "#a9b4bc",
          aliasLight: "black/97 solid"
        },
        {
          name: "neutral/secondary/outline/default",
          key: "2461f38b7d19f180954432c22346812630cf0a0d",
          light: "#e0e5e8",
          dark: "#26292e",
          aliasLight: "black/20 solid"
        },
        {
          name: "neutral/secondary/outline/hover",
          key: "02e23e7b06ace1f4d2a0bc450cb5de50589f9ce0",
          light: "#cad1d7",
          dark: "#202327",
          aliasLight: "black/24 solid"
        },
        {
          name: "neutral/secondary/outline/active",
          key: "9b0d66900ca306f6b9dff2c1aaf67fe11bb4f875",
          light: "#cad1d7",
          dark: "#202327",
          aliasLight: "black/24 solid"
        },
        {
          name: "neutral/secondary/outline/on-accent",
          key: "02385f1e3d8489893bc403b83af0b3dc8b8859be",
          light: "#0e0f11",
          dark: "#202327",
          aliasLight: "black/97 solid"
        },
        {
          name: "neutral/secondary/outline/on-accent-muted",
          key: "0a5b50116e25662756a61e96bca73f911e26e273",
          light: "#0e0f11",
          dark: "#0e0f11f2",
          aliasLight: "black/97 solid"
        },
        {
          name: "neutral/secondary/outline/container-muted",
          key: "4501ea3188e6502c04266d82c9ad49d5bdfbfbd2",
          light: "#f6f8f9",
          dark: "#26292e",
          aliasLight: "black/5 solid"
        },
        {
          name: "neutral/negative/default",
          key: "7c507104d0f9c48829ed82d10239cee95eedc293",
          light: "#feebeb",
          dark: "#b91c1c",
          aliasLight: "red/10 solid"
        },
        {
          name: "neutral/negative/hover",
          key: "da22c2b67af546c841c5c3560105c00886474bb6",
          light: "#fee2e2",
          dark: "#b91c1c",
          aliasLight: "red/20 solid"
        },
        {
          name: "neutral/negative/active",
          key: "dd47676b678574b8509943a8c7743225c332a9e5",
          light: "#fee2e2",
          dark: "#b91c1c",
          aliasLight: "red/20 solid"
        },
        {
          name: "neutral/negative/on-accent",
          key: "804f284adcaa6af59e8169642d3e5703cecf3dd3",
          light: "#ef4444",
          dark: "#0e0f11f2",
          aliasLight: "red/60 solid"
        },
        {
          name: "neutral/negative/container-muted",
          key: "6059caa72c3269f8bcb3a367900e49007375cabf",
          light: "#feebeb",
          dark: "#fca5a5",
          aliasLight: "red/10 solid"
        },
        {
          name: "neutral/negative/on-accent-muted",
          key: "cf3c3a71b0bdd39e8020811f316748c1f0c4c3b0",
          light: "#fca5a5",
          dark: "#0e0f11f2",
          aliasLight: "red/40 solid"
        },
        {
          name: "neutral/positive/default",
          key: "5df7f0ddd95348768ad8c4fe9d11d05951fe5f43",
          light: "#ecfdf5",
          dark: "#ecfdf5",
          aliasLight: "emerald/10 solid"
        },
        {
          name: "neutral/positive/hover",
          key: "cf1a095e7675eaa3cff748a29ccd29c994258cd7",
          light: "#dffced",
          dark: "#dffced",
          aliasLight: "emerald/15 solid"
        },
        {
          name: "neutral/positive/active",
          key: "79bd7dfd020803a06a136ba2fd29e6d33c74c556",
          light: "#dffced",
          dark: "#dffced",
          aliasLight: "emerald/15 solid"
        },
        {
          name: "neutral/positive/on-accent",
          key: "5d9167092a312b8188d60a68d6098059f9c1a525",
          light: "#0fa976",
          dark: "#0fa976",
          aliasLight: "emerald/65 solid"
        },
        {
          name: "neutral/positive/container-muted",
          key: "c715c4e2fd2d7eaa0850a66760e7f676a948c8b3",
          light: "#ecfdf5",
          dark: "#ecfdf5",
          aliasLight: "emerald/10 solid"
        },
        {
          name: "neutral/positive/on-accent-muted",
          key: "595458ab8622a2b9f53bbefb1d9f31f70d90b678",
          light: "#0fa976",
          dark: "#0fa976",
          aliasLight: "emerald/65 solid"
        },
        {
          name: "neutral/static/default",
          key: "448af814ad20db49ead9be6b7ef02e55e116bdaf",
          light: "#0e0f11",
          dark: "#0e0f11",
          aliasLight: "black/97 solid"
        },
        {
          name: "neutral/static/hover",
          key: "106cfb25e7fd8074b7e6d7900eda84a47d1aa172",
          light: "#26292e",
          dark: "#26292e",
          aliasLight: "black/90 solid"
        },
        {
          name: "neutral/static/active",
          key: "7fe368c6595cdfb2ab5e1096ae2ab83fc23d303c",
          light: "#0e0f11",
          dark: "#0e0f11",
          aliasLight: "black/97 solid"
        },
        {
          name: "neutral/static/on-accent",
          key: "854005feab469595b9586d967f704ff4a955f8fc",
          light: "#ffffff",
          dark: "#0e0f11f2",
          aliasLight: "black/0 solid"
        },
        {
          name: "neutral/static/on-accent-muted",
          key: "e229789d4ca46d2865816a119a463b2744abbfd1",
          light: "#93a0a9",
          dark: "#93a0a9",
          aliasLight: "black/35 solid"
        },
        {
          name: "neutral/static/container-muted",
          key: "97d53b3d31d05155981ddb40fc88581dba8812a4",
          light: "#f0f3f4",
          dark: "#f0f3f4",
          aliasLight: "black/15 solid"
        },
        {
          name: "accent/primary/hover",
          key: "6b557bc7821bb9fc5b0d2b2fe933bbc9d9ed23c8",
          light: "#f7c21c",
          dark: "#fddb2b",
          aliasLight: "yellow/60 solid"
        },
        {
          name: "accent/primary/active",
          key: "7dad401d284a0665062ccdb2af0f89b898fa911a",
          light: "#fddb2b",
          dark: "#fddb2b",
          aliasLight: "yellow/50 solid"
        },
        {
          name: "accent/primary/on-accent",
          key: "5e755c94dc67c5dea2ec450f7eb50c4223859c47",
          light: "#0e0f11",
          dark: "#0e0f11",
          aliasLight: "black/97 solid"
        },
        {
          name: "accent/primary/on-accent-muted",
          key: "cdd021e79fa64da6e795f524c455208a5dad21f8",
          light: "#0e0f11",
          dark: "#0e0f11",
          aliasLight: "black/97 solid"
        },
        {
          name: "accent/primary/container-muted",
          key: "f51910b07f47fce154594921a4fc339d6347ab13",
          light: "#fef08a",
          dark: "#fef08a",
          aliasLight: "yellow/30 solid"
        },
        {
          name: "accent/secondary/flat/default",
          key: "da80bc6968b1ae081d2e8152229a27cccc2e200b",
          light: "#f0f3f4",
          dark: "#26292e",
          aliasLight: "black/15 solid"
        },
        {
          name: "accent/secondary/flat/hover",
          key: "d4a319e901a82d17f0007f8554df5be561ab2363",
          light: "#e0e5e8",
          dark: "#3f4146",
          aliasLight: "black/20 solid"
        },
        {
          name: "accent/secondary/flat/active",
          key: "4cc8a214d7a202004df5788a18d6ac8fec612867",
          light: "#f0f3f4",
          dark: "#26292e",
          aliasLight: "black/15 solid"
        },
        {
          name: "accent/secondary/flat/on-accent",
          key: "860e76a24bbea21039e31ddb33af9d61fd62c233",
          light: "#3b82f6",
          dark: "#3b82f6",
          aliasLight: "blue/60 solid"
        },
        {
          name: "accent/secondary/flat/container-muted",
          key: "0c1d4a79f618cd9a4e5af8cf1610a0ae655c2b63",
          light: "#f4f6f7",
          dark: "#3a3c41",
          aliasLight: "black/10 solid"
        },
        {
          name: "accent/secondary/flat/on-accent-muted",
          key: "0fd195a7c5c4fa70d7c5c0350fd57124c5cf8f9b",
          light: "#3b82f6",
          dark: "#0e0f11f2",
          aliasLight: "blue/60 solid"
        },
        {
          name: "accent/negative/default",
          key: "3717327211c6b7f0a3f533f2f0c79f865b529f30",
          light: "#ef4444",
          dark: "#b91c1c",
          aliasLight: "red/60 solid"
        },
        {
          name: "accent/positive/default",
          key: "454762e6ceaea6431078b001351ace25d4e7e9dd",
          light: "#0fa976",
          dark: "#0fa976",
          aliasLight: "emerald/65 solid"
        },
        {
          name: "accent/static/default",
          key: "cc0476ada5bec7d0deac8b51f9ecf77183407a22",
          light: "#ffffff",
          dark: "#ffffff",
          aliasLight: "black/0 solid"
        },
        {
          name: "accent/static/hover",
          key: "94226beb537849177b9556669e1ad5153bc192c2",
          light: "#d7dce1",
          dark: "#d7dce1",
          aliasLight: "black/22 solid"
        },
        {
          name: "accent/static/active",
          key: "292a0dc7347bb1be5b4943ae40cc9e9a0d909ac4",
          light: "#ffffff",
          dark: "#cad1d7",
          aliasLight: "black/0 solid"
        },
        {
          name: "accent/static/on-accent",
          key: "c94073320949e77be47c3ce53eb51d104b5da43c",
          light: "#0e0f11",
          dark: "#0e0f11",
          aliasLight: "black/97 solid"
        },
        {
          name: "accent/static/container-muted",
          key: "89602c2aae0faed3abce2252378c5b5293f6f26c",
          light: "#ffffff",
          dark: "#768793",
          aliasLight: "black/0 solid"
        },
        {
          name: "accent/static/on-accent-muted",
          key: "b27997c1cf48595b74bef839b7383e2788a8683f",
          light: "#0e0f11",
          dark: "#0e0f11",
          aliasLight: "black/97 solid"
        },
        {
          name: "accent/positive/hover",
          key: "6b9599885cefa8bc7cdf2a19f7a9f5629fda1ce4",
          light: "#059669",
          dark: "#059669",
          aliasLight: "emerald/70 solid"
        },
        {
          name: "accent/positive/active",
          key: "9b091443a860ecd5a32379af21a579ffe59c5855",
          light: "#0fa976",
          dark: "#10b981",
          aliasLight: "emerald/65 solid"
        },
        {
          name: "accent/positive/on-accent",
          key: "01b82dea3e963da6e01f4ca08923b0c14511705d",
          light: "#0e0f11f2",
          dark: "#0e0f11f2",
          aliasLight: "black/95"
        },
        {
          name: "accent/positive/container-muted",
          key: "aac4cd3543030c4fd888c73dffa0726b9d1de149",
          light: "#d1fae5",
          dark: "#d1fae5",
          aliasLight: "emerald/20 solid"
        },
        {
          name: "accent/positive/on-accent-muted",
          key: "e109107ddbe665ea5bab26eefcb04d9e203ab60f",
          light: "#0e0f11f2",
          dark: "#0e0f11f2",
          aliasLight: "black/95"
        },
        {
          name: "accent/negative/hover",
          key: "746a41958228054bd386b27501bf85a033dc4891",
          light: "#b91c1c",
          dark: "#b91c1c",
          aliasLight: "red/80 solid"
        },
        {
          name: "accent/negative/active",
          key: "a666254f7ddcc865dc06649724a798da5aaab422",
          light: "#ef4444",
          dark: "#b91c1c",
          aliasLight: "red/60 solid"
        },
        {
          name: "accent/negative/on-accent",
          key: "bc02a16da8fc10b5c20d8700fd21cc782d4af51d",
          light: "#0e0f11f2",
          dark: "#0e0f11f2",
          aliasLight: "black/95"
        },
        {
          name: "accent/negative/container-muted",
          key: "b7c353146262738e83d00afb5765d666379a223c",
          light: "#fca5a5",
          dark: "#fca5a5",
          aliasLight: "red/40 solid"
        },
        {
          name: "accent/negative/on-accent-muted",
          key: "2dc7fc4bfa5698d5e6730e36c4c85aef057ca2db",
          light: "#0e0f11f2",
          dark: "#0e0f11f2",
          aliasLight: "black/95"
        },
        {
          name: "static/light",
          key: "5c4810c36d8078c5314d391514845b5c5828b8df",
          light: "#ffffff",
          dark: "#ffffff",
          aliasLight: "black/0 solid"
        },
        {
          name: "static/dark",
          key: "fbd4bfe877400ffe7e3af5a2572847c03e587e80",
          light: "#0e0f11",
          dark: "#0e0f11",
          aliasLight: "black/97 solid"
        },
        {
          name: "text/brand",
          key: "9182775236adb96970d21e01ce9fbee25834e230",
          light: "#16a34a",
          dark: "#189547",
          aliasLight: "brand/default"
        },
        {
          name: "text/default",
          key: "8af86f380514faeacdc79b7a232d03723fab0bde",
          light: "#0e0f11",
          dark: "#f0f3f4",
          aliasLight: "black/97 solid"
        },
        {
          name: "components/chipsButton/soft/default",
          key: "e4ac0f7453347b568d1792b1bd6b2a236ab9c2c1",
          light: "#e0e5e8",
          dark: "#3f4146",
          aliasLight: "black/20 solid"
        },
        {
          name: "text/soft",
          key: "f729c62f2c73030dcb2f5a7b78984146b05aea2b",
          light: "#40474f",
          dark: "#d7dce1",
          aliasLight: "black/84 solid"
        },
        {
          name: "text/muted",
          key: "8bb44dbea94883e123e8c8999072b7e40886ca68",
          light: "#768793",
          dark: "#768793",
          aliasLight: "black/40 solid"
        },
        {
          name: "components/chipsButton/soft/hover",
          key: "3f881b557413b377c101cd1cf6733d3c6c81fe31",
          light: "#d7dce1",
          dark: "#26292e",
          aliasLight: "black/22 solid"
        },
        {
          name: "text/disabled",
          key: "667c29a1ebfcefbc7be637b6c421c1f6fba79b51",
          light: "#a9b4bc",
          dark: "#5d6c79",
          aliasLight: "black/30 solid"
        },
        {
          name: "components/chipsButton/soft/active",
          key: "d315b1aa94b6c541d0ceb9ab0618564ee7031979",
          light: "#17191d",
          dark: "#4d5661",
          aliasLight: "black/95 solid"
        },
        {
          name: "text/inverse",
          key: "f85ccfae4cfb11d0d3436726babf269a22afdd7e",
          light: "#f4f6f7",
          dark: "#0e0f11",
          aliasLight: "black/10 solid"
        },
        {
          name: "text/link",
          key: "3019aa5c09a3caaa6ef5a60a0aea282d659084ea",
          light: "#3b82f6",
          dark: "#3b82f6",
          aliasLight: "blue/60 solid"
        },
        {
          name: "text/danger",
          key: "c71864d1c0dbe42e85d945e45b2e8b2e07f2873b",
          light: "#ef4444",
          dark: "#b91c1c",
          aliasLight: "accent/negative/default"
        },
        {
          name: "text/positive",
          key: "38f2afee24740dccbb19d9f5bd8488b50973c359",
          light: "#0fa976",
          dark: "#059669",
          aliasLight: "accent/positive/default"
        },
        {
          name: "text/warning",
          key: "863eb2737166b081d843174d16b1842c62eea90c",
          light: "#f97316",
          dark: "#ea580c",
          aliasLight: "border/accent/warning"
        },
        {
          name: "components/chipsButton/light/default",
          key: "c77c6d36c42a1dac30ef4b05a5aade2b509ac1a9",
          light: "#ffffff",
          dark: "#515c69",
          aliasLight: "black/0 solid"
        },
        {
          name: "components/chipsButton/light/hover",
          key: "e8da076d4edb2dc308bd0725bd4434771e8fde82",
          light: "#f4f6f7",
          dark: "#515c69",
          aliasLight: "black/10 solid"
        },
        {
          name: "components/chipsButton/light/active",
          key: "a79bf5e6055a74e21563bba187c89d0f4dc5aadf",
          light: "#17191d",
          dark: "#515c69",
          aliasLight: "black/95 solid"
        },
        {
          name: "background/surface/light",
          key: "6b620b0494f77db47571a4133623011b8f0fe3b5",
          light: "#ffffff",
          dark: "#0e0f11",
          aliasLight: "black/0 solid"
        },
        {
          name: "background/surface/soft",
          key: "9937a9232afab99fdc4fa020576aae016c3d7630",
          light: "#f4f6f7",
          dark: "#17191d",
          aliasLight: "black/10 solid"
        },
        {
          name: "background/onsurface/0",
          key: "597e34eb4635ee8b4625923be7f8b6496f987f1c",
          light: "#ffffff",
          dark: "#26292e",
          aliasLight: "black/0 solid"
        },
        {
          name: "background/global/clear/default",
          key: "9a8e2ee53b78cef5d7a3ecdd6ceb22ebadf564dd",
          light: "#ffffff00",
          dark: "#1b1e22",
          aliasLight: null
        },
        {
          name: "background/global/light/default",
          key: "eea1abcc3330f203d90fec3a838007499cff7997",
          light: "#ffffff",
          dark: "#1b1e22",
          aliasLight: "black/0 solid"
        },
        {
          name: "background/global/light/hover",
          key: "37529e5928f9e857069853b4a5775209092779e5",
          light: "#eaeef0",
          dark: "#40474f",
          aliasLight: "black/17 solid"
        },
        {
          name: "background/global/light/active",
          key: "852d6da2b613c8529cbbc013c3aff18cf60889ff",
          light: "#f0f3f4",
          dark: "#373c42",
          aliasLight: "black/15 solid"
        },
        {
          name: "background/global/light/container-muted",
          key: "50482fc1d0f6450a247148aed6b8b7eed39dd0b0",
          light: "#ffffff00",
          dark: "#40474f",
          aliasLight: null
        },
        {
          name: "background/global/soft/default",
          key: "53a04a552dad4c0b33bbbb141d85db8e91f0e62a",
          light: "#e0e5e8",
          dark: "#373c42",
          aliasLight: "black/20 solid"
        },
        {
          name: "background/global/soft/hover",
          key: "da113c8a57297ff4ccc92c908b9e2e2c0407cad4",
          light: "#eaeef0",
          dark: "#40474f",
          aliasLight: "black/17 solid"
        },
        {
          name: "background/global/soft/active",
          key: "a8a0895f496f7ceab6151e4663df72324cfadabc",
          light: "#eaeef0",
          dark: "#373c42",
          aliasLight: "black/17 solid"
        },
        {
          name: "background/global/soft/container-muted",
          key: "0ba898b66fd18a189ef0fc5dbf2055ffe1940606",
          light: "#ffffff00",
          dark: "#40474f",
          aliasLight: null
        },
        {
          name: "background/global/clear/hover",
          key: "5c3c1667e9ee8759de59d89a675249d8c2f82094",
          light: "#eaeef0",
          dark: "#40474f",
          aliasLight: "black/17 solid"
        },
        {
          name: "background/global/clear/active",
          key: "4e2c605fe109a44bb90452bfc4acf361e9351f92",
          light: "#ffffff00",
          dark: "#ffffff00",
          aliasLight: null
        },
        {
          name: "background/global/clear/container-muted",
          key: "f064a4c6cb6aaab8d3a00e7aa30c4d49c0863229",
          light: "#ffffff00",
          dark: "#40474f",
          aliasLight: null
        },
        {
          name: "background/onsurface/1",
          key: "6ff51ba6d871c88f2ab26ab3d74b76f72bfe63f1",
          light: "#f4f6f7",
          dark: "#2e3238",
          aliasLight: "black/10 solid"
        },
        {
          name: "background/onsurface/2",
          key: "fbe8e32317aa0b95304841f2881d7d01c810fa33",
          light: "#eaeef0",
          dark: "#3a3c41",
          aliasLight: "black/17 solid"
        },
        {
          name: "background/onsurface/3",
          key: "79215f526cdbdc48db8837e6d61048e072896d9f",
          light: "#d7dce1",
          dark: "#3f4146",
          aliasLight: "black/22 solid"
        },
        {
          name: "background/onsurface/4",
          key: "57ddc4d21ad7814cd9e5a04f2fb5505359e28ec9",
          light: "#cad1d7",
          dark: "#40474f",
          aliasLight: "black/24 solid"
        },
        {
          name: "background/onsurface/5",
          key: "fce09485d8065467a5abed1c4f9854c683f69988",
          light: "#a9b4bc",
          dark: "#464e58",
          aliasLight: "black/30 solid"
        },
        {
          name: "background/onsurface/6",
          key: "6fa2c477f4797f975d8b37e89c55f35836b382f1",
          light: "#768793",
          dark: "#4d5661",
          aliasLight: "black/40 solid"
        },
        {
          name: "background/onsurface/0-inverse",
          key: "b07141d92666bb6469056965114ce8385823763b",
          light: "#0e0f11",
          dark: "#f4f6f7",
          aliasLight: "black/97 solid"
        },
        {
          name: "border/accent/danger",
          key: "a725b5229c21f98c37ffdbbd676b50ffd49c24be",
          light: "#ef4444",
          dark: "#dc2626",
          aliasLight: "red/60 solid"
        },
        {
          name: "border/accent/positive",
          key: "41b2aaa3f8ca573a86354875fbbc2a681ff96979",
          light: "#0fa976",
          dark: "#0fa976",
          aliasLight: "emerald/65 solid"
        },
        {
          name: "border/accent/warning",
          key: "6176d3a6b84d308ca2af1e0f3fa5db0c1e456e4e",
          light: "#f97316",
          dark: "#f97316",
          aliasLight: "orange/60 solid"
        },
        {
          name: "border/accent/brand",
          key: "dc946628c987112c7727236e341ca1bc72acd278",
          light: "#16a34a",
          dark: "#189547",
          aliasLight: "brand/default"
        },
        {
          name: "border/divider/primary",
          key: "51813af7717630a119a3ea6291e05b540359c8c5",
          light: "#e0e5e8",
          dark: "#3a3c41",
          aliasLight: "black/20 solid"
        },
        {
          name: "border/global/soft/default",
          key: "2633ff7c179a75b585932d697e2c9c0967f7005e",
          light: "#d7dce1",
          dark: "#4d5661",
          aliasLight: "black/22 solid"
        },
        {
          name: "border/global/soft/hover",
          key: "0011f441b8c33d89cd6610c2325f3cf599248f34",
          light: "#768793",
          dark: "#515c69",
          aliasLight: "black/40 solid"
        },
        {
          name: "border/global/soft/filled",
          key: "6e85c3539201fec02d1a3e79197d074a655a95ba",
          light: "#d7dce1",
          dark: "#40474f",
          aliasLight: "black/22 solid"
        },
        {
          name: "border/global/soft/active",
          key: "ae82d51efbabd022f3d5fb769cafb5693538676f",
          light: "#a9b4bc",
          dark: "#515c69",
          aliasLight: "black/30 solid"
        },
        {
          name: "border/global/soft/disabled",
          key: "60b115ea0f2bea5f926325412bef066624af1020",
          light: "#eaeef0",
          dark: "#26292e",
          aliasLight: "black/17 solid"
        },
        {
          name: "border/divider/secondary",
          key: "9da710ec28de3b2bcbdecc9da0d8e6a84ebd2710",
          light: "#d7dce1",
          dark: "#40474f",
          aliasLight: "black/22 solid"
        },
        {
          name: "border/divider/tetriary",
          key: "a8277d111f27e8a58ff96ab381ad246898660068",
          light: "#cad1d7",
          dark: "#464e58",
          aliasLight: "black/24 solid"
        },
        {
          name: "status/filled/bg/default",
          key: "8e125a92ece57b864b1c321a805d389c15508618",
          light: "#5d6c79",
          dark: "#a9b4bc",
          aliasLight: "black/63 solid"
        },
        {
          name: "status/filled/bg/accent",
          key: "9cebb5a355608795a767ac9853404fbb43db5206",
          light: "#fddb2b",
          dark: "#fddb2b",
          aliasLight: "yellow/50 solid"
        },
        {
          name: "status/filled/bg/success",
          key: "fc1939007674cf3c93b1c94017470f8c6a87573a",
          light: "#10b981",
          dark: "#10b981",
          aliasLight: "emerald/60 solid"
        },
        {
          name: "status/filled/bg/warning",
          key: "d2001fcbd94fb99277f5761d0d4f66072c415c5d",
          light: "#ea580c",
          dark: "#ea580c",
          aliasLight: "orange/70 solid"
        },
        {
          name: "status/filled/bg/error",
          key: "27dee2b70f6e109a4b3a2ac5966cb8bfc42024eb",
          light: "#e11d48",
          dark: "#e11d48",
          aliasLight: "rose/70 solid"
        },
        {
          name: "status/filled/bg/info",
          key: "3ad196a6d3a682b186c23de842f6471b83370b08",
          light: "#2563eb",
          dark: "#2563eb",
          aliasLight: "blue/70 solid"
        },
        {
          name: "status/filled/bg/clear",
          key: "93d33d613eab2d1b4d31a8e619b64b381d72a4e3",
          light: "#dde2e6",
          dark: "#54606d",
          aliasLight: "black/21 solid"
        },
        {
          name: "status/filled/text/default",
          key: "5019f6f5b7ba914f887b62c93d5edb2e06fd69b2",
          light: "#0e0f11f2",
          dark: "#0e0f11f2",
          aliasLight: "black/95"
        },
        {
          name: "status/filled/text/default-inverse",
          key: "0949f04c7ab8b91faaa35136172c7e0557957d5e",
          light: "#0e0f11",
          dark: "#f0f3f4",
          aliasLight: "black/97 solid"
        },
        {
          name: "status/ghost/bg/default",
          key: "a015840d61d7555752a6d553bfd5a27debbe72d4",
          light: "#cad1d7",
          dark: "#4d5661",
          aliasLight: "black/24 solid"
        },
        {
          name: "status/ghost/bg/accent",
          key: "3a9c3243f8607e33721507cd402401fbef257e79",
          light: "#fef7b4",
          dark: "#492c12",
          aliasLight: "yellow/20 solid"
        },
        {
          name: "status/ghost/bg/success",
          key: "30ca12f279cfc6d8b82695c4b9449bbc9f03df41",
          light: "#dcfce7",
          dark: "#093429",
          aliasLight: "green/20 solid"
        },
        {
          name: "status/ghost/bg/warning",
          key: "8600b871f9331691b62a6251c38876f768dfd97b",
          light: "#ffedd5",
          dark: "#542212",
          aliasLight: "orange/20 solid"
        },
        {
          name: "status/ghost/bg/error",
          key: "d6976782df00d03acc38f85fc707a23691a6e849",
          light: "#fee2e2",
          dark: "#4b1124",
          aliasLight: "red/20 solid"
        },
        {
          name: "status/ghost/bg/info",
          key: "4f0694156bf507c9d8489ac865d0958d83f3c3f0",
          light: "#e0f2fe",
          dark: "#14234e",
          aliasLight: "light blue/20 solid"
        },
        {
          name: "status/ghost/bg/clear",
          key: "4521c8dfedc48ebecfaf00b393f14950b2c93347",
          light: "#f4f6f7",
          dark: "#1f2326",
          aliasLight: "black/10 solid"
        },
        {
          name: "status/ghost/text/default",
          key: "f051b5799e28331ef340deb471b46ee61886739f",
          light: "#1b1e22",
          dark: "#dde2e6",
          aliasLight: "black/93 solid"
        },
        {
          name: "status/ghost/text/accent",
          key: "22f5b1784478aaac7409799c7e04470e54eca5c6",
          light: "#713f12",
          dark: "#d9a607",
          aliasLight: "yellow/100 solid"
        },
        {
          name: "status/ghost/text/success",
          key: "d4e0020199320ae0b6795793a8624f31181dcb6f",
          light: "#033a29",
          dark: "#10b981",
          aliasLight: "emerald/100 solid"
        },
        {
          name: "status/ghost/text/warning",
          key: "87c8cde7b5048a85bc5f7adecb3450c55e2be986",
          light: "#7c2d12",
          dark: "#f97316",
          aliasLight: "orange/100 solid"
        },
        {
          name: "status/ghost/text/error",
          key: "b0cd6e709e506da9ec9be38f3ba06fd0aab8a793",
          light: "#881337",
          dark: "#f43f5e",
          aliasLight: "rose/100 solid"
        },
        {
          name: "status/ghost/text/info",
          key: "c82074870b69f984cc5be9a4928ef53f3d8e962c",
          light: "#1e3a8a",
          dark: "#60a5fa",
          aliasLight: "blue/100 solid"
        },
        {
          name: "status/ghost/text/clear",
          key: "3f7b0a622f408f0da56d95bdc81cd7d204db0cc2",
          light: "#1b1e22",
          dark: "#a9b4bc",
          aliasLight: "black/93 solid"
        },
        {
          name: "supportive/filled/1",
          key: "ad6e033b05a95ceef888b7df75bf1060ff1cb587",
          light: "#5d6c79",
          dark: "#5d6c79",
          aliasLight: "black/63 solid"
        },
        {
          name: "supportive/filled/1-hc",
          key: "7d58f0fbc6a5b1b97668b0789bf1d5a0fc1864e1",
          light: "#768793",
          dark: "#768793",
          aliasLight: "black/40 solid"
        },
        {
          name: "misc/scrollbar/default",
          key: "2276cee9aa3287df8f026cefd51de27aad367d6a",
          light: "#00000033",
          dark: "#ffffff3d",
          aliasLight: null
        },
        {
          name: "misc/scrollbar/hover",
          key: "b3d0ba9e9831417d7af3fbaa9bae21c9b579e385",
          light: "#0000003d",
          dark: "#ffffff52",
          aliasLight: null
        },
        {
          name: "misc/scrollbar/active",
          key: "7f849b402015ebc987be8caf4b884e46fabd4207",
          light: "#0000007a",
          dark: "#ffffff7a",
          aliasLight: null
        },
        {
          name: "misc/overlay/default",
          key: "7cbaa01f8f8a3416948ec7a58834a562dc379155",
          light: "#000000bf",
          dark: "#ffffff7a",
          aliasLight: null
        },
        {
          name: "misc/overlay/blur 0",
          key: "c8c71fb6157ef94ab902baa089ffb65d9c804c0f",
          light: "#f4f6f759",
          dark: "#14161959",
          aliasLight: null
        },
        {
          name: "misc/overlay/blur 1",
          key: "f97a69cb2a3c4f00db3876f7a6f7171beb10d9d7",
          light: "#eaeef059",
          dark: "#3a3c4159",
          aliasLight: null
        },
        {
          name: "misc/overlay/blur 2",
          key: "fd487333eec6709aaa3447359e628da49f78bad2",
          light: "#d7dce159",
          dark: "#3f414659",
          aliasLight: null
        },
        {
          name: "supportive/filled/2",
          key: "b4b05bb60a566b12e934113a031100ce7cb0416b",
          light: "#f7c21c",
          dark: "#f7c21c",
          aliasLight: "yellow/60 solid"
        },
        {
          name: "supportive/filled/2-hc",
          key: "6a2ff6a53d156042459110510dfedb6d1970a9b8",
          light: "#f7c21c",
          dark: "#f7c21c",
          aliasLight: "yellow/60 solid"
        },
        {
          name: "supportive/filled/3",
          key: "e8cf9a531d8f5ce6f31f0914dc0cc0f8a1a0ea62",
          light: "#10b981",
          dark: "#059669",
          aliasLight: "emerald/60 solid"
        },
        {
          name: "supportive/filled/3-hc",
          key: "8e8f7e2a4a4eb81ac9e27f5c49018654e8397b6e",
          light: "#34d399",
          dark: "#10b981",
          aliasLight: "emerald/50 solid"
        },
        {
          name: "supportive/filled/4",
          key: "a3cd7b5cfd146e94e58f58b0b75aa6539347c05d",
          light: "#ea580c",
          dark: "#ea580c",
          aliasLight: "orange/70 solid"
        },
        {
          name: "supportive/filled/4-hc",
          key: "98ec2dea9d839c8df3f2e61eef294ff3e4597b61",
          light: "#f97316",
          dark: "#f97316",
          aliasLight: "orange/60 solid"
        },
        {
          name: "supportive/filled/5",
          key: "20332c1546b7dae1ff61a602bc9df5a0a7cd44ee",
          light: "#e11d48",
          dark: "#e11d48",
          aliasLight: "rose/70 solid"
        },
        {
          name: "supportive/filled/5-hc",
          key: "f81a37baa9de332d5624fdd92fd658a6fbaf6b97",
          light: "#f43f5e",
          dark: "#f43f5e",
          aliasLight: "rose/60 solid"
        },
        {
          name: "supportive/filled/6",
          key: "9e455d107e271b9181ad892fae1bb3ad5a291820",
          light: "#2563eb",
          dark: "#2563eb",
          aliasLight: "blue/70 solid"
        },
        {
          name: "supportive/filled/6-hc",
          key: "95e9af210d2e5243337d134234db16f80fe365d3",
          light: "#3b82f6",
          dark: "#3b82f6",
          aliasLight: "blue/60 solid"
        },
        {
          name: "supportive/filled/7",
          key: "5c42d1ac83e5e05827bce398e0859b61853b9bee",
          light: "#7c3aed",
          dark: "#7c3aed",
          aliasLight: "violet/70 solid"
        },
        {
          name: "supportive/filled/7-hc",
          key: "c3119e67298397c0353dc26f4bc3343c1d2eed4e",
          light: "#8b5cf6",
          dark: "#8b5cf6",
          aliasLight: "violet/60 solid"
        },
        {
          name: "supportive/filled/8",
          key: "6fee4e3e1523a572be5ffa0f28f66bafe20fe15e",
          light: "#4f46e5",
          dark: "#4f46e5",
          aliasLight: "indigo/70 solid"
        },
        {
          name: "supportive/filled/8-hc",
          key: "7c5f439eea40ad61e05a14f071bf7c415b52358d",
          light: "#6366f1",
          dark: "#6366f1",
          aliasLight: "indigo/60 solid"
        },
        {
          name: "supportive/filled/9",
          key: "3a799ae89d05ac0f207c536b4409df418b15bb86",
          light: "#db2777",
          dark: "#db2777",
          aliasLight: "pink/70 solid"
        },
        {
          name: "supportive/filled/9-hc",
          key: "747eb9ca9d3cfe18a63907ddb5f1a4b2207ad450",
          light: "#ec4899",
          dark: "#ec4899",
          aliasLight: "pink/60 solid"
        },
        {
          name: "supportive/filled/10",
          key: "13c034aa449bbd2c49096178a31ed94b7ac94785",
          light: "#0f766b",
          dark: "#0f766b",
          aliasLight: "teal/70 solid"
        },
        {
          name: "supportive/ghost/1",
          key: "3792dad1e6dec20e68675dcbe5da9eabb675ef92",
          light: "#e7e9eb",
          dark: "#2e3236",
          aliasLight: null
        },
        {
          name: "supportive/filled/10-hc",
          key: "ccb92a2a828bbaa7e547bcfd14251d9311884fb7",
          light: "#0d9485",
          dark: "#0d9485",
          aliasLight: "teal/60 solid"
        },
        {
          name: "supportive/ghost/2",
          key: "6c8168b02aa970f7b6b94981412622aae4ac4395",
          light: "#f2ebd4",
          dark: "#433b1e",
          aliasLight: null
        },
        {
          name: "supportive/ghost/3",
          key: "2fe70ff7cd20a95af7a5993310eab993ec943a6f",
          light: "#dff1ec",
          dark: "#1a3f37",
          aliasLight: null
        },
        {
          name: "supportive/ghost/4",
          key: "82604b98cf358d6f5c4c008c66a0f0c0b464a3bf",
          light: "#f4e7e0",
          dark: "#462b1f",
          aliasLight: null
        },
        {
          name: "supportive/ghost/5",
          key: "fde585df00890604093b1d6af4b11932096f05f5",
          light: "#f4e1e6",
          dark: "#441f2b",
          aliasLight: null
        },
        {
          name: "supportive/ghost/6",
          key: "5575400919f04f4c4c36efb38492fc1dc8bf68d3",
          light: "#e1e8f7",
          dark: "#1f2d4c",
          aliasLight: null
        },
        {
          name: "supportive/ghost/7",
          key: "0d61b8f8b0fe06f7338815bafc12eb9204a7bdef",
          light: "#e9e4f7",
          dark: "#30254c",
          aliasLight: null
        },
        {
          name: "supportive/ghost/8",
          key: "930d0154ef61f47c09b1b8aac9e1d53af3591d78",
          light: "#e5e5f6",
          dark: "#2a2a54",
          aliasLight: null
        },
        {
          name: "supportive/ghost/9",
          key: "66481078c006617a3eba056480773f8ff20537ec",
          light: "#f3e2eb",
          dark: "#432135",
          aliasLight: null
        },
        {
          name: "supportive/ghost/10",
          key: "02facbf6f327fd1d3b542b2f4ccaf7a305e3af8b",
          light: "#deeded",
          dark: "#1a3738",
          aliasLight: null
        },
        {
          name: "accent/secondary/clear/default",
          key: "fd1f40c46864a2a2a1f0a16c80561d896fbc9575",
          light: "#ffffff00",
          dark: "#26292e00",
          aliasLight: null
        },
        {
          name: "accent/secondary/flat filled/default",
          key: "885388b6e4c15303f30384cbc0d0728a42fafc43",
          light: "#ffffff",
          dark: "#26292e",
          aliasLight: "black/0 solid"
        },
        {
          name: "accent/secondary/flat filled/hover",
          key: "0b98cf259bae6d23bb8a1db0e097ee6e27bf240f",
          light: "#e0e5e8",
          dark: "#2a2d32",
          aliasLight: "black/20 solid"
        },
        {
          name: "accent/secondary/flat filled/active",
          key: "5dff4c25a41d22625295184cfcd1eb3ff391d748",
          light: "#ffffff",
          dark: "#2a2d32",
          aliasLight: "black/0 solid"
        },
        {
          name: "accent/secondary/flat filled/on-accent",
          key: "4dc980fdb31fb15ec2b77044cc63ccc64bcc1531",
          light: "#3b82f6",
          dark: "#3b82f6",
          aliasLight: "blue/60 solid"
        },
        {
          name: "accent/secondary/flat filled/container-muted",
          key: "6c122bf0ef75101889a2b3266348ecc1e8aef9b6",
          light: "#ffffff",
          dark: "#3a3c41",
          aliasLight: "black/0 solid"
        },
        {
          name: "accent/secondary/flat filled/on-accent-muted",
          key: "8957c3365a44f1eb386cac6d7a3d8067444c1c6e",
          light: "#3b82f6",
          dark: "#3b82f6",
          aliasLight: "blue/60 solid"
        },
        {
          name: "accent/secondary/clear/hover",
          key: "e1ac136b0bca70dfc827da7aaaa0ab1d820185e1",
          light: "#e0e5e8",
          dark: "#2a2d32",
          aliasLight: "black/20 solid"
        },
        {
          name: "accent/secondary/clear/active",
          key: "7b40a53154d42eddd35caedbbe7b8b024a5395c4",
          light: "#ffffff00",
          dark: "#2a2d32",
          aliasLight: null
        },
        {
          name: "accent/secondary/clear/on-accent",
          key: "31a5b466a3ece52eeaaf1e74fbd833e21deaa1a2",
          light: "#3b82f6",
          dark: "#3b82f6",
          aliasLight: "blue/60 solid"
        },
        {
          name: "accent/secondary/clear/container-muted",
          key: "951bb1a8cb99740b5b1564e7aa6f562ca8005e74",
          light: "#ffffff00",
          dark: "#3a3c4100",
          aliasLight: null
        },
        {
          name: "accent/secondary/clear/on-accent-muted",
          key: "6be35fe04e678e4068343463a12b78bc764c811d",
          light: "#3b82f6",
          dark: "#ffffff",
          aliasLight: "blue/60 solid"
        },
        {
          name: "accent/secondary/outline/default",
          key: "d5d9d4dbb9d32e0de4988fa1f5a1758e3d957e60",
          light: "#bfdbfe",
          dark: "#2563eb",
          aliasLight: "blue/30 solid"
        },
        {
          name: "accent/secondary/outline/hover",
          key: "289c71271be74888d006a027a492ce86f72aff97",
          light: "#93c5fd",
          dark: "#1d4ed8",
          aliasLight: "blue/40 solid"
        },
        {
          name: "accent/secondary/outline/active",
          key: "078061ee00916af6074c7165c53e3c7b7d4deeb5",
          light: "#bfdbfe",
          dark: "#2563eb",
          aliasLight: "blue/30 solid"
        },
        {
          name: "accent/secondary/outline/on-accent",
          key: "9239241cc2ede419c9bd254ffcf879607053f7fc",
          light: "#3b82f6",
          dark: "#3b82f6",
          aliasLight: "blue/60 solid"
        },
        {
          name: "accent/secondary/outline/container-muted",
          key: "67947bcec00e9caa270ce55a34ba9ae4e6ad2122",
          light: "#eff6ff",
          dark: "#1e40af",
          aliasLight: "blue/10 solid"
        },
        {
          name: "background/onsurface/0-inverse-soft",
          key: "391c55c48db5284cd79177cf36f8c77a16b7ffb7",
          light: "#ffffff",
          dark: "#4d5661",
          aliasLight: "black/0 solid"
        }
      ]
    },
    brand: {
      columns: [
        "bank",
        "kassa",
        "travel",
        "artwin",
        "koko"
      ],
      vars: [
        {
          name: "brand/default",
          key: "3fcd6d12c7cc69c1234f116a3814b8add7ab2497",
          values: [
            "#16a34a",
            "#2563eb",
            "#60a5fa",
            "#fddb2b",
            "#da78f2"
          ]
        },
        {
          name: "brand/hover",
          key: "82a3be583bee1e54a9820a88b176bc1a0609fa2c",
          values: [
            "#189547",
            "#1d4ed8",
            "#4d9af9",
            "#f7c21c",
            "#f7c21c"
          ]
        },
        {
          name: "brand/active",
          key: "1b3f03e7755cc15e0cbdac50e402785669ce1825",
          values: [
            "#16a34a",
            "#1d4ed8",
            "#60a5fa",
            "#fddb2b",
            "#fddb2b"
          ]
        },
        {
          name: "brand/on-accent",
          key: "9ee77db9b335856989165e8f70a4c08b1fd42b07",
          values: [
            "#ffffff",
            "#ffffff",
            "#ffffff",
            "#0e0f11",
            "#0e0f11"
          ]
        },
        {
          name: "brand/on-accent-muted",
          key: "7dcb7080f888546265c5196924993c42cc2bf41b",
          values: [
            "#a9b4bc",
            "#a9b4bc",
            "#a9b4bc",
            "#a9b4bc",
            "#a9b4bc"
          ]
        },
        {
          name: "brand/container-muted",
          key: "e78d2a11607d7e68ba3c17c4559abc03bafd65f6",
          values: [
            "#f0f3f4",
            "#f0f3f4",
            "#f0f3f4",
            "#f0f3f4",
            "#f0f3f4"
          ]
        },
        {
          name: "brand/ghost-default",
          key: "618558efb4b8526fe7d694f6cef6c786da1614d1",
          values: [
            "#f0fdf4",
            "#dbeafe",
            "#eff6ff",
            "#fef7b4",
            "#fef7b4"
          ]
        },
        {
          name: "brand/ghost-hover",
          key: "94afb4debb19af70507fb5070792ff6cf8245d62",
          values: [
            "#e8fcee",
            "#bfdbfe",
            "#e5f1ff",
            "#fef08a",
            "#fef08a"
          ]
        },
        {
          name: "brand/ghost-active",
          key: "5409c22ed2729aa2ca5adc39504f2151152e9ff3",
          values: [
            "#f0fdf4",
            "#dbeafe",
            "#eff6ff",
            "#fef7b4",
            "#fef7b4"
          ]
        },
        {
          name: "brand/ghost-on-accent-muted",
          key: "4e1ccb3eaf0bbf9f541aebbac32471c813c2a7ab",
          values: [
            "#86efac",
            "#3b82f6",
            "#93c5fd",
            "#f7c21c",
            "#f7c21c"
          ]
        },
        {
          name: "brand/ghost-container-muted",
          key: "3920f79f5f81b23546281bde748ac4a909a1608d",
          values: [
            "#f0fdf4",
            "#eff6ff",
            "#eff6ff",
            "#fefce8",
            "#fefce8"
          ]
        },
        {
          name: "brand/ghost-on-accent",
          key: "3a014360ef561bd9d8459ba4a7852757ec660bfc",
          values: [
            "#16a34a",
            "#1d4ed8",
            "#60a5fa",
            "#d9a607",
            "#d9a607"
          ]
        }
      ],
      modes: [
        "bank",
        "kassa",
        "travel",
        "artwin",
        "koko"
      ]
    },
    brandRadius: {
      columns: [
        "value"
      ],
      vars: [
        {
          name: "radius/full",
          key: "880334001c5c1a616d6700df798cd84e29cf0070",
          values: [
            "1000"
          ]
        },
        {
          name: "radius/xl-4",
          key: "0552e3addd4a74430e7c53b6718479b9aa6d60e6",
          values: [
            "40"
          ]
        },
        {
          name: "radius/xl-3",
          key: "b60fc0f5852bc96ca2f6c0cf1711f36f033d788d",
          values: [
            "32"
          ]
        },
        {
          name: "radius/xl-2",
          key: "5c0fd5fb1f56125215d6330cdee12086f32a53f7",
          values: [
            "24"
          ]
        },
        {
          name: "radius/xl",
          key: "46ff3d87efcea0e8e529e8dbaa14ee9c81faafb2",
          values: [
            "20"
          ]
        },
        {
          name: "radius/l",
          key: "215a81ed22f0545e5c4e4bacdaba3f52506fc65e",
          values: [
            "16"
          ]
        },
        {
          name: "radius/m",
          key: "cff2d86748887ff2a64d9de8911be6e9c7c48f3e",
          values: [
            "12"
          ]
        },
        {
          name: "radius/s",
          key: "9d4b1d6c55e145f473e312025829306854a3a023",
          values: [
            "8"
          ]
        },
        {
          name: "radius/xs",
          key: "e5e218dc0552b718be2cdcf3992ae8475ee3f492",
          values: [
            "4"
          ]
        },
        {
          name: "radius/xss",
          key: "243485996c0d982afbccdfdfc18c58ead796485b",
          values: [
            "2"
          ]
        },
        {
          name: "radius/none",
          key: "8d2416e70df7331ba3e0496575be0c02514377fb",
          values: [
            "0"
          ]
        }
      ]
    },
    borderRadius: {
      columns: [
        "value"
      ],
      vars: [
        {
          name: "border-radius/full",
          key: "0c623a2bff941b61f99500d938b32b30d62e8189",
          values: [
            "1000"
          ]
        },
        {
          name: "border-radius/xl-4",
          key: "e492b8f7b74f3167adddea50ca768c31f4163cdf",
          values: [
            "40"
          ]
        },
        {
          name: "border-radius/xl-3",
          key: "9b9d79b1ef31201c04903b45671fe485d6f75c7c",
          values: [
            "32"
          ]
        },
        {
          name: "border-radius/xl-2",
          key: "b43b8564d904c26c3147d3e61d89a2cfcf8d1e7f",
          values: [
            "24"
          ]
        },
        {
          name: "border-radius/xl",
          key: "163a64c42405550c6b3bc85182e6aff4bcab58e0",
          values: [
            "20"
          ]
        },
        {
          name: "border-radius/l",
          key: "d57f472525c8756360b9023d49bb093edb04a41a",
          values: [
            "16"
          ]
        },
        {
          name: "border-radius/m",
          key: "ff615bebaee8bcbf4953d65b2d7b5a162c6aa45c",
          values: [
            "12"
          ]
        },
        {
          name: "border-radius/s",
          key: "2f35262ae3ae0f15d4c8a18bc61b5006391e7436",
          values: [
            "8"
          ]
        },
        {
          name: "border-radius/xs",
          key: "78c30ccab1bb9e8bbae51ce0132119ec0de8304b",
          values: [
            "4"
          ]
        },
        {
          name: "border-radius/xss",
          key: "e42ccaf32d0f9f89f906f3f7d447324a43e690e7",
          values: [
            "2"
          ]
        },
        {
          name: "inner-radius-segment/l",
          key: "0999b6732b02aae49c153a574de11fb5ddd9f68e",
          values: [
            "18"
          ]
        },
        {
          name: "inner-radius-segment/s",
          key: "752efd0b6cb81b8c8f67acaeef512a5357abb9bb",
          values: [
            "15"
          ]
        },
        {
          name: "inner-radius-segment/m",
          key: "3050b4e31cc04f9761d7d880334679181c6ca8f6",
          values: [
            "10"
          ]
        }
      ]
    },
    rem: {
      columns: [
        "value"
      ],
      vars: [
        {
          name: "rem/default/0",
          key: "1bbae6b23893ee52749c03d355a9b62c63eb7a41",
          values: [
            "0"
          ]
        },
        {
          name: "rem/default/2",
          key: "c59a9be0c4c9a1fbfd706f6f7eeb551252d527e7",
          values: [
            "2"
          ]
        },
        {
          name: "rem/default/4",
          key: "ad8f3b7f62f28241835a75389d8d6ded150a6f8a",
          values: [
            "4"
          ]
        },
        {
          name: "rem/default/6",
          key: "f3f6f21e57c99a41891d54dfa3d0a469fd45adbb",
          values: [
            "6"
          ]
        },
        {
          name: "rem/default/8",
          key: "5b26e724955a5e40c9be2ca63f157d4734e3c85e",
          values: [
            "8"
          ]
        },
        {
          name: "rem/default/10",
          key: "2a9083fe3044d93424acc3688d4e3b033d93cd09",
          values: [
            "10"
          ]
        },
        {
          name: "rem/default/12",
          key: "7ebbef3d4a05f7623eca40a6b176cda22d8749a6",
          values: [
            "12"
          ]
        },
        {
          name: "rem/default/14",
          key: "a3708337250568bee43e0c049bf7fdfbf27bdeff",
          values: [
            "14"
          ]
        },
        {
          name: "rem/default/16",
          key: "6546edd17b72e154b5c3468b773e8a40036b3df7",
          values: [
            "16"
          ]
        },
        {
          name: "rem/default/20",
          key: "7ab74e1119917b06823e2155333141fe68a795be",
          values: [
            "20"
          ]
        },
        {
          name: "rem/default/24",
          key: "848ab6eaa317b35e5da6820a7571a4e8548433c8",
          values: [
            "24"
          ]
        },
        {
          name: "rem/default/28",
          key: "bf5b3b43fcccd79ba5bf60065422d26013d96d43",
          values: [
            "28"
          ]
        },
        {
          name: "rem/default/32",
          key: "0b651763bbb43ad2e2387ef38e05a775545e84ab",
          values: [
            "32"
          ]
        },
        {
          name: "rem/default/36",
          key: "a91ce087a65c458cdbb817cc14d396b43f5dbbca",
          values: [
            "36"
          ]
        },
        {
          name: "rem/default/40",
          key: "fd32316b18edfdc75c0167cd5285ed5e6d9bef94",
          values: [
            "40"
          ]
        },
        {
          name: "rem/default/48",
          key: "0eb02f7d1b88b866ab15772afd6779c88f0e8e13",
          values: [
            "48"
          ]
        },
        {
          name: "rem/default/56",
          key: "f1101d370313d1acfa7e95e5c3d190fdb46eddc4",
          values: [
            "56"
          ]
        },
        {
          name: "rem/default/64",
          key: "e7181ea608339bc60f7f29094767658c3b777a22",
          values: [
            "64"
          ]
        },
        {
          name: "rem/default/72",
          key: "6b3b47272e28f3381e149f220644bd19aa11c5ed",
          values: [
            "72"
          ]
        },
        {
          name: "rem/default/80",
          key: "0e5252ebf4ab528029d2f1d177cb0a3f119fb146",
          values: [
            "80"
          ]
        }
      ]
    },
    webSpacing: {
      columns: [
        "value"
      ],
      vars: [
        {
          name: "spacing/none",
          key: "469eae815f2cdfa1596c9cdb6701618e0030a899",
          values: [
            "0"
          ]
        },
        {
          name: "spacing/xs",
          key: "49fe1d2a4517444f7f637ea69fad54c17decba64",
          values: [
            "4"
          ]
        },
        {
          name: "spacing/s-3",
          key: "25548a2aee9592223ee300340cc03b54847db6b8",
          values: [
            "8"
          ]
        },
        {
          name: "spacing/s-2",
          key: "bd33cdc1be90ca2ac5f3d0beb7e6cd3dcbe826e9",
          values: [
            "10"
          ]
        },
        {
          name: "spacing/s-1",
          key: "b7f3190a4d32d94e37e2349ac0035f2b7a28ddf7",
          values: [
            "12"
          ]
        },
        {
          name: "spacing/m-2-base",
          key: "06f234ad59d196f83831e10bcb2ba0dda48564a8",
          values: [
            "16"
          ]
        },
        {
          name: "spacing/m-1",
          key: "945c102a9deead688072a884e69d5b10932b013e",
          values: [
            "20"
          ]
        },
        {
          name: "spacing/l-2",
          key: "c25e02637c18d4b74c20014d98a2ee237c50749a",
          values: [
            "24"
          ]
        },
        {
          name: "spacing/l-1",
          key: "139bc110af5978890090115e3686b93fa86dbef0",
          values: [
            "28"
          ]
        },
        {
          name: "spacing/xl-2",
          key: "d80486a8ad621a92eefd5fa6500a3ce339f6dd76",
          values: [
            "32"
          ]
        },
        {
          name: "spacing/xl-1",
          key: "afc59ca2bae3e2c7b18935a7f518fe9a12aa6fcd",
          values: [
            "36"
          ]
        },
        {
          name: "spacing/xxl-2",
          key: "5112dc6b296ab4e9d858030023ca5db8790524d2",
          values: [
            "40"
          ]
        },
        {
          name: "spacing/xxl-1",
          key: "f68a450bfa5d2d835a3493982430608b136b0692",
          values: [
            "48"
          ]
        }
      ]
    },
    mobileFoundation: {
      columns: [
        "value"
      ],
      vars: [
        {
          name: "paddings/default/none",
          key: "fb109a5072b402ff23bef536000e8e6b2c5ef8d5",
          values: [
            "0"
          ]
        },
        {
          name: "paddings/default/xs",
          key: "4e84b77b36220c2f282456e7cf0495104d5084dd",
          values: [
            "2"
          ]
        },
        {
          name: "paddings/default/xs 2",
          key: "d4c8e9d721b5696cee908a4366ad497721653773",
          values: [
            "4"
          ]
        },
        {
          name: "paddings/default/s",
          key: "6e80bc94476fe9fb8e18a2ecd1184d9cc31865df",
          values: [
            "8"
          ]
        },
        {
          name: "paddings/default/s - 2",
          key: "c44220317b3fa1713b480e666de7cd5fc2540446",
          values: [
            "12"
          ]
        },
        {
          name: "paddings/default/m",
          key: "f5a1fba27841d60b694005eb8da23f146b5c3269",
          values: [
            "14"
          ]
        },
        {
          name: "paddings/default/m - 2",
          key: "81a966b963f940ab223bdc6d0742e7222a85a39f",
          values: [
            "16"
          ]
        },
        {
          name: "paddings/default/l",
          key: "22db93c32da263a7da496ff79f405638628a6c17",
          values: [
            "20"
          ]
        },
        {
          name: "paddings/default/xl",
          key: "3415f336c1457466e9e4026def9f3f53ad1477c2",
          values: [
            "24"
          ]
        },
        {
          name: "paddings/default/xxl",
          key: "77387b36180f1321d8fb6a702a1294c1c7a9d0f2",
          values: [
            "28"
          ]
        },
        {
          name: "paddings/default/xxxl",
          key: "e26c9bc27be00b5e5452fd6ff1e9100bb129f547",
          values: [
            "32"
          ]
        },
        {
          name: "paddings/inverse/-xs",
          key: "c1af1dc8facfa9468f27e7574a36075595fe6039",
          values: [
            "-4"
          ]
        },
        {
          name: "paddings/inverse/-s",
          key: "d940fd2511bfd70ba2873fe910ac597112c5bb86",
          values: [
            "-8"
          ]
        },
        {
          name: "paddings/inverse/-m",
          key: "257dd4c377e271b531edef870ddb3761dfdbf582",
          values: [
            "-16"
          ]
        },
        {
          name: "radius/none (mobile)",
          key: "307348f93f8587eb6f3eca52b4778f9a092d35bb",
          values: [
            "0"
          ]
        },
        {
          name: "radius/xxs (mobile)",
          key: "eea831d02251e6334c9383c2a8dbaf8ac1c467b5",
          values: [
            "4"
          ]
        },
        {
          name: "radius/xs (mobile)",
          key: "d3785f1a672886dab4f07230c66d7cb14677b87d",
          values: [
            "8"
          ]
        },
        {
          name: "radius/s (mobile)",
          key: "5ad164a0bfd5cf02aad0e9578356a2ae6e3f4005",
          values: [
            "12"
          ]
        },
        {
          name: "radius/m (mobile)",
          key: "e0a9d7d5ad30e3eb9ed959084e24d924674ef691",
          values: [
            "16"
          ]
        },
        {
          name: "radius/l (mobile)",
          key: "9bf7a0dce8faa91850c3902d2b1b6a1aa67a2546",
          values: [
            "20"
          ]
        },
        {
          name: "radius/xl (mobile)",
          key: "6b44870a2403aaf41999d1892a919dae2cf1c0f7",
          values: [
            "24"
          ]
        },
        {
          name: "radius/xxl (mobile)",
          key: "71e2e936964d07b19be084f25da408f1d7ba670b",
          values: [
            "1000"
          ]
        }
      ]
    },
    textStyles: {
      web: [
        {
          name: "font/Display/l",
          key: "e316e5b34dae81e60cc2ab97a1ab8cdef4563a98",
          family: "Inter Mbank",
          style: "Regular",
          size: 72,
          lineHeight: 88
        },
        {
          name: "font/Display/l-md",
          key: "5ab7b80c54c4507d649b6306dd3e61b8f1721230",
          family: "Inter Mbank",
          style: "SemiBold",
          size: 72,
          lineHeight: 88
        },
        {
          name: "font/Display/l-strong",
          key: "9b0ca8f78c395d4698e06d129e87dee3e6ead2b5",
          family: "Inter Mbank",
          style: "Bold",
          size: 72,
          lineHeight: 88
        },
        {
          name: "font/Display/m",
          key: "3e023dd0da2e1e176c3187b68196a6586d802b8a",
          family: "Inter Mbank",
          style: "Medium",
          size: 56,
          lineHeight: 68
        },
        {
          name: "font/Display/m-md",
          key: "6fd5a97d91cc9a9de866ac0f36f7ad642b2d2b05",
          family: "Inter Mbank",
          style: "SemiBold",
          size: 56,
          lineHeight: 68
        },
        {
          name: "font/Display/m-strong",
          key: "a95b07a2b43f24aa401f1ef8c1b32b489149392f",
          family: "Inter Mbank",
          style: "Bold",
          size: 56,
          lineHeight: 68
        },
        {
          name: "font/Display/s",
          key: "6b7f650ff27b4c6c9d69163260725f86cfd4fca2",
          family: "Inter Mbank",
          style: "Medium",
          size: 48,
          lineHeight: 56
        },
        {
          name: "font/Display/s-md",
          key: "e06696cc2138f91849ecab3b1db9f94381d41b82",
          family: "Inter Mbank",
          style: "SemiBold",
          size: 48,
          lineHeight: 56
        },
        {
          name: "font/Display/s-strong",
          key: "c249d0bd029a93d6d6923dbf531dde2d3e4e11fe",
          family: "Inter Mbank",
          style: "Bold",
          size: 48,
          lineHeight: 56
        },
        {
          name: "font/Heading/h1",
          key: "e08e01dab2c6eb1e477b5e7bc9fd8bb7de4fd8a3",
          family: "Inter Mbank",
          style: "Bold",
          size: 44,
          lineHeight: 52
        },
        {
          name: "font/Heading/h2",
          key: "69b9a4ac3a851a758d18a02b4a29af33ecb256ad",
          family: "Inter Mbank",
          style: "Bold",
          size: 44,
          lineHeight: 52
        },
        {
          name: "font/Heading/h3",
          key: "23dc9ab4ba71b905aa555d4aa563e364598fa40c",
          family: "Inter Mbank",
          style: "Bold",
          size: 32,
          lineHeight: 40
        },
        {
          name: "font/Heading/h4",
          key: "3c1db2e1820e70adce82a63dc504382b52ee759a",
          family: "Inter Mbank",
          style: "Bold",
          size: 24,
          lineHeight: 32
        },
        {
          name: "font/Heading/h5",
          key: "d42185ecec5526dbd0305063826a760364c56df0",
          family: "Inter Mbank",
          style: "Bold",
          size: 20,
          lineHeight: 28
        },
        {
          name: "font/Heading/h6",
          key: "6fb93a2cc4474df73cd2ae1bbd7d6d9b041e835f",
          family: "Inter Mbank",
          style: "Bold",
          size: 16,
          lineHeight: 24
        },
        {
          name: "font/Body/xl",
          key: "aa8b7fbaa97839c3510a2fe501e42b210d3a872e",
          family: "Inter Mbank",
          style: "Regular",
          size: 18,
          lineHeight: 26
        },
        {
          name: "font/Body/xl-md",
          key: "07863401d95c6f432ee9a03758fa0fc226d159ab",
          family: "Inter Mbank",
          style: "Medium",
          size: 18,
          lineHeight: 26
        },
        {
          name: "font/Body/xl-strong",
          key: "9be63943b5c7f6b88df6340c47e73a3d6d2728fe",
          family: "Inter Mbank",
          style: "Bold",
          size: 18,
          lineHeight: 26
        },
        {
          name: "font/Body/l",
          key: "98dc7c792e61f09be4d5f519634aada8b52cfcd3",
          family: "Inter Mbank",
          style: "Regular",
          size: 16,
          lineHeight: 24
        },
        {
          name: "font/Body/l-md",
          key: "a7b3a781c611400a807bdee354a39c3736df09bd",
          family: "Inter Mbank",
          style: "Medium",
          size: 16,
          lineHeight: 24
        },
        {
          name: "font/Body/l-strong",
          key: "cac77d0fc4391374fa731efc663cc720e5049da4",
          family: "Inter Mbank",
          style: "Bold",
          size: 16,
          lineHeight: 24
        },
        {
          name: "font/Body/m",
          key: "4d1b7e47cbc9fc3531246736359f2c9325535de6",
          family: "Inter Mbank",
          style: "Regular",
          size: 15,
          lineHeight: 22
        },
        {
          name: "font/Body/m-md",
          key: "a52537e7e015a8c7a857ad4c3c1527c811d582d1",
          family: "Inter Mbank",
          style: "Medium",
          size: 15,
          lineHeight: 22
        },
        {
          name: "font/Body/m-strong",
          key: "473c82346b61cca42405ac66ec8888a5ceaa5112",
          family: "Inter Mbank",
          style: "Bold",
          size: 15,
          lineHeight: 22
        },
        {
          name: "font/Body/s",
          key: "476f8d56a3c3bcaa804a33fd3658f73dbbb06fa3",
          family: "Inter Mbank",
          style: "Regular",
          size: 14,
          lineHeight: 20
        },
        {
          name: "font/Body/s-md",
          key: "6ebb3dab78e706c0f2ee21bd5fd79999aecc4862",
          family: "Inter Mbank",
          style: "Medium",
          size: 14,
          lineHeight: 20
        },
        {
          name: "font/Body/s-strong",
          key: "8f1f4e2617b460a9982399f453c4d9baa952dc45",
          family: "Inter Mbank",
          style: "Bold",
          size: 14,
          lineHeight: 20
        },
        {
          name: "font/Body/xs",
          key: "8850f7044628d2c0d22dd32323557ea8baa5e178",
          family: "Inter Mbank",
          style: "Regular",
          size: 13,
          lineHeight: 16
        },
        {
          name: "font/Body/xs-md",
          key: "aa171a29710200f383227c5de81e8ac07bd72ed0",
          family: "Inter Mbank",
          style: "Medium",
          size: 13,
          lineHeight: 16
        },
        {
          name: "font/Body/xs-strong",
          key: "fe0bc48b745d27ee08208ae8f35afda3e8206bd5",
          family: "Inter Mbank",
          style: "Bold",
          size: 13,
          lineHeight: 16
        },
        {
          name: "font/Label/l",
          key: "7a128f79cc1cd1422c65b1e8787741357c438ea9",
          family: "Inter Mbank",
          style: "Regular",
          size: 14,
          lineHeight: 16
        },
        {
          name: "font/Label/m",
          key: "5ce2601a5d83c46550be0cc8999693e275c7c5f5",
          family: "Inter Mbank",
          style: "Regular",
          size: 12,
          lineHeight: 16
        },
        {
          name: "font/Label/s",
          key: "8fc90fb03d6fad3a47f660345698efd4b84e9c0d",
          family: "Inter Mbank",
          style: "Regular",
          size: 11,
          lineHeight: 14
        },
        {
          name: "font/description/l",
          key: "7d16943d07753ab98f3f8c03a62e2e09a07274df",
          family: "Inter Mbank",
          style: "Regular",
          size: 13,
          lineHeight: 16
        },
        {
          name: "font/description/l-strong",
          key: "f36e178caa81d1327daca41ec2433253fdf4181e",
          family: "Inter Mbank",
          style: "SemiBold",
          size: 13,
          lineHeight: 16
        },
        {
          name: "font/description/m",
          key: "f0df2a3cba519550cdc24d7c51281fa594092871",
          family: "Inter Mbank",
          style: "Regular",
          size: 12,
          lineHeight: 16
        },
        {
          name: "font/description/m-strong",
          key: "cf52afe4f832a6b223ccd031fbbf36ec42aa44fd",
          family: "Inter Mbank",
          style: "SemiBold",
          size: 12,
          lineHeight: 16
        },
        {
          name: "font/description/s",
          key: "9d9978915ce26a75add453d62bdc2b2838c015a4",
          family: "Inter Mbank",
          style: "Regular",
          size: 11,
          lineHeight: 14
        },
        {
          name: "font/description/s-strong",
          key: "b5a2d7494f74f33a5f8cdff6262e4aeffa9020f3",
          family: "Inter Mbank",
          style: "SemiBold",
          size: 11,
          lineHeight: 14
        }
      ],
      mobile: [
        {
          name: "display/large",
          key: "935eecfccf8f19e0b0b07db993694abd68d7d6fa",
          family: "Nunito",
          style: "Black",
          size: 56,
          lineHeight: 68
        },
        {
          name: "display/medium",
          key: "77389d3ebaea2c5a0e51c9888d13085cc2a06625",
          family: "Nunito",
          style: "ExtraBold",
          size: 44,
          lineHeight: 56
        },
        {
          name: "display/small",
          key: "fbc14f8cc8d7ec20ed34ef6c9035d7c32a6d71c8",
          family: "Nunito",
          style: "ExtraBold",
          size: 36,
          lineHeight: 48
        },
        {
          name: "headline/large",
          key: "42bd51967686fee5ca4ccc96538ce60fa5058d69",
          family: "Nunito",
          style: "Bold",
          size: 32,
          lineHeight: 40
        },
        {
          name: "headline/medium",
          key: "dabf12c1016d1f2ad529f2b44c76a7cfc2f129f1",
          family: "Nunito",
          style: "Bold",
          size: 28,
          lineHeight: 36
        },
        {
          name: "headline/small",
          key: "cf5b068f4264ad7d2cab1343d5c8e995964607b8",
          family: "Nunito",
          style: "Bold",
          size: 24,
          lineHeight: 32
        },
        {
          name: "title/large 2",
          key: "cda42c331c76712c19b4f260be17b2b28e62460a",
          family: "Nunito",
          style: "Bold",
          size: 22,
          lineHeight: 28
        },
        {
          name: "title/large 1",
          key: "e25d51b8915eb2d26b659620aef2f06e3199dddc",
          family: "Nunito",
          style: "Bold",
          size: 18,
          lineHeight: 24
        },
        {
          name: "title/medium",
          key: "5e00391d94336064ae90578d9b2d488f6ae30edd",
          family: "Nunito",
          style: "Bold",
          size: 16,
          lineHeight: 24
        },
        {
          name: "title/small",
          key: "8ad541a9910d966f41fd18c4b134828a01224a61",
          family: "Nunito",
          style: "Bold",
          size: 14,
          lineHeight: 20
        },
        {
          name: "body/large",
          key: "0b0bc64ef8b5dc133fd1194d126f262df2a930ae",
          family: "Nunito",
          style: "Medium",
          size: 16,
          lineHeight: 24
        },
        {
          name: "body/medium",
          key: "6f67996c8bfa4eddc6c219cb559800ba1d1bb590",
          family: "Nunito",
          style: "Medium",
          size: 14,
          lineHeight: 20
        },
        {
          name: "body/small",
          key: "43a4ed0fc2a0718be0f2e2c509ddcb620c93e3e9",
          family: "Nunito",
          style: "Medium",
          size: 12,
          lineHeight: 16
        },
        {
          name: "label/large-prominent",
          key: "e4778cf7733078e9b75f0532853aa9a55ed05ac5",
          family: "Nunito",
          style: "Bold",
          size: 16,
          lineHeight: 24
        },
        {
          name: "label/large",
          key: "b5146d924829d4afbc81cdf4802c39a15b59c203",
          family: "Nunito",
          style: "Medium",
          size: 16,
          lineHeight: 24
        },
        {
          name: "label/medium-prominent",
          key: "37add98b49257c926e19f1e45381f502e2be451b",
          family: "Nunito",
          style: "Bold",
          size: 14,
          lineHeight: 20
        },
        {
          name: "label/medium",
          key: "22b70c3f6ff11d198c6043879ea2977f3e07bdf2",
          family: "Nunito",
          style: "SemiBold",
          size: 14,
          lineHeight: 20
        },
        {
          name: "label/small m - prominent",
          key: "83d85bcafe0b51a3656ddc48731726188143c838",
          family: "Nunito",
          style: "Bold",
          size: 13,
          lineHeight: 16
        },
        {
          name: "label/small m",
          key: "c6f52356a7c782670153ff55cdfbf3456849fd3e",
          family: "Nunito",
          style: "Medium",
          size: 13,
          lineHeight: 16
        },
        {
          name: "label/small s - prominent",
          key: "81d7ea4c0dfcebb6fe7a9dfd9793bdafbb8e52e1",
          family: "Nunito",
          style: "Bold",
          size: 12,
          lineHeight: 14
        },
        {
          name: "label/small s",
          key: "d5105b04b8c92621288b5c6a8d59e5356979c571",
          family: "Nunito",
          style: "Medium",
          size: 12,
          lineHeight: 14
        }
      ]
    },
    effectStyles: {
      web: [
        {
          name: "shadow/none",
          key: "8acf8b7a42bf5700ba96fedbb871bf5819f783e4",
          effects: "none"
        },
        {
          name: "shadow/Default",
          key: "4022ed1f609ecc4e8d56143d3dc583270da14404",
          effects: "DROP_SHADOW 0,4 r24"
        },
        {
          name: "shadow/Default-hover",
          key: "3ba21a75473937d8cea9b629aaa9b32420f87e18",
          effects: "DROP_SHADOW 0,12 r36"
        },
        {
          name: "shadow/dropdown",
          key: "fee84674c72640e71ad87cb7242bfcf66a529d1c",
          effects: "DROP_SHADOW 0,3 r6 + 0,11 r11 + 0,15 r35"
        },
        {
          name: "shadow/notification",
          key: "0849c663f3bd667083617a09592b8eb9ed1d8c36",
          effects: "DROP_SHADOW 0,8 r16"
        },
        {
          name: "shadow/modal",
          key: "f584a1bc29d2235b8d036666788a22be86abb4e2",
          effects: "DROP_SHADOW 0,18 r30"
        },
        {
          name: "shadow/tooltip",
          key: "7b6ebd53cddd6da1b80df822729b4cebaa48371c",
          effects: "DROP_SHADOW 0,4 r6 + 0,12 r12 + 0,24 r16 + 0,0 r2"
        },
        {
          name: "shadow/bottom/controls",
          key: "fd6ac19b432ce73bce36e50f41f509a627ce9d44",
          effects: "DROP_SHADOW 0,2 r2 + 0,0 r1"
        },
        {
          name: "shadow/bottom/s",
          key: "d444bf9240ed99ea2f21d5c33ec2a73140e68430",
          effects: "DROP_SHADOW 0,2 r4 + 0,0 r8"
        },
        {
          name: "shadow/bottom/m",
          key: "c867ef24d0e44cc0cebb1741884cf3e2cada237b",
          effects: "DROP_SHADOW 0,4 r8 + 0,0 r16"
        },
        {
          name: "shadow/bottom/l",
          key: "801a169f55b5f3a890cba9c9860ad4a3cdab5e3e",
          effects: "DROP_SHADOW 0,12 r20 + 0,0 r20"
        },
        {
          name: "shadow/bottom/xl",
          key: "62bddc7abd7015237fd174f6c0e7700d63b3ff77",
          effects: "DROP_SHADOW 0,32 r32 + 0,0 r32"
        },
        {
          name: "shadow/top/controls",
          key: "0bbbacb7185609e64d65b0b4b7cb329595a56a0d",
          effects: "DROP_SHADOW 0,-2 r2 + 0,0 r1"
        },
        {
          name: "shadow/top/s",
          key: "4a873714e2dee817fadf03d129e5fe32617f87ac",
          effects: "DROP_SHADOW 0,-2 r4 + 0,0 r8"
        },
        {
          name: "shadow/top/m",
          key: "668b437ab010a6dfbd2d3f7c25c6759aa8c3d0a4",
          effects: "DROP_SHADOW 0,-4 r8 + 0,0 r16"
        },
        {
          name: "shadow/top/l",
          key: "6274b8e4cc57b6491cb734f26a448590dfb16d61",
          effects: "DROP_SHADOW 0,-12 r20 + 0,0 r20"
        },
        {
          name: "shadow/top/xl",
          key: "e94d19faf070d3aaffd4bf9239eb1814df5a9b24",
          effects: "DROP_SHADOW 0,-32 r32 + 0,0 r32"
        }
      ],
      mobile: [
        {
          name: "blocks/elevateBlocks",
          key: "af66c8cb44215b21732f55a594ff6ea5fb61b200",
          effects: "DROP_SHADOW 0,4 r20"
        },
        {
          name: "shadow/Default",
          key: "cf3f2c1cec4b9973388dc957f2e14b4b5f4bc21a",
          effects: "DROP_SHADOW 0,4 r24"
        },
        {
          name: "shadow/Default-hover",
          key: "2e66027ce4ce5d9243511b148dfa32362623d3ce",
          effects: "DROP_SHADOW 0,12 r36"
        },
        {
          name: "shadow/dropdown",
          key: "52cf274a237c77f957b26bdfb8f8d9743c267d70",
          effects: "DROP_SHADOW 0,3 r6 + 0,11 r11 + 0,25 r15"
        },
        {
          name: "shadow/notification",
          key: "53bfc4ffe3cf10e1aba5abcca629f8c3845b6fe5",
          effects: "DROP_SHADOW 0,8 r16"
        },
        {
          name: "shadow/modal",
          key: "b19fb1c69429a6e20e310a26b4def93ba35906fe",
          effects: "DROP_SHADOW 0,18 r30"
        },
        {
          name: "shadow/tooltip",
          key: "4564637f5cbcb2c09bbbfdda19dab7782e391b7a",
          effects: "DROP_SHADOW 0,4 r6 + 0,12 r12 + 0,24 r16 + 0,0 r2"
        }
      ]
    },
    platforms: {
      web: {
        title: "Web",
        order: 1,
        figmaLibrary: "Web components",
        viewports: {
          desktop: 1440,
          tablet: 768
        },
        scales: {
          spacing: {
            section: "webSpacing",
            prefix: "spacing/"
          },
          radius: {
            section: "brandRadius",
            prefix: "radius/"
          }
        },
        sections: [
          "brandRadius",
          "borderRadius",
          "rem",
          "webSpacing"
        ]
      },
      mobile: {
        title: "Mobile",
        order: 2,
        figmaLibrary: "Mobile KIT",
        viewports: {
          mobile: 375
        },
        scales: {
          spacing: {
            section: "mobileFoundation",
            prefix: "paddings/default/"
          },
          radius: {
            section: "mobileFoundation",
            prefix: "radius/"
          }
        },
        sections: [
          "mobileFoundation"
        ]
      }
    }
  };

  // ../widget/core/model.js
  var BRANDS = ["bank", "kassa", "travel", "artwin", "koko"];
  var MODES = ["light", "dark"];
  var THEME = "2.theme";
  var BRAND = "1.brand";
  function groupOf2(css, collection) {
    if (collection === BRAND || /^brand(-|$)/.test(css)) return "brand";
    if (/^radius-/.test(css)) return "radius";
    if (/^supportive-/.test(css)) return "supportive";
    if (/^(status-|success|destructive|warning)/.test(css)) return "status";
    if (/^(border|input|ring)/.test(css)) return "border";
    if (/^(primary|secondary|soft-hover|soft$|soft-foreground-strong|ghost|outline|static|neutral|accent|overlay)/.test(css)) return "accent";
    return "surface";
  }
  var CYR_TO_LAT = { \u0430: "a", \u0432: "b", \u0435: "e", \u043A: "k", \u043C: "m", \u043D: "h", \u043E: "o", \u0440: "p", \u0441: "c", \u0442: "t", \u0443: "y", \u0445: "x", \u0456: "i" };
  var modeName = (name) => [...String(name).trim().toLowerCase()].map((ch) => CYR_TO_LAT[ch] || ch).join("");
  function normHex(value) {
    if (value == null) return null;
    let h = String(value).trim().toLowerCase().replace(/^#/, "");
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(h)) return null;
    return `#${h.length === 8 && h.endsWith("ff") ? h.slice(0, 6) : h}`;
  }
  var sameValue = (a, b) => {
    if (a == null || b == null) return a == b;
    const ha = normHex(a);
    return ha ? ha === normHex(b) : String(a) === String(b);
  };
  function indexSource(tokens) {
    const by = (list2) => new Map((list2 || []).map((v) => [v.name, v]));
    return {
      tokens,
      theme: by(tokens.theme && tokens.theme.vars),
      brand: by(tokens.brand && tokens.brand.vars),
      brandModes: tokens.brand && (tokens.brand.modes || tokens.brand.columns) || BRANDS,
      radius: by(tokens.brandRadius && tokens.brandRadius.vars)
    };
  }
  function sourceRows(ix, brand = "bank") {
    const rows = [];
    const bi = Math.max(0, ix.brandModes.indexOf(brand));
    for (const [css, m] of Object.entries(TOKEN_MAP.colors)) {
      if (!m.figma) continue;
      if (m.collection === BRAND) {
        const name = `brand/${m.figma}`;
        const src = ix.brand.get(name);
        const dark = ix.theme.get(`brand/${brand}/${m.figma}`);
        const light = src ? src.values[bi] : null;
        rows.push({
          key: `${brand}:${css}`,
          css,
          figma: name,
          collection: BRAND,
          kind: "color",
          group: "brand",
          brand,
          darkFigma: `brand/${brand}/${m.figma}`,
          source: { light, dark: dark ? dark.dark : light },
          note: dark ? null : `\u043D\u0435\u0442 2.theme brand/${brand}/${m.figma}: \u0442\u0451\u043C\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 = \u0441\u0432\u0435\u0442\u043B\u043E\u0435 (G04)`
        });
      } else {
        const src = ix.theme.get(m.figma);
        rows.push({
          key: css,
          css,
          figma: m.figma,
          collection: THEME,
          kind: "color",
          group: groupOf2(css, THEME),
          source: { light: src ? src.light : null, dark: src ? src.dark : null },
          aliasLight: src ? src.aliasLight : null,
          note: src ? null : "\u043D\u0435\u0442 \u0432 tokens.json"
        });
      }
    }
    for (const [key, figma2] of Object.entries(TOKEN_MAP.radius)) {
      const src = ix.radius.get(figma2);
      const v = src ? Number(src.values[0]) : null;
      rows.push({ key: `radius-${key}`, css: `radius-${key}`, figma: figma2, collection: BRAND, kind: "radius", group: "radius", source: { light: v, dark: v }, note: src ? null : "\u043D\u0435\u0442 \u0432 tokens.json" });
    }
    return rows;
  }
  var SLOT_CSS = Object.fromEntries(Object.entries(TOKEN_MAP.colors).filter(([, m]) => m.collection === BRAND).map(([css, m]) => [m.figma, css]));
  function extraFigmaName(extra) {
    const prefix = extra.name.split("-")[0];
    return customName(prefix, extra.name);
  }
  function buildModel(tokens, { brand = "bank", edits = {}, extras = [] } = {}) {
    const ix = indexSource(tokens);
    const rows = sourceRows(ix, brand).map((r) => {
      const m = /^brand\/(\w+)\/(.+)$/.exec(r.collection === THEME ? r.figma : "");
      if (m && SLOT_CSS[m[2]]) r = __spreadProps(__spreadValues({}, r), { derivedFrom: `${m[1]}:${SLOT_CSS[m[2]]}` });
      const e = edits[r.derivedFrom || r.key] || {};
      const light = e.light !== void 0 ? e.light : r.source.light;
      const dark = e.dark !== void 0 ? e.dark : r.source.dark;
      const edited = !sameValue(light, r.source.light) || !sameValue(dark, r.source.dark);
      return __spreadProps(__spreadValues({}, r), { light, dark, edited });
    });
    for (const x of extras) {
      rows.push({
        key: `extra:${x.name}`,
        css: x.name,
        figma: extraFigmaName(x),
        collection: THEME,
        kind: x.kind,
        group: "extra",
        extra: true,
        pairWith: x.pairWith || null,
        source: { light: null, dark: null },
        light: x.light,
        dark: x.dark || x.light,
        edited: true
      });
    }
    return { brand, rows, ix };
  }
  var rowsByCss = (rows) => new Map(rows.map((r) => [r.css, r]));

  // ../widget/core/sync.js
  function scopesOf(row) {
    if (row.kind === "radius") return ["CORNER_RADIUS"];
    if (row.kind === "size") return ["WIDTH_HEIGHT", "GAP"];
    return scopesFor(row.css);
  }
  function valueFor(raw, byCss) {
    const m = /^var\(--([\w-]+)\)$/.exec(String(raw == null ? "" : raw).trim());
    if (!m) return raw;
    const t = byCss.get(m[1]);
    if (!t) return { error: `var(--${m[1]}): \u0442\u0430\u043A\u043E\u0433\u043E \u0442\u043E\u043A\u0435\u043D\u0430 \u043D\u0435\u0442` };
    return { aliasOf: { collection: t.collection, name: t.figma } };
  }
  function planWrites(model, opts = {}) {
    const byCss = rowsByCss(model.rows);
    const writes = [];
    const skipped = [];
    for (const r of model.rows) {
      if (!opts.all && !r.edited) continue;
      if (r.light == null) {
        skipped.push({ css: r.css, reason: "\u043D\u0435\u0442 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F" });
        continue;
      }
      const base = { css: r.css, rowKey: r.key, scopes: scopesOf(r) };
      if (r.kind === "radius" && !r.extra) {
        writes.push(__spreadProps(__spreadValues({}, base), { collection: BRAND, name: r.figma, type: "FLOAT", values: { "*": Number(r.light) } }));
        continue;
      }
      const light = r.kind === "color" ? valueFor(r.light, byCss) : Number(r.light);
      const dark = r.kind === "color" ? valueFor(r.dark == null ? r.light : r.dark, byCss) : Number(r.dark == null ? r.light : r.dark);
      const bad = [light, dark].find((v) => v && v.error);
      if (bad) {
        skipped.push({ css: r.css, reason: bad.error });
        continue;
      }
      const type = r.kind === "color" ? "COLOR" : "FLOAT";
      if (r.collection === BRAND) {
        writes.push(__spreadProps(__spreadValues({}, base), { collection: BRAND, name: r.figma, type, values: { [r.brand]: light } }));
        writes.push(__spreadProps(__spreadValues({}, base), { collection: THEME, name: r.darkFigma, type, values: { light, dark }, scopes: [] }));
      } else {
        writes.push(__spreadProps(__spreadValues({}, base), { collection: THEME, name: r.figma, type, values: { light, dark } }));
      }
    }
    return { writes, skipped };
  }
  function plainValue(v) {
    if (v && typeof v === "object" && "r" in v) {
      const b = (x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, "0");
      return normHex(`#${b(v.r)}${b(v.g)}${b(v.b)}${v.a === void 0 || v.a >= 1 ? "" : b(v.a)}`);
    }
    return v;
  }
  function planAllBrands(build, brands, opts = {}) {
    const writes = [];
    const skipped = [];
    brands.forEach((brand, i) => {
      const model = build(brand);
      if (i > 0) model.rows = model.rows.filter((r) => r.collection === BRAND && r.kind === "color");
      const plan = planWrites(model, opts);
      writes.push(...plan.writes);
      skipped.push(...plan.skipped);
    });
    return { writes, skipped };
  }

  // ../widget/src/figma-io.js
  var isAlias2 = (x) => x && typeof x === "object" && x.type === "VARIABLE_ALIAS";
  var OURS = [THEME, BRAND];
  var MODES_OF = { [THEME]: MODES, [BRAND]: BRANDS };
  async function loadLocal() {
    const cols2 = await figma.variables.getLocalVariableCollectionsAsync();
    const vars = await figma.variables.getLocalVariablesAsync();
    const colById = new Map(cols2.map((c) => [c.id, c]));
    const col = {};
    for (const c of cols2) col[c.name.trim()] = c;
    const named = {};
    for (const name of OURS) named[name] = /* @__PURE__ */ new Map();
    for (const v of vars) {
      const c = colById.get(v.variableCollectionId);
      if (c && named[c.name.trim()]) named[c.name.trim()].set(v.name, v);
    }
    return { cols: cols2, vars, colById, col, named };
  }
  async function resolve2(value, mode, depth = 0) {
    if (!isAlias2(value)) return value;
    if (depth > 10) return null;
    const target = await figma.variables.getVariableByIdAsync(value.id);
    if (!target) return null;
    const c = await figma.variables.getVariableCollectionByIdAsync(target.variableCollectionId);
    const m = c && (c.modes.find((x) => modeName(x.name) === modeName(mode)) || c.modes.find((x) => x.modeId === c.defaultModeId)) || null;
    return m ? resolve2(target.valuesByMode[m.modeId], mode, depth + 1) : null;
  }
  async function primitiveIndex(ix) {
    const out = /* @__PURE__ */ new Map();
    for (const v of ix.vars) {
      const c = ix.colById.get(v.variableCollectionId);
      if (!c || OURS.includes(c.name.trim()) || v.resolvedType !== "COLOR") continue;
      const val = v.valuesByMode[c.defaultModeId];
      if (isAlias2(val)) continue;
      const hex = plainValue(val);
      if (hex && !out.has(hex)) out.set(hex, v);
    }
    return out;
  }
  function modeFailed(report2, collection, mode, e) {
    report2.modesFailed = report2.modesFailed || {};
    const list2 = report2.modesFailed[collection] || (report2.modesFailed[collection] = []);
    if (list2.includes(mode)) return;
    list2.push(mode);
    const limit = /Limited to (\d+) modes?/i.exec(e.message || "");
    if (list2.length > 1) return;
    report2.errors.push(limit ? `${collection}: \u0442\u0430\u0440\u0438\u0444 \u0444\u0430\u0439\u043B\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0430\u0435\u0442 ${limit[1]} \u0440\u0435\u0436\u0438\u043C(\u0430) \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 \u2014 \u0437\u0430\u043F\u0438\u0441\u0430\u043D \u0442\u043E\u043B\u044C\u043A\u043E \xAB${collection === THEME ? "light" : "\u043F\u0435\u0440\u0432\u044B\u0439 \u0431\u0440\u0435\u043D\u0434"}\xBB. \u041D\u0443\u0436\u0435\u043D \u0444\u0430\u0439\u043B \u0432 \u043A\u043E\u043C\u0430\u043D\u0434\u0435 Professional+ (\u0438\u043B\u0438 Foundation), \u0447\u0442\u043E\u0431\u044B \u0431\u044B\u043B\u0438 dark \u0438 \u0432\u0441\u0435 \u0431\u0440\u0435\u043D\u0434\u044B.` : `${collection}: \u0440\u0435\u0436\u0438\u043C \xAB${mode}\xBB \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D (${e.message})`);
  }
  function ensureCollection(ix, name, report2, dryRun) {
    if (ix.col[name]) return ix.col[name];
    if (report2.collectionsCreated.includes(name)) return null;
    report2.collectionsCreated.push(name);
    if (dryRun) return null;
    const c = figma.variables.createVariableCollection(name);
    const modes = MODES_OF[name];
    c.renameMode(c.modes[0].modeId, modes[0]);
    for (const m of modes.slice(1)) {
      try {
        c.addMode(m);
      } catch (e) {
        modeFailed(report2, name, m, e);
      }
    }
    ix.col[name] = c;
    return c;
  }
  function modeIdsFor(c, key, report2, dryRun) {
    if (!c) return [key];
    if (key === "*") return c.modes.map((m) => m.modeId);
    const hit = c.modes.find((m) => modeName(m.name) === modeName(key));
    if (hit) return [hit.modeId];
    if (dryRun) {
      if (!report2.modesAdded.includes(`${c.name}/${key}`)) report2.modesAdded.push(`${c.name}/${key}`);
      return [];
    }
    if (report2.modesFailed && report2.modesFailed[c.name]) {
      modeFailed(report2, c.name, key, {});
      return [];
    }
    try {
      const id = c.addMode(key);
      report2.modesAdded.push(`${c.name}/${key}`);
      return [id];
    } catch (e) {
      modeFailed(report2, c.name, key, e);
      return [];
    }
  }
  var rgba2 = (hex) => {
    const { r, g, b, a } = hexToRgb(hex);
    return { r, g, b, a };
  };
  async function libraryGuard(ix) {
    if (OURS.every((n) => ix.col[n])) return null;
    if (!figma.teamLibrary) return null;
    let libs = [];
    try {
      libs = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
    } catch (e) {
      return null;
    }
    const connected = libs.filter((l) => OURS.includes(String(l.name).trim()));
    if (!connected.length) return null;
    const from = [...new Set(connected.map((l) => l.libraryName).filter(Boolean))].join(", ") || "Foundation";
    return `\u0424\u0430\u0439\u043B \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0442\u043E\u043A\u0435\u043D\u044B \u0438\u0437 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438 \xAB${from}\xBB. \u041F\u0440\u0438\u043C\u0435\u043D\u044F\u0442\u044C \u043D\u0443\u0436\u043D\u043E \u0432 \u0441\u0430\u043C\u043E\u043C \u0444\u0430\u0439\u043B\u0435 Foundation \u0438\u043B\u0438 \u0432 \u0435\u0433\u043E \u0432\u0435\u0442\u043A\u0435, \u0438\u043D\u0430\u0447\u0435 \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0435 \u043A\u043E\u043F\u0438\u0438 \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0439 ${OURS.join(" \u0438 ")}. \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 (\u043F\u0440\u043E\u0431\u043D\u044B\u0439 \u043F\u0440\u043E\u0433\u043E\u043D) \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430.`;
  }
  async function applyWrites(writes, opts = {}) {
    if (figma.editorType && figma.editorType !== "figma") throw new Error("\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u0444\u0430\u0439\u043B\u0435 Figma Design (\u043D\u0435 FigJam)");
    const dryRun = !!opts.dryRun;
    const ix = await loadLocal();
    if (!dryRun) {
      const reason = await libraryGuard(ix);
      if (reason) throw new Error(reason);
    }
    const prims = await primitiveIndex(ix);
    const report2 = { dryRun, collectionsCreated: [], modesAdded: [], created: [], updated: [], aliased: [], raw: [], unchanged: 0, errors: [], changed: [] };
    for (const w of writes) {
      const key = `${w.collection}/${w.name}`;
      const touched = () => {
        if (!report2.changed.includes(key)) report2.changed.push(key);
      };
      const c = ensureCollection(ix, w.collection, report2, dryRun);
      let v = ix.named[w.collection].get(w.name);
      if (v && v.resolvedType !== w.type) {
        report2.errors.push(`${w.collection}/${w.name}: \u0442\u0438\u043F ${v.resolvedType}, \u0430 \u043D\u0443\u0436\u0435\u043D ${w.type}`);
        continue;
      }
      const fresh = !v;
      if (fresh) {
        report2.created.push(key);
        touched();
        if (!dryRun) {
          v = figma.variables.createVariable(w.name, c, w.type);
          v.scopes = w.scopes && w.scopes.length ? w.scopes : [];
          if (w.css && (w.collection === THEME || /^custom\//.test(w.name)) && !/^brand\//.test(w.name)) v.setVariableCodeSyntax("WEB", `var(--${w.css})`);
          ix.named[w.collection].set(w.name, v);
          const first = Object.values(w.values)[0];
          if (!(first && first.aliasOf)) for (const m of c.modes) v.setValueForMode(m.modeId, w.type === "COLOR" ? rgba2(first) : Number(first));
        }
      }
      for (const [modeKey, wanted] of Object.entries(w.values)) {
        for (const modeId of modeIdsFor(c, modeKey, report2, dryRun)) {
          const label2 = `${w.collection}/${w.name} (${modeKey === "*" ? "\u0432\u0441\u0435 \u0440\u0435\u0436\u0438\u043C\u044B" : modeKey})`;
          const current = v && !fresh ? v.valuesByMode[modeId] : void 0;
          if (wanted && wanted.aliasOf) {
            const target = ix.named[wanted.aliasOf.collection] && ix.named[wanted.aliasOf.collection].get(wanted.aliasOf.name);
            if (!target && !dryRun) {
              report2.errors.push(`${label2}: \u043D\u0435\u0442 \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0439 ${wanted.aliasOf.collection}/${wanted.aliasOf.name} \u0434\u043B\u044F \u0441\u0441\u044B\u043B\u043A\u0438`);
              continue;
            }
            if (isAlias2(current) && target && current.id === target.id) {
              report2.unchanged++;
              continue;
            }
            report2.aliased.push(`${label2} \u2192 ${wanted.aliasOf.name}`);
            touched();
            if (!dryRun) v.setValueForMode(modeId, figma.variables.createVariableAlias(target));
            continue;
          }
          const now = current === void 0 ? void 0 : plainValue(await resolve2(current, modeKey));
          if (!fresh && current !== void 0 && sameValue(now, w.type === "COLOR" ? normHex(wanted) : wanted)) {
            report2.unchanged++;
            continue;
          }
          const before = isAlias2(current) ? "\u0441\u0441\u044B\u043B\u043A\u0430" : now;
          touched();
          if (w.type === "COLOR") {
            const prim = prims.get(normHex(wanted));
            if (prim) {
              report2.aliased.push(`${label2} \u2192 ${prim.name}`);
              if (!dryRun) v.setValueForMode(modeId, figma.variables.createVariableAlias(prim));
            } else {
              report2.raw.push(`${label2}: ${normHex(wanted)}${before !== void 0 ? ` (\u0431\u044B\u043B\u043E ${before})` : ""}`);
              if (!dryRun) v.setValueForMode(modeId, rgba2(wanted));
            }
          } else if (!dryRun) v.setValueForMode(modeId, Number(wanted));
          if (!fresh && current !== void 0) report2.updated.push(`${label2}: ${before} \u2192 ${wanted}`);
        }
      }
    }
    return report2;
  }

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
    async "tokens-apply"(a) {
      const plan = planAllBrands((b) => buildModel(tokens_default, { brand: b, edits: a.edits || {}, extras: a.extras || [] }), BRANDS, { all: true });
      const r = await applyWrites(plan.writes, { dryRun: !!a.dryRun });
      return { created: r.created.length, updated: r.updated.length, raw: r.raw.length, errors: r.errors };
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
  async function exportTokens(brand, style) {
    const table2 = await readBrand(brand, style);
    const colors = { light: {}, dark: {} };
    for (const r of table2.rows) if (r.hex) colors[r.theme][r.token] = r.hex;
    const ix = await loadIndex();
    const custom = await resolveCustom(brand, style);
    const radiusVar = ix.named[C.style].get("radius/lg");
    const sm = ix.col[C.style].modes.find((m) => m.name === style) || ix.col[C.style].modes[0];
    const missing = COLOR_TOKENS.filter((t) => !colors.light[t] || !colors.dark[t]);
    return {
      $schema: "ds-builder/tokens@1",
      name: brand,
      style: sm.name,
      font: { sans: table2.font || "Inter", mono: "Geist Mono" },
      radius: radiusVar ? radiusVar.valuesByMode[sm.modeId] : 10,
      colors,
      custom,
      missing
    };
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
    async setup(m) {
      const report2 = await setupBrand(m);
      return { report: report2, status: await inspect() };
    },
    async rollback() {
      const r = await rollbackBrand();
      return { report: r, status: await inspect() };
    },
    async "add-brand"(m) {
      await addBrand(m.name);
      return { status: await inspect() };
    },
    async "remove-brand"(m) {
      await removeBrand(m.name);
      return { status: await inspect() };
    },
    async "read-brand"(m) {
      return { table: await readBrand(m.brand, m.style) };
    },
    async "apply-brand"(m) {
      const rows = await applyBrand(m.brand, m.tokens, m.keys, { reset: m.reset, snap: m.snap });
      return { rows, table: await readBrand(m.brand, m.style) };
    },
    async "add-token"(m) {
      const t = await addCustomToken(m.token);
      return { token: t, custom: await listCustom() };
    },
    async "list-custom"() {
      return { custom: await listCustom() };
    },
    async "scan-kit"() {
      kitCache = null;
      const k = await kit();
      return { kit: k.kit, count: k.components.length, components: k.components };
    },
    async "export-css"(m) {
      const tokens = await exportTokens(m.brand, m.style);
      return { tokens, css: toShadcnCss(tokens) };
    },
    async build(m) {
      const errors = [...validateSpec(m.spec), ...validateLinks(m.spec)];
      if (errors.length) return { errors };
      const { vars, radius } = await screenVars(await modeVars());
      const components = m.components === false ? null : await ensureContracts(m.spec, contracts_default, { font: m.font, create: m.create });
      if (components && components.built.length) kitCache = null;
      const k = await kit();
      const res = await buildSpec(
        m.spec,
        { vars, radius, kit: k.kit, font: m.font, brand: m.brand, style: m.style, theme: m.theme, only: m.only, contracts: components ? components.sets : void 0 },
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
      const r = await handlers.build({ spec: credit_crm_spec_default, brand: "bank", theme: "light" });
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
