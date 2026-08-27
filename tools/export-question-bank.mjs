import fs from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)]
  .map(m => m[1].split('?')[0])
  .filter(src => !/^https?:/i.test(src))
  .filter(src => !['supabase-config.js'].includes(src))
  .filter(src => !/^multiplayer-/i.test(src))
  .filter(src => !/^controller-/i.test(src));

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'https://laffha.local/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});
const ctx = dom.getInternalVMContext();
ctx.console = console;
ctx.fetch = async () => ({ ok: false, json: async () => ({}) });
ctx.requestAnimationFrame = cb => { try { cb(0); } catch {} return 1; };
ctx.cancelAnimationFrame = () => {};
ctx.setInterval = () => 0;
ctx.clearInterval = () => {};
ctx.setTimeout = (cb) => { try { cb(); } catch {} return 0; };
ctx.clearTimeout = () => {};
ctx.alert = () => {};
ctx.confirm = () => true;
ctx.scrollTo = () => {};

const loaded = [];
const skipped = [];
for (const src of scripts) {
  if (!fs.existsSync(src)) { skipped.push({src, reason:'missing'}); continue; }
  try {
    const code = fs.readFileSync(src, 'utf8');
    new vm.Script(code, { filename: src }).runInContext(ctx);
    loaded.push(src);
  } catch (err) {
    // Some UI-only patches expect an active browser game. Keep exporting the bank
    // and report the script so we can review it if it mattered.
    skipped.push({src, reason:String(err?.message || err)});
  }
}

new vm.Script('globalThis.__LAFFHA_EXPORT__ = Array.isArray(QUESTIONS) ? QUESTIONS : [];').runInContext(ctx);
const bank = ctx.__LAFFHA_EXPORT__;

const clean = bank.map((q, i) => {
  const copy = JSON.parse(JSON.stringify(q));
  copy.questionID = String(copy.questionID || `generated-${i+1}`);
  return copy;
});

const byId = new Map();
for (const q of clean) byId.set(q.questionID, q);
const unique = [...byId.values()];

fs.mkdirSync('migration', { recursive: true });
fs.writeFileSync('migration/question-bank-export.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  sourceVersion: (html.match(/laffha-version" content="([^"]+)/)||[])[1] || null,
  total: unique.length,
  loadedScripts: loaded,
  skippedScripts: skipped,
  questions: unique,
}, null, 2));

console.log(`Exported ${unique.length} questions`);
if (skipped.length) console.log('Skipped scripts:', skipped);
