#!/usr/bin/env node
// Finds filler and overgrown interface text in React files (skill ui-copy).
// Usage: node check-ui-copy.mjs [dir-or-file ...] [--json]   (default ./src; exit 1 on findings)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CODE = new Set(['.tsx', '.jsx']);
const DICT = new Set(['.json']);
const IGNORED_DIRS = new Set(['node_modules', 'dist', 'build', '.next', 'coverage', '.git']);
const IGNORED = [/[\\/]shared[\\/]ui[\\/]/, /[\\/]components[\\/]ui[\\/]/, /\.stories\.[jt]sx$/, /\.test\.[jt]sx$/, /[\\/](mocks?|fixtures|__mocks__)[\\/]/];
const isDict = (f) => DICT.has(extname(f)) && /[\\/](locales?|i18n|messages|translations)[\\/]/.test(f);

export const MAX_TEXT = 90;
export const MAX_BUTTON_WORDS = 3;

// Phrases that only fill space. Lowercase; matched on word start.
export const FILLER = [
  'здесь вы можете', 'в этом разделе', 'на этой странице', 'добро пожаловать', 'пожалуйста', 'обратите внимание',
  'нажмите кнопку', 'нажмите на кнопку', 'введите ваш', 'введите вашу', 'введите ваше', 'данный', 'данная', 'данное',
  'успешно!', 'ой!', 'упс', 'ниже представлен', 'ниже приведен', 'легко и быстро', 'всего в несколько кликов',
  'here you can', 'welcome to', 'please ', 'oops', 'click the button to', 'below you will find',
];

const words = (s) => s.trim().split(/\s+/).filter(Boolean);
const hasLetters = (s) => /[a-zа-яё]/i.test(s);

// Visible strings: JSX text between tags and the props people read.
// Comments become spaces (line numbers stay); code between generics' "<…>" is not text.
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\/|(^|[^:])\/\/.*$/gm, (m) => m.replace(/[^\n]/g, ' '));
const looksLikeCode = (t) => /[;={}]|=>|&&|\|\||\breturn\b|\bconst\b|\?\s|\bimport\b/.test(t);

function strings(raw) {
  const src = stripComments(raw);
  const out = [];
  const line = (i) => src.slice(0, i).split('\n').length;
  for (const m of src.matchAll(/>([^<>{}]+)</g)) {
    const text = m[1].replace(/\s+/g, ' ').trim();
    if (text && hasLetters(text) && !looksLikeCode(text)) out.push({ text, line: line(m.index), kind: 'text' });
  }
  for (const m of src.matchAll(/\b(title|description|placeholder|label|aria-label|alt|subtitle|text)=["']([^"']+)["']/g)) {
    out.push({ text: m[2].trim(), line: line(m.index), kind: m[1] });
  }
  return out;
}

function checkText(s, add) {
  const low = s.text.toLowerCase();
  const filler = FILLER.find((f) => new RegExp(`(^|[^a-zа-яё])${f.replace(/[.*+?^${}()|[\]\\!]/g, '\\$&')}`, 'i').test(low));
  if (filler) add(s.line, 'filler', `«${filler.trim()}» — лишние слова: «${s.text}»`);
  if (/!/.test(s.text) && s.kind !== 'aria-label') add(s.line, 'exclamation', `«!» в тексте интерфейса: «${s.text}»`);
  // abbreviations (ИНН, CRM, API) are short; a 5+ letter word in caps is shouting
  if (words(s.text).some((w) => /^[A-ZА-ЯЁ]{5,}[.,:]?$/.test(w))) add(s.line, 'caps', `КАПСЛОК: «${s.text}»`);
  if (s.text.length > MAX_TEXT) add(s.line, 'long', `${s.text.length} символов — сократи до сути: «${s.text.slice(0, 50)}…»`);
}

export function checkSource(src, file = '') {
  const out = [];
  const add = (line, rule, message) => out.push({ file, line, rule, message });
  if (isDict(file)) {
    // i18n dictionaries: only the phrase rules, values only
    const values = [];
    const walk = (v) => (typeof v === 'string' ? values.push(v) : v && typeof v === 'object' && Object.values(v).forEach(walk));
    try { walk(JSON.parse(src)); } catch { return out; }
    for (const v of values) checkText({ text: v, line: src.split('\n').findIndex((l) => l.includes(v)) + 1, kind: 'text' }, (l, r, m) => r !== 'long' && add(l, r, m));
    return out;
  }
  for (const s of strings(src)) checkText(s, add);
  // Buttons: 1-3 words; two primary buttons next to each other
  const primaries = [];
  for (const m of src.matchAll(/<Button\b([^>]*)>([^<{]*)</g)) {
    const line = src.slice(0, m.index).split('\n').length;
    const label = m[2].replace(/\s+/g, ' ').trim();
    if (label && words(label).length > MAX_BUTTON_WORDS) add(line, 'button', `кнопка длиннее ${MAX_BUTTON_WORDS} слов: «${label}»`);
    const variant = m[1].match(/variant=["'{]+["']?(\w+)/)?.[1];
    if (!variant || variant === 'default') primaries.push(line);
  }
  for (let i = 1; i < primaries.length; i += 1) {
    if (primaries[i] - primaries[i - 1] <= 4) add(primaries[i], 'two-primary', 'две главные кнопки рядом — оставь одну, вторую сделай outline/ghost');
  }
  // placeholder that repeats its label
  for (const m of src.matchAll(/label=["']([^"']+)["'][^>]*placeholder=["']([^"']+)["']/g)) {
    const [label, ph] = [m[1].toLowerCase(), m[2].toLowerCase()];
    if (ph === label || ph.replace(/^(введите|укажите|enter)\s+/, '').startsWith(label)) {
      add(src.slice(0, m.index).split('\n').length, 'placeholder', `плейсхолдер повторяет подпись «${m[1]}» — дай пример формата или убери`);
    }
  }
  return out;
}

function collect(path, out) {
  if (!existsSync(path)) return out;
  if (statSync(path).isFile()) {
    if ((CODE.has(extname(path)) && !IGNORED.some((re) => re.test(path))) || isDict(path)) out.push(path);
    return out;
  }
  for (const e of readdirSync(path)) if (!IGNORED_DIRS.has(e)) collect(join(path, e), out);
  return out;
}

export function checkPaths(paths) {
  return paths.flatMap((p) => collect(p, [])).flatMap((f) => checkSource(readFileSync(f, 'utf8'), f));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const paths = args.filter((a) => !a.startsWith('--'));
  const found = checkPaths(paths.length ? paths : ['src']);
  if (json) console.log(JSON.stringify(found, null, 2));
  else if (!found.length) console.log('ui-copy: лишнего текста не найдено');
  else {
    for (const f of found) console.log(`${f.file}:${f.line}  [${f.rule}]  ${f.message}`);
    console.log(`\nui-copy: ${found.length} замечаний. Удали или сократи текст (скилл ui-copy).`);
  }
  process.exit(found.length ? 1 : 0);
}
