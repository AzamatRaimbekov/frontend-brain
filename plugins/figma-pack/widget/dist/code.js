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

  // ../builder/core/color.js
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
    const C2 = Math.sqrt(A * A + B * B);
    const H = C2 < 1e-4 ? 0 : (Math.atan2(B, A) * 180 / Math.PI + 360) % 360;
    return { l: L, c: C2, h: H };
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
  var inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  function oklchToHex({ l, c, h }) {
    let lo = 0;
    let hi = c;
    let rgb = oklchToLinear({ l, c, h });
    if (!inGamut(rgb)) {
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (inGamut(oklchToLinear({ l, c: mid, h }))) lo = mid;
        else hi = mid;
      }
      rgb = oklchToLinear({ l, c: lo, h });
    }
    const [r, g, b] = rgb.map((v) => toGamma(Math.min(1, Math.max(0, v))));
    return rgbToHex({ r, g, b });
  }
  function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }
  function contrast(fg, bg) {
    const over = (top, under) => {
      const t = hexToRgb(top);
      if (t.a >= 1) return top;
      const u = hexToRgb(under);
      const mix2 = (k) => t[k] * t.a + u[k] * (1 - t.a);
      return rgbToHex({ r: mix2("r"), g: mix2("g"), b: mix2("b") });
    };
    const a = luminance(over(fg, bg));
    const b = luminance(over(bg, "#ffffff"));
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  function onColor(fill, dark = "#09090b", light = "#ffffff") {
    return contrast(light, fill) >= contrast(dark, fill) ? light : dark;
  }

  // ../builder/core/token-map.js
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

  // ../builder/core/naming.js
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

  // core/model.js
  var BRANDS = ["bank", "kassa", "travel", "artwin", "koko"];
  var MODES = ["light", "dark"];
  var THEME = "2.theme";
  var BRAND = "1.brand";
  var GROUPS = [
    { id: "brand", label: "\u0411\u0440\u0435\u043D\u0434" },
    { id: "surface", label: "\u041F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0438 \u0438 \u0442\u0435\u043A\u0441\u0442" },
    { id: "accent", label: "\u0410\u043A\u0446\u0435\u043D\u0442\u044B" },
    { id: "border", label: "\u0413\u0440\u0430\u043D\u0438\u0446\u044B" },
    { id: "status", label: "\u0421\u0442\u0430\u0442\u0443\u0441\u044B" },
    { id: "supportive", label: "\u0414\u043E\u043F. \u043F\u0430\u043B\u0438\u0442\u0440\u0430" },
    { id: "radius", label: "\u0420\u0430\u0434\u0438\u0443\u0441\u044B" },
    { id: "extra", label: "\u0422\u043E\u043A\u0435\u043D\u044B \u043F\u0440\u043E\u0435\u043A\u0442\u0430" }
  ];
  function groupOf(css, collection) {
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
    const by = (list) => new Map((list || []).map((v) => [v.name, v]));
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
          group: groupOf(css, THEME),
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
  function resolveValue(value, mode, byCss, depth = 0) {
    const m = /^var\(--([\w-]+)\)$/.exec(String(value == null ? "" : value).trim());
    if (!m) return value;
    const target = byCss.get(m[1]);
    if (!target || depth > 8) return null;
    return resolveValue(target[mode], mode, byCss, depth + 1);
  }
  function counters(model, issues = []) {
    const base = model.rows.filter((r) => !r.extra);
    return {
      tokens: base.length,
      extras: model.rows.length - base.length,
      edited: base.filter((r) => r.edited).length,
      contrast: issues.filter((i) => !i.ok).length
    };
  }

  // src/theme.js
  var paint = (hex) => {
    try {
      const { r, g, b, a } = hexToRgb(hex);
      return { r, g, b, a };
    } catch (e) {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
  };
  var ROLES = {
    page: "background",
    card: "card",
    soft: "muted",
    text: "foreground",
    muted: "muted-foreground",
    border: "border",
    brand: "brand",
    onBrand: "brand-foreground",
    accentSoft: "brand-ghost",
    accentText: "brand-ghost-foreground",
    successBg: "status-success-muted",
    successFg: "status-success-foreground",
    warningBg: "status-warning-muted",
    warningFg: "status-warning-foreground",
    errorBg: "status-error-muted",
    errorFg: "status-error-foreground",
    neutralBg: "status-neutral-muted",
    neutralFg: "status-neutral-foreground",
    infoBg: "status-info-muted",
    infoFg: "status-info-foreground"
  };
  function chromeHex(tokens, brand = "bank") {
    const byCss = new Map(buildModel(tokens, { brand }).rows.map((r) => [r.css, r]));
    const out = {};
    for (const [role, css] of Object.entries(ROLES)) out[role] = byCss.get(css) && byCss.get(css).source.light || null;
    return out;
  }
  function chrome(tokens, brand) {
    const hex = chromeHex(tokens, brand);
    const out = {};
    for (const [role, value] of Object.entries(hex)) out[role] = paint(value);
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

  // ../builder/core/tokens.js
  function scopesFor(token) {
    const t = token.split("/").pop();
    if (/(^|-)foreground$/.test(t) || /(^|-)(txt|text)(-|$)/.test(t)) return ["TEXT_FILL", "SHAPE_FILL", "STROKE_COLOR"];
    if (/^(border|input|ring|ring-offset)$|-(border|ring)$|(^|-)border-/.test(t)) return ["STROKE_COLOR", "FRAME_FILL", "SHAPE_FILL"];
    if (/^chart-/.test(t)) return ["SHAPE_FILL", "FRAME_FILL", "STROKE_COLOR"];
    return ["FRAME_FILL", "SHAPE_FILL"];
  }
  var NEUTRALS = { neutral: [0, 0], zinc: [286, 6e-3], slate: [257, 0.02], stone: [56, 6e-3], gray: [264, 0.012] };
  var STEPS = { 50: 0.985, 100: 0.967, 200: 0.922, 300: 0.87, 400: 0.708, 500: 0.556, 600: 0.439, 700: 0.371, 800: 0.269, 900: 0.205, 950: 0.145 };
  function neutralScale(neutral, brandHue) {
    const [hue, chroma] = neutral === "tinted" ? [brandHue, 0.012] : NEUTRALS[neutral] || NEUTRALS.neutral;
    const scale = {};
    for (const [k, l] of Object.entries(STEPS)) scale[k] = oklchToHex({ l, c: chroma, h: hue });
    return scale;
  }
  var shift = (hex, dl, dc = 0) => {
    const o = hexToOklch(hex);
    return oklchToHex({ l: Math.min(0.98, Math.max(0.05, o.l + dl)), c: Math.max(0, o.c + dc), h: o.h });
  };
  function charts(brand) {
    const { c, h } = hexToOklch(brand);
    const chroma = Math.max(0.12, Math.min(0.2, c));
    return [0, 72, 144, 216, 288].map((d, i) => oklchToHex({ l: 0.62 + i % 2 * 0.08, c: chroma, h: (h + d) % 360 }));
  }
  function generateTokens(opts = {}) {
    var _a;
    const brand = opts.brand || "#18181b";
    hexToRgb(brand);
    const n = neutralScale(opts.neutral || "neutral", hexToOklch(brand).h);
    const brandDark = hexToOklch(brand).l < 0.45 ? shift(brand, 0.18) : brand;
    const status = { success: "#16a34a", warning: "#f59e0b", info: "#2563eb", destructive: "#dc2626" };
    const ch = charts(brand);
    const pair = (fill) => [fill, onColor(fill, n[950], "#ffffff")];
    const light = {
      background: "#ffffff",
      foreground: n[950],
      card: "#ffffff",
      "card-foreground": n[950],
      popover: "#ffffff",
      "popover-foreground": n[950],
      primary: brand,
      "primary-foreground": onColor(brand, n[950], "#ffffff"),
      secondary: n[100],
      "secondary-foreground": n[900],
      muted: n[100],
      "muted-foreground": n[600],
      accent: n[100],
      "accent-foreground": n[900],
      destructive: status.destructive,
      "destructive-foreground": "#ffffff",
      border: n[200],
      input: n[200],
      ring: brand,
      sidebar: n[50],
      "sidebar-foreground": n[950],
      "sidebar-primary": brand,
      "sidebar-primary-foreground": onColor(brand, n[950], "#ffffff"),
      "sidebar-accent": n[100],
      "sidebar-accent-foreground": n[900],
      "sidebar-border": n[200],
      "sidebar-ring": brand
    };
    const dark = {
      background: n[950],
      foreground: n[50],
      card: n[900],
      "card-foreground": n[50],
      popover: n[900],
      "popover-foreground": n[50],
      primary: brandDark,
      "primary-foreground": onColor(brandDark, n[950], "#ffffff"),
      secondary: n[800],
      "secondary-foreground": n[50],
      muted: n[800],
      "muted-foreground": n[400],
      accent: n[800],
      "accent-foreground": n[50],
      destructive: "#dc2626",
      "destructive-foreground": "#ffffff",
      border: n[800],
      input: n[800],
      ring: brandDark,
      sidebar: n[900],
      "sidebar-foreground": n[50],
      "sidebar-primary": brandDark,
      "sidebar-primary-foreground": onColor(brandDark, n[950], "#ffffff"),
      "sidebar-accent": n[800],
      "sidebar-accent-foreground": n[50],
      "sidebar-border": n[800],
      "sidebar-ring": brandDark
    };
    for (const [k, v] of Object.entries({ success: status.success, warning: status.warning, info: status.info })) {
      [light[k], light[`${k}-foreground`]] = pair(v);
      [dark[k], dark[`${k}-foreground`]] = pair(shift(v, 0.06));
    }
    ch.forEach((c, i) => {
      light[`chart-${i + 1}`] = c;
      dark[`chart-${i + 1}`] = shift(c, 0.05);
    });
    return {
      $schema: "ds-builder/tokens@1",
      name: opts.name || "project",
      source: { brand, neutral: opts.neutral || "neutral" },
      font: { sans: opts.font || "Inter", mono: opts.mono || "JetBrains Mono" },
      radius: Number((_a = opts.radius) != null ? _a : 10),
      colors: { light, dark }
    };
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

  // core/sync.js
  var STATUS = {
    bound: { label: "\u2713 \u0432 \u0444\u0430\u0439\u043B\u0435", tone: "success" },
    differs: { label: "\u2260 \u0444\u0430\u0439\u043B", tone: "warning" },
    missing: { label: "\u043D\u0435\u0442 \u0432 \u0444\u0430\u0439\u043B\u0435", tone: "error" },
    library: { label: "\u0432 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0435", tone: "info" },
    unknown: { label: "\u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E", tone: "neutral" }
  };
  var varKey = (collection, name) => `${collection}/${name}`;
  var inLibrary = (snapshot, collection, name) => !!(snapshot.library && snapshot.library[varKey(collection, name)]);
  function statusOf(row, snapshot) {
    if (!snapshot || !snapshot.vars) return "unknown";
    const vars = snapshot.vars;
    if (row.collection === BRAND && row.kind === "color") {
      const v2 = vars[varKey(BRAND, row.figma)];
      if (!v2 || v2[row.brand] === void 0) return inLibrary(snapshot, BRAND, row.figma) ? "library" : "missing";
      const dark = vars[varKey(THEME, row.darkFigma)];
      const ok = sameValue(v2[row.brand], row.light) && (!dark || sameValue(dark.dark, row.dark));
      return ok ? "bound" : "differs";
    }
    const v = vars[varKey(row.collection, row.figma)];
    if (!v) return inLibrary(snapshot, row.collection, row.figma) ? "library" : "missing";
    if (row.kind === "radius") return Object.values(v).every((x) => Number(x) === Number(row.light)) ? "bound" : "differs";
    return sameValue(v.light, row.light) && sameValue(v.dark, row.dark) ? "bound" : "differs";
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
  var SOURCE = { apply: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0432 Figma", component: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u0432 \u0444\u0430\u0439\u043B\u0435", build: "\u0421\u043E\u0431\u0440\u0430\u0442\u044C \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442" };
  function propagationLines(p) {
    if (!p) return null;
    const at = String(p.at || "").slice(0, 16).replace("T", " ");
    const vars = p.variableCount !== void 0 ? p.variableCount : (p.variables || []).length;
    const summary = [
      ...p.kind === "apply" ? [`\u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 ${vars}`] : [],
      `\u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043E\u0432 ${p.components.length}`,
      ...p.setsUpdated ? [`\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E \u043D\u0430\u0431\u043E\u0440\u043E\u0432 ${p.setsUpdated}`] : [],
      `\u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u043E\u0432 \u0432 \u0444\u0430\u0439\u043B\u0435 ${p.instances}`
    ].join(" \xB7 ");
    const components = p.components.slice(0, 8).map((x) => {
      const where = x.inFile ? "" : x.library ? " (\u0438\u0437 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438)" : " (\u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u043D\u0435\u0442 \u0432 \u0444\u0430\u0439\u043B\u0435)";
      const same = x.kept !== void 0 ? ` \xB7 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u043E\u0432 ${x.variants}, \u0442\u0435 \u0436\u0435 \u0443\u0437\u043B\u044B ${x.kept}` : "";
      return `${x.title}: ${x.instances} \u044D\u043A\u0437.${where}${same}`;
    });
    if (p.components.length > 8) components.push(`\u2026\u0438 \u0435\u0449\u0451 ${p.components.length - 8}`);
    const names = p.variables || [];
    return {
      title: `${p.dryRun ? "\u0427\u0442\u043E \u043F\u043E\u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F" : "\u0413\u0434\u0435 \u043F\u043E\u043C\u0435\u043D\u044F\u043B\u043E\u0441\u044C"} \u2014 ${SOURCE[p.kind] || p.kind}${at ? `, ${at}` : ""}`,
      summary,
      components,
      variables: names.length ? `\u041F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0435: ${names.slice(0, 6).join(", ")}${vars > 6 ? ` \u0438 \u0435\u0449\u0451 ${vars - 6}` : ""}` : null,
      note: p.kind === "apply" ? p.components.length ? "\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u044B \u043A \u044D\u0442\u0438\u043C \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u043C: \u043E\u043D\u0438 \u0438 \u0432\u0441\u0435 \u0438\u0445 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u044B \u0443\u0436\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u043D\u043E\u0432\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F." : "\u041D\u0438 \u043E\u0434\u0438\u043D \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442 \u044D\u0442\u0438 \u0442\u043E\u043A\u0435\u043D\u044B." : "\u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u043E\u0431\u043D\u043E\u0432\u043B\u0451\u043D \u043D\u0430 \u043C\u0435\u0441\u0442\u0435: \u0432\u0441\u0435 \u0435\u0433\u043E \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440\u044B \u0432 \u0444\u0430\u0439\u043B\u0435 \u0443\u0436\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F."
    };
  }

  // src/board.jsx
  var { AutoLayout, Text, Rectangle } = figma.widget;
  var W = 960;
  var COL = { swatch: 132, css: 250, figma: 300, status: 190 };
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
      const px = Math.max(0, Math.min(14, Number(value) || 0));
      return /* @__PURE__ */ figma.widget.h(AutoLayout, { spacing: 6, verticalAlignItems: "center", width: COL.swatch / 2 }, /* @__PURE__ */ figma.widget.h(Rectangle, { width: 24, height: 24, cornerRadius: px, fill: c.soft, stroke: c.border }), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: c.muted }, value == null ? "\u2014" : `${value}px`));
    }
    const hex = normHex(value);
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { spacing: 6, verticalAlignItems: "center", width: COL.swatch / 2, tooltip: String(value) }, /* @__PURE__ */ figma.widget.h(Rectangle, { width: 24, height: 24, cornerRadius: 6, fill: hex ? paint(hex) : c.soft, stroke: c.border }), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 10, fill: c.muted }, hex ? hex.slice(1, 7) : "var"));
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
        tooltip: row.note || "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440 \u0442\u043E\u043A\u0435\u043D\u0430"
      },
      /* @__PURE__ */ figma.widget.h(Swatch, { c, row, mode: "light" }),
      /* @__PURE__ */ figma.widget.h(Swatch, { c, row, mode: "dark" }),
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fontWeight: 600, fill: c.text, width: COL.css }, `--${row.css}`),
      /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: c.muted, width: COL.figma }, `${row.collection} / ${row.figma}`),
      /* @__PURE__ */ figma.widget.h(AutoLayout, { spacing: 4, width: COL.status }, /* @__PURE__ */ figma.widget.h(Chip, { c, tone: st.tone, label: st.label }), row.edited ? /* @__PURE__ */ figma.widget.h(Chip, { c, tone: "brand", label: row.extra ? "\u043D\u043E\u0432\u044B\u0439" : "\u0438\u0437\u043C\u0435\u043D\u0451\u043D", tooltip: "\u041E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F \u043E\u0442 tokens.json" }) : null, issue ? /* @__PURE__ */ figma.widget.h(Chip, { c, tone: "error", label: "AA", tooltip: issue }) : null)
    );
  }
  function Header({ c, brand, brands, onBrand, source }) {
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { width: "fill-parent", verticalAlignItems: "center", spacing: 16 }, /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 2, width: "fill-parent" }, /* @__PURE__ */ figma.widget.h(Text, { fontSize: 22, fontWeight: 700, fill: c.text }, "Mbank Tokens"), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: c.muted }, source)), /* @__PURE__ */ figma.widget.h(AutoLayout, { spacing: 4, padding: 4, fill: c.soft, cornerRadius: 12 }, brands.map((b) => /* @__PURE__ */ figma.widget.h(AutoLayout, { key: b, padding: { vertical: 6, horizontal: 12 }, cornerRadius: 9, fill: b === brand ? c.brand : c.soft, onClick: () => onBrand(b) }, /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fontWeight: 600, fill: b === brand ? c.onBrand : c.text }, b)))));
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
  function Propagation({ c, p }) {
    const l = propagationLines(p);
    if (!l) return null;
    const line = (key, text, bold) => /* @__PURE__ */ figma.widget.h(Text, { key, fontSize: 12, fontWeight: bold ? 700 : 400, fill: c.successFg, width: "fill-parent" }, text);
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", spacing: 4, width: "fill-parent", padding: { vertical: 10, horizontal: 12 }, cornerRadius: 10, fill: c.successBg }, line("title", l.title, true), line("summary", l.summary), l.components.map((x, i) => line(`c${i}`, `\u2022 ${x}`)), l.variables ? line("vars", l.variables) : null, line("note", l.note));
  }
  function Board(p) {
    const { c } = p;
    const counts = {};
    for (const r of p.rows) counts[r.group] = (counts[r.group] || 0) + 1;
    const visible = p.rows.filter((r) => r.group === p.group);
    const issueOf = {};
    for (const i of p.issues) if (!i.ok) issueOf[i.fg] = `${issueOf[i.fg] ? `${issueOf[i.fg]}; ` : ""}${i.mode}: ${i.ratio} \u043D\u0430 --${i.bg} (\u043D\u0443\u0436\u043D\u043E ${i.min})`;
    const t = p.totals;
    const fileLine = p.scan ? `\u0424\u0430\u0439\u043B \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D ${p.scan.scannedAt.slice(0, 16).replace("T", " ")}: \u2713 ${t.bound} \xB7 \u2260 ${t.differs} \xB7 \u043D\u0435\u0442 ${t.missing}${t.library ? ` \xB7 \u0432 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0435 ${t.library}` : ""}` : "\u0424\u0430\u0439\u043B \u0435\u0449\u0451 \u043D\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u043B\u0438: \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u0430 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u2192 \xAB\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0444\u0430\u0439\u043B\xBB";
    return /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", width: W, padding: 24, spacing: 16, fill: p.c.page, cornerRadius: 20, stroke: c.border }, /* @__PURE__ */ figma.widget.h(Header, { c, brand: p.brand, brands: p.brands, onBrand: p.handlers.brand, source: p.source }), /* @__PURE__ */ figma.widget.h(AutoLayout, { width: "fill-parent", spacing: 8 }, /* @__PURE__ */ figma.widget.h(Counter, { c, label: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432", value: p.counters.tokens, tone: "neutral" }), /* @__PURE__ */ figma.widget.h(Counter, { c, label: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u043F\u0440\u043E\u0435\u043A\u0442\u0430", value: p.counters.extras, tone: "info" }), /* @__PURE__ */ figma.widget.h(Counter, { c, label: "\u0438\u0437\u043C\u0435\u043D\u0435\u043D\u043E", value: p.counters.edited, tone: "brand" }), /* @__PURE__ */ figma.widget.h(Counter, { c, label: "\u043F\u0440\u043E\u0431\u043B\u0435\u043C \u043A\u043E\u043D\u0442\u0440\u0430\u0441\u0442\u0430 AA", value: p.counters.contrast, tone: p.counters.contrast ? "error" : "success" })), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fill: c.muted, width: "fill-parent" }, fileLine), p.report ? /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fill: c.text, width: "fill-parent" }, p.report) : null, /* @__PURE__ */ figma.widget.h(Propagation, { c, p: p.propagation }), /* @__PURE__ */ figma.widget.h(Tabs, { c, groups: p.groups, group: p.group, counts, onGroup: p.handlers.group }), /* @__PURE__ */ figma.widget.h(AutoLayout, { direction: "vertical", width: "fill-parent", fill: c.card, cornerRadius: 12, stroke: c.border, padding: { vertical: 6 } }, /* @__PURE__ */ figma.widget.h(AutoLayout, { width: "fill-parent", spacing: 12, padding: { vertical: 6, horizontal: 12 } }, /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c.muted, width: COL.swatch / 2 }, "light"), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c.muted, width: COL.swatch / 2 }, "dark"), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c.muted, width: COL.css }, "CSS-\u0442\u043E\u043A\u0435\u043D"), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c.muted, width: COL.figma }, "\u041F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F Figma"), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: c.muted, width: COL.status }, "\u0421\u0442\u0430\u0442\u0443\u0441")), visible.length ? visible.map((r) => /* @__PURE__ */ figma.widget.h(Row, { key: r.key, c, row: r, status: p.status[r.key], issue: issueOf[r.css], onOpen: p.handlers.open })) : /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fill: c.muted, width: "fill-parent", horizontalAlignText: "center" }, "\u041F\u0443\u0441\u0442\u043E. \u0422\u043E\u043A\u0435\u043D \u043F\u0440\u043E\u0435\u043A\u0442\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0432 \xAB\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C\xBB \u2192 \xAB\u041D\u043E\u0432\u044B\u0439 \u0442\u043E\u043A\u0435\u043D\xBB.")), /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: c.muted, width: "fill-parent" }, "\u0421\u0432\u043E\u0439\u0441\u0442\u0432\u0430 \u0432\u0438\u0434\u0436\u0435\u0442\u0430: \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \xB7 \u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0444\u0430\u0439\u043B \xB7 \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0432 Figma \xB7 \u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B \xB7 \u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0441 \u043A\u043E\u0434\u043E\u043C. \u041A\u043B\u0438\u043A \u043F\u043E \u0441\u0442\u0440\u043E\u043A\u0435 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u0442\u043E\u043A\u0435\u043D."));
  }

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
      mobile: "Nunito (mobile collection modes: Nunito | Inter -> Inter Mbank)",
      web: "Inter Mbank"
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
    textStyles: {
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
      ],
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
      ]
    },
    effectStyles: {
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
      ],
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
      ]
    }
  };

  // mbank:contracts
  var contracts_default = [{ "$schema": "mbank/component@1", "name": "alert", "title": "Alert", "figma": { "name": "alert-text", "key": "862527fc2fc9aad902f137eb72e3d82620897a9d", "nodeId": "3012:33" }, "parts": ["root", "icon", "title"], "props": { "tone": { "values": ["clear", "accent", "info", "success", "warning", "error"], "default": "clear" } }, "base": { "root": { "radius": "md", "px": 4, "py": 3, "text": "sm", "align": "start" }, "icon": { "size": 5 }, "title": { "weight": "bold" } }, "variants": { "tone": { "clear": { "root": { "bg": "status-clear-muted", "fg": "status-clear-foreground" } }, "accent": { "root": { "bg": "status-accent-muted", "fg": "status-accent-foreground" } }, "info": { "root": { "bg": "status-info-muted", "fg": "status-info-foreground" } }, "success": { "root": { "bg": "status-success-muted", "fg": "status-success-foreground" } }, "warning": { "root": { "bg": "status-warning-muted", "fg": "status-warning-foreground" } }, "error": { "root": { "bg": "status-error-muted", "fg": "status-error-foreground" } } } }, "states": ["default"], "code": { "file": "alert.tsx", "export": "alertVariants", "template": "card-like", "parts": { "icon": "[&>svg]" }, "blocks": ["title"], "extra": "relative grid w-full grid-cols-[0_1fr] gap-y-0.5 has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] has-[>svg]:gap-x-3 [&>svg]:translate-y-0.5 [&>svg]:text-current", "extras": { "title": "col-start-2" } } }, { "$schema": "mbank/component@1", "name": "avatar", "title": "Avatar", "figma": { "name": "Avatars", "key": "a3d5e7947473b09bf719839c62a18d751927d7a8", "nodeId": "3174:1503" }, "parts": ["root", "fallback", "text"], "props": { "size": { "values": ["xs", "sm", "md", "lg", "xl"], "default": "md" } }, "base": { "root": { "radius": "full", "layout": "row" }, "fallback": { "radius": "full", "bg": "surface-2", "weight": "medium", "fg": "soft-foreground", "layout": "row", "align": "center" }, "text": { "fg": "muted-foreground", "weight": "medium" } }, "variants": { "size": { "xs": { "root": { "size": 6, "text": "xs" } }, "sm": { "root": { "size": 8, "text": "xs" } }, "md": { "root": { "size": 10, "text": "sm" } }, "lg": { "root": { "size": 14, "text": "base" } }, "xl": { "root": { "size": 18, "text": "xl" } } } }, "states": ["default"], "code": { "file": "avatar.tsx", "export": "avatarVariants", "template": "badge-like", "blocks": ["fallback"], "extra": "relative shrink-0 overflow-hidden", "extras": { "fallback": "size-full justify-center" } } }, { "$schema": "mbank/component@1", "name": "badge", "title": "Badge", "figma": { "name": "Badge-status", "key": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "nodeId": "2348:2631" }, "parts": ["root", "icon", "label"], "props": { "tone": { "values": ["neutral", "accent", "success", "warning", "error", "info", "clear"], "default": "neutral" }, "fill": { "values": ["ghost", "solid"], "default": "ghost" }, "shape": { "values": ["rounded", "square"], "default": "rounded" }, "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 1, "weight": "medium", "align": "center" }, "icon": { "size": 3, "hidden": true } }, "variants": { "tone": { "neutral": { "root": { "bg": "status-neutral-muted", "fg": "status-neutral-foreground" } }, "accent": { "root": { "bg": "status-accent-muted", "fg": "status-accent-foreground" } }, "success": { "root": { "bg": "status-success-muted", "fg": "status-success-foreground" } }, "warning": { "root": { "bg": "status-warning-muted", "fg": "status-warning-foreground" } }, "error": { "root": { "bg": "status-error-muted", "fg": "status-error-foreground" } }, "info": { "root": { "bg": "status-info-muted", "fg": "status-info-foreground" } }, "clear": { "root": { "bg": "status-clear-muted", "fg": "status-clear-foreground" } } }, "fill": { "ghost": {}, "solid": { "root": { "fg": "status-filled-foreground" } } }, "shape": { "rounded": { "root": { "radius": "full" } }, "square": { "root": { "radius": "xs" } } }, "size": { "sm": { "root": { "height": 5, "px": 1.5, "text": "xs" } }, "md": { "root": { "height": 6, "px": 2, "text": "xs" } }, "lg": { "root": { "height": 7, "px": 2.5, "text": "sm" } } } }, "compound": [{ "when": { "fill": "solid", "tone": "neutral" }, "root": { "bg": "status-neutral" } }, { "when": { "fill": "solid", "tone": "accent" }, "root": { "bg": "status-accent" } }, { "when": { "fill": "solid", "tone": "success" }, "root": { "bg": "status-success" } }, { "when": { "fill": "solid", "tone": "warning" }, "root": { "bg": "status-warning" } }, { "when": { "fill": "solid", "tone": "error" }, "root": { "bg": "status-error" } }, { "when": { "fill": "solid", "tone": "info" }, "root": { "bg": "status-info" } }, { "when": { "fill": "solid", "tone": "clear" }, "root": { "bg": "status-clear" } }], "states": ["default"], "code": { "file": "badge.tsx", "export": "badgeVariants", "template": "badge-like", "parts": { "icon": "[&>svg]" }, "extra": "inline-flex w-fit shrink-0 justify-center overflow-hidden whitespace-nowrap [&>svg]:pointer-events-none" } }, { "$schema": "mbank/component@1", "name": "button", "title": "Button", "figma": { "name": "button/default", "key": "713c90401df3b5d7ddf00e3af4d7ea5870c4c120", "nodeId": "2077:341" }, "parts": ["root", "icon", "label"], "props": { "variant": { "values": ["primary", "brand", "secondary", "destructive", "success", "soft", "ghost", "outline", "static", "link"], "default": "primary" }, "size": { "values": ["xs", "sm", "md", "lg", "icon-sm", "icon", "icon-lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "weight": "medium", "opacity:disabled": 50, "align": "center", "focus-ring": "ring/50" }, "icon": { "size": 5, "hidden": true } }, "variants": { "variant": { "primary": { "root": { "bg": "primary", "fg": "primary-foreground", "bg:hover": "primary-hover", "bg:active": "primary-active" } }, "brand": { "root": { "bg": "brand", "fg": "brand-foreground", "bg:hover": "brand-hover", "bg:active": "brand-active" } }, "secondary": { "root": { "bg": "secondary", "fg": "secondary-foreground", "bg:hover": "secondary-hover", "bg:active": "secondary-active" } }, "destructive": { "root": { "bg": "destructive", "fg": "destructive-foreground", "bg:hover": "destructive-hover", "bg:active": "destructive-active" } }, "success": { "root": { "bg": "success", "fg": "success-foreground", "bg:hover": "success-hover", "bg:active": "success-active" } }, "soft": { "root": { "bg": "soft", "fg": "soft-foreground-strong", "bg:hover": "soft-hover" } }, "ghost": { "root": { "bg": "ghost", "fg": "ghost-foreground", "bg:hover": "ghost-hover" } }, "outline": { "root": { "border-width": 1, "border": "outline", "bg": "background", "fg": "outline-foreground", "border:hover": "outline-hover", "bg:hover": "muted" } }, "static": { "root": { "bg": "static", "fg": "static-foreground", "bg:hover": "static-hover", "bg:active": "static-active" } }, "link": { "root": { "px": 0, "fg": "link" } } }, "size": { "xs": { "root": { "height": 8, "px": 3, "text": "xs" }, "icon": { "size": 4 } }, "sm": { "root": { "height": 9, "px": 3, "text": "sm" }, "icon": { "size": 4 } }, "md": { "root": { "height": 11, "px": 4, "text": "sm" } }, "lg": { "root": { "height": 14, "px": 6, "text": "base" } }, "icon-sm": { "root": { "size": 9 }, "label": { "hidden": true }, "icon": { "hidden": false } }, "icon": { "root": { "size": 11 }, "label": { "hidden": true }, "icon": { "hidden": false } }, "icon-lg": { "root": { "size": 14 }, "label": { "hidden": true }, "icon": { "hidden": false } } } }, "states": ["default", "hover", "active", "focus", "disabled"], "code": { "file": "button.tsx", "export": "buttonVariants", "template": "button-like", "parts": { "icon": "[&_svg:not([class*='size-'])]" }, "extra": "inline-flex shrink-0 justify-center whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 aria-invalid:ring-[3px] aria-invalid:ring-border-destructive/30", "extras": { "variant=link": "h-auto underline-offset-4 hover:underline" } } }, { "$schema": "mbank/component@1", "name": "card", "title": "Card", "parts": ["root", "header", "title", "description", "content", "footer"], "props": {}, "base": { "root": { "gap": 4, "radius": "lg", "border-width": 1, "border": "border", "bg": "card", "py": 5, "fg": "card-foreground", "layout": "column" }, "header": { "gap": 1, "px": 5, "align": "start" }, "title": { "text": "base", "weight": "bold" }, "description": { "text": "sm", "fg": "muted-foreground" }, "content": { "px": 5 }, "footer": { "gap": 2, "px": 5, "layout": "row", "align": "center" } }, "variants": {}, "states": ["default"], "code": { "file": "card.tsx", "shape": "classes", "template": "card-like", "blocks": ["header", "title", "description", "content", "footer"], "extras": { "header": "grid auto-rows-min grid-rows-[auto_auto] has-data-[slot=card-action]:grid-cols-[1fr_auto]", "footer": "[.border-t]:pt-4" } } }, { "$schema": "mbank/component@1", "name": "checkbox", "title": "Checkbox", "figma": { "name": "Switchers - Check", "key": "be053b3924b63e289a38bfd661b7180deb83236e", "nodeId": "2280:9729" }, "parts": ["root"], "props": {}, "base": { "root": { "size": 5, "radius": "xs", "border-width": 1, "border": "input", "bg": "background", "border:hover": "input-hover", "border:disabled": "input-disabled", "bg:disabled": "muted", "border:invalid": "border-destructive", "border:checked": "brand", "bg:checked": "brand", "fg:checked": "brand-foreground", "border:indeterminate": "brand", "bg:indeterminate": "brand", "fg:indeterminate": "brand-foreground", "focus-ring": "ring/30" } }, "variants": {}, "states": ["default", "hover", "focus", "disabled", "invalid", "checked", "indeterminate"], "code": { "file": "checkbox.tsx", "shape": "classes", "template": "button-like", "modifiers": { "checked": "data-[state=checked]", "indeterminate": "data-[state=indeterminate]" }, "extra": "peer shrink-0 transition-colors outline-none disabled:cursor-not-allowed disabled:data-[state=checked]:opacity-50" } }, { "$schema": "mbank/component@1", "name": "crm-application-card", "title": "CRM / Application card", "figma": { "name": "CRM / Application card", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "33:28", "uses": 15 } }, "parts": ["root", "top", "id", "time", "name", "amount", "meta", "footer", "badge"], "anatomy": { "root": { "width": 200 }, "top": { "kind": "frame", "layer": "Top", "fill": true }, "id": { "kind": "text", "layer": "ID", "parent": "top", "sample": "CL-240118" }, "time": { "kind": "text", "layer": "Time", "parent": "top", "sample": "09:14" }, "name": { "kind": "text", "layer": "Name", "fill": true, "sample": "\u0410\u0441\u0430\u043D\u043E\u0432 \u041D\u0443\u0440\u043B\u0430\u043D" }, "amount": { "kind": "text", "layer": "Amount", "sample": "450 000 KGS" }, "meta": { "kind": "text", "layer": "Meta", "fill": true, "sample": "\u041F\u043E\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \xB7 24 \u043C\u0435\u0441" }, "footer": { "kind": "frame", "layer": "Footer", "fill": true }, "badge": { "kind": "instance", "layer": "Badge-status", "parent": "footer", "sample": "SLA 25 \u043C\u0438\u043D", "component": { "name": "Badge-status", "set": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "key": "b68afd3e0714ecefd38ee21793292c14ae240015", "variant": "Size=S, Form=rounded, Appearance=Info, Status=Off, Icon=Off, Solid=off" } } }, "props": {}, "base": { "root": { "layout": "column", "gap": 1, "px": 3, "py": 3, "radius": "md", "bg": "card", "fg": "foreground" }, "top": { "layout": "row", "align": "between" }, "id": { "text": "caption", "fg": "muted-foreground", "weight": "regular" }, "time": { "text": "caption", "fg": "muted-foreground", "weight": "regular" }, "name": { "text": "sm", "weight": "medium", "fg": "foreground" }, "amount": { "text": "base", "weight": "bold", "fg": "foreground" }, "meta": { "text": "caption", "fg": "muted-foreground", "weight": "regular" }, "footer": { "layout": "row", "align": "start", "pt": 1 } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/ApplicationCard.tsx", "slot": "application-card" } }, { "$schema": "mbank/component@1", "name": "crm-key-value-row", "title": "CRM / Key-value row", "figma": { "name": "CRM / Key-value row", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "24:6539", "uses": 26 } }, "parts": ["root", "label", "value"], "anatomy": { "root": { "width": 480 }, "label": { "kind": "text", "layer": "Label", "width": 180, "sample": "\u041A\u043B\u044E\u0447" }, "value": { "kind": "text", "layer": "Value", "fill": true, "sample": "\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435" } }, "props": {}, "base": { "root": { "layout": "row", "align": "start", "gap": 4, "px": 0, "py": 2, "text": "sm" }, "label": { "text": "sm", "fg": "muted-foreground", "weight": "regular" }, "value": { "text": "sm", "weight": "medium", "fg": "foreground" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/KeyValueRow.tsx", "slot": "key-value-row" } }, { "$schema": "mbank/component@1", "name": "crm-kpi-card", "title": "CRM / KPI card", "figma": { "name": "CRM / KPI card", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "21:1819", "uses": 8 } }, "parts": ["root", "label", "value", "delta", "delta-value", "delta-label"], "anatomy": { "root": { "width": 260 }, "label": { "kind": "text", "layer": "Label", "sample": "\u041F\u0435\u0440\u0435\u0432\u043E\u0434\u043E\u0432 \u0441\u0435\u0433\u043E\u0434\u043D\u044F" }, "value": { "kind": "text", "layer": "Value", "sample": "12 480" }, "delta": { "kind": "frame", "layer": "Delta" }, "delta-value": { "kind": "text", "layer": "Delta value", "parent": "delta", "sample": "+8,2%" }, "delta-label": { "kind": "text", "layer": "Delta label", "parent": "delta", "sample": "\u043A \u0432\u0447\u0435\u0440\u0430" } }, "props": {}, "base": { "root": { "layout": "column", "gap": 2, "px": 5, "py": 5, "radius": "lg", "bg": "card", "fg": "foreground" }, "label": { "text": "sm", "fg": "muted-foreground", "weight": "regular" }, "value": { "text": "2xl", "weight": "bold", "fg": "foreground" }, "delta": { "layout": "row", "align": "center", "gap": 1 }, "delta-value": { "text": "sm", "weight": "medium", "fg": "success-text" }, "delta-label": { "text": "caption", "fg": "muted-foreground", "weight": "regular" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/KpiCard.tsx", "slot": "kpi-card" } }, { "$schema": "mbank/component@1", "name": "crm-timeline-item", "title": "CRM / Timeline item", "figma": { "name": "CRM / Timeline item", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "24:6542", "uses": 8 } }, "parts": ["root", "marker", "dot", "content", "title", "meta"], "anatomy": { "root": { "width": 320 }, "marker": { "kind": "frame", "layer": "Marker" }, "dot": { "kind": "frame", "layer": "Dot", "parent": "marker" }, "content": { "kind": "frame", "layer": "Content", "fill": true }, "title": { "kind": "text", "layer": "Title", "parent": "content", "fill": true, "sample": "\u0421\u043E\u0431\u044B\u0442\u0438\u0435" }, "meta": { "kind": "text", "layer": "Meta", "parent": "content", "sample": "12.10.2026, 14:32 \xB7 \u0421\u0438\u0441\u0442\u0435\u043C\u0430" } }, "props": {}, "base": { "root": { "layout": "row", "align": "start", "gap": 3 }, "marker": { "layout": "column", "px": 0, "pt": 1, "pb": 0 }, "dot": { "size": 3, "radius": "full", "bg": "border-success" }, "content": { "layout": "column", "gap": 1 }, "title": { "text": "sm", "weight": "medium", "fg": "foreground" }, "meta": { "text": "caption", "fg": "muted-foreground", "weight": "regular" } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/TimelineItem.tsx", "slot": "timeline-item" } }, { "$schema": "mbank/component@1", "name": "crm-transfer-row", "title": "CRM / Transfer row", "figma": { "name": "CRM / Transfer row", "page": "\u2630 CRM blocks", "source": { "file": "vVuM5uw3TsWo1xm3vJelXG", "name": "[draft] Mbank CRM \u2014 \u0442\u0435\u0441\u0442 \u0418\u0418", "nodeId": "23:10079", "uses": 10 } }, "parts": ["root", "id-cell", "id-content", "id", "date-cell", "date-content", "date", "sender-cell", "sender-content", "sender", "recipient-cell", "recipient-content", "recipient", "country-cell", "country-content", "country", "amount-cell", "amount-content", "amount", "channel-cell", "channel-content", "channel", "status-cell", "status"], "anatomy": { "root": { "sides": ["bottom"] }, "id-cell": { "kind": "frame", "layer": "TableCell 1", "width": 124, "sides": ["right"] }, "id-content": { "kind": "frame", "layer": "TextContent", "parent": "id-cell", "fill": true }, "id": { "kind": "text", "layer": "Label", "parent": "id-content", "fill": true, "sample": "TR-80421951" }, "date-cell": { "kind": "frame", "layer": "TableCell 2", "width": 156, "sides": ["right"] }, "date-content": { "kind": "frame", "layer": "TextContent", "parent": "date-cell", "fill": true }, "date": { "kind": "text", "layer": "Label", "parent": "date-content", "fill": true, "sample": "12.10.2026, 14:32" }, "sender-cell": { "kind": "frame", "layer": "TableCell 3", "width": 160, "sides": ["right"] }, "sender-content": { "kind": "frame", "layer": "TextContent", "parent": "sender-cell", "fill": true }, "sender": { "kind": "text", "layer": "Label", "parent": "sender-content", "fill": true, "sample": "\u0411\u0430\u043A\u044B\u0442 \u0422\u043E\u043A\u0442\u043E\u0433\u0443\u043B\u043E\u0432" }, "recipient-cell": { "kind": "frame", "layer": "TableCell 4", "width": 170, "sides": ["right"] }, "recipient-content": { "kind": "frame", "layer": "TextContent", "parent": "recipient-cell", "fill": true }, "recipient": { "kind": "text", "layer": "Label", "parent": "recipient-content", "fill": true, "sample": "\u0418\u0432\u0430\u043D \u041F\u0435\u0442\u0440\u043E\u0432" }, "country-cell": { "kind": "frame", "layer": "TableCell 5", "width": 116, "sides": ["right"] }, "country-content": { "kind": "frame", "layer": "TextContent", "parent": "country-cell", "fill": true }, "country": { "kind": "text", "layer": "Label", "parent": "country-content", "fill": true, "sample": "\u0420\u043E\u0441\u0441\u0438\u044F" }, "amount-cell": { "kind": "frame", "layer": "TableCell 6", "width": 124, "sides": ["right"] }, "amount-content": { "kind": "frame", "layer": "TextContent", "parent": "amount-cell", "fill": true }, "amount": { "kind": "text", "layer": "Label", "parent": "amount-content", "fill": true, "sample": "185 000 KGS" }, "channel-cell": { "kind": "frame", "layer": "TableCell 7", "width": 128, "sides": ["right"] }, "channel-content": { "kind": "frame", "layer": "TextContent", "parent": "channel-cell", "fill": true }, "channel": { "kind": "text", "layer": "Label", "parent": "channel-content", "fill": true, "sample": "\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435" }, "status-cell": { "kind": "frame", "layer": "TableCell 8", "width": 138, "sides": ["right"] }, "status": { "kind": "instance", "layer": "Badge-status", "parent": "status-cell", "sample": "\u0423\u0441\u043F\u0435\u0448\u043D\u043E", "component": { "name": "Badge-status", "set": "f25dcf8a0cdeb0a978f91b7a07790d42b80f9dcd", "key": "4c16cc198bc2c10f229898b330166c1db17200b6", "variant": "Size=S, Form=rounded, Appearance=Success, Status=Off, Icon=Off, Solid=off" } } }, "props": {}, "base": { "root": { "layout": "row", "align": "center", "bg": "background", "border": "border", "border-width": 1, "text": "sm" }, "id-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "id-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "id": { "text": "sm", "weight": "regular", "fg": "foreground" }, "date-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "date-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "date": { "text": "sm", "weight": "regular", "fg": "foreground" }, "sender-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "sender-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "sender": { "text": "sm", "weight": "regular", "fg": "foreground" }, "recipient-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "recipient-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "recipient": { "text": "sm", "weight": "regular", "fg": "foreground" }, "country-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "country-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "country": { "text": "sm", "weight": "regular", "fg": "foreground" }, "amount-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "amount-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "amount": { "text": "sm", "weight": "regular", "fg": "foreground" }, "channel-cell": { "layout": "row", "align": "start", "gap": 2, "px": 3, "border": "border", "border-width": 1 }, "channel-content": { "layout": "column", "gap": 1, "px": 0, "py": 3 }, "channel": { "text": "sm", "weight": "regular", "fg": "foreground" }, "status-cell": { "layout": "row", "align": "center", "gap": 2, "px": 3, "border": "border", "border-width": 1, "py": 3 } }, "variants": {}, "states": ["default"], "code": { "kind": "block", "file": "blocks/crm/TransferRow.tsx", "slot": "transfer-row", "inline": ["id-content", "id", "date-content", "date", "sender-content", "sender", "recipient-content", "recipient", "country-content", "country", "amount-content", "amount", "channel-content", "channel"] } }, { "$schema": "mbank/component@1", "name": "input", "title": "Input", "figma": { "name": "input/default", "key": "9b99d128100afd0ac499d5fc2cfdedf0ae6aa44b", "nodeId": "2184:1939" }, "parts": ["root", "placeholder"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "border:invalid": "border-destructive", "layout": "row", "focus-ring": "ring/30" }, "placeholder": { "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9, "text": "sm" } }, "md": { "root": { "height": 11, "text": "sm" } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "hover", "focus", "disabled", "invalid"], "code": { "file": "input.tsx", "export": "inputVariants", "template": "input-like", "parts": { "placeholder": "placeholder" }, "extra": "w-full min-w-0 transition-colors outline-none disabled:pointer-events-none file:border-0 file:bg-transparent file:text-sm file:font-medium aria-invalid:ring-border-destructive/20" } }, { "$schema": "mbank/component@1", "name": "pagination", "title": "Pagination item", "figma": { "name": "item/pagintaion / buttons", "key": "2255ec920c853b652f1389adbc4bd30779ee35d7", "nodeId": "4141:5990" }, "parts": ["root", "icon", "label"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "radius": "sm", "weight": "medium", "fg": "foreground", "bg:hover": "accent", "fg:disabled": "disabled-foreground", "bg:selected": "secondary", "fg:selected": "secondary-foreground", "align": "center", "focus-ring": "ring/30" }, "icon": { "size": 5, "hidden": true } }, "variants": { "size": { "sm": { "root": { "height": 8, "px": 1.5, "text": "xs" } }, "md": { "root": { "height": 9, "px": 2, "text": "sm" } }, "lg": { "root": { "height": 10, "px": 2.5, "text": "sm" } } } }, "states": ["default", "hover", "focus", "disabled", "selected"], "code": { "file": "pagination.tsx", "export": "paginationItemVariants", "template": "button-like", "parts": { "icon": "[&_svg]" }, "modifiers": { "selected": "aria-[current=page]" }, "extra": "inline-flex shrink-0 justify-center tabular-nums transition-colors outline-none select-none disabled:pointer-events-none [&_svg]:shrink-0", "extras": { "size=sm": "min-w-8", "size=md": "min-w-9", "size=lg": "min-w-10" } } }, { "$schema": "mbank/component@1", "name": "progress", "title": "Progress", "figma": { "name": "Progress bar / Determinate", "key": "cf47478133f9b8625225affab7ae57b7b022c9bd", "nodeId": "4823:334" }, "parts": ["root", "indicator"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" }, "shape": { "values": ["rounded", "square"], "default": "rounded" }, "tone": { "values": ["brand", "success", "error", "warning"], "default": "brand" } }, "base": { "root": { "bg": "surface-2" } }, "variants": { "size": { "sm": { "root": { "height": 1 } }, "md": { "root": { "height": 2 } }, "lg": { "root": { "height": 3 } } }, "shape": { "rounded": { "root": { "radius": "full" } }, "square": { "root": { "radius": "none" } } }, "tone": { "brand": { "indicator": { "bg": "brand" } }, "success": { "indicator": { "bg": "status-success" } }, "error": { "indicator": { "bg": "status-error" } }, "warning": { "indicator": { "bg": "status-warning" } } } }, "states": ["default"], "code": { "file": "progress.tsx", "export": "progressVariants", "template": "card-like", "maps": { "tone": { "const": "indicatorTones", "part": "indicator" } }, "extra": "relative w-full overflow-hidden" } }, { "$schema": "mbank/component@1", "name": "select-trigger", "title": "Select trigger", "figma": { "name": "input/dropdown", "key": "a51f7990a9914a36e511d08aeb2684c412634c09", "nodeId": "2431:11731" }, "parts": ["root", "placeholder"], "props": { "size": { "values": ["sm", "md", "lg"], "default": "md" } }, "base": { "root": { "gap": 2, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "text": "sm", "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "border:invalid": "border-destructive", "layout": "row", "align": "between", "focus-ring": "ring/30" }, "placeholder": { "fg": "muted-foreground" } }, "variants": { "size": { "sm": { "root": { "height": 9 } }, "md": { "root": { "height": 11 } }, "lg": { "root": { "height": 14, "px": 4, "text": "base" } } } }, "states": ["default", "hover", "focus", "disabled", "invalid"], "code": { "file": "select.tsx", "shape": "classes", "template": "button-like", "parts": { "placeholder": "data-[placeholder]" }, "maps": { "size": { "const": "triggerSizes", "part": "root" } }, "extra": "w-full whitespace-nowrap transition-colors outline-none disabled:pointer-events-none *:data-[slot=select-value]:truncate" } }, { "$schema": "mbank/component@1", "name": "skeleton", "title": "Skeleton", "parts": ["root"], "props": {}, "base": { "root": { "radius": "md", "bg": "surface-2" } }, "variants": {}, "states": ["default"], "code": { "file": "skeleton.tsx", "shape": "classes", "template": "card-like", "extra": "animate-pulse motion-reduce:animate-none" } }, { "$schema": "mbank/component@1", "name": "switch", "title": "Switch", "parts": ["root"], "props": {}, "base": { "root": { "height": 6, "radius": "full", "border-width": 2, "opacity:disabled": 50, "bg:checked": "brand", "bg:unchecked": "surface-3", "align": "center", "focus-ring": "ring/30" } }, "variants": {}, "states": ["default", "focus", "disabled", "checked", "unchecked"], "code": { "file": "switch.tsx", "shape": "classes", "template": "button-like", "modifiers": { "checked": "data-[state=checked]", "unchecked": "data-[state=unchecked]" }, "extra": "peer inline-flex w-10 shrink-0 border-transparent transition-colors outline-none disabled:cursor-not-allowed aria-invalid:ring-[3px] aria-invalid:ring-border-destructive/30" } }, { "$schema": "mbank/component@1", "name": "table-cell", "title": "Table cell", "figma": { "name": "TableCell", "key": "75d931d4c1075a08c944e2a7ba1b34b1c4e787d0", "nodeId": "1309:22504" }, "parts": ["root"], "props": {}, "base": { "root": { "height": 11, "px": 3, "py": 3, "text": "sm" } }, "variants": {}, "states": ["default"], "code": { "file": "table.tsx", "shape": "classes", "template": "card-like", "extra": "align-middle leading-5 whitespace-nowrap tabular-nums [&:has([role=checkbox])]:pr-0" } }, { "$schema": "mbank/component@1", "name": "tabs-list", "title": "Tabs list", "figma": { "name": "segment", "key": "f28915a7224a6ba85128b9cbab0b9d706c9285a8", "nodeId": "2371:564" }, "parts": ["root"], "props": { "variant": { "values": ["segment", "outline", "line"], "default": "segment" } }, "base": { "root": { "align": "center" } }, "variants": { "variant": { "segment": { "root": { "gap": 1, "radius": "md", "bg": "muted" } }, "outline": { "root": { "gap": 2 } }, "line": { "root": { "gap": 6, "border": "border" } } } }, "states": ["default"], "code": { "file": "tabs.tsx", "export": "tabsListVariants", "template": "card-like", "extra": "group/tabs-list inline-flex w-fit", "extras": { "variant=segment": "p-1", "variant=line": "border-b" } } }, { "$schema": "mbank/component@1", "name": "tabs-trigger", "title": "Tabs trigger", "figma": { "name": "Item / segmentButtons", "key": "d3dce4a16063872d9bd8a43a3a4901ca546452a5", "nodeId": "2370:4860" }, "parts": ["root", "icon", "label"], "props": { "variant": { "values": ["segment", "outline", "line"], "default": "segment" } }, "base": { "root": { "height": 9, "gap": 2, "px": 3, "text": "sm", "weight": "medium", "fg": "muted-foreground", "fg:hover": "foreground", "fg:disabled": "disabled-foreground", "align": "center", "focus-ring": "ring/30" }, "icon": { "size": 4, "hidden": true } }, "variants": { "variant": { "segment": { "root": { "radius": "sm", "bg:selected": "background", "fg:selected": "foreground", "shadow:selected": "xs" } }, "outline": { "root": { "radius": "md", "border-width": 1, "border": "border", "border:selected": "secondary", "bg:selected": "secondary", "fg:selected": "secondary-foreground" } }, "line": { "root": { "px": 0, "border:selected": "brand", "fg:selected": "foreground" } } } }, "states": ["default", "hover", "focus", "disabled", "selected"], "code": { "file": "tabs.tsx", "shape": "classes", "template": "button-like", "parts": { "icon": "[&_svg]" }, "modifiers": { "selected": "data-[state=active]" }, "prefix": { "variant": "group-data-[variant={value}]/tabs-list" }, "extra": "inline-flex justify-center whitespace-nowrap transition-colors outline-none disabled:pointer-events-none [&_svg]:shrink-0", "extras": { "variant=line": "-mb-px border-b-2 border-transparent" } } }, { "$schema": "mbank/component@1", "name": "textarea", "title": "Textarea", "figma": { "name": "TextArea", "key": "f5e8ed2faaef70b5702fa5e0f70d9c65a370a8ed", "nodeId": "3069:1804" }, "parts": ["root", "placeholder"], "props": {}, "base": { "root": { "min-height": 24, "radius": "md", "border-width": 1, "border": "input", "bg": "background", "px": 3, "py": 2.5, "text": "sm", "fg": "foreground", "border:hover": "input-hover", "border:focus": "ring", "border:disabled": "input-disabled", "bg:disabled": "muted", "fg:disabled": "disabled-foreground", "border:invalid": "border-destructive", "layout": "row", "focus-ring": "ring/30" }, "placeholder": { "fg": "muted-foreground" } }, "variants": {}, "states": ["default", "hover", "focus", "disabled", "invalid"], "code": { "file": "textarea.tsx", "shape": "classes", "template": "input-like", "parts": { "placeholder": "placeholder" }, "extra": "field-sizing-content w-full min-w-0 transition-colors outline-none disabled:pointer-events-none aria-invalid:ring-border-destructive/20" } }];

  // core/checks.js
  var MIN_TEXT = 4.5;
  var KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  var LENGTH = /^(0|\d+(\.\d+)?(px|rem)?)$/;
  var KINDS = ["color", "radius", "size"];
  var PAIR_OVERRIDES = {
    foreground: ["background", MIN_TEXT],
    "muted-foreground": ["background", 3],
    "soft-foreground": ["background", 3],
    "inverse-foreground": ["surface-inverse", MIN_TEXT],
    "disabled-foreground": null,
    // disabled text is exempt (WCAG 1.4.3)
    "primary-foreground-muted": null,
    "brand-foreground-muted": null,
    "brand-ghost-foreground-muted": null
  };
  function pairFor(css, byCss, pairWith) {
    if (pairWith) return [pairWith, MIN_TEXT];
    if (css in PAIR_OVERRIDES) return PAIR_OVERRIDES[css];
    let m = /^status-(\w+)-foreground$/.exec(css);
    if (m) return byCss.has(`status-${m[1]}-muted`) ? [`status-${m[1]}-muted`, MIN_TEXT] : null;
    m = /^(.+)-foreground$/.exec(css);
    if (m && byCss.has(m[1])) return [m[1], MIN_TEXT];
    return null;
  }
  function contrastIssues(rows) {
    const byCss = rowsByCss(rows);
    const out = [];
    for (const r of rows) {
      if (r.kind !== "color") continue;
      const pair = pairFor(r.css, byCss, r.pairWith);
      if (!pair || !byCss.has(pair[0])) continue;
      for (const mode of MODES) {
        const fg = normHex(resolveValue(r[mode], mode, byCss));
        const bg = normHex(resolveValue(byCss.get(pair[0])[mode], mode, byCss));
        const ratio = fg && bg ? Math.round(contrast(fg, bg) * 100) / 100 : null;
        out.push({ fg: r.css, bg: pair[0], mode, ratio, min: pair[1], ok: ratio !== null && ratio >= pair[1] });
      }
    }
    return out;
  }
  var toPx = (value) => {
    const s = String(value).trim();
    return s.endsWith("rem") ? parseFloat(s) * 16 : parseFloat(s);
  };
  function validateExtra(token, prefix, taken = /* @__PURE__ */ new Set()) {
    const errors = [];
    if (!KEBAB.test(prefix || "")) errors.push("\u041F\u0440\u0435\u0444\u0438\u043A\u0441 \u043F\u0440\u043E\u0435\u043A\u0442\u0430: \u043B\u0430\u0442\u0438\u043D\u0438\u0446\u0430 \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0435, \u0446\u0438\u0444\u0440\u044B \u0438 \u0434\u0435\u0444\u0438\u0441\u044B");
    if (!KEBAB.test(token.name || "")) errors.push("\u0418\u043C\u044F: kebab-case (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 mb-promo-surface)");
    else if (!token.name.startsWith(`${prefix}-`)) errors.push(`\u0418\u043C\u044F \u0434\u043E\u043B\u0436\u043D\u043E \u043D\u0430\u0447\u0438\u043D\u0430\u0442\u044C\u0441\u044F \u0441 \u043F\u0440\u0435\u0444\u0438\u043A\u0441\u0430 \xAB${prefix}-\xBB`);
    else if (token.name === `${prefix}-`) errors.push("\u0418\u043C\u044F: \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u0435\u0444\u0438\u043A\u0441\u0430 \u043D\u0443\u0436\u043D\u0430 \u0440\u043E\u043B\u044C");
    if (taken.has(token.name)) errors.push(`\u0422\u043E\u043A\u0435\u043D \xAB${token.name}\xBB \u0443\u0436\u0435 \u0435\u0441\u0442\u044C`);
    if (!KINDS.includes(token.kind)) errors.push(`\u0422\u0438\u043F: ${KINDS.join(" | ")}`);
    for (const mode of MODES) {
      const value = String(token[mode] == null ? "" : token[mode]).trim();
      if (!value) {
        if (mode === "light") errors.push("light: \u043D\u0443\u0436\u043D\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435");
        continue;
      }
      if (token.kind === "color" && !normHex(value) && !/^var\(--[\w-]+\)$/.test(value)) {
        errors.push(`${mode}: \u043D\u0435 \u0446\u0432\u0435\u0442 (hex #rrggbb \u0438\u043B\u0438 var(--\u0442\u043E\u043A\u0435\u043D))`);
      } else if (token.kind !== "color" && !LENGTH.test(value)) {
        errors.push(`${mode}: \u043D\u0443\u0436\u043D\u0430 \u0434\u043B\u0438\u043D\u0430 \u0432 px \u0438\u043B\u0438 rem (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 12px)`);
      }
    }
    if (token.pairWith && token.kind !== "color") errors.push("\u041F\u0430\u0440\u0430 \u0434\u043B\u044F \u043A\u043E\u043D\u0442\u0440\u0430\u0441\u0442\u0430 \u0431\u044B\u0432\u0430\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0443 \u0446\u0432\u0435\u0442\u0430");
    return errors;
  }
  function normalizeExtra(token) {
    const norm = (v) => {
      if (v == null || String(v).trim() === "") return null;
      if (token.kind === "color") return normHex(v) || String(v).trim();
      return toPx(v);
    };
    const light = norm(token.light);
    const dark = norm(token.dark);
    return __spreadValues({ name: token.name, kind: token.kind, light, dark: dark == null ? light : dark }, token.pairWith ? { pairWith: token.pairWith } : {});
  }

  // core/brand-gen.js
  var BRAND_SLOTS = [
    "default",
    "hover",
    "active",
    "on-accent",
    "on-accent-muted",
    "container-muted",
    "ghost-default",
    "ghost-hover",
    "ghost-active",
    "ghost-on-accent",
    "ghost-on-accent-muted",
    "ghost-container-muted"
  ];
  var step = (hex, dl) => {
    const o = hexToOklch(hex);
    return oklchToHex({ l: Math.min(0.98, Math.max(0.05, o.l + dl)), c: o.c, h: o.h });
  };
  var tint = (hex, l, maxC) => {
    const o = hexToOklch(hex);
    return oklchToHex({ l, c: Math.min(o.c, maxC), h: o.h });
  };
  var mix = (a, b, t) => {
    const x = hexToOklch(a);
    const y = hexToOklch(b);
    return oklchToHex({ l: x.l + (y.l - x.l) * t, c: x.c + (y.c - x.c) * t, h: y.c < 0.02 ? x.h : y.h });
  };
  var alpha = (hex, a) => `${hex.slice(0, 7)}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
  function readable(fg, bg, min = 4.5, dir = -1) {
    let out = fg;
    for (let i = 0; i < 20 && contrast(out, bg) < min; i++) out = step(out, dir * 0.03);
    return out;
  }
  function generateBrand(hex) {
    hexToRgb(hex);
    const t = generateTokens({ brand: hex });
    const base = t.colors.light.primary;
    const baseDark = t.colors.dark.primary;
    const lightGhost = tint(base, 0.97, 0.04);
    const light = {
      default: base,
      hover: step(base, -0.05),
      active: step(base, -0.08),
      "on-accent": t.colors.light["primary-foreground"],
      "on-accent-muted": mix(t.colors.light["primary-foreground"], base, 0.35),
      "container-muted": tint(base, 0.95, 0.01),
      "ghost-default": lightGhost,
      "ghost-hover": tint(base, 0.94, 0.06),
      "ghost-active": lightGhost,
      "ghost-on-accent": readable(base, lightGhost),
      "ghost-on-accent-muted": tint(base, 0.85, 0.12),
      "ghost-container-muted": lightGhost
    };
    const dark = {
      default: baseDark,
      hover: step(baseDark, 0.05),
      active: baseDark,
      "on-accent": t.colors.dark["primary-foreground"],
      "on-accent-muted": mix(t.colors.dark["primary-foreground"], baseDark, 0.35),
      "container-muted": tint(baseDark, 0.32, 0.01),
      "ghost-default": alpha(baseDark, 0.1),
      "ghost-hover": alpha(baseDark, 0.15),
      "ghost-active": alpha(baseDark, 0.1),
      "ghost-on-accent": baseDark,
      "ghost-on-accent-muted": alpha(baseDark, 0.1),
      "ghost-container-muted": alpha(baseDark, 0.1)
    };
    return { light, dark };
  }
  function brandEdits(rows, brand, generated) {
    const edits = {};
    for (const r of rows) {
      if (r.group !== "brand" || r.collection !== "1.brand" || r.kind !== "color") continue;
      const slot = r.figma.replace(/^brand\//, "");
      if (!(slot in generated.light)) continue;
      edits[`${brand}:${r.css}`] = { light: generated.light[slot], dark: generated.dark[slot] };
    }
    return edits;
  }

  // core/exports.js
  var clone = (x) => JSON.parse(JSON.stringify(x));
  var str = (v) => typeof v === "number" ? String(Number(v.toFixed(4))) : v;
  function exportTokensJson(tokens, { edits = {}, extras = [] } = {}) {
    const out = clone(tokens);
    const ix = indexSource(out);
    const themeVar = (name, light) => {
      let v = ix.theme.get(name);
      if (!v) {
        v = { name, key: null, light, dark: light, aliasLight: null };
        out.theme.vars.push(v);
        ix.theme.set(name, v);
      }
      return v;
    };
    for (const brand of ix.brandModes) {
      const model2 = buildModel(tokens, { brand, edits });
      const bi = ix.brandModes.indexOf(brand);
      for (const r of model2.rows) {
        if (!r.edited) continue;
        if (r.kind === "radius") {
          const v2 = ix.radius.get(r.figma);
          if (v2) v2.values = v2.values.map(() => str(r.light));
          continue;
        }
        if (r.collection === BRAND) {
          const v2 = ix.brand.get(r.figma);
          if (v2) v2.values[bi] = r.light;
          const d = themeVar(r.darkFigma, r.light);
          d.light = r.light;
          d.dark = r.dark;
          continue;
        }
        if (brand !== ix.brandModes[0]) continue;
        const v = themeVar(r.figma, r.light);
        if (!v || r.light == null) continue;
        if (v.light !== r.light) v.aliasLight = null;
        v.light = r.light;
        v.dark = r.dark;
      }
    }
    const model = buildModel(out, { brand: ix.brandModes[0], extras });
    const byCss = rowsByCss(model.rows);
    for (const r of model.rows.filter((x) => x.extra)) {
      const val = (mode) => r.kind === "color" ? normHex(resolveValue(r[mode], mode, byCss)) : str(r[mode]);
      const alias2 = /^var\(--([\w-]+)\)$/.exec(String(r.light));
      const target = alias2 && byCss.get(alias2[1]);
      const v = themeVar(r.figma, val("light"));
      Object.assign(v, { light: val("light"), dark: val("dark"), aliasLight: target ? target.figma : null });
    }
    return out;
  }
  function rawDump(tokens, { date = (/* @__PURE__ */ new Date()).toISOString() } = {}) {
    const theme = tokens.theme.vars.map((v) => {
      const color = normHex(v.light) !== null;
      return {
        name: v.name,
        key: v.key || null,
        type: color ? "COLOR" : "FLOAT",
        values: { light: color ? v.light : Number(v.light), dark: color ? v.dark : Number(v.dark) },
        alias: { light: v.aliasLight || null, dark: null }
      };
    });
    const modes = tokens.brand.modes || tokens.brand.columns || BRANDS;
    const per = (fn) => Object.fromEntries(modes.map((m, i) => [m, fn(i)]));
    const brand = [
      ...tokens.brand.vars.map((v) => ({ name: v.name, key: v.key || null, type: "COLOR", values: per((i) => v.values[i]), alias: per(() => null) })),
      ...(tokens.brandRadius && tokens.brandRadius.vars || []).map((v) => ({ name: v.name, key: v.key || null, type: "FLOAT", values: per(() => Number(v.values[0])), alias: per(() => null) }))
    ];
    return {
      format: "mbank-figma-raw/1",
      kit: "foundation",
      file: { name: "Mbank Tokens widget", key: null },
      readAt: date,
      collections: [
        { name: THEME, key: tokens.theme && tokens.theme.key || null, modes: ["light", "dark"], variables: theme },
        { name: BRAND, key: null, modes, variables: brand }
      ],
      textStyles: [],
      effectStyles: [],
      warnings: []
    };
  }
  function cssVarsOf(model) {
    const byCss = rowsByCss(model.rows);
    const light = {};
    const dark = {};
    for (const r of model.rows) {
      if (r.light == null) continue;
      if (r.kind === "color") {
        light[r.css] = normHex(resolveValue(r.light, "light", byCss)) || r.light;
        dark[r.css] = normHex(resolveValue(r.dark, "dark", byCss)) || r.dark;
      } else {
        light[r.css] = `${Number(r.light)}px`;
        if (r.dark != null && Number(r.dark) !== Number(r.light)) dark[r.css] = `${Number(r.dark)}px`;
      }
    }
    for (const [css, m] of Object.entries(TOKEN_MAP.colors)) {
      if (m.alias && !(css in light)) {
        light[css] = `var(--${m.alias})`;
        dark[css] = `var(--${m.alias})`;
      }
    }
    if (light["radius-md"]) light.radius = light["radius-md"];
    const theme = { "font-sans": '"Inter Mbank", Inter, ui-sans-serif, system-ui, sans-serif' };
    return { light, dark, theme };
  }
  var REGISTRY_ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
  function registryBase(model) {
    const vars = cssVarsOf(model);
    return {
      $schema: REGISTRY_ITEM_SCHEMA,
      name: `mbank-${model.brand}`,
      type: "registry:base",
      title: `Mbank ${model.brand}`,
      description: `Mbank design system, brand ${model.brand}: Figma tokens (2.theme + 1.brand) from the Mbank Tokens widget for shadcn/ui + Tailwind v4`,
      cssVars: vars,
      meta: {
        generator: "figma-pack/widget (Mbank Tokens)",
        brand: model.brand,
        figma: { collections: [THEME, BRAND], brandMode: model.brand },
        extras: model.rows.filter((r) => r.extra).map((r) => r.css)
      }
    };
  }
  var block = (selector, vars) => `${selector} {
${Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`).join("\n")}
}`;
  function tokensCss(model) {
    const vars = cssVarsOf(model);
    const inline = {};
    for (const r of model.rows) {
      if (r.kind === "color") inline[`color-${r.css}`] = `var(--${r.css})`;
      else if (r.kind === "radius" && r.css.startsWith("radius-")) inline[r.css] = `var(--${r.css})`;
    }
    for (const [css, m] of Object.entries(TOKEN_MAP.colors)) if (m.alias) inline[`color-${css}`] = `var(--${css})`;
    Object.assign(inline, vars.theme);
    return [
      "/*",
      ` * Mbank ${model.brand}: design tokens for Tailwind CSS v4 + shadcn/ui.`,
      " * GENERATED by the Figma widget Mbank Tokens (figma-pack/widget). Preview of one brand; the canonical",
      " * file is frontend-pack registry/mbank/tokens.css from tokens-build.mjs. Do not edit by hand.",
      " */",
      "",
      "@custom-variant dark (&:where(.dark, .dark *));",
      "",
      block(":root", vars.light),
      "",
      block(".dark", vars.dark),
      "",
      block("@theme inline", inline),
      "",
      "@layer base {",
      "  * { @apply border-border outline-ring/50; }",
      "  body { @apply bg-background text-foreground; }",
      "}",
      ""
    ].join("\n");
  }
  var OWNER_TOKENS = "plugins/figma-pack/skills/mbank-figma-patterns/references/tokens.json";
  function syncCommands({ contracts = [] } = {}) {
    const out = [
      {
        title: "tokens.json \u2192 \u0440\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0440\u0438\u0439 (\u0432\u043B\u0430\u0434\u0435\u043B\u0435\u0446 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430), \u0437\u0430\u0442\u0435\u043C \u043A\u043E\u043F\u0438\u044F \u0432\u043E frontend-pack \u0438 tokens.css",
        cmd: `cp ~/Downloads/tokens.json ${OWNER_TOKENS}
node plugins/design-engine/scripts/sync-contracts.mjs`
      },
      {
        title: "\u0418\u043B\u0438 \u0441\u044B\u0440\u043E\u0439 \u0434\u0430\u043C\u043F, \u043A\u0430\u043A \u043F\u043E\u0441\u043B\u0435 read-tokens.js",
        cmd: `node plugins/frontend-pack/scripts/tokens-build.mjs --from ~/Downloads/mbank-tokens-raw.json --tokens ${OWNER_TOKENS}
node plugins/design-engine/scripts/sync-contracts.mjs`
      },
      { title: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430: \u043A\u043E\u043F\u0438\u0438 \u0438 tokens.css \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0442 \u0441 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u043C", cmd: "npm test" }
    ];
    if (contracts.length) {
      const files = contracts.length > 1 ? `{${contracts.join(",")}}` : contracts[0];
      out.splice(2, 0, {
        title: `\u041A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u044B \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u043E\u0432 (${contracts.join(", ")}) \u2192 builder/contracts, \u0437\u0430\u0442\u0435\u043C \u043A\u043E\u0434 \u043A\u0438\u0442\u0430`,
        cmd: `cp ~/Downloads/${files}.json plugins/figma-pack/builder/contracts/
node plugins/design-engine/scripts/sync-contracts.mjs
node plugins/frontend-pack/scripts/contract-to-code.mjs`
      });
    }
    return out;
  }

  // ../builder/core/contract.js
  var SCHEMA = "mbank/component@1";
  var STATES = ["default", "hover", "active", "focus", "disabled"];
  var statesAllowed = (c) => [.../* @__PURE__ */ new Set([...STATES, ...c && c.states || []])];
  var STEP = 4;
  var KINDS2 = {
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
  var PROPS = Object.keys(KINDS2);
  var WEIGHTS = ["regular", "medium", "semibold", "bold"];
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
        if (!KINDS2[prop]) errors.push(`${where}.${part}: \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0435 \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E \xAB${prop}\xBB`);
        if (!statesAllowed(c).includes(state)) errors.push(`${where}.${part}: \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \xAB${state}\xBB`);
        if (KINDS2[prop] === "color" && (typeof value !== "string" || /^#|^rgb|^oklch/i.test(value)))
          errors.push(`${where}.${part}.${key}: \u0446\u0432\u0435\u0442 \u2014 \u0442\u043E\u043B\u044C\u043A\u043E \u0438\u043C\u044F \u0442\u043E\u043A\u0435\u043D\u0430, \u043D\u0435 \xAB${value}\xBB`);
        if (KINDS2[prop] === "space" && !(typeof value === "number" && value >= 0)) errors.push(`${where}.${part}.${key}: \u0448\u0430\u0433 \u0441\u0435\u0442\u043A\u0438 \u2014 \u0447\u0438\u0441\u043B\u043E`);
        if (KINDS2[prop] === "flag" && typeof value !== "boolean") errors.push(`${where}.${part}.${key}: true \u0438\u043B\u0438 false`);
        if (prop === "weight" && !WEIGHTS.includes(value)) errors.push(`${where}.${part}.weight: ${WEIGHTS.join(" | ")}`);
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
          if (!["color", "radius", "space", "text", "weight"].includes(KINDS2[prop])) continue;
          rows.push({ id: [...path, part, key].join("."), source, path: [...path, part], key, part, prop, state, kind: KINDS2[prop], value });
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
  function tokensUsed(c) {
    const out = { color: /* @__PURE__ */ new Set(), radius: /* @__PURE__ */ new Set(), space: /* @__PURE__ */ new Set(), text: /* @__PURE__ */ new Set() };
    for (const r of bindingRows(c)) {
      if (r.kind === "color") out.color.add(splitToken(r.value).token);
      else if (out[r.kind]) out[r.kind].add(r.value);
    }
    return out;
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

  // core/io.js
  function importTokens(source, text) {
    let data;
    try {
      data = typeof text === "string" ? JSON.parse(text) : text;
    } catch (e) {
      return { errors: [`\u041D\u0435 JSON: ${e.message}`] };
    }
    if (data && String(data.format || "").startsWith("mbank-figma-raw/")) {
      return { errors: ["\u042D\u0442\u043E \u0441\u044B\u0440\u043E\u0439 \u0434\u0430\u043C\u043F read-tokens.js: \u0441\u043D\u0430\u0447\u0430\u043B\u0430 tokens-build.mjs --from, \u0437\u0430\u0442\u0435\u043C \u0432\u0441\u0442\u0430\u0432\u044C\u0442\u0435 tokens.json"] };
    }
    if (!data || !data.theme || !Array.isArray(data.theme.vars) || !data.brand || !Array.isArray(data.brand.vars)) {
      return { errors: ["\u041D\u0443\u0436\u0435\u043D tokens.json Mbank: \u0435\u0441\u0442\u044C theme.vars \u0438 brand.vars"] };
    }
    const edits = {};
    let changed = 0;
    for (const brand of indexSource(data).brandModes) {
      const before = buildModel(source, { brand }).rows;
      const after = new Map(buildModel(data, { brand }).rows.map((r) => [r.key, r]));
      for (const r of before) {
        const a = after.get(r.key);
        if (!a || a.light == null || r.derivedFrom) continue;
        if (sameValue(a.light, r.light) && sameValue(a.dark, r.dark)) continue;
        if (edits[r.key]) continue;
        edits[r.key] = { light: a.light, dark: a.dark };
        changed++;
      }
    }
    const known = new Set(source.theme.vars.map((v) => v.name));
    const extras = data.theme.vars.filter((v) => v.name.startsWith("custom/") && !known.has(v.name)).map((v) => {
      const color = normHex(v.light) !== null;
      const name = cssVar(v.name).slice(2);
      return { name, kind: color ? "color" : /radius/.test(name) ? "radius" : "size", light: color ? normHex(v.light) : Number(v.light), dark: color ? normHex(v.dark) : Number(v.dark) };
    });
    return { edits, extras, changed, errors: [] };
  }
  var bindingKey = (contract, rowId) => `${contract}|${rowId}`;
  function applyBindings(contract, edits = []) {
    return edits.reduce((c, e) => setBinding(c, e.path, e.key, e.value), contract);
  }
  function bindingTable(contract) {
    return bindingRows(contract).filter((r) => r.kind === "color" || r.kind === "radius" || r.kind === "space").map((r) => ({ id: r.id, source: r.source, part: r.part, prop: r.prop, state: r.state, kind: r.kind, value: r.value, path: r.path, key: r.key }));
  }
  function editedContracts(bundled, bindingEdits, isShared = () => false) {
    const byContract = {};
    for (const e of bindingEdits) (byContract[e.contract] = byContract[e.contract] || []).push(e);
    return bundled.filter((c) => byContract[c.name] || isShared(c)).map((c) => {
      const next = applyBindings(c, byContract[c.name] || []);
      return { name: c.name, contract: next, errors: validateContract(next) };
    });
  }

  // src/figma-io.js
  var isAlias = (x) => x && typeof x === "object" && x.type === "VARIABLE_ALIAS";
  var OURS = [THEME, BRAND];
  var MODES_OF = { [THEME]: MODES, [BRAND]: BRANDS };
  async function loadLocal() {
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const vars = await figma.variables.getLocalVariablesAsync();
    const colById = new Map(cols.map((c) => [c.id, c]));
    const col = {};
    for (const c of cols) col[c.name.trim()] = c;
    const named = {};
    for (const name of OURS) named[name] = /* @__PURE__ */ new Map();
    for (const v of vars) {
      const c = colById.get(v.variableCollectionId);
      if (c && named[c.name.trim()]) named[c.name.trim()].set(v.name, v);
    }
    return { cols, vars, colById, col, named };
  }
  async function resolve(value, mode, depth = 0) {
    if (!isAlias(value)) return value;
    if (depth > 10) return null;
    const target = await figma.variables.getVariableByIdAsync(value.id);
    if (!target) return null;
    const c = await figma.variables.getVariableCollectionByIdAsync(target.variableCollectionId);
    const m = c && (c.modes.find((x) => modeName(x.name) === modeName(mode)) || c.modes.find((x) => x.modeId === c.defaultModeId)) || null;
    return m ? resolve(target.valuesByMode[m.modeId], mode, depth + 1) : null;
  }
  async function scanFile() {
    const ix = await loadLocal();
    const vars = {};
    for (const name of OURS) {
      const c = ix.col[name];
      if (!c) continue;
      for (const [vName, v] of ix.named[name]) {
        const entry = {};
        for (const m of c.modes) entry[modeName(m.name)] = plainValue(await resolve(v.valuesByMode[m.modeId], m.name));
        vars[`${name}/${vName}`] = entry;
      }
    }
    const library = {};
    const missingLocal = OURS.filter((n) => !ix.col[n]);
    if (missingLocal.length && figma.teamLibrary) {
      try {
        const libs = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
        for (const lib of libs.filter((l) => missingLocal.includes(String(l.name).trim()))) {
          for (const ref of await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lib.key)) library[`${lib.name.trim()}/${ref.name}`] = true;
        }
      } catch (e) {
      }
    }
    return {
      scannedAt: (/* @__PURE__ */ new Date()).toISOString(),
      collections: Object.fromEntries(OURS.map((n) => [n, !!ix.col[n]])),
      count: Object.keys(vars).length,
      libraryCount: Object.keys(library).length,
      vars,
      library
    };
  }
  async function primitiveIndex(ix) {
    const out = /* @__PURE__ */ new Map();
    for (const v of ix.vars) {
      const c = ix.colById.get(v.variableCollectionId);
      if (!c || OURS.includes(c.name.trim()) || v.resolvedType !== "COLOR") continue;
      const val = v.valuesByMode[c.defaultModeId];
      if (isAlias(val)) continue;
      const hex = plainValue(val);
      if (hex && !out.has(hex)) out.set(hex, v);
    }
    return out;
  }
  function modeFailed(report2, collection, mode, e) {
    report2.modesFailed = report2.modesFailed || {};
    const list = report2.modesFailed[collection] || (report2.modesFailed[collection] = []);
    if (list.includes(mode)) return;
    list.push(mode);
    const limit = /Limited to (\d+) modes?/i.exec(e.message || "");
    if (list.length > 1) return;
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
  var rgba = (hex) => {
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
          if (!(first && first.aliasOf)) for (const m of c.modes) v.setValueForMode(m.modeId, w.type === "COLOR" ? rgba(first) : Number(first));
        }
      }
      for (const [modeKey, wanted] of Object.entries(w.values)) {
        for (const modeId of modeIdsFor(c, modeKey, report2, dryRun)) {
          const label = `${w.collection}/${w.name} (${modeKey === "*" ? "\u0432\u0441\u0435 \u0440\u0435\u0436\u0438\u043C\u044B" : modeKey})`;
          const current = v && !fresh ? v.valuesByMode[modeId] : void 0;
          if (wanted && wanted.aliasOf) {
            const target = ix.named[wanted.aliasOf.collection] && ix.named[wanted.aliasOf.collection].get(wanted.aliasOf.name);
            if (!target && !dryRun) {
              report2.errors.push(`${label}: \u043D\u0435\u0442 \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0439 ${wanted.aliasOf.collection}/${wanted.aliasOf.name} \u0434\u043B\u044F \u0441\u0441\u044B\u043B\u043A\u0438`);
              continue;
            }
            if (isAlias(current) && target && current.id === target.id) {
              report2.unchanged++;
              continue;
            }
            report2.aliased.push(`${label} \u2192 ${wanted.aliasOf.name}`);
            touched();
            if (!dryRun) v.setValueForMode(modeId, figma.variables.createVariableAlias(target));
            continue;
          }
          const now = current === void 0 ? void 0 : plainValue(await resolve(current, modeKey));
          if (!fresh && current !== void 0 && sameValue(now, w.type === "COLOR" ? normHex(wanted) : wanted)) {
            report2.unchanged++;
            continue;
          }
          const before = isAlias(current) ? "\u0441\u0441\u044B\u043B\u043A\u0430" : now;
          touched();
          if (w.type === "COLOR") {
            const prim = prims.get(normHex(wanted));
            if (prim) {
              report2.aliased.push(`${label} \u2192 ${prim.name}`);
              if (!dryRun) v.setValueForMode(modeId, figma.variables.createVariableAlias(prim));
            } else {
              report2.raw.push(`${label}: ${normHex(wanted)}${before !== void 0 ? ` (\u0431\u044B\u043B\u043E ${before})` : ""}`);
              if (!dryRun) v.setValueForMode(modeId, rgba(wanted));
            }
          } else if (!dryRun) v.setValueForMode(modeId, Number(wanted));
          if (!fresh && current !== void 0) report2.updated.push(`${label}: ${before} \u2192 ${wanted}`);
        }
      }
    }
    return report2;
  }
  function reportLine(r) {
    if (!r) return "";
    const parts = [`\u0441\u043E\u0437\u0434\u0430\u043D\u043E ${r.created.length}`, `\u0438\u0437\u043C\u0435\u043D\u0435\u043D\u043E ${r.updated.length}`, `\u0441\u0441\u044B\u043B\u043E\u043A ${r.aliased.length}`, `hex \u0431\u0435\u0437 \u043F\u0440\u0438\u043C\u0438\u0442\u0438\u0432\u0430 ${r.raw.length}`, `\u0431\u0435\u0437 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439 ${r.unchanged}`];
    if (r.collectionsCreated.length) parts.push(`\u043D\u043E\u0432\u044B\u0435 \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0438: ${r.collectionsCreated.join(", ")}`);
    if (r.errors.length) parts.push(`\u043E\u0448\u0438\u0431\u043E\u043A ${r.errors.length}`);
    return `${r.dryRun ? "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430" : "\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u043E"}: ${parts.join(" \xB7 ")}`;
  }

  // ../builder/plugin/src/shared-contracts.js
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
  function sharedContract(name) {
    const raw = figma.root.getSharedPluginData(NAMESPACE, PREFIX + name);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
  function putSharedContract(contract) {
    figma.root.setSharedPluginData(NAMESPACE, PREFIX + contract.name, JSON.stringify(contract));
  }
  function dropSharedContract(name) {
    figma.root.setSharedPluginData(NAMESPACE, PREFIX + name, "");
  }

  // ../builder/plugin/src/draw.js
  var WEIGHTS2 = { regular: "Regular", medium: "Medium", semibold: "Semi Bold", bold: "Bold" };
  function createCtx({ vars, radius, font, kit, width, state, spec }) {
    return { vars, radius, font, kit, width, state, spec, styles: {}, kitStyles: null, stats: { instances: 0, fallbacks: 0, fallbackFonts: false } };
  }
  async function loadFonts(family) {
    const loaded = [];
    for (const style of Object.values(WEIGHTS2)) {
      try {
        await figma.loadFontAsync({ family, style });
        loaded.push(style);
      } catch (e) {
      }
    }
    if (loaded.includes("Regular")) return family;
    for (const style of Object.values(WEIGHTS2)) await figma.loadFontAsync({ family: "Inter", style });
    return "Inter";
  }
  function paint2(ctx, token, opacity = 1) {
    const v = ctx.vars[token];
    const base = { type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 }, opacity };
    return v ? figma.variables.setBoundVariableForPaint(base, "color", v) : base;
  }
  async function textStyle(ctx, sz, weight) {
    const key = `${sz}/${weight}`;
    if (ctx.styles[key]) return ctx.styles[key];
    if (!ctx.kitStyles) ctx.kitStyles = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
    const kit = ctx.kitStyles.get(`text-${sz}/leading-normal/${weight === "regular" ? "normal" : weight}`);
    if (kit) {
      try {
        await figma.loadFontAsync(kit.fontName);
        return ctx.styles[key] = kit;
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
    st.fontName = { family: ctx.font, style: WEIGHTS2[weight] || "Regular" };
    st.fontSize = px;
    st.lineHeight = { unit: "PIXELS", value: lh };
    st.letterSpacing = { unit: "PERCENT", value: ["2xl", "3xl", "4xl"].includes(sz) ? -2 : 0 };
    ctx.stats.fallbackFonts = true;
    return ctx.styles[key] = st;
  }

  // ../builder/plugin/src/icons.js
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
  function icon(ctx, name, color = "muted-foreground", px = 16) {
    const body = P[name] || P.folder;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
    const node = figma.createNodeFromSvg(svg);
    node.name = `Icon / ${name}`;
    node.fills = [];
    const tint2 = (n) => {
      if ("strokes" in n && n.strokes.length) n.strokes = [paint2(ctx, color)];
      if ("fills" in n && n.type !== "FRAME") n.fills = [];
      if ("children" in n) n.children.forEach(tint2);
    };
    tint2(node);
    node.rescale(px / 24);
    return node;
  }

  // ../builder/plugin/src/library-import.js
  var TIMEOUT = 4e3;
  var unreachable = false;
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

  // ../builder/plugin/src/brand.js
  var C = { tailwind: "Tailwind", style: "Style", mode: "Mode", brand: "Brand" };
  var THEMES = ["light", "dark"];
  var alias = (v) => figma.variables.createVariableAlias(v);
  var isAlias2 = (x) => x && typeof x === "object" && x.type === "VARIABLE_ALIAS";
  var rgba2 = (hex) => {
    const { r, g, b, a } = hexToRgb(hex);
    return { r, g, b, a };
  };
  async function loadIndex() {
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const vars = await figma.variables.getLocalVariablesAsync();
    const byId = new Map(vars.map((v) => [v.id, v]));
    const col = {};
    for (const c of cols) col[c.name] = c;
    const named = {};
    for (const c of cols) named[c.name] = /* @__PURE__ */ new Map();
    for (const v of vars) {
      const c = cols.find((x) => x.id === v.variableCollectionId);
      if (c) named[c.name].set(v.name, v);
    }
    const palette = {};
    for (const [name, v] of named[C.tailwind] || []) {
      if (v.resolvedType !== "COLOR" || !name.startsWith("colors/")) continue;
      const val = v.valuesByMode[col[C.tailwind].defaultModeId];
      if (!isAlias2(val)) palette[name.slice(7)] = rgbToHex(val);
    }
    return { col, named, byId, palette };
  }
  var themeMode = (c, theme) => (c.modes.find((m) => (theme === "dark" ? /dark/i : /light/i).test(m.name)) || c.modes[theme === "dark" ? 1 : 0]).modeId;
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
  async function ensureModeColor(name, like) {
    const ix = await loadIndex();
    if (!ix.col[C.brand] || !ix.col[C.mode]) return null;
    const mode = ix.col[C.mode];
    const mv = figma.variables.createVariable(name, mode, "COLOR");
    const base = like && ix.named[C.mode].get(like);
    for (const theme of THEMES) {
      const bv = await ensureBrandVar(ix, `color/${theme}/${name}`);
      const src = base && ix.named[C.brand].get(`color/${theme}/${like}`);
      setAllModes(ix, bv, src ? alias(src) : rgba2("#ff00ff"));
      mv.setValueForMode(themeMode(mode, theme), alias(bv));
    }
    mv.setPluginData("ds", "contract-placeholder");
    mv.scopes = scopesFor(name);
    mv.setVariableCodeSyntax("WEB", `var(${cssVar(name)})`);
    return mv;
  }

  // ../builder/plugin/src/tokens-resolve.js
  async function tokenIndex() {
    const ix = await loadIndex();
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const colName = new Map(cols.map((c) => [c.id, c.name]));
    const all = [...ix.byId.values()];
    const byName = /* @__PURE__ */ new Map();
    for (const v of all) {
      const list = byName.get(v.name) || [];
      list.push(v);
      byName.set(v.name, list);
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
    const list = (t.byName.get(name) || []).filter((v) => v.resolvedType === type);
    if (!list.length) return null;
    return collection && list.find((v) => (t.colName.get(v.variableCollectionId) || "").startsWith(collection)) || list[0];
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
  function findSpace(t, step2) {
    const s = String(step2).replace(".", "-");
    const mbank = TOKEN_MAP.spacing && TOKEN_MAP.spacing[String(step2 * STEP)];
    return pick(t, `spacing/${step2}`, "FLOAT") || pick(t, `spacing/${s}`, "FLOAT") || pick(t, `spacing/${step2 * STEP}`, "FLOAT") || mbank && pick(t, mbank, "FLOAT");
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

  // ../builder/plugin/src/components.js
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
  async function pickTextStyle(r, size, weight) {
    const key = `${size}/${weight}`;
    if (r.textStyles.has(key)) return r.textStyles.get(key);
    const local = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
    const mapped = TOKEN_MAP.text[size];
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
      const sz = TYPE_SCALE[size] ? size : { "2xs": "xs", caption: "xs", md: "sm", "5xl": "4xl", "6xl": "4xl", "7xl": "4xl" }[size] || "sm";
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
    const size = inherited(style, part, "text", "sm");
    const weight = inherited(style, part, "weight", "regular");
    const st = await pickTextStyle(r, size, weight);
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
    const fill = c.anatomy ? !!a.fill : column && kind !== "icon";
    if (fill) node.layoutSizingHorizontal = "FILL";
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
    for (const h of holders.values()) if (h.type !== "INSTANCE" && h.children) {
      for (const n of [...h.children]) if (!keep.has(n)) n.remove();
    }
  }
  function layoutGrid(set, c, comps) {
    const states = statesOf(c);
    const w = Math.max(...comps.map((x) => x.node.width));
    const h = Math.max(...comps.map((x) => x.node.height));
    comps.forEach((x, i) => {
      x.node.x = GAP + i % states.length * (w + GAP);
      x.node.y = GAP + Math.floor(i / states.length) * (h + GAP);
    });
    const rows = Math.ceil(comps.length / states.length);
    set.resizeWithoutConstraints(GAP + states.length * (w + GAP), GAP + rows * (h + GAP));
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
    if (!key) key = set.addComponentProperty("Label", "TEXT", defaultText(part, c));
    for (const v of set.children) {
      const t = v.findOne((n) => n.type === "TEXT" && n.name === part);
      if (t) t.componentPropertyReferences = { characters: key };
    }
  }
  async function refreshPaints(root) {
    const nodes = [root, ...root.findAll ? root.findAll(() => true) : []];
    for (const n of nodes) {
      for (const key of ["fills", "strokes"]) {
        const list = n[key];
        if (!Array.isArray(list) || !list.some((p) => p.boundVariables && p.boundVariables.color)) continue;
        const next = [];
        for (const p of list) {
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

  // src/components-io.js
  var INSERTED = "mbank-insert";
  var RADII = ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"];
  async function mainOf(inst) {
    try {
      return inst.getMainComponentAsync ? await inst.getMainComponentAsync() : inst.mainComponent || null;
    } catch (e) {
      return null;
    }
  }
  var ownerOf = (main) => main && main.parent && main.parent.type === "COMPONENT_SET" ? main.parent : main;
  function pageNode(node) {
    let p = node;
    while (p && p.type !== "PAGE") p = p.parent;
    return p || null;
  }
  var pageName = (node) => pageNode(node) ? pageNode(node).name : "?";
  function inside(node, id) {
    for (let p = node.parent; p; p = p.parent) if (p.id === id) return true;
    return false;
  }
  async function findLocal(c) {
    await figma.loadAllPagesAsync();
    const pages = figma.root.children;
    const home = pages.find((p) => p.name === pageOf(c));
    const order = home ? [home, ...pages.filter((p) => p !== home)] : pages;
    for (const p of order) {
      const hit = findSet(p, c);
      if (hit) return hit;
    }
    return null;
  }
  async function instanceUsage(targets) {
    const out = {};
    for (const t of targets) out[t.name] = { instances: 0, pages: {} };
    if (!targets.length) return out;
    await figma.loadAllPagesAsync();
    for (const inst of figma.root.findAllWithCriteria({ types: ["INSTANCE"] })) {
      const main = await mainOf(inst);
      const owner = ownerOf(main);
      if (!owner) continue;
      const t = targets.find((x) => x.id && owner.id === x.id || x.key && owner.remote && (owner.key === x.key || main.key === x.key));
      if (!t || t.id && inside(inst, t.id)) continue;
      const u = out[t.name];
      u.instances++;
      u.pages[pageName(inst)] = (u.pages[pageName(inst)] || 0) + 1;
    }
    return out;
  }
  var libraryKey = (c) => c.figma && c.figma.key || null;
  async function componentStatus(c) {
    const node = await findLocal(c);
    const key = libraryKey(c);
    const target = node ? { name: c.name, id: node.id } : key ? { name: c.name, key } : null;
    const use = target ? (await instanceUsage([target]))[c.name] : { instances: 0, pages: {} };
    return {
      name: c.name,
      title: c.title || c.name,
      state: node ? "local" : use.instances ? "library" : "none",
      setId: node ? node.id : null,
      variants: node ? node.type === "COMPONENT_SET" ? node.children.length : 1 : 0,
      instances: use.instances,
      pages: use.pages
    };
  }
  async function extraVariables(extras) {
    const out = /* @__PURE__ */ new Map();
    if (!extras.length) return out;
    const theme = (await figma.variables.getLocalVariableCollectionsAsync()).find((x) => x.name.trim() === THEME);
    if (!theme) return out;
    const vars = (await figma.variables.getLocalVariablesAsync()).filter((v) => v.variableCollectionId === theme.id);
    for (const x of extras) {
      const v = vars.find((y) => y.name === x.figma);
      if (v) out.set(x.css, v);
    }
    return out;
  }
  var boundPaint = (v, opacity) => figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity }, "color", v);
  function partNode(nodes, c, part) {
    const holder = nodes.get(parentOf(c, part));
    const layer = c.anatomy && c.anatomy[part] && c.anatomy[part].layer || part;
    return holder && holder.type !== "INSTANCE" && holder.children ? holder.children.find((n) => n.name === layer) || null : null;
  }
  function bindExtras(node, c, vars) {
    let bound = 0;
    const colour = (value) => {
      if (!value) return null;
      const { token, opacity } = splitToken(value);
      const v = vars.get(token);
      return v && v.resolvedType === "COLOR" ? boundPaint(v, opacity) : null;
    };
    const list = variantList(c);
    const comps = node.type === "COMPONENT_SET" ? node.children.filter((n) => n.type === "COMPONENT") : [node];
    for (const comp of comps) {
      const w = isSingle(c) ? list[0] : list.find((x) => x.name === comp.name);
      if (!w) continue;
      const style = resolveStyle(c, w.props, w.state);
      const nodes = /* @__PURE__ */ new Map([["root", comp]]);
      for (const part of c.parts) {
        const el = part === "root" ? comp : partNode(nodes, c, part);
        if (!el) continue;
        nodes.set(part, el);
        const kind = partKind(part, c);
        if (kind === "instance") continue;
        if (kind === "text" || kind === "icon") {
          const paint3 = colour(inherited(style, part, "fg", "foreground"));
          if (!paint3) continue;
          if (kind === "text") el.fills = [paint3];
          else for (const vec of el.findAll((n) => n.type === "VECTOR")) {
            if (vec.strokes.length) vec.strokes = [paint3];
            if (vec.fills.length) vec.fills = [paint3];
          }
          bound++;
          continue;
        }
        const s = style[part] || {};
        const bg = colour(s.bg);
        if (bg) {
          el.fills = [bg];
          bound++;
        }
        const border = colour(s.border);
        if (border) {
          el.strokes = [border];
          bound++;
        }
        const ring = s["focus-ring"] && vars.get(splitToken(s["focus-ring"]).token);
        if (ring && el.effects && el.effects.length) {
          el.effects = [figma.variables.setBoundVariableForEffect(__spreadValues({}, el.effects[0]), "color", ring)];
          bound++;
        }
        const radius = s.radius !== void 0 && vars.get(String(s.radius));
        if (radius && radius.resolvedType === "FLOAT") {
          for (const f of RADII) el.setBoundVariable(f, radius);
          bound++;
        }
      }
    }
    return bound;
  }
  async function updateComponent(c, extras = [], { build = false } = {}) {
    const before = await findLocal(c);
    if (!before) {
      const st = await componentStatus(c);
      if (st.state === "library") throw new Error(`\xAB${st.title}\xBB \u0432 \u044D\u0442\u043E\u043C \u0444\u0430\u0439\u043B\u0435 \u0438\u0437 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438 (${st.instances} \u044D\u043A\u0437.): \u043C\u0435\u043D\u044F\u0439\u0442\u0435 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u0432 \u0444\u0430\u0439\u043B\u0435 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0438 \u0438 \u043F\u0443\u0431\u043B\u0438\u043A\u0443\u0439\u0442\u0435, \u0437\u0434\u0435\u0441\u044C \u2014 Accept updates`);
      if (!build) return { needsBuild: true, name: c.name, title: c.title || c.name };
    }
    const ids = before ? before.type === "COMPONENT_SET" ? before.children.map((n) => n.id) : [before.id] : [];
    const res = await renderContract(c, { create: false, prune: false });
    if (res.errors) throw new Error(`\u041A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 \u0441 \u043E\u0448\u0438\u0431\u043A\u0430\u043C\u0438: ${res.errors.join("; ")}`);
    const node = await figma.getNodeByIdAsync(res.report.setId);
    const used = tokensUsed(c);
    const mine = extras.filter((x) => used.color.has(x.css) || used.radius.has(x.css));
    const vars = await extraVariables(mine);
    const extraBound = vars.size ? bindExtras(node, c, vars) : 0;
    const nowIds = node.type === "COMPONENT_SET" ? node.children.map((n) => n.id) : [node.id];
    const use = (await instanceUsage([{ name: c.name, id: node.id }]))[c.name];
    return {
      name: c.name,
      title: c.title || c.name,
      setId: node.id,
      page: res.report.page,
      built: !before,
      variants: nowIds.length,
      kept: ids.filter((id) => nowIds.includes(id)).length,
      created: res.report.created,
      bound: res.report.bound + extraBound,
      extraBound,
      missing: res.report.missing.filter((m) => !vars.has(m.token)).map((m) => `${m.kind}: ${m.token}`),
      notApplied: mine.filter((x) => !vars.has(x.css)).map((x) => x.css),
      instances: use.instances,
      pages: use.pages
    };
  }
  async function insertInstance(c, widgetId) {
    const local = await findLocal(c);
    let main = local ? local.type === "COMPONENT_SET" ? local.defaultVariant || local.children[0] : local : null;
    const key = libraryKey(c);
    if (!main && key && figma.importComponentByKeyAsync) {
      main = await importByKey(() => figma.importComponentByKeyAsync(key));
      if (!main) {
        const set = await importByKey(() => figma.importComponentSetByKeyAsync(key));
        main = set ? set.defaultVariant : null;
      }
    }
    if (!main) throw new Error(`\xAB${c.title || c.name}\xBB \u043D\u0435\u0442 \u0432 \u0444\u0430\u0439\u043B\u0435 \u0438 \u0432 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D\u043D\u044B\u0445 \u0431\u0438\u0431\u043B\u0438\u043E\u0442\u0435\u043A\u0430\u0445: \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \xAB\u0421\u043E\u0431\u0440\u0430\u0442\u044C \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\xBB`);
    const inst = main.createInstance();
    const anchor = widgetId ? await figma.getNodeByIdAsync(widgetId) : null;
    const parent = anchor && anchor.parent || figma.currentPage;
    parent.appendChild(inst);
    const x = anchor ? anchor.x + anchor.width + 48 : 0;
    const column = parent.children.filter((n) => n !== inst && n.x === x && n.getPluginData && n.getPluginData(INSERTED));
    inst.x = x;
    inst.y = column.length ? Math.max(...column.map((n) => n.y + n.height)) + 24 : anchor ? anchor.y : 0;
    inst.setPluginData(INSERTED, c.name);
    if (pageNode(inst) === figma.currentPage) {
      figma.currentPage.selection = [inst];
      figma.viewport.scrollAndZoomIntoView([inst]);
    }
    return { id: inst.id, name: main.name, title: c.title || c.name, source: local ? "local" : "library", x: inst.x, y: inst.y };
  }
  async function propagation(contracts, changedCss, variables) {
    const touches = (c) => {
      const u = tokensUsed(c);
      return [...changedCss].some((css) => u.color.has(css) || u.radius.has(css) || u.radius.has(css.replace(/^radius-/, "")));
    };
    const found = [];
    for (const c of contracts.filter(touches)) found.push({ c, node: await findLocal(c), key: libraryKey(c) });
    const targets = found.filter((x) => x.node || x.key).map((x) => ({ name: x.c.name, id: x.node ? x.node.id : null, key: x.node ? null : x.key }));
    const use = await instanceUsage(targets);
    const components = found.map((x) => {
      const u = use[x.c.name] || { instances: 0, pages: {} };
      return { name: x.c.name, title: x.c.title || x.c.name, inFile: !!x.node, library: !x.node && u.instances > 0, instances: u.instances, pages: u.pages };
    });
    return {
      kind: "apply",
      variables,
      components,
      setsUpdated: 0,
      instances: components.reduce((n, x) => n + x.instances, 0)
    };
  }

  // src/actions.js
  function readState(store, brand = store.brand) {
    return {
      brand,
      edits: Object.fromEntries(store.edits.entries()),
      extras: store.extras.values(),
      bindings: store.bindings.values()
    };
  }
  var modelOf = (store, brand) => buildModel(tokens_default, readState(store, brand));
  async function scan(store) {
    const snapshot = await scanFile();
    store.setScan(snapshot);
    return snapshot;
  }
  async function apply(store, opts = {}) {
    const state = readState(store);
    const plan = planAllBrands((b) => buildModel(tokens_default, __spreadProps(__spreadValues({}, state), { brand: b })), BRANDS, opts);
    const report2 = await applyWrites(plan.writes, opts);
    report2.skipped = plan.skipped;
    report2.at = (/* @__PURE__ */ new Date()).toISOString();
    const css = new Set(plan.writes.filter((w) => report2.changed.includes(`${w.collection}/${w.name}`)).map((w) => w.css));
    report2.propagation = __spreadProps(__spreadValues({}, await propagation(fileContracts(store), css, report2.changed)), { at: report2.at, dryRun: !!opts.dryRun });
    if (!opts.dryRun) {
      store.setReport(report2);
      store.setPropagation(__spreadProps(__spreadValues({}, report2.propagation), { variables: report2.changed.slice(0, 20), variableCount: report2.changed.length }));
      await scan(store);
    }
    return report2;
  }
  var isEmpty = (v) => v == null || String(v).trim() === "";
  function setToken(store, brand, { key, light, dark }) {
    const row = modelOf(store, brand).rows.find((r) => r.key === key);
    if (!row || row.extra) return [`\u041D\u0435\u0442 \u0442\u043E\u043A\u0435\u043D\u0430 ${key}`];
    if (row.derivedFrom) return [`--${row.css} \u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u0431\u0440\u0435\u043D\u0434\u043E\u043C: \u043F\u0440\u0430\u0432\u044C\u0442\u0435 ${row.derivedFrom.replace(":", " \u2192 --")}`];
    const norm = (v) => {
      if (isEmpty(v)) return void 0;
      if (row.kind !== "color") return Number.isFinite(Number(v)) ? Number(v) : NaN;
      return normHex(v) || (/^var\(--[\w-]+\)$/.test(String(v).trim()) ? String(v).trim() : NaN);
    };
    const next = { light: norm(light), dark: norm(dark) };
    const errors = Object.entries(next).filter(([, v]) => Number.isNaN(v)).map(([m]) => `${m}: ${row.kind === "color" ? "\u043D\u0443\u0436\u0435\u043D #hex \u0438\u043B\u0438 var(--\u0442\u043E\u043A\u0435\u043D)" : "\u043D\u0443\u0436\u043D\u043E \u0447\u0438\u0441\u043B\u043E px"}`);
    if (errors.length) return errors;
    if (next.light === void 0) next.light = row.source.light;
    if (next.dark === void 0) next.dark = row.source.dark;
    if (sameValue(next.light, row.source.light) && sameValue(next.dark, row.source.dark)) store.edits.delete(key);
    else store.edits.set(key, next);
    return [];
  }
  function addExtra(store, token) {
    const taken = new Set(modelOf(store).rows.map((r) => r.css));
    const errors = validateExtra(token, store.prefix, taken);
    if (!errors.length) store.extras.set(token.name, normalizeExtra(token));
    return errors;
  }
  function setExtra(store, token) {
    const old = store.extras.get(token.name);
    if (!old) return [`\u041D\u0435\u0442 \u0442\u043E\u043A\u0435\u043D\u0430 \u043F\u0440\u043E\u0435\u043A\u0442\u0430 ${token.name}`];
    const next = __spreadProps(__spreadValues(__spreadValues({}, old), token), { kind: old.kind });
    const taken = new Set(modelOf(store).rows.map((r) => r.css).filter((c) => c !== token.name));
    const errors = validateExtra(next, store.prefix, taken);
    if (!errors.length) store.extras.set(token.name, normalizeExtra(next));
    return errors;
  }
  function generatePreview(hex) {
    const slots = generateBrand(hex);
    return { hex, slots: BRAND_SLOTS.map((s) => ({ slot: s, light: slots.light[s], dark: slots.dark[s] })) };
  }
  function applyGenerated(store, brand, hex) {
    const edits = brandEdits(modelOf(store, brand).rows, brand, generateBrand(hex));
    for (const [k, v] of Object.entries(edits)) store.edits.set(k, v);
    return Object.keys(edits).length;
  }
  var fileContract = (name) => sharedContract(name) || contracts_default.find((c) => c.name === name) || null;
  var mineOf = (store, name) => store.bindings.values().filter((b) => b.contract === name);
  function contractOf(store, name) {
    const base = fileContract(name);
    return base ? applyBindings(base, mineOf(store, name)) : null;
  }
  function fileContracts(store, { valid = true } = {}) {
    const names = [.../* @__PURE__ */ new Set([...contracts_default.map((c) => c.name), ...Object.keys(sharedContracts())])];
    return names.map((n) => contractOf(store, n)).filter((c) => c && (!valid || !validateContract(c).length));
  }
  function contractView(store, name) {
    const contract = contractOf(store, name);
    if (!contract) return null;
    return { name, title: contract.title || name, rows: bindingTable(contract), errors: validateContract(contract), edited: mineOf(store, name).length };
  }
  function setBinding2(store, { contract, rowId, path, key, value, kind }) {
    const val = isEmpty(value) ? null : kind === "space" ? Number(value) : value;
    if (kind === "space" && val !== null && !(val >= 0)) return [`\u041E\u0442\u0441\u0442\u0443\u043F \u2014 \u0448\u0430\u0433 \u0441\u0435\u0442\u043A\u0438 4 px \u0447\u0438\u0441\u043B\u043E\u043C (2 = 8 px), \u0430 \u043D\u0435 \xAB${value}\xBB`];
    const edit = { contract, path, key, value: val };
    store.bindings.set(bindingKey(contract, rowId), edit);
    const base = fileContract(contract);
    if (base) putSharedContract(applyBindings(base, [edit]));
    return [];
  }
  function resetBindings(store, contract) {
    for (const k of store.bindings.keys()) if (k.startsWith(`${contract}|`)) store.bindings.delete(k);
    dropSharedContract(contract);
  }
  var extrasOf = (store) => modelOf(store).rows.filter((r) => r.extra).map((r) => ({ css: r.css, figma: r.figma, kind: r.kind }));
  async function componentInfo(store, name) {
    const c = contractOf(store, name);
    return c ? componentStatus(c) : null;
  }
  async function updateInFile(store, name, { build = false } = {}) {
    if (figma.editorType && figma.editorType !== "figma") throw new Error("\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u0444\u0430\u0439\u043B\u0435 Figma Design (\u043D\u0435 FigJam)");
    const c = contractOf(store, name);
    if (!c) throw new Error(`\u041D\u0435\u0442 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430 \xAB${name}\xBB`);
    const errors = validateContract(c);
    if (errors.length) throw new Error(`\u041A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 \u0441 \u043E\u0448\u0438\u0431\u043A\u0430\u043C\u0438: ${errors.join("; ")}`);
    const res = await updateComponent(c, extrasOf(store), { build });
    if (res.needsBuild) return res;
    store.setPropagation({
      kind: build && res.built ? "build" : "component",
      at: (/* @__PURE__ */ new Date()).toISOString(),
      variables: [],
      setsUpdated: 1,
      instances: res.instances,
      components: [{ name: res.name, title: res.title, inFile: true, instances: res.instances, pages: res.pages, variants: res.variants, kept: res.kept }]
    });
    return res;
  }
  async function insertComponent(store, name) {
    const c = contractOf(store, name);
    if (!c) throw new Error(`\u041D\u0435\u0442 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430 \xAB${name}\xBB`);
    return insertInstance(c, store.widgetId);
  }
  function importInto(store, text) {
    const res = importTokens(tokens_default, text);
    if (res.errors.length) return res;
    for (const k of store.edits.keys()) store.edits.delete(k);
    for (const [k, v] of Object.entries(res.edits)) store.edits.set(k, v);
    for (const k of store.extras.keys()) store.extras.delete(k);
    for (const x of res.extras) store.extras.set(x.name, x);
    return res;
  }
  function exportsOf(store, brand) {
    const state = readState(store, brand);
    const json = exportTokensJson(tokens_default, state);
    const model = buildModel(tokens_default, state);
    const contracts = editedContracts(contracts_default.map((c) => sharedContract(c.name) || c), state.bindings, (c) => !!sharedContract(c.name));
    const files = [
      { name: "tokens.json", mime: "application/json", text: JSON.stringify(json, null, 1) },
      { name: "mbank-tokens-raw.json", mime: "application/json", text: `${JSON.stringify(rawDump(json), null, 1)}
` },
      { name: `registry-mbank-${brand}.json`, mime: "application/json", text: `${JSON.stringify(registryBase(model), null, 2)}
` },
      { name: `tokens-${brand}.css`, mime: "text/css", text: tokensCss(model) },
      ...contracts.map((c) => ({ name: `${c.name}.json`, mime: "application/json", text: `${JSON.stringify(c.contract, null, 2)}
`, errors: c.errors }))
    ];
    return { files, commands: syncCommands({ contracts: contracts.map((c) => c.name) }) };
  }
  function uiState(store, brand) {
    const model = modelOf(store, brand);
    const issues = contrastIssues(model.rows);
    const status = fileStatus(model.rows, store.scan);
    const rows = model.rows.map((r) => ({
      key: r.key,
      css: r.css,
      figma: r.figma,
      collection: r.collection,
      kind: r.kind,
      group: r.group,
      extra: !!r.extra,
      light: r.light,
      dark: r.dark,
      source: r.source,
      edited: r.edited,
      note: r.note,
      status: status.byKey[r.key],
      derivedFrom: r.derivedFrom || null
    }));
    return {
      brand,
      brands: BRANDS,
      groups: GROUPS,
      prefix: store.prefix,
      rows,
      issues: issues.filter((i) => !i.ok),
      totals: status.totals,
      scan: store.scan ? { scannedAt: store.scan.scannedAt, count: store.scan.count, collections: store.scan.collections } : null,
      contracts: fileContracts(store, { valid: false }).map((c) => ({ name: c.name, title: c.title || c.name })),
      propagation: store.propagation || null
    };
  }

  // src/ui-bridge.js
  var SIZE = { width: 760, height: 720 };
  function openUI(store, tab = "tokens", focus = null) {
    const s = __spreadProps(__spreadValues({}, store), {
      setBrand: (b) => {
        s.brand = b;
        store.setBrand(b);
      },
      setScan: (x) => {
        s.scan = x;
        store.setScan(x);
      },
      setPrefix: (p) => {
        s.prefix = p;
        store.setPrefix(p);
      },
      setPropagation: (p) => {
        s.propagation = p;
        store.setPropagation(p);
      }
    });
    const post = (type, data) => figma.ui.postMessage(Object.assign({ type }, data));
    const state = () => post("state", { state: uiState(s, s.brand) });
    const handlers = {
      ready: () => {
        post("open", { tab, focus });
      },
      brand: (m) => {
        if (m.brand) s.setBrand(m.brand);
      },
      "set-token": (m) => ({ errors: setToken(s, s.brand, m) }),
      "reset-token": (m) => {
        s.edits.delete(m.key);
      },
      "reset-all": () => {
        for (const k of s.edits.keys()) s.edits.delete(k);
      },
      prefix: (m) => {
        s.setPrefix(String(m.prefix || "").trim());
      },
      "add-extra": (m) => ({ errors: addExtra(s, m.token) }),
      "set-extra": (m) => ({ errors: setExtra(s, m.token) }),
      "remove-extra": (m) => {
        s.extras.delete(m.name);
      },
      "gen-preview": (m) => ({ preview: generatePreview(m.hex) }),
      "gen-apply": (m) => ({ count: applyGenerated(s, s.brand, m.hex) }),
      contract: async (m) => ({ contract: contractView(s, m.name), component: await componentInfo(s, m.name) }),
      binding: (m) => ({ errors: setBinding2(s, m), contract: contractView(s, m.contract) }),
      "binding-reset": (m) => {
        resetBindings(s, m.contract);
        return { contract: contractView(s, m.contract) };
      },
      import: (m) => ({ result: importInto(s, m.text) }),
      export: () => exportsOf(s, s.brand),
      scan: async () => ({ scan: await scan(s) }),
      apply: async (m) => ({ report: await apply(s, { all: !!m.all, dryRun: !!m.dryRun }) }),
      "component-update": async (m) => {
        const result = await updateInFile(s, m.name, { build: !!m.build });
        return { result, component: await componentInfo(s, m.name) };
      },
      "component-insert": async (m) => ({ inserted: await insertComponent(s, m.name) })
    };
    return new Promise((resolve2) => {
      figma.showUI(__html__, Object.assign({ title: "Mbank Tokens", themeColors: false }, SIZE));
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
  var { useSyncedState, useSyncedMap, usePropertyMenu, useWidgetNodeId } = widget;
  var BRAND_LABEL = { bank: "Bank", kassa: "Kassa", travel: "Travel", artwin: "Artwin", koko: "Koko" };
  function MbankTokens() {
    const [brand, setBrand] = useSyncedState("brand", "bank");
    const [group, setGroup] = useSyncedState("group", "brand");
    const [scanned, setScan] = useSyncedState("scan", null);
    const [report2, setReport] = useSyncedState("report", null);
    const [prefix, setPrefix] = useSyncedState("prefix", "mb");
    const [propagated, setPropagation] = useSyncedState("propagation", null);
    const widgetId = useWidgetNodeId();
    const edits = useSyncedMap("edits");
    const extras = useSyncedMap("extras");
    const bindings = useSyncedMap("bindings");
    const store = { brand, setBrand, scan: scanned, setScan, setReport, propagation: propagated, setPropagation, prefix, setPrefix, widgetId, edits, extras, bindings };
    const model = buildModel(tokens_default, readState(store));
    const issues = contrastIssues(model.rows);
    const status = fileStatus(model.rows, scanned);
    usePropertyMenu(
      [
        { itemType: "dropdown", propertyName: "brand", tooltip: "\u0411\u0440\u0435\u043D\u0434", selectedOption: brand, options: BRANDS.map((b) => ({ option: b, label: BRAND_LABEL[b] })) },
        { itemType: "separator" },
        { itemType: "action", propertyName: "edit", tooltip: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C" },
        { itemType: "action", propertyName: "scan", tooltip: "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0444\u0430\u0439\u043B" },
        { itemType: "action", propertyName: "apply", tooltip: "\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0432 Figma" },
        { itemType: "action", propertyName: "components", tooltip: "\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B" },
        { itemType: "action", propertyName: "sync", tooltip: "\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0441 \u043A\u043E\u0434\u043E\u043C" }
      ],
      async ({ propertyName, propertyValue }) => {
        if (propertyName === "brand") setBrand(propertyValue);
        else if (propertyName === "edit") await openUI(store, "tokens");
        else if (propertyName === "sync") await openUI(store, "code");
        else if (propertyName === "components") await openUI(store, "bind");
        else if (propertyName === "scan") {
          const snap2 = await scan(store);
          figma.notify(`\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E: ${snap2.count} \u043F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 2.theme / 1.brand \u0432 \u0444\u0430\u0439\u043B\u0435`);
        } else if (propertyName === "apply") {
          await openUI(store, "figma");
        }
      }
    );
    const handlers = {
      brand: (b) => setBrand(b),
      group: (g) => setGroup(g),
      open: (key) => openUI(store, "tokens", key)
    };
    const source = `\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A: tokens.json (${String(tokens_default.source || "").slice(0, 90)})`;
    return /* @__PURE__ */ figma.widget.h(
      Board,
      {
        c: chrome(tokens_default, brand),
        brand,
        brands: BRANDS,
        groups: GROUPS,
        group,
        rows: model.rows,
        status: status.byKey,
        totals: status.totals,
        issues,
        counters: counters(model, issues),
        scan: scanned,
        report: reportLine(report2),
        propagation: propagated,
        source,
        handlers
      }
    );
  }
  widget.register(MbankTokens);
})();
