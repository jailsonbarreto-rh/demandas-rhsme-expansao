import fs from 'node:fs';

const path = 'src/export/excelAnalytics.ts';
let content = fs.readFileSync(path, 'utf8');
const startMarker = '  if (filters.periodoInicio || filters.periodoFim) {';
const endMarker = '\n\n  const quickFilters: string[] = [];';
const start = content.indexOf(startMarker);
const endStart = content.indexOf(endMarker, start);

if (start >= 0 && endStart >= 0) {
  const replacement = `  if (filters.periodoInicio || filters.periodoFim) {
    const fieldLabels = {
      limite1: 'Prazo interno',
      limite2: 'Prazo final',
      historico: 'Movimentação do histórico',
    } as const;
    const displayDate = (value?: string) => value ? value.split('-').reverse().join('/') : 'sem limite';
    const field = filters.periodoCampo ?? 'limite2';
    const description = fieldLabels[field]
      + ': '
      + displayDate(filters.periodoInicio)
      + ' a '
      + displayDate(filters.periodoFim);
    result.push(['Período', description]);
  }`;
  content = content.slice(0, start) + replacement + content.slice(endStart);
  fs.writeFileSync(path, content, 'utf8');
}
