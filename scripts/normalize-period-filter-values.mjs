import fs from 'node:fs';

const path = 'src/components/FilterPanel.tsx';
let content = fs.readFileSync(path, 'utf8');
const replacements = [
  ["    () => Boolean(filtros.periodoInicio || filtros.periodoFim),", "    () => Boolean((filtros.periodoInicio ?? '') || (filtros.periodoFim ?? '')),"],
  ["  if (filtros.periodoInicio || filtros.periodoFim) filtrosAtivosCount += 1;", "  if ((filtros.periodoInicio ?? '') || (filtros.periodoFim ?? '')) filtrosAtivosCount += 1;"],
  ["                value={filtros.periodoCampo}", "                value={filtros.periodoCampo ?? 'limite2'}"],
  ["                value={filtros.periodoInicio}", "                value={filtros.periodoInicio ?? ''}"],
  ["                value={filtros.periodoFim}", "                value={filtros.periodoFim ?? ''}"],
];

for (const [source, replacement] of replacements) {
  if (!content.includes(source)) throw new Error(`Trecho não encontrado: ${source}`);
  content = content.replace(source, replacement);
}

fs.writeFileSync(path, content, 'utf8');
