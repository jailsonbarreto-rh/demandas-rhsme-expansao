import fs from 'node:fs';

const path = 'src/index.css';
let content = fs.readFileSync(path, 'utf8');
const source = ".recent-searches-panel { position: absolute; z-index: 900; top: calc(100% - 3px); left: 0; right: 0; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: #fff; box-shadow: var(--shadow-lg); padding: 10px; }";
const replacement = ".recent-searches-panel { position: relative; z-index: 2; margin-top: 8px; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: #fff; box-shadow: var(--shadow-md); padding: 10px; }";
if (!content.includes(source)) throw new Error('Regra do painel de buscas recentes não encontrada.');
content = content.replace(source, replacement);
content = content.replace("  .recent-searches-panel { position: static; margin-top: 6px; }\n", "  .recent-searches-panel { margin-top: 6px; }\n");
fs.writeFileSync(path, content, 'utf8');
