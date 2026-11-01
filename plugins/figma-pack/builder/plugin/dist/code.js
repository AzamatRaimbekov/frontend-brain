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
      const clean2 = opts.fixNames ? fixLegacyName(name) : name;
      if (clean2 !== name) {
        mv.name = clean2;
        report2.renamed++;
      }
      for (const theme of THEMES) {
        const mId = themeMode(mode, theme);
        const val = mv.valuesByMode[mId];
        const target = isAlias(val) ? ix.byId.get(val.id) : null;
        if (target && target.variableCollectionId === brand.id) continue;
        if (target && target.variableCollectionId === mode.id) continue;
        const fromStyle = target && target.variableCollectionId === ix.col[C.style].id && target.name.startsWith(`color/${theme}/`);
        const bName = fromStyle ? target.name : `color/${theme}/${clean2}`;
        const isNew = !ix.named[C.brand].has(bName);
        const bv = await ensureBrandVar(ix, bName);
        if (isNew) {
          setAllModes(ix, bv, val);
          report2.created++;
        }
        mv.setValueForMode(mId, alias(bv));
        report2.linked++;
      }
      mv.setVariableCodeSyntax("WEB", `var(${cssVar(clean2)})`);
      if (opts.fixScopes) {
        mv.scopes = scopesFor(clean2);
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
    return { vars, radius, font, kit: kit2, width, state, spec, styles: {}, kitStyles: null, stats: { instances: 0, fallbacks: 0, fallbackFonts: false } };
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
    return v ? figma.variables.setBoundVariableForPaint(base, "color", v) : base;
  }
  function fill(node, ctx, token, opacity) {
    node.fills = token ? [paint(ctx, token, opacity)] : [];
  }
  function stroke(node, ctx, token = "border", weight = 1) {
    node.strokes = [paint(ctx, token)];
    node.strokeWeight = weight;
    node.strokeAlign = "INSIDE";
  }
  function round(node, ctx, size2 = "lg") {
    const v = ctx.radius[size2];
    if (v && typeof v === "object") {
      for (const k of ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]) node.setBoundVariable(k, v);
    } else node.cornerRadius = typeof v === "number" ? v : size2 === "full" ? 999 : 8;
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
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "AUTO";
    if (typeof o.w === "number") f.resize(o.w, Math.max(1, typeof o.h === "number" ? o.h : 1));
    if (typeof o.w === "number") {
      if (f.layoutMode === "HORIZONTAL") f.primaryAxisSizingMode = "FIXED";
      else f.counterAxisSizingMode = "FIXED";
    }
    if (typeof o.h === "number") {
      if (typeof o.w !== "number") f.resize(f.width, o.h);
      if (f.layoutMode === "VERTICAL") f.primaryAxisSizingMode = "FIXED";
      else f.counterAxisSizingMode = "FIXED";
    }
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
  var norm = (s) => s.toLowerCase().replace(/^[^a-z]+/, "").replace(/[\s_/]+/g, "-");
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
      const name = norm(n.name);
      all.push({ id: n.id, name: n.name, type: n.type, variants: variantProps(n), texts: textProps(n) });
      for (const [role, names] of Object.entries(ROLES)) {
        if (kit2[role]) continue;
        if (names.some((x) => name === x || name.endsWith(`-${x}`))) kit2[role] = { id: n.id, name: n.name };
      }
    }
    return { kit: kit2, components: all };
  }
  function pickVariant(set, want) {
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
  async function setLabel(inst, label) {
    const defs = inst.componentProperties || {};
    const key = Object.keys(defs).find((k) => defs[k].type === "TEXT" && /label|text|title|placeholder|value/i.test(k)) || Object.keys(defs).find((k) => defs[k].type === "TEXT");
    if (key) {
      inst.setProperties({ [key]: label });
      return true;
    }
    const t = inst.findOne((n) => n.type === "TEXT" && n.visible);
    if (!t) return false;
    const fonts = t.getRangeAllFontNames(0, t.characters.length);
    for (const f of fonts) await figma.loadFontAsync(f);
    t.characters = label;
    return true;
  }
  async function instance(ctx, role, want, label) {
    const ref = ctx.kit[role];
    if (!ref) return null;
    const node = await figma.getNodeByIdAsync(ref.id);
    if (!node) return null;
    const comp = node.type === "COMPONENT_SET" ? node.defaultVariant : node;
    const inst = comp.createInstance();
    if (node.type === "COMPONENT_SET") {
      const v = pickVariant(node, want);
      if (Object.keys(v).length) try {
        inst.setProperties(v);
      } catch (e) {
      }
    }
    if (label != null) {
      try {
        await setLabel(inst, label);
      } catch (e) {
        inst.remove();
        return null;
      }
    }
    ctx.stats.instances++;
    return inst;
  }
  var BTN = {
    default: ["primary", "primary-foreground", null],
    secondary: ["secondary", "secondary-foreground", null],
    outline: ["background", "foreground", "border"],
    ghost: [null, "foreground", null],
    destructive: ["destructive", "destructive-foreground", null]
  };
  async function button(ctx, label, variant = "default", sz = "default") {
    const inst = await instance(ctx, "button", { variant, size: sz, type: variant, style: variant }, label);
    if (inst) return inst;
    ctx.stats.fallbacks++;
    const [bg, fg, border] = BTN[variant] || BTN.default;
    const b = box(ctx, `Button / ${variant}`, { dir: "H", gap: 8, pad: sz === "sm" ? [6, 12] : [8, 16], fill: bg, stroke: border, radius: "md", align: "CENTER", justify: "CENTER" });
    return add(b, await text(ctx, label, { size: "sm", weight: "medium", color: fg }));
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
  async function badge(ctx, label, variant = "secondary") {
    const kitVariant = ["success", "warning", "info"].includes(variant) ? null : variant;
    const inst = kitVariant && await instance(ctx, "badge", { variant: kitVariant, type: kitVariant }, label);
    if (inst) return inst;
    ctx.stats.fallbacks++;
    const [bg, fg] = BADGE[variant] || BADGE.secondary;
    const b = box(ctx, `Badge / ${variant}`, { dir: "H", pad: [2, 8], fill: bg, stroke: variant === "outline" ? "border" : null, radius: "full", align: "CENTER" });
    return add(b, await text(ctx, label, { size: "xs", weight: "medium", color: fg }));
  }
  async function input(ctx, placeholder, o = {}) {
    const inst = await instance(ctx, "input", { state: o.error ? "error" : "default" }, placeholder);
    if (inst) return inst;
    ctx.stats.fallbacks++;
    const f = box(ctx, "Input", { dir: "H", gap: 8, pad: [8, 12], fill: "background", stroke: o.error ? "destructive" : "input", radius: "md", align: "CENTER", w: o.w || "fill", h: 36 });
    return add(f, await text(ctx, placeholder, { size: "sm", color: "muted-foreground", truncate: true }));
  }
  async function avatar(ctx, name, d = 32) {
    const inst = await instance(ctx, "avatar", {}, null);
    if (inst) return inst;
    ctx.stats.fallbacks++;
    const initials = String(name).split(" ").map((w) => w[0]).slice(0, 2).join("");
    const a = box(ctx, "Avatar", { dir: "H", fill: "muted", radius: "full", align: "CENTER", justify: "CENTER", w: d, h: d });
    a.primaryAxisSizingMode = "FIXED";
    a.counterAxisSizingMode = "FIXED";
    return add(a, await text(ctx, initials, { size: "xs", weight: "medium", color: "muted-foreground" }));
  }
  async function checkbox(ctx, checked = false) {
    const inst = await instance(ctx, "checkbox", { checked: checked ? "true" : "false", state: checked ? "checked" : "unchecked" }, null);
    if (inst) return inst;
    const c = figma.createRectangle();
    c.name = "Checkbox";
    c.resize(16, 16);
    fill(c, ctx, checked ? "primary" : "background");
    stroke(c, ctx, checked ? "primary" : "input");
    round(c, ctx, "sm");
    return c;
  }
  function statusVariant(label) {
    const s = String(label).toLowerCase();
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
  var money = (r) => `${(Math.round(r() * 2400 + 50) * 1e3).toLocaleString("ru-RU").replace(/ /g, " ")} \u0441`;
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
    const [label, type = "text"] = String(col).split(":");
    return { label: label.trim(), type: type.trim() };
  }
  function fakeValue(type, r, i = 0, statuses = DEFAULT_STATUSES) {
    if (type === "status") return statuses[(i + Math.floor(r() * 2)) % statuses.length];
    if (type === "actions") return "\u2022\u2022\u2022";
    return (GEN[type] || GEN.text)(r, i);
  }
  function fakeRows(columns, count, seed = 7, statuses) {
    const r = rng(seed);
    const cols2 = columns.map(parseColumn);
    return Array.from({ length: count }, (_, i) => cols2.map((c) => fakeValue(c.type, r, i, statuses)));
  }

  // core/spec.js
  var VIEWPORTS = { desktop: 1440, tablet: 768, mobile: 375 };
  var STATES = ["default", "loading", "empty", "error", "no-access"];
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
    split: ["columns"]
  };
  var DATA_BLOCKS = ["stats", "table", "kanban", "chart", "list", "timeline", "cards", "details"];
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
    if (!["web", "mobile"].includes(spec.platform || "web")) errors.push("platform: web | mobile");
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
      for (const st of s.states || []) if (!STATES.includes(st)) errors.push(`${p}.states: unknown "${st}"`);
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
    const label = at > 0 ? raw.slice(at + 1) : "";
    const sign = /^[+▲↑]/.test(value) ? "up" : /^[-−–▼↓]/.test(value) ? "down" : null;
    const tone = item.tone || (!sign ? "neutral" : sign === (item.better || "up") ? "positive" : "negative");
    return { value, label, tone };
  }
  function normalizeSpec(spec) {
    var _a;
    const platform = spec.platform || "web";
    return __spreadProps(__spreadValues({}, spec), {
      platform,
      viewports: ((_a = spec.viewports) == null ? void 0 : _a.length) ? spec.viewports : [platform === "mobile" ? "mobile" : "desktop"],
      nav: spec.nav || [],
      user: spec.user || { name: "\u0410\u0439\u0433\u0443\u043B\u044C \u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B\u043E\u0432\u0430", role: "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440" },
      screens: spec.screens.map((s) => {
        var _a2, _b, _c, _d;
        return __spreadProps(__spreadValues({
          shell: s.shell || (platform === "mobile" ? "mobile" : ((_a2 = spec.nav) == null ? void 0 : _a2.length) ? "sidebar" : "plain"),
          page: s.page || s.title,
          states: ((_b = s.states) == null ? void 0 : _b.length) ? s.states : ["default"]
        }, s), {
          viewports: ((_c = s.viewports) == null ? void 0 : _c.length) ? s.viewports : ((_d = spec.viewports) == null ? void 0 : _d.length) ? spec.viewports : [platform === "mobile" ? "mobile" : "desktop"]
        });
      })
    });
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
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
    folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'
  };
  var ICONS = Object.keys(P);
  function guessIcon(label = "") {
    const s = label.toLowerCase();
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

  // plugin/src/shell.js
  var SIDEBAR = { desktop: 256, tablet: 72 };
  var PAD = { desktop: 32, tablet: 24, mobile: 16 };
  async function navItem(ctx, item, active, compact) {
    const it = box(ctx, `Nav / ${item.label}`, { dir: "H", gap: 10, pad: compact ? [10, 10] : [8, 12], radius: "md", align: "CENTER", fill: active ? "sidebar-accent" : null, w: compact ? "hug" : "fill", justify: compact ? "CENTER" : "MIN" });
    add(it, icon(ctx, item.icon || guessIcon(item.label), active ? "sidebar-accent-foreground" : "sidebar-foreground", 16));
    if (!compact) add(it, await text(ctx, item.label, { size: "sm", weight: active ? "medium" : "regular", color: active ? "sidebar-accent-foreground" : "sidebar-foreground", w: "fill" }));
    return it;
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
    for (const item of spec.nav) {
      if (item.group && !compact) add(s, add(box(ctx, "Group", { pad: [12, 12, 4, 12], w: "fill" }), await text(ctx, item.group, { size: "xs", weight: "medium", color: "muted-foreground" })));
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
    else add(t, await input(ctx, spec.searchPlaceholder || "\u041F\u043E\u0438\u0441\u043A\u2026", { w: 320 }), box(ctx, "Spacer", { w: "fill" }));
    return add(t, icon(ctx, "bell", "muted-foreground", 18), await avatar(ctx, spec.user.name));
  }
  async function mobileBar(ctx, screen) {
    const bar = box(ctx, "App bar", { dir: "H", gap: 12, pad: [12, 16], align: "CENTER", fill: "background", w: "fill", h: 56 });
    if (screen.back) add(bar, icon(ctx, "back", "foreground", 22));
    return add(bar, await text(ctx, screen.title, { size: "lg", weight: "semibold", w: "fill", truncate: true }), icon(ctx, "bell", "foreground", 20));
  }
  async function tabbar(ctx, spec, screen) {
    const bar = box(ctx, "Tab bar", { dir: "H", pad: [8, 8, 24, 8], fill: "background", stroke: "border", w: "fill", justify: "SPACE_BETWEEN" });
    for (const item of spec.nav.slice(0, 5)) {
      const on = item.id === screen.nav;
      const it = box(ctx, `Tab / ${item.label}`, { gap: 4, align: "CENTER", pad: [4, 6], w: "fill" });
      add(bar, add(it, icon(ctx, item.icon || guessIcon(item.label), on ? "primary" : "muted-foreground", 22), await text(ctx, item.label, { size: "xs", weight: on ? "medium" : "regular", color: on ? "primary" : "muted-foreground", align: "CENTER" })));
    }
    return bar;
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
  async function stats(ctx, b) {
    const row = box(ctx, "Stats", { dir: "H", gap: 16, w: "fill", wrap: true });
    const per = cols(ctx, b.items.length > 4 ? 4 : b.items.length);
    const w = Math.floor((ctx.width - 16 * (per - 1)) / per);
    for (const it of b.items) {
      const c = card(ctx, `Stat / ${it.label}`, { gap: 8, pad: 20, w });
      if (ctx.state === "loading") add(c, skel(ctx, 96, 12), skel(ctx, 140, 28, "md"), skel(ctx, 72, 10));
      else {
        const value = ctx.state === "empty" ? "0" : it.value;
        const d = ctx.state !== "empty" ? statDelta(it) : null;
        const tone = { positive: "success", negative: "destructive", neutral: "muted-foreground" };
        const delta = d ? add(
          box(ctx, "Delta", { dir: "H", gap: 4, align: "CENTER" }),
          await text(ctx, d.value, { size: "xs", weight: "medium", color: tone[d.tone] }),
          d.label && await text(ctx, d.label, { size: "xs", color: "muted-foreground" })
        ) : null;
        add(
          c,
          await text(ctx, it.label, { size: "sm", weight: "medium", color: "muted-foreground" }),
          await text(ctx, value, { size: "2xl", weight: "bold" }),
          delta || it.hint && await text(ctx, it.hint, { size: "xs", color: "muted-foreground" })
        );
      }
      add(row, c);
    }
    return row;
  }
  async function cell(ctx, type, value, w) {
    const c = box(ctx, "Cell", { dir: "H", gap: 8, pad: [12, 12], align: "CENTER", w, h: 52 });
    if (ctx.state === "loading") return add(c, skel(ctx, Math.max(40, Math.min(w - 24, 60 + w % 70)), 12));
    if (type === "status") return add(c, await badge(ctx, value, statusVariant(value)));
    if (type === "person") return add(c, await avatar(ctx, value, 28), await text(ctx, value, { size: "sm", weight: "medium", truncate: true }));
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
      const item = box(ctx, "Row", { dir: "H", gap: 12, pad: 16, w: "fill", align: "CENTER", stroke: "border" });
      const main = box(ctx, "Main", { gap: 4, w: "fill" });
      const pi = columns.findIndex((c) => c.type === "person" || c.type === "company");
      const si = columns.findIndex((c) => c.type === "status");
      const mi = columns.findIndex((c) => c.type === "money");
      if (ctx.state === "loading") add(main, skel(ctx, 140, 12), skel(ctx, 90, 10));
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
    const count = ctx.state === "loading" ? Math.min(b.rows || 8, 6) : b.rows || 8;
    const rows = b.data || fakeRows(b.columns, count, (b.seed || 7) + ctx.seed, b.statuses);
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
      const h = box(ctx, `Head / ${columns[i].label}`, { dir: "H", pad: [10, 12], align: "CENTER", w: widths[i], h: 40 });
      if (columns[i].type === "money") h.primaryAxisAlignItems = "MAX";
      add(hr, add(h, await text(ctx, columns[i].label, { size: "xs", weight: "medium", color: "muted-foreground" })));
    }
    add(t, hr);
    for (const [ri, r] of rows.entries()) {
      const row = box(ctx, `Row ${ri + 1}`, { dir: "H", w: "fill", align: "CENTER" });
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
        const k = card(ctx, "Card", { gap: 8, pad: 12 });
        if (ctx.state === "loading") add(k, skel(ctx, 80, 10), skel(ctx, "fill", 12), skel(ctx, 60, 10));
        else {
          const [id, who, sum] = fakeRows(["id", "person", "money"], 1, 31 + ci * 5 + i + ctx.seed)[0];
          const top = box(ctx, "Top", { dir: "H", align: "CENTER", justify: "SPACE_BETWEEN", w: "fill" });
          add(top, await text(ctx, id, { size: "xs", color: "muted-foreground" }), b.badge !== false && await badge(ctx, i === 0 && ci === 1 ? "SLA" : `${10 + i * 7} \u043C\u0438\u043D`, i === 0 && ci === 1 ? "destructive" : "secondary"));
          add(k, top, await text(ctx, who, { size: "sm", weight: "medium" }), await text(ctx, sum, { size: "sm", color: "muted-foreground" }));
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
    add(c, await cardTitle(ctx, b.title || "\u0414\u0438\u043D\u0430\u043C\u0438\u043A\u0430", b.subtitle));
    const plot = box(ctx, "Plot", { dir: "H", gap: ctx.vp === "mobile" ? 4 : 8, align: "MAX", w: "fill", h: b.height || 200 });
    const r = rng(5 + ctx.seed);
    const n = ctx.vp === "mobile" ? 7 : b.points || 12;
    const barW = Math.max(6, Math.floor((ctx.width - 48 - (n - 1) * (ctx.vp === "mobile" ? 4 : 8)) / n));
    for (let i = 0; i < n; i++) {
      const h = ctx.state === "loading" ? 40 + i * 37 % 120 : Math.round(40 + r() * 150);
      add(plot, rect(ctx, "Bar", barW, h, ctx.state === "loading" ? "muted" : i === n - 2 ? "chart-1" : "chart-2", "sm"));
    }
    return add(c, plot);
  }
  async function list(ctx, b) {
    const c = card(ctx, b.title || "List", { gap: 0, pad: 0 });
    if (b.title) add(c, add(box(ctx, "Head", { pad: [20, 24, 8, 24], w: "fill" }), await cardTitle(ctx, b.title, b.subtitle)));
    const items = b.items || fakeRows(["person", "text", "status"], b.rows || 5, 21 + ctx.seed, b.statuses);
    for (const it of items) {
      const [who, what, st] = Array.isArray(it) ? it : [it.title, it.subtitle, it.status];
      const row = box(ctx, "Item", { dir: "H", gap: 12, pad: [12, 24], align: "CENTER", w: "fill" });
      if (ctx.state === "loading") {
        add(row, skel(ctx, 32, 32, "full"), add(box(ctx, "Lines", { gap: 6, w: "fill" }), skel(ctx, 140, 12), skel(ctx, 90, 10)));
        add(c, row);
        continue;
      }
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
      const row = box(ctx, "Event", { dir: "H", gap: 12, pad: [12, 0, 0, 0], w: "fill" });
      add(row, rect(ctx, "Dot", 8, 8, i === items.length - 1 ? "primary" : "border", "full"));
      const t = box(ctx, "Text", { gap: 2, w: "fill" });
      if (ctx.state === "loading") add(t, skel(ctx, 160, 12), skel(ctx, 100, 10));
      else add(t, await text(ctx, title, { size: "sm", weight: "medium" }), await text(ctx, when, { size: "xs", color: "muted-foreground" }));
      add(c, add(row, t));
    }
    return c;
  }
  async function cards(ctx, b) {
    const grid = box(ctx, "Cards", { dir: "H", gap: 16, w: "fill", wrap: true });
    const per = cols(ctx, b.columns || 3);
    const w = Math.floor((ctx.width - 16 * (per - 1)) / per);
    for (const it of b.items) {
      const c = card(ctx, `Card / ${it.title}`, { gap: 8, pad: 20, w });
      if (ctx.state === "loading") add(c, skel(ctx, 120, 14), skel(ctx, "fill", 10), skel(ctx, 160, 10));
      else add(c, await text(ctx, it.title, { size: "base", weight: "semibold" }), it.text && await text(ctx, it.text, { size: "sm", color: "muted-foreground", w: "fill" }), it.badge && await badge(ctx, it.badge, statusVariant(it.badge)));
      add(grid, c);
    }
    return grid;
  }
  async function details(ctx, b) {
    const c = card(ctx, b.title || "Details");
    if (b.title) add(c, await cardTitle(ctx, b.title, b.subtitle));
    const per = cols(ctx, b.columns || 2);
    const grid = box(ctx, "Fields", { dir: "H", gap: 16, w: "fill", wrap: true });
    const w = Math.floor((ctx.width - 48 - 16 * (per - 1)) / per);
    for (const it of b.items) {
      const [label, value] = Array.isArray(it) ? it : typeof it === "string" ? it.split(":") : [it.label, it.value];
      const f = box(ctx, `Field / ${label}`, { gap: 4, w });
      const v = value && !["money", "person", "phone", "date", "id", "product", "city", "company"].includes(value) ? value : fakeRows([`x:${value || "text"}`], 1, label.length + ctx.seed)[0][0];
      add(f, await text(ctx, label, { size: "xs", color: "muted-foreground" }), ctx.state === "loading" ? skel(ctx, 120, 12) : await text(ctx, v, { size: "sm", weight: "medium", w: "fill" }));
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
  var isPrimary = (label) => String(label).trim().startsWith("+");
  var clean = (label) => String(label).replace(/^\+\s*/, "");
  async function header(ctx, b) {
    var _a;
    const mobile = ctx.vp === "mobile";
    const h = box(ctx, "Page header", { dir: mobile ? "V" : "H", gap: 16, align: mobile ? "MIN" : "CENTER", justify: "SPACE_BETWEEN", w: "fill" });
    const left = box(ctx, "Title", { gap: 6, w: mobile ? "fill" : "hug" });
    if (b.breadcrumbs) add(left, await text(ctx, b.breadcrumbs.join("  /  "), { size: "sm", color: "muted-foreground" }));
    const titleRow = box(ctx, "Title row", { dir: "H", gap: 12, align: "CENTER" });
    add(titleRow, await text(ctx, b.title, { size: mobile ? "xl" : "2xl", weight: "bold" }), b.badge && await badge(ctx, b.badge, "secondary"));
    add(left, titleRow, b.subtitle && await text(ctx, b.subtitle, { size: "sm", color: "muted-foreground" }));
    add(h, left);
    if ((_a = b.actions) == null ? void 0 : _a.length) {
      const acts = box(ctx, "Actions", { dir: "H", gap: 8, align: "CENTER", wrap: mobile });
      for (const a of b.actions) add(acts, await button(ctx, clean(a), isPrimary(a) ? "default" : "outline"));
      add(h, acts);
    }
    return h;
  }
  async function toolbar(ctx, b) {
    var _a, _b;
    const mobile = ctx.vp === "mobile";
    const t = box(ctx, "Toolbar", { dir: mobile ? "V" : "H", gap: 8, align: mobile ? "MIN" : "CENTER", w: "fill" });
    add(t, await input(ctx, b.search || "\u041F\u043E\u0438\u0441\u043A\u2026", { w: mobile ? "fill" : 320 }));
    const filters = box(ctx, "Filters", { dir: "H", gap: 8, wrap: true, w: mobile ? "fill" : "hug" });
    for (const f of b.filters || []) add(filters, await button(ctx, `${f}  \u25BE`, "outline", "sm"));
    if (((_a = b.filters) == null ? void 0 : _a.length) && !mobile) add(filters, await button(ctx, "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C", "ghost", "sm"));
    add(t, filters);
    if (((_b = b.actions) == null ? void 0 : _b.length) && !mobile) {
      add(t, box(ctx, "Spacer", { w: "fill" }));
      for (const a of b.actions) add(t, await button(ctx, clean(a), isPrimary(a) ? "default" : "outline", "sm"));
    }
    return t;
  }
  async function pagination(ctx, b) {
    const p = box(ctx, "Pagination", { dir: "H", gap: 8, align: "CENTER", justify: "SPACE_BETWEEN", w: "fill" });
    add(p, ctx.state === "loading" ? skel(ctx, 140, 12) : await text(ctx, b.summary || "\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E 1\u20138 \u0438\u0437 128", { size: "sm", color: "muted-foreground" }));
    const pages = box(ctx, "Pages", { dir: "H", gap: 4, align: "CENTER" });
    add(pages, await button(ctx, "\u2039 \u041D\u0430\u0437\u0430\u0434", "ghost", "sm"));
    if (ctx.vp !== "mobile") for (const n of ["1", "2", "3", "\u2026", "16"]) add(pages, await button(ctx, n, n === "1" ? "outline" : "ghost", "sm"));
    add(pages, await button(ctx, "\u0412\u043F\u0435\u0440\u0451\u0434 \u203A", "ghost", "sm"));
    return add(p, pages);
  }
  async function tabs(ctx, b) {
    var _a;
    const t = box(ctx, "Tabs", { dir: "H", gap: 4, pad: 4, fill: "muted", radius: "lg" });
    const active = (_a = b.active) != null ? _a : 0;
    for (const [i, label] of b.items.entries()) {
      const tab = box(ctx, `Tab / ${label}`, { dir: "H", pad: [6, 12], radius: "md", fill: i === active ? "background" : null, align: "CENTER" });
      add(t, add(tab, await text(ctx, label, { size: "sm", weight: "medium", color: i === active ? "foreground" : "muted-foreground" })));
    }
    return t;
  }
  async function field(ctx, f, w, error) {
    const spec = typeof f === "string" ? { label: f.split(":")[0], type: f.split(":")[1] || "text" } : f;
    const wrap = box(ctx, `Field / ${spec.label}`, { gap: 6, w });
    if (spec.type === "checkbox") {
      const row = box(ctx, "Checkbox row", { dir: "H", gap: 8, align: "CENTER" });
      return add(wrap, add(row, await checkbox(ctx, true), await text(ctx, spec.label, { size: "sm" })));
    }
    add(wrap, await text(ctx, spec.label + (spec.required ? " *" : ""), { size: "sm", weight: "medium" }));
    const ph = spec.placeholder || (spec.type === "select" ? "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435\u2026  \u25BE" : spec.type === "date" ? "\u0434\u0434.\u043C\u043C.\u0433\u0433\u0433\u0433" : spec.type === "money" ? "0 \u0441" : spec.type === "phone" ? "+996 ___ ___ ___" : "");
    const inp = await input(ctx, ph, { error });
    if (spec.type === "textarea") inp.resize(inp.width, 88);
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
    const grid = box(ctx, "Fields", { dir: "H", gap: 16, w: "fill", wrap: true });
    const w = Math.floor((inner - 16 * (per - 1)) / per);
    for (const [i, f] of b.fields.entries()) add(grid, await field(ctx, f, w, ctx.state === "error" && i === 0));
    add(c, grid);
    const acts = box(ctx, "Form actions", { dir: "H", gap: 8, justify: "MAX", w: "fill" });
    add(acts, await button(ctx, b.cancel || "\u041E\u0442\u043C\u0435\u043D\u0430", "outline"), await button(ctx, b.submit || "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C", "default"));
    return add(c, acts);
  }
  async function stepper(ctx, b) {
    var _a;
    const s = box(ctx, "Stepper", { dir: ctx.vp === "mobile" ? "V" : "H", gap: 8, align: "CENTER", w: "fill" });
    const cur = (_a = b.current) != null ? _a : 1;
    for (const [i, label] of b.steps.entries()) {
      const done = i < cur;
      const st = box(ctx, `Step / ${label}`, { dir: "H", gap: 8, align: "CENTER" });
      const dot = box(ctx, "Dot", { dir: "H", w: 24, h: 24, radius: "full", align: "CENTER", justify: "CENTER", fill: i <= cur ? "primary" : "muted" });
      add(dot, await text(ctx, done ? "\u2713" : String(i + 1), { size: "xs", weight: "semibold", color: i <= cur ? "primary-foreground" : "muted-foreground" }));
      add(st, dot, await text(ctx, label, { size: "sm", weight: i === cur ? "semibold" : "regular", color: i <= cur ? "foreground" : "muted-foreground" }));
      add(s, st);
      if (i < b.steps.length - 1 && ctx.vp !== "mobile") add(s, rect(ctx, "Line", 32, 1, done ? "primary" : "border"));
    }
    return s;
  }
  var ALERT = { destructive: ["destructive", "destructive"], warning: ["warning", "foreground"], info: ["info", "foreground"], success: ["success", "foreground"] };
  async function alert(ctx, b) {
    const [accent, tc] = ALERT[b.variant] || ALERT.info;
    const a = box(ctx, `Alert / ${b.variant || "info"}`, { dir: "H", gap: 12, pad: 16, stroke: accent, radius: "lg", fill: "background", w: "fill" });
    add(a, rect(ctx, "Mark", 4, 36, accent, "full"));
    const t = box(ctx, "Text", { gap: 2, w: "fill" });
    add(t, b.title && await text(ctx, b.title, { size: "sm", weight: "semibold", color: tc }), await text(ctx, b.text, { size: "sm", color: "muted-foreground", w: "fill" }));
    return add(a, t, b.action && await button(ctx, b.action, "outline", "sm"));
  }
  async function empty(ctx, b) {
    const c = box(ctx, "Empty state", { gap: 12, pad: [56, 24], align: "CENTER", stroke: "border", radius: "xl", fill: "card", w: "fill" });
    c.dashPattern = [6, 4];
    const icon2 = box(ctx, "Icon", { dir: "H", w: 48, h: 48, radius: "full", fill: "muted", align: "CENTER", justify: "CENTER" });
    add(icon2, await text(ctx, b.icon || "\u2205", { size: "lg", color: "muted-foreground" }));
    add(
      c,
      icon2,
      await text(ctx, b.title || "\u041F\u043E\u043A\u0430 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435\u0442", { size: "base", weight: "semibold", align: "CENTER" }),
      await text(ctx, b.text || "\u0417\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0430\u043F\u0438\u0441\u0438, \u043A\u043E\u0433\u0434\u0430 \u043E\u043D\u0438 \u0431\u0443\u0434\u0443\u0442 \u0441\u043E\u0437\u0434\u0430\u043D\u044B.", { size: "sm", color: "muted-foreground", align: "CENTER" }),
      b.action && await button(ctx, clean(b.action), "default")
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
      const [label, type] = f.split(":");
      const fw = box(ctx, `Field / ${label}`, { gap: 6, w: "fill" });
      add(c, add(fw, await text(ctx, label, { size: "sm", weight: "medium" }), await input(ctx, type === "password" ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "name@company.kg", { error: err })));
    }
    const btn = await button(ctx, b.submit || "\u0412\u043E\u0439\u0442\u0438", "default");
    add(c, btn);
    if ("layoutSizingHorizontal" in btn) btn.layoutSizingHorizontal = "FILL";
    if (b.footer !== false) add(c, await text(ctx, b.footer || "\u0417\u0430\u0431\u044B\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C?", { size: "sm", color: "muted-foreground", align: "CENTER", w: "fill" }));
    return add(wrap, c);
  }
  var SPLIT_GAP = 24;

  // plugin/src/screens.js
  var BUILDERS = __spreadValues(__spreadValues({}, blocks_data_exports), blocks_ui_exports);
  var GAP = 120;
  var LISTS = ["table", "list", "kanban", "cards"];
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
        if (LISTS.includes(b.type)) {
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
          if (!replaced && LISTS.includes(b.type)) {
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
      for (const [i, col] of b.columns.entries()) {
        const w = ctx.vp === "mobile" ? ctx.width : Math.floor(avail * (ratio[i] || 1) / total);
        const c = box(ctx, `Column ${i + 1}`, { gap: 24, w: ctx.vp === "mobile" ? "fill" : w });
        const sub = __spreadProps(__spreadValues({}, ctx), { width: w });
        for (const x of blocksForState({ blocks: col }, ctx.state === "loading" ? "default" : ctx.state)) add(c, await renderBlock(sub, x));
        add(row, c);
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
    if (push && frame.height < 812) {
      frame.primaryAxisSizingMode = "FIXED";
      frame.resize(width, 812);
      push.layoutSizingVertical = "FILL";
    }
    frame.name = `[draft] ${screen.title} / ${state} / ${width}`;
    return frame;
  }
  async function pageFor(name) {
    await figma.loadAllPagesAsync();
    return figma.root.children.find((p) => p.name === name) || Object.assign(figma.createPage(), { name });
  }
  async function buildSpec(rawSpec, opts, onProgress = () => {
  }) {
    const spec = normalizeSpec(rawSpec);
    const font = await loadFonts(opts.font || "Inter");
    const base = createCtx({ vars: opts.vars, radius: opts.radius, font, kit: opts.kit || {} });
    base.kitStyles = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
    const screens = spec.screens.filter((s) => {
      var _a;
      return !((_a = opts.only) == null ? void 0 : _a.length) || opts.only.includes(s.id);
    });
    const total = screens.reduce((n, s) => n + s.states.length * s.viewports.length, 0);
    const result = { frames: [], sections: [], stats: base.stats, font, fallbackFonts: false };
    let done = 0;
    const yByPage = {};
    for (const [si, screen] of screens.entries()) {
      const page = await pageFor(screen.page);
      await figma.setCurrentPageAsync(page);
      const title = `${spec.project} / ${screen.title}`;
      page.findAll((n) => n.type === "SECTION" && n.name === title).forEach((n) => n.remove());
      if (yByPage[page.id] == null) yByPage[page.id] = Math.max(0, ...page.children.map((n) => n.y + n.height + GAP));
      const section = figma.createSection();
      section.name = title;
      page.appendChild(section);
      let y = GAP;
      for (const state of screen.states) {
        let x = GAP;
        let rowH = 0;
        for (const vp of screen.viewports) {
          const f = await buildFrame(base, spec, screen, state, vp, si * 13);
          section.appendChild(f);
          f.x = x;
          f.y = y;
          await setFrameModes(f, { brand: opts.brand, style: opts.style, theme: opts.theme || "light" });
          x += f.width + GAP;
          rowH = Math.max(rowH, f.height);
          result.frames.push({ id: f.id, name: f.name, page: page.name });
          onProgress(++done, total, f.name);
        }
        y += rowH + GAP;
      }
      const w = Math.max(...section.children.map((n) => n.x + n.width)) + GAP;
      section.resizeWithoutConstraints(w, y);
      section.x = 0;
      section.y = yByPage[page.id];
      yByPage[page.id] += y + GAP;
      result.sections.push({ id: section.id, name: title, page: page.name });
    }
    result.fallbackFonts = base.stats.fallbackFonts;
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

  // core/contract.js
  var SCHEMA = "mbank/component@1";
  var STATES2 = ["default", "hover", "active", "focus", "disabled"];
  var statesAllowed = (c) => [.../* @__PURE__ */ new Set([...STATES2, ...c && c.states || []])];
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
    align: "layout"
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
      primaryAxisAlignItems: s.align === "between" ? "SPACE_BETWEEN" : row && s.align === "center" ? "CENTER" : "MIN",
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
      "secondary-foreground": { "figma": "neutral/primary/on-accent", "collection": "2.theme" },
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
      "neutral/primary/on-accent": "850d035c748c1bafefc3fb2f9ce21a77f1e16afb",
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
    try {
      const v = await figma.variables.importVariableByKeyAsync(key);
      if (v && !t.imported.includes(name)) t.imported.push(name);
      return v || null;
    } catch (e) {
      return null;
    }
  }
  function colorName(token, depth = 0) {
    const m = TOKEN_MAP.colors[token];
    if (m && m.alias && depth < 4) return colorName(m.alias, depth + 1);
    return m && m.figma;
  }
  function pick2(t, name, type, collection) {
    const list2 = (t.byName.get(name) || []).filter((v) => v.resolvedType === type);
    if (!list2.length) return null;
    return collection && list2.find((v) => (t.colName.get(v.variableCollectionId) || "").startsWith(collection)) || list2[0];
  }
  function findColor(t, token, depth = 0) {
    var _a;
    const mode = (_a = t.ix.named[C.mode]) == null ? void 0 : _a.get(token);
    if (mode && mode.resolvedType === "COLOR") return mode;
    const m = TOKEN_MAP.colors[token];
    if (m && m.alias && depth < 4) return findColor(t, m.alias, depth + 1);
    if (m && m.figma) {
      const v = pick2(t, m.figma, "COLOR", m.collection);
      if (v) return v;
    }
    return pick2(t, token, "COLOR") || pick2(t, `color/${token}`, "COLOR");
  }
  function findRadius(t, key) {
    var _a;
    const style = (_a = t.ix.named[C.style]) == null ? void 0 : _a.get(`radius/${key}`);
    if (style) return style;
    return TOKEN_MAP.radius[key] && pick2(t, TOKEN_MAP.radius[key], "FLOAT") || pick2(t, `radius/${key}`, "FLOAT") || pick2(t, `rounded/${key}`, "FLOAT");
  }
  function findSpace(t, step) {
    const s = String(step).replace(".", "-");
    const mbank = TOKEN_MAP.spacing && TOKEN_MAP.spacing[String(step * STEP)];
    return pick2(t, `spacing/${step}`, "FLOAT") || pick2(t, `spacing/${s}`, "FLOAT") || pick2(t, `spacing/${step * STEP}`, "FLOAT") || mbank && pick2(t, mbank, "FLOAT");
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

  // plugin/src/components.js
  var PAGE = "Components";
  var KEY = "mbank-contract";
  var GAP2 = 24;
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
    if (a.width) {
      L.width = a.width;
      if (L.layoutMode === "HORIZONTAL") L.primaryAxisSizingMode = "FIXED";
      else L.counterAxisSizingMode = "FIXED";
    }
    for (const f of FLOAT_FIELDS) if (node.boundVariables && node.boundVariables[f]) node.setBoundVariable(f, null);
    for (const k of ["layoutMode", "primaryAxisAlignItems", "counterAxisAlignItems", "itemSpacing", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom"]) node[k] = L[k];
    node.primaryAxisSizingMode = L.primaryAxisSizingMode;
    node.counterAxisSizingMode = L.counterAxisSizingMode;
    if (L.width !== void 0 || L.height !== void 0) node.resize(L.width || node.width, L.height || node.height);
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
  async function pickTextStyle(r, size2, weight) {
    const key = `${size2}/${weight}`;
    if (r.textStyles.has(key)) return r.textStyles.get(key);
    const local = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
    const mapped = TOKEN_MAP.text[size2];
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
      const sz = TYPE_SCALE[size2] ? size2 : { "2xs": "xs", caption: "xs", md: "sm", "5xl": "4xl", "6xl": "4xl", "7xl": "4xl" }[size2] || "sm";
      st = await textStyle(r.ctx, sz, weight);
    }
    r.textStyles.set(key, st);
    return st;
  }
  async function libraryStyle(name) {
    const key = TOKEN_MAP.styleKeys && TOKEN_MAP.styleKeys[name];
    if (!key || !figma.importStyleByKeyAsync) return null;
    try {
      return await figma.importStyleByKeyAsync(key);
    } catch (e) {
      return null;
    }
  }
  var defaultText = (part, c) => ({ placeholder: "Placeholder", description: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", value: "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435", hint: "\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430" })[part] || c.title || c.name;
  async function applyText(r, node, style, part, c, a = {}) {
    const size2 = inherited(style, part, "text", "sm");
    const weight = inherited(style, part, "weight", "regular");
    const st = await pickTextStyle(r, size2, weight);
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
  async function applyIcon(r, comp, style, part) {
    var _a, _b;
    const token = splitToken(inherited(style, part, "fg", "foreground")).token;
    r.ctx.vars[token] = await colorVar(r.t, token, { create: r.create });
    const node = icon(r.ctx, "check", token, ((_b = (_a = style[part]) == null ? void 0 : _a.size) != null ? _b : 4) * STEP);
    node.name = part;
    if (r.ctx.vars[token]) r.bound++;
    else r.unbound++;
    return node;
  }
  async function instanceOf(r, a) {
    const { name, key } = a.component;
    let main = null;
    if (key && figma.importComponentByKeyAsync) {
      try {
        main = await figma.importComponentByKeyAsync(key);
      } catch (e) {
      }
    }
    if (!main) {
      const local = figma.root.findOne((n) => (n.type === "COMPONENT_SET" || n.type === "COMPONENT") && n.name === name);
      main = local && local.type === "COMPONENT_SET" ? local.defaultVariant : local;
    }
    if (!main) {
      if (!r.missingComponents.includes(name)) r.missingComponents.push(name);
      return null;
    }
    const inst = main.createInstance();
    const label = a.sample && inst.findOne && inst.findOne((n) => n.type === "TEXT");
    if (label) {
      try {
        await figma.loadFontAsync(label.fontName);
        label.characters = a.sample;
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
    if (kind === "icon") node = await applyIcon(r, holder, style, part);
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
      holders.set(part, node);
      keep.add(node);
    }
    for (const h of holders.values()) if (h.type !== "INSTANCE" && h.children) {
      for (const n of [...h.children]) if (!keep.has(n)) n.remove();
    }
  }
  function layoutGrid(set, c, comps) {
    const states = statesOf(c);
    const w = Math.max(...comps.map((x) => x.node.width));
    const h = Math.max(...comps.map((x) => x.node.height));
    comps.forEach((x, i) => {
      x.node.x = GAP2 + i % states.length * (w + GAP2);
      x.node.y = GAP2 + Math.floor(i / states.length) * (h + GAP2);
    });
    const rows = Math.ceil(comps.length / states.length);
    set.resizeWithoutConstraints(GAP2 + states.length * (w + GAP2), GAP2 + rows * (h + GAP2));
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
      node.x = GAP2;
      node.y = GAP2 + Math.max(0, ...page.children.filter((n) => n !== node).map((n) => n.y + n.height));
    }
    await renderVariant(r, node, c, {}, "default");
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

  // plugin/src/contracts.js
  var PREFIX = "contract:";
  function stored() {
    const out = {};
    for (const key of figma.root.getPluginDataKeys().filter((k) => k.startsWith(PREFIX))) {
      try {
        out[key.slice(PREFIX.length)] = JSON.parse(figma.root.getPluginData(key));
      } catch (e) {
      }
    }
    return out;
  }
  function putContract(c) {
    figma.root.setPluginData(PREFIX + c.name, JSON.stringify(c));
  }
  function allContracts(bundled) {
    const out = /* @__PURE__ */ new Map();
    for (const c of bundled) out.set(c.name, { contract: c, source: c.example ? "example" : "bundled" });
    for (const [name, c] of Object.entries(stored())) out.set(name, { contract: c, source: out.has(name) ? "edited" : "file" });
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
    return [...allContracts(bundled).values()].map(({ contract: c, source }) => ({
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
    putContract(strip(res.contract));
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
          else putContract(strip(c));
        }
        return { errors, contracts: await summary(bundled) };
      },
      async "contract-render"(m) {
        let c = get(bundled, m.name);
        if (m.states) c = __spreadProps(__spreadValues({}, c), { states: m.states });
        const res = await render(c, m);
        return __spreadProps(__spreadValues({}, res), { contracts: await summary(bundled) });
      },
      async "contract-rows"(m) {
        const c = get(bundled, m.name);
        return { name: c.name, contract: c, rows: bindingRows(c), vars: await listVariables() };
      },
      async "contract-bind"(m) {
        const c = setBinding(get(bundled, m.name), m.path, m.key, m.value);
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
        figma.root.setPluginData(PREFIX + m.name, "");
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
  var contracts_default = [{ "$schema": "mbank/component@1", "name": "alert", "title": "Alert", "figma": { "name": "alert-text", "key": "862527fc2fc9aad902f137eb72e3d82620897a9d", "nodeId": "3012:33" }, "parts": ["root", "icon", "title"], "props": { "tone": { "values": ["clear", "accent", "info", "success", "warning", "error"], "default": "clear" } }, "base": { "root": { "radius": "md", "px": 4, "py": 3, "text": "sm", "align": "start" }, "icon": { "size": 5 }, "title": { "weight": "bold" } }, "variants": { "tone": { "clear": { "root": { "bg": "status-clear-muted", "fg": "status-clear-foreground" } }, "accent": { "root": { "bg": "status-accent-muted", "fg": "status-accent-foreground" } }, "info": { "root": { "bg": "status-info-muted", "fg": "status-info-foreground" } }, "success": { "root": { "bg": "status-success-muted", "fg": "status-success-foreground" } }, "warning": { "root": { "bg": "status-warning-muted", "fg": "status-warning-foreground" } }, "error": { "root": { "bg": "status-error-muted", "fg": "status-error-foreground" } } } }, "states": ["default"], "code": { "file": "alert.tsx", "export": "alertVariants", "template": "card-like", "parts": { "icon": "[&>svg]" }, "blocks": ["title"], "extra": "relative grid w-full grid-cols-[0_1fr] gap-y-0.5 has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3 [&>svg]:translate-y-0.5 [&>svg]:text-current", "extras": { "title": "col-start-2" } } }, { "$schema": "mbank/component@1", "name": "avatar", "title": "Avatar", "figma": { "name": "Avatars", "key": "a3d5e7947473b09bf719839c62a18d751927d7a8", "nodeId": "3174:1503" }, "parts": ["root", "fallback"], "props": { "size": { "values": ["xs", "sm", "md", "lg", "xl"], "default": "md" } }, "base": { "root": { "radius": "full", "layout": "row" }, "fallback": { "radius": "full", "bg": "surface-2", "weight": "medium", "fg": "soft-foreground", "layout": "row", "align": "center" } }, "variants": { "size": { "xs": { "root": { "size": 6, "text": "xs" } }, "sm": { "root": { "size": 8, "text": "xs" } }, "md": { "root": { "size": 10, "text": "sm" } }, "lg": { "root": { "size": 14, "text": "base" } }, "xl": { "root": { "size": 18, "text": "xl" } } } }, "states": ["default"], "code": { "file": "avatar.tsx", "export": "avatarVariants", "template": "badge-like", "blocks": ["fallback"], "extra": "relative shrink-0 overflow-hidden", "extras": { "fallback": "size-full justify-center" } } }, { "$schema": "mbank/component@1", "name": "badge", "title": "Badge", "figma": { "name": "Badge-status", "key": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "nodeId": "2348:2631" }, "parts": ["root", "icon"], "props": { "tone": { "values": ["neutral", "accent", "success", "warning", "error", "info", "clear"], "default": "neutral" }, "fill": { "values": ["ghost", "solid"], "default": "ghost" }, "shape": { "values": ["rounded", "square"], "default": "rounded" }, "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 1, "weight": "medium", "align": "center" }, "icon": { "size": 3 } }, "variants": { "tone": { "neutral": { "root": { "bg": "status-neutral-muted", "fg": "status-neutral-foreground" } }, "accent": { "root": { "bg": "status-accent-muted", "fg": "status-accent-foreground" } }, "success": { "root": { "bg": "status-success-muted", "fg": "status-success-foreground" } }, "warning": { "root": { "bg": "status-warning-muted", "fg": "status-warning-foreground" } }, "error": { "root": { "bg": "status-error-muted", "fg": "status-error-foreground" } }, "info": { "root": { "bg": "status-info-muted", "fg": "status-info-foreground" } }, "clear": { "root": { "bg": "status-clear-muted", "fg": "status-clear-foreground" } } }, "fill": { "ghost": {}, "solid": { "root": { "fg": "status-filled-foreground" } } }, "shape": { "rounded": { "root": { "radius": "full" } }, "square": { "root": { "radius": "xs" } } }, "size": { "sm": { "root": { "height": 5, "px": 1.5, "text": "xs" } }, "md": { "root": { "height": 6, "px": 2, "text": "xs" } }, "lg": { "root": { "height": 7, "px": 2.5, "text": "sm" } } } }, "compound": [{ "when": { "fill": "solid", "tone": "neutral" }, "root": { "bg": "status-neutral" } }, { "when": { "fill": "solid", "tone": "accent" }, "root": { "bg": "status-accent" } }, { "when": { "fill": "solid", "tone": "success" }, "root": { "bg": "status-success" } }, { "when": { "fill": "solid", "tone": "warning" }, "root": { "bg": "status-warning" } }, { "when": { "fill": "solid", "tone": "error" }, "root": { "bg": "status-error" } }, { "when": { "fill": "solid", "tone": "info" }, "root": { "bg": "status-info" } }, { "when": { "fill": "solid", "tone": "clear" }, "root": { "bg": "status-clear" } }], "states": ["default"], "code": { "file": "badge.tsx", "export": "badgeVariants", "template": "badge-like", "parts": { "icon": "[&>svg]" }, "extra": "inline-flex w-fit shrink-0 justify-center overflow-hidden whitespace-nowrap [&>svg]:pointer-events-none" } }, { "$schema": "mbank/component@1", "name": "button", "title": "Button", "figma": { "name": "button/default", "key": "713c90401df3b5d7ddf00e3af4d7ea5870c4c120", "nodeId": "2077:341" }, "parts": ["root", "icon"], "props": { "variant": { "values": ["primary", "brand", "secondary", "destructive", "success", "soft", "ghost", "outline", "static", "link"], "default": "primary" }, "size": { "values": ["xs", "sm", "md", "lg", "icon-sm", "icon", "icon-lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "weight": "medium", "opacity:disabled": 50, "align": "center", "focus-ring": "ring/50" }, "icon": { "size": 5 } }, "variants": { "variant": { "primary": { "root": { "bg": "primary", "fg": "primary-foreground", "bg:hover": "primary-hover", "bg:active": "primary-active" } }, "brand": { "root": { "bg": "brand", "fg": "brand-foreground", "bg:hover": "brand-hover", "bg:active": "brand-active" } }, "secondary": { "root": { "bg": "secondary", "fg": "secondary-foreground", "bg:hover": "secondary-hover", "bg:active": "secondary-active" } }, "destructive": { "root": { "bg": "destructive", "fg": "destructive-foreground", "bg:hover": "destructive-hover", "bg:active": "destructive-active" } }, "success": { "root": { "bg": "success", "fg": "success-foreground", "bg:hover": "success-hover", "bg:active": "success-active" } }, "soft": { "root": { "bg": "soft", "fg": "soft-foreground-strong", "bg:hover": "soft-hover" } }, "ghost": { "root": { "bg": "ghost", "fg": "ghost-foreground", "bg:hover": "ghost-hover" } }, "outline": { "root": { "border-width": 1, "border": "outline", "bg": "background", "fg": "outline-foreground", "border:hover": "outline-hover", "bg:hover": "muted" } }, "static": { "root": { "bg": "static", "fg": "static-foreground", "bg:hover": "static-hover", "bg:active": "static-active" } }, "link": { "root": { "px": 0, "fg": "link" } } }, "size": { "xs": { "root": { "height": 8, "px": 3, "text": "xs" }, "icon": { "size": 4 } }, "sm": { "root": { "height": 9, "px": 3, "text": "sm" }, "icon": { "size": 4 } }, "md": { "root": { "height": 11, "px": 4, "text": "sm" } }, "lg": { "root": { "height": 14, "px": 6, "text": "base" } }, "icon-sm": { "root": { "size": 9 } }, "icon": { "root": { "size": 11 } }, "icon-lg": { "root": { "size": 14 } } } }, "states": ["default", "hover", "active", "focus", "disabled"], "code": { "file": "button.tsx", "export": "buttonVariants", "template": "button-like", "parts": { "icon": "[&_svg:not([class*='size-'])]" }, "extra": "inline-flex shrink-0 justify-center whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 aria-invalid:ring-[3px] aria-invalid:ring-border-destructive/30", "extras": { "variant=link": "h-auto underline-offset-4 hover:underline" } } }, { "$schema": "mbank/component@1", "name": "card", "title": "Card", "parts": ["root", "header", "title", "description", "content", "footer"], "props": {}, "base": { "root": { "gap": 4, "radius": "lg", "border-width": 1, "border": "border", "bg": "card", "py": 5, "fg": "card-foreground", "layout": "column" }, "header": { "gap": 1, "px": 5, "align": "start" }, "title": { "text": "base", "weight": "bold" }, "description": { "text": "sm", "fg": "muted-foreground" }, "content": { "px": 5 }, "footer": { "gap": 2, "px": 5, "layout": "row", "align": "center" } }, "variants": {}, "states": ["default"], "code": { "file": "card.tsx", "shape": "classes", "template": "card-like", "blocks": ["header", "title", "description", "content", "footer"], "extras": { "header": "grid auto-rows-min grid-rows-[auto_auto] has-data-[slot=card-action]:grid-cols-[1fr_auto]", "footer": "[.border-t]:pt-4" } } }, { "$schema": "mbank/component@1", "name": "checkbox", "title": "Checkbox", "figma": { "name": "Switchers - Check", "key": "be053b3924b63e289a38bfd661b7180deb83236e", "nodeId": "2280:9729" }, "parts": ["root"], "props": {}, "base": { "root": { "size": 5, "radius": "xs", "border-width": 1, "border": "input", "bg": "background", "border:hover": "input-hover", "border:disabled": "input-disabled", "bg:disabled": "muted", "border:invalid": "border-destructive", "border:checked": "brand", "bg:checked": "brand", "fg:checked": "brand-foreground", "border:indeterminate": "brand", "bg:indeterminate": "brand", "fg:indeterminate": "brand-foreground", "focus-ring": "ring/30" } }, "variants": {}, "states": ["default", "hover", "focus", "disabled", "invalid", "checked", "indeterminate"], "code": { "file": "checkbox.tsx", "shape": "classes", "template": "button-like", "modifiers": { "checked": "data-[state=checked]", "indeterminate": "data-[state=indeterminate]" }, "extra": "peer shrink-0 transition-colors outline-none disabled:cursor-not-allowed disabled:data-[state=checked]:opacity-50" } }, { "$schema": "mbank/component@1", "name": "crm-application-card", "title": "CRM / Application card", "figma": { "name": "CRM / Application card", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "33:28", "uses": 15 } }, "parts": ["root", "top", "id", "time", "name", "amount", "meta", "footer", "badge"], "anatomy": { "root": { "width": 200 }, "top": { "kind": "frame", "layer": "Top", "fill": true }, "id": { "kind": "text", "layer": "ID", "parent": "top", "sample": "CL-240118" }, "time": { "kind": "text", "layer": "Time", "parent": "top", "sample": "09:14" }, "name": { "kind": "text", "layer": "Name", "fill": true, "sample": "\u0410\u0441\u0430\u043D\u043E\u0432 \u041D\u0443\u0440\u043B\u0430\u043D" }, "amount": { "kind": "text", "layer": "Amount", "sample": "450 000 KGS" }, "meta": { "kind": "text", "layer": "Meta", "fill": true, "sample": "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \xB7 24 \u043C\u0435\u0441" }, "footer": { "kind": "frame", "layer": "Footer", "fill": true }, "badge": { "kind": "instance", "layer": "Badge-status", "parent": "footer", "sample": "SLA 25 \u043C\u0438\u043D", "component": { "name": "Badge-status", "set": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "key": "b68afd3e0714ecefd38ee21793292c14ae240015", "variant": "Size=S, Form=rounded, Appearance=Info, Status=Off, Icon=Off, Solid=off" } } }, "props": {}, "base": { "root": { "layout": "column", "gap": 1, "px": 3, "py": 3, "radius": "md", "bg": "card", "fg": "foreground" }, "top": { "layout": "row", "align": "between" }, "id": { "text": "caption", "fg": "muted-foreground", "weight": "regular" }, "time": { "text": "caption", "fg": "muted-foreground", "weight": "regular" }, "name": { "text": "sm", "weight": "medium", "fg": "foreground" }, "amount": { "text": "base", "weight": "bold", "fg": "foreground" }, "meta": { "text": "caption", "fg": "muted-foreground", "weight": "regular" }, "footer": { "layout": "row", "align": "start", "pt": 1 } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/ApplicationCard.tsx", "slot": "application-card" } }, { "$schema": "mbank/component@1", "name": "crm-key-value-row", "title": "CRM / Key-value row", "figma": { "name": "CRM / Key-value row", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "24:6539", "uses": 26 } }, "parts": ["root", "label", "value"], "anatomy": { "root": { "width": 480 }, "label": { "kind": "text", "layer": "Label", "width": 180, "sample": "\u041A\u043B\u044E\u0447" }, "value": { "kind": "text", "layer": "Value", "fill": true, "sample": "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435" } }, "props": {}, "base": { "root": { "layout": "row", "align": "start", "gap": 4, "px": 0, "py": 2, "text": "sm" }, "label": { "text": "sm", "fg": "muted-foreground", "weight": "regular" }, "value": { "text": "sm", "weight": "medium", "fg": "foreground" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/KeyValueRow.tsx", "slot": "key-value-row" } }, { "$schema": "mbank/component@1", "name": "crm-kpi-card", "title": "CRM / KPI card", "figma": { "name": "CRM / KPI card", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "21:1819", "uses": 8 } }, "parts": ["root", "label", "value", "delta", "delta-value", "delta-label"], "anatomy": { "root": { "width": 260 }, "label": { "kind": "text", "layer": "Label", "sample": "\u041F\u0435\u0440\u0435\u0432\u043E\u0434\u043E\u0432 \u0441\u0435\u0433\u043E\u0434\u043D\u044F" }, "value": { "kind": "text", "layer": "Value", "sample": "12 480" }, "delta": { "kind": "frame", "layer": "Delta" }, "delta-value": { "kind": "text", "layer": "Delta value", "parent": "delta", "sample": "+8,2%" }, "delta-label": { "kind": "text", "layer": "Delta label", "parent": "delta", "sample": "\u043A \u0432\u0447\u0435\u0440\u0430" } }, "props": {}, "base": { "root": { "layout": "column", "gap": 2, "px": 5, "py": 5, "radius": "lg", "bg": "card", "fg": "foreground" }, "label": { "text": "sm", "fg": "muted-foreground", "weight": "regular" }, "value": { "text": "2xl", "weight": "bold", "fg": "foreground" }, "delta": { "layout": "row", "align": "center", "gap": 1 }, "delta-value": { "text": "sm", "weight": "medium", "fg": "success-text" }, "delta-label": { "text": "caption", "fg": "muted-foreground", "weight": "regular" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/KpiCard.tsx", "slot": "kpi-card" } }, { "$schema": "mbank/component@1", "name": "crm-timeline-item", "title": "CRM / Timeline item", "figma": { "name": "CRM / Timeline item", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "24:6542", "uses": 8 } }, "parts": ["root", "marker", "dot", "content", "title", "meta"], "anatomy": { "root": { "width": 320 }, "marker": { "kind": "frame", "layer": "Marker" }, "dot": { "kind": "frame", "layer": "Dot", "parent": "marker" }, "content": { "kind": "frame", "layer": "Content", "fill": true }, "title": { "kind": "text", "layer": "Title", "parent": "content", "fill": true, "sample": "\u0421\u043E\u0431\u044B\u0442\u0438\u0435" }, "meta": { "kind": "text", "layer": "Meta", "parent": "content", "sample": "12.10.2026, 14:32 \xB7 \u0421\u0438\u0441\u0442\u0435\u043C\u0430" } }, "props": {}, "base": { "root": { "layout": "row", "align": "start", "gap": 3 }, "marker": { "layout": "column", "px": 0, "pt": 1, "pb": 0 }, "dot": { "size": 3, "radius": "full", "bg": "border-success" }, "content": { "layout": "column", "gap": 1 }, "title": { "text": "sm", "weight": "medium", "fg": "foreground" }, "meta": { "text": "caption", "fg": "muted-foreground", "weight": "regular" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/TimelineItem.tsx", "slot": "timeline-item" } }, { "$schema": "mbank/component@1", "name": "crm-transfer-row", "title": "CRM / Transfer row", "figma": { "name": "CRM / Transfer row", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "23:10079", "uses": 10 } }, "parts": ["root", "id-cell", "id-content", "id", "date-cell", "date-content", "date", "sender-cell", "sender-content", "sender", "recipient-cell", "recipient-content", "recipient", "country-cell", "country-content", "country", "amount-cell", "amount-content", "amount", "channel-cell", "channel-content", "channel", "status-cell", "status"], "anatomy": { "root": { "sides": ["bottom"] }, "id-cell": { "kind": "frame", "layer": "TableCell 1", "width": 124, "sides": ["right"] }, "id-content": { "kind": "frame", "layer": "TextContent", "parent": "id-cell", "fill": true }, "id": { "kind": "text", "layer": "Label", "parent": "id-content", "fill": true, "sample": "TR-80421951" }, "date-cell": { "kind": "frame", "layer": "TableCell 2", "width": 156, "sides": ["right"] }, "date-content": { "kind": "frame", "layer": "TextContent", "parent": "date-cell", "fill": true }, "date": { "kind": "text", "layer": "Label", "parent": "date-content", "fill": true, "sample": "12.10.2026, 14:32" }, "sender-cell": { "kind": "frame", "layer": "TableCell 3", "width": 160, "sides": ["right"] }, "sender-content": { "kind": "frame", "layer": "TextContent", "parent": "sender-cell", "fill": true }, "sender": { "kind": "text", "layer": "Label", "parent": "sender-content", "fill": true, "sample": "\u0411\u0430\u043A\u044B\u0442 \u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B\u043E\u0432" }, "recipient-cell": { "kind": "frame", "layer": "TableCell 4", "width": 170, "sides": ["right"] }, "recipient-content": { "kind": "frame", "layer": "TextContent", "parent": "recipient-cell", "fill": true }, "recipient": { "kind": "text", "layer": "Label", "parent": "recipient-content", "fill": true, "sample": "\u0418\u0432\u0430\u043D \u041F\u0435\u0442\u0440\u043E\u0432" }, "country-cell": { "kind": "frame", "layer": "TableCell 5", "width": 116, "sides": ["right"] }, "country-content": { "kind": "frame", "layer": "TextContent", "parent": "country-cell", "fill": true }, "country": { "kind": "text", "layer": "Label", "parent": "country-content", "fill": true, "sample": "\u0420\u043E\u0441\u0441\u0438\u044F" }, "amount-cell": { "kind": "frame", "layer": "TableCell 6", "width": 124, "sides": ["right"] }, "amount-content": { "kind": "frame", "layer": "TextContent", "parent": "amount-cell", "fill": true }, "amount": { "kind": "text", "layer": "Label", "parent": "amount-content", "fill": true, "sample": "185 000 KGS" }, "channel-cell": { "kind": "frame", "layer": "TableCell 7", "width": 128, "sides": ["right"] }, "channel-content": { "kind": "frame", "layer": "TextContent", "parent": "channel-cell", "fill": true }, "channel": { "kind": "text", "layer": "Label", "parent": "channel-content", "fill": true, "sample": "\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435" }, "status-cell": { "kind": "frame", "layer": "TableCell 8", "width": 138, "sides": ["right"] }, "status": { "kind": "instance", "layer": "Badge-status", "parent": "status-cell", "sample": "\u0423\u0441\u043F\u0435\u0448\u043D\u043E", "component": { "name": "Badge-status", "set": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "key": "4c16cc198bc2c10f229898b330166c1db17200b6", "variant": "Size=S, Form=rounded, Appearance=Success, Status=Off, Icon=Off, Solid=off" } } }, "props": {}, "base": { "root": { "layout": "row", "align": "center", "bg": "background", "border": "border", "border-width": 1, "text": "sm" }, "id-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "id-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "id": { "text": "sm", "weight": "regular", "fg": "foreground" }, "date-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "date-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "date": { "text": "sm", "weight": "regular", "fg": "foreground" }, "sender-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "sender-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "sender": { "text": "sm", "weight": "regular", "fg": "foreground" }, "recipient-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "recipient-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "recipient": { "text": "sm", "weight": "regular", "fg": "foreground" }, "country-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "country-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "country": { "text": "sm", "weight": "regular", "fg": "foreground" }, "amount-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "amount-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "amount": { "text": "sm", "weight": "regular", "fg": "foreground" }, "channel-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "channel-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "channel": { "text": "sm", "weight": "regular", "fg": "foreground" }, "status-cell": { "layout": "row", "align": "center", "gap": 2, "px": 3, "border": "border", "border-width": 1, "py": 3 } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/TransferRow.tsx", "slot": "transfer-row", "inline": ["id-content", "id", "date-content", "date", "sender-content", "sender", "recipient-content", "recipient", "country-content", "country", "amount-content", "amount", "channel-content", "channel"] } }, { "$schema": "mbank/component@1", "name": "input", "title": "Input", "figma": { "name": "input/default", "key": "9b99d128100afd0ac499d5fc2cfdedf0ae6aa44b", "nodeId": "2184:1939" }, "parts": ["root", "placeholder"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "border:invalid": "border-destructive", "layout": "row", "focus-ring": "ring/30" }, "placeholder": { "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9, "text": "sm" } }, "md": { "root": { "height": 11, "text": "sm" } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "hover", "focus", "disabled", "invalid"], "code": { "file": "input.tsx", "export": "inputVariants", "template": "input-like", "parts": { "placeholder": "placeholder" }, "extra": "w-full min-w-0 transition-colors outline-none disabled:pointer-events-none file:border-0 file:bg-transparent file:text-sm file:font-medium aria-invalid:ring-border-destructive/20" } }, { "$schema": "mbank/component@1", "name": "pagination", "title": "Pagination item", "figma": { "name": "item/pagintaion / buttons", "key": "2255ec920c853b652f1389adbc4bd30779ee35d7", "nodeId": "4141:5990" }, "parts": ["root", "icon"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "radius": "sm", "weight": "medium", "fg": "foreground", "bg:hover": "accent", "fg:disabled": "disabled-foreground", "bg:selected": "secondary", "fg:selected": "secondary-foreground", "align": "center", "focus-ring": "ring/30" }, "icon": { "size": 5 } }, "variants": { "size": { "sm": { "root": { "height": 8, "px": 1.5, "text": "xs" } }, "md": { "root": { "height": 9, "px": 2, "text": "sm" } }, "lg": { "root": { "height": 10, "px": 2.5, "text": "sm" } } } }, "states": ["default", "hover", "focus", "disabled", "selected"], "code": { "file": "pagination.tsx", "export": "paginationItemVariants", "template": "button-like", "parts": { "icon": "[&_svg]" }, "modifiers": { "selected": "aria-[current=page]" }, "extra": "inline-flex shrink-0 justify-center tabular-nums transition-colors outline-none select-none disabled:pointer-events-none [&_svg]:shrink-0", "extras": { "size=sm": "min-w-8", "size=md": "min-w-9", "size=lg": "min-w-10" } } }, { "$schema": "mbank/component@1", "name": "progress", "title": "Progress", "figma": { "name": "Progress bar / Determinate", "key": "cf47478133f9b8625225affab7ae57b7b022c9bd", "nodeId": "4823:334" }, "parts": ["root", "indicator"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" }, "shape": { "values": ["rounded", "square"], "default": "rounded" }, "tone": { "values": ["brand", "success", "error", "warning"], "default": "brand" } }, "base": { "root": { "bg": "surface-2" } }, "variants": { "size": { "sm": { "root": { "height": 1 } }, "md": { "root": { "height": 2 } }, "lg": { "root": { "height": 3 } } }, "shape": { "rounded": { "root": { "radius": "full" } }, "square": { "root": { "radius": "none" } } }, "tone": { "brand": { "indicator": { "bg": "brand" } }, "success": { "indicator": { "bg": "status-success" } }, "error": { "indicator": { "bg": "status-error" } }, "warning": { "indicator": { "bg": "status-warning" } } } }, "states": ["default"], "code": { "file": "progress.tsx", "export": "progressVariants", "template": "card-like", "maps": { "tone": { "const": "indicatorTones", "part": "indicator" } }, "extra": "relative w-full overflow-hidden" } }, { "$schema": "mbank/component@1", "name": "select-trigger", "title": "Select trigger", "figma": { "name": "input/dropdown", "key": "a51f7990a9914a36e511d08aeb2684c412634c09", "nodeId": "2431:11731" }, "parts": ["root", "placeholder"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "text": "sm", "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "border:invalid": "border-destructive", "layout": "row", "align": "between", "focus-ring": "ring/30" }, "placeholder": { "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9 } }, "md": { "root": { "height": 11 } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "hover", "focus", "disabled", "invalid"], "code": { "file": "select.tsx", "shape": "classes", "template": "button-like", "parts": { "placeholder": "data-[placeholder]" }, "maps": { "size": { "const": "triggerSizes", "part": "root" } }, "extra": "w-full whitespace-nowrap transition-colors outline-none disabled:pointer-events-none *:data-[slot=select-value]:truncate" } }, { "$schema": "mbank/component@1", "name": "skeleton", "title": "Skeleton", "parts": ["root"], "props": {}, "base": { "root": { "radius": "md", "bg": "surface-2" } }, "variants": {}, "states": ["default"], "code": { "file": "skeleton.tsx", "shape": "classes", "template": "card-like", "extra": "animate-pulse motion-reduce:animate-none" } }, { "$schema": "mbank/component@1", "name": "switch", "title": "Switch", "parts": ["root"], "props": {}, "base": { "root": { "height": 6, "radius": "full", "border-width": 2, "opacity:disabled": 50, "bg:checked": "brand", "bg:unchecked": "surface-3", "align": "center", "focus-ring": "ring/30" } }, "variants": {}, "states": ["default", "focus", "disabled", "checked", "unchecked"], "code": { "file": "switch.tsx", "shape": "classes", "template": "button-like", "modifiers": { "checked": "data-[state=checked]", "unchecked": "data-[state=unchecked]" }, "extra": "peer inline-flex w-10 shrink-0 border-transparent transition-colors outline-none disabled:cursor-not-allowed aria-invalid:ring-[3px] aria-invalid:ring-border-destructive/30" } }, { "$schema": "mbank/component@1", "name": "table-cell", "title": "Table cell", "figma": { "name": "TableCell", "key": "75d931d4c1075a08c944e2a7ba1b34b1c4e787d0", "nodeId": "1309:22504" }, "parts": ["root"], "props": {}, "base": { "root": { "height": 11, "px": 3, "py": 3, "text": "sm" } }, "variants": {}, "states": ["default"], "code": { "file": "table.tsx", "shape": "classes", "template": "card-like", "extra": "align-middle leading-5 whitespace-nowrap tabular-nums [&:has([role=checkbox])]:pr-0" } }, { "$schema": "mbank/component@1", "name": "tabs-list", "title": "Tabs list", "figma": { "name": "segment", "key": "f28915a7224a6ba85128b9cbab0b9d706c9285a8", "nodeId": "2371:564" }, "parts": ["root"], "props": { "variant": { "values": ["segment", "outline", "line"], "default": "segment" } }, "base": { "root": { "align": "center" } }, "variants": { "variant": { "segment": { "root": { "gap": 1, "radius": "md", "bg": "muted" } }, "outline": { "root": { "gap": 2 } }, "line": { "root": { "gap": 6, "border": "border" } } } }, "states": ["default"], "code": { "file": "tabs.tsx", "export": "tabsListVariants", "template": "card-like", "extra": "group/tabs-list inline-flex w-fit", "extras": { "variant=segment": "p-1", "variant=line": "border-b" } } }, { "$schema": "mbank/component@1", "name": "tabs-trigger", "title": "Tabs trigger", "figma": { "name": "Item / segmentButtons", "key": "d3dce4a16063872d9bd8a43a3a4901ca546452a5", "nodeId": "2370:4860" }, "parts": ["root", "icon"], "props": { "variant": { "values": ["segment", "outline", "line"], "default": "segment" } }, "base": { "root": { "height": 9, "gap": 2, "px": 3, "text": "sm", "weight": "medium", "fg": "muted-foreground", "fg:hover": "foreground", "fg:disabled": "disabled-foreground", "align": "center", "focus-ring": "ring/30" }, "icon": { "size": 4 } }, "variants": { "variant": { "segment": { "root": { "radius": "sm", "bg:selected": "background", "fg:selected": "foreground", "shadow:selected": "xs" } }, "outline": { "root": { "radius": "md", "border-width": 1, "border": "border", "border:selected": "secondary", "bg:selected": "secondary", "fg:selected": "secondary-foreground" } }, "line": { "root": { "px": 0, "border:selected": "brand", "fg:selected": "foreground" } } } }, "states": ["default", "hover", "focus", "disabled", "selected"], "code": { "file": "tabs.tsx", "shape": "classes", "template": "button-like", "parts": { "icon": "[&_svg]" }, "modifiers": { "selected": "data-[state=active]" }, "prefix": { "variant": "group-data-[variant={value}]/tabs-list" }, "extra": "inline-flex justify-center whitespace-nowrap transition-colors outline-none disabled:pointer-events-none [&_svg]:shrink-0", "extras": { "variant=line": "-mb-px border-b-2 border-transparent" } } }, { "$schema": "mbank/component@1", "name": "textarea", "title": "Textarea", "figma": { "name": "TextArea", "key": "f5e8ed2faaef70b5702fa5e0f70d9c65a370a8ed", "nodeId": "3069:1804" }, "parts": ["root", "placeholder"], "props": {}, "base": { "root": { "min-height": 24, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "py": 2.5, "text": "sm", "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "border:invalid": "border-destructive", "layout": "row", "focus-ring": "ring/30" }, "placeholder": { "fg": "muted-foreground" } }, "variants": {}, "states": ["default", "hover", "focus", "disabled", "invalid"], "code": { "file": "textarea.tsx", "shape": "classes", "template": "input-like", "parts": { "placeholder": "placeholder" }, "extra": "field-sizing-content w-full min-w-0 transition-colors outline-none disabled:pointer-events-none aria-invalid:ring-border-destructive/20" } }];

  // plugin/src/code.js
  figma.showUI(__html__, { width: 520, height: 720, themeColors: true });
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
      const errors = validateSpec(m.spec);
      if (errors.length) return { errors };
      const { vars, radius } = await modeVars();
      const k = await kit();
      const res = await buildSpec(
        m.spec,
        { vars, radius, kit: k.kit, font: m.font, brand: m.brand, style: m.style, theme: m.theme, only: m.only },
        (done, total, label) => post("progress", { done, total, label })
      );
      const audit = await auditFrames(res.frames.map((f) => f.id));
      const first = res.sections[0] && await figma.getNodeByIdAsync(res.sections[0].id);
      if (first) figma.viewport.scrollAndZoomIntoView([first]);
      return { result: res, audit };
    }
  }, contractHandlers(contracts_default));
  figma.ui.onmessage = async (m) => {
    const fn = handlers[m.type];
    if (!fn) return;
    try {
      post(`${m.type}:done`, await fn(m));
    } catch (e) {
      post("error", { for: m.type, message: String(e && e.message ? e.message : e) });
    }
  };
})();
