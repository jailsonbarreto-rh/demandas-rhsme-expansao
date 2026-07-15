import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const BASELINE_INITIAL_JS_BYTES = 487_244;
const MAX_GROWTH_RATIO = 1.15;
const MAX_INITIAL_JS_BYTES = Math.floor(BASELINE_INITIAL_JS_BYTES * MAX_GROWTH_RATIO);
const assetsDirectory = resolve(process.cwd(), 'dist', 'assets');

const initialBundles = readdirSync(assetsDirectory)
  .filter((name) => /^index-.*\.js$/.test(name))
  .map((name) => ({ name, size: statSync(resolve(assetsDirectory, name)).size }));

if (initialBundles.length !== 1) {
  throw new Error(`Esperado um único bundle inicial index-*.js; encontrados ${initialBundles.length}.`);
}

const [{ name, size }] = initialBundles;
const growthPercent = ((size / BASELINE_INITIAL_JS_BYTES) - 1) * 100;
console.log(`Bundle inicial: ${name} — ${size} bytes (${growthPercent.toFixed(2)}% sobre a linha de base).`);
console.log(`Limite aprovado: ${MAX_INITIAL_JS_BYTES} bytes (+15%).`);

if (size > MAX_INITIAL_JS_BYTES) {
  throw new Error(`O bundle inicial excedeu o limite aprovado em ${size - MAX_INITIAL_JS_BYTES} bytes.`);
}
