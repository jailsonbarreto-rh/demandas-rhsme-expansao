import fs from 'node:fs';

function replaceOnce(content, source, replacement, label) {
  const index = content.indexOf(source);
  if (index < 0) throw new Error(`Trecho não encontrado: ${label}`);
  if (content.indexOf(source, index + source.length) >= 0) throw new Error(`Trecho duplicado: ${label}`);
  return content.slice(0, index) + replacement + content.slice(index + source.length);
}

const tablePath = 'src/components/DemandasTable.tsx';
let table = fs.readFileSync(tablePath, 'utf8');
table = replaceOnce(
  table,
  `  searchQuery?: string;\n  searchMatches?: Map<number, DemandSearchMatch>;\n}`,
  `  searchQuery?: string;\n  searchMatches?: Map<number, DemandSearchMatch>;\n  searchResultMode?: 'exact' | 'approximate' | 'empty';\n}`,
  'contrato da tabela',
);
table = replaceOnce(
  table,
  `      {match.historySnippet && (\n        <div className="search-history-snippet">\n          <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />\n          <span><strong>Histórico:</strong> <HighlightedText text={match.historySnippet} query={query} /></span>\n        </div>\n      )}`,
  `      {match.matchKind === 'approximate' && (\n        <div className="approximate-match-details">\n          <span className="approximate-match-ratio">{match.matchedTermCount} de {match.totalTermCount} termos</span>\n          <span className="approximate-missing-terms">\n            <strong>{(match.missingTerms?.length ?? 0) > 1 ? 'Termos ausentes:' : 'Termo ausente:'}</strong>{' '}\n            {match.missingTerms?.join(', ')}\n          </span>\n        </div>\n      )}\n      {match.historySnippet && (\n        <div className="search-history-snippet">\n          <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />\n          <span><strong>Histórico:</strong> <HighlightedText text={match.historySnippet} query={query} /></span>\n        </div>\n      )}`,
  'detalhes da correspondência',
);
table = replaceOnce(
  table,
  `  searchQuery = '',\n  searchMatches = new Map<number, DemandSearchMatch>(),\n}) => {`,
  `  searchQuery = '',\n  searchMatches = new Map<number, DemandSearchMatch>(),\n  searchResultMode = 'exact',\n}) => {`,
  'propriedade do modo de resultado',
);
table = replaceOnce(
  table,
  `  const total = table.getRowCount();\n  const start = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;\n  const end = Math.min(total, start + pagination.pageSize - 1);`,
  `  const total = table.getRowCount();\n  const start = total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;\n  const end = Math.min(total, start + pagination.pageSize - 1);\n  const approximateTermCount = searchMatches.values().next().value?.totalTermCount ?? 0;`,
  'contagem de termos aproximados',
);
table = replaceOnce(
  table,
  `      <div className="table-card">\n        <div className="table-responsive" role="region" aria-label="Tabela de demandas" tabIndex={0}>`,
  `      <div className={\`table-card \${searchResultMode === 'approximate' ? 'approximate-results-card' : ''}\`}>\n        {searchResultMode === 'approximate' && (\n          <div className="approximate-search-notice" role="status">\n            <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />\n            <div>\n              <strong>Nenhuma demanda contém todos os {approximateTermCount} termos pesquisados.</strong>\n              <span>Exibindo resultados próximos, ordenados pela quantidade e relevância das correspondências.</span>\n            </div>\n          </div>\n        )}\n        <div className="table-responsive" role="region" aria-label={searchResultMode === 'approximate' ? 'Tabela de resultados próximos' : 'Tabela de demandas'} tabIndex={0}>`,
  'aviso de resultados próximos',
);
table = replaceOnce(
  table,
  `                    <strong>Nenhuma demanda encontrada</strong>\n                    <span>Revise os filtros ou faça uma nova busca.</span>`,
  `                    <strong>{searchResultMode === 'empty' ? 'Nenhum resultado exato ou próximo encontrado' : 'Nenhuma demanda encontrada'}</strong>\n                    <span>{searchResultMode === 'empty' ? 'Tente corrigir algum termo ou reduzir a quantidade de palavras pesquisadas.' : 'Revise os filtros ou faça uma nova busca.'}</span>`,
  'estado vazio',
);
table = replaceOnce(
  table,
  `<div className="pagination-summary">{start}–{end} de {total} resultados</div>`,
  `<div className="pagination-summary">{start}–{end} de {total} {searchResultMode === 'approximate' ? 'sugestões' : 'resultados'}</div>`,
  'resumo da paginação',
);
fs.writeFileSync(tablePath, table, 'utf8');

const appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');
app = replaceOnce(
  app,
  `import { matchDemandSearch } from './search/demandSearch';`,
  `import { matchDemandSearch } from './search/demandSearch';\nimport { rankApproximateDemandSearch } from './search/approximateSearch';`,
  'importação do ranqueamento aproximado',
);
const oldSearchState = `  const searchState = useMemo(() => {\n    const todayStr = getTodayString();\n    const matches = new Map<number, DemandSearchMatch>();\n    const filtered = demandas.filter((demanda) => {\n      const algumQuickAtivo = quickFilters.assinatura || quickFilters.hoje || quickFilters.vencido;\n      if (algumQuickAtivo) {\n        const matchQuick = (\n          (quickFilters.assinatura && demanda.status === 'Para Assinatura')\n          || (quickFilters.hoje && demanda.status !== 'Encerrado' && demanda.limite2 === todayStr)\n          || (quickFilters.vencido && demanda.status !== 'Encerrado' && Boolean(demanda.limite2) && isBeforeToday(demanda.limite2))\n        );\n        if (!matchQuick) return false;\n      }\n\n      const searchMatch = matchDemandSearch(demanda, historico, filtros.busca);\n      if (!searchMatch.matches) return false;\n\n      if (!matchesPeriod(demanda, historico, {\n        field: filtros.periodoCampo,\n        start: filtros.periodoInicio,\n        end: filtros.periodoFim,\n      })) return false;\n\n      if (filtros.tipo !== 'Todos' && demanda.tipo !== filtros.tipo) return false;\n      if (filtros.classificacao !== 'Todas' && demanda.classificacao !== filtros.classificacao) return false;\n      if (filtros.status === 'Somente ativos (padrão)') {\n        if (demanda.status === 'Encerrado') return false;\n      } else if (filtros.status !== 'Todos (exibir tudo)' && demanda.status !== filtros.status) {\n        return false;\n      }\n      if (filtros.setor !== 'Todos' && demanda.setor !== filtros.setor) return false;\n\n      matches.set(demanda.id, searchMatch);\n      return true;\n    });\n\n    return { demandas: filtered, matches };\n  }, [demandas, filtros, historico, quickFilters]);\n\n  const demandasFiltradas = searchState.demandas;\n  const searchMatches = searchState.matches;`;
const newSearchState = `  const searchState = useMemo(() => {\n    const todayStr = getTodayString();\n    const baseCandidates = demandas.filter((demanda) => {\n      const algumQuickAtivo = quickFilters.assinatura || quickFilters.hoje || quickFilters.vencido;\n      if (algumQuickAtivo) {\n        const matchQuick = (\n          (quickFilters.assinatura && demanda.status === 'Para Assinatura')\n          || (quickFilters.hoje && demanda.status !== 'Encerrado' && demanda.limite2 === todayStr)\n          || (quickFilters.vencido && demanda.status !== 'Encerrado' && Boolean(demanda.limite2) && isBeforeToday(demanda.limite2))\n        );\n        if (!matchQuick) return false;\n      }\n\n      if (!matchesPeriod(demanda, historico, {\n        field: filtros.periodoCampo,\n        start: filtros.periodoInicio,\n        end: filtros.periodoFim,\n      })) return false;\n\n      if (filtros.tipo !== 'Todos' && demanda.tipo !== filtros.tipo) return false;\n      if (filtros.classificacao !== 'Todas' && demanda.classificacao !== filtros.classificacao) return false;\n      if (filtros.status === 'Somente ativos (padrão)') {\n        if (demanda.status === 'Encerrado') return false;\n      } else if (filtros.status !== 'Todos (exibir tudo)' && demanda.status !== filtros.status) {\n        return false;\n      }\n      if (filtros.setor !== 'Todos' && demanda.setor !== filtros.setor) return false;\n      return true;\n    });\n\n    const exactMatches = new Map<number, DemandSearchMatch>();\n    const exactDemandas = baseCandidates.filter((demanda) => {\n      const match = matchDemandSearch(demanda, historico, filtros.busca);\n      if (!match.matches) return false;\n      exactMatches.set(demanda.id, { ...match, matchKind: 'exact' });\n      return true;\n    });\n\n    if (exactDemandas.length > 0 || !filtros.busca.trim()) {\n      return { demandas: exactDemandas, matches: exactMatches, mode: 'exact' as const };\n    }\n\n    const approximateResults = rankApproximateDemandSearch(baseCandidates, historico, filtros.busca);\n    if (approximateResults.length > 0) {\n      return {\n        demandas: approximateResults.map((result) => result.demanda),\n        matches: new Map(approximateResults.map((result) => [result.demanda.id, result.match])),\n        mode: 'approximate' as const,\n      };\n    }\n\n    return { demandas: [], matches: new Map<number, DemandSearchMatch>(), mode: 'empty' as const };\n  }, [demandas, filtros, historico, quickFilters]);\n\n  const demandasFiltradas = searchState.demandas;\n  const searchMatches = searchState.matches;\n  const searchResultMode = searchState.mode;`;
app = replaceOnce(app, oldSearchState, newSearchState, 'estado central da busca');
app = replaceOnce(
  app,
  `  const handleExportExcel = async () => {\n    if (demandasFiltradas.length === 0) {`,
  `  const handleExportExcel = async () => {\n    if (searchResultMode === 'approximate') {\n      toast.info('Os resultados próximos são sugestões. Ajuste a pesquisa antes de exportar como resultado exato.');\n      return;\n    }\n\n    if (demandasFiltradas.length === 0) {`,
  'proteção da exportação',
);
app = replaceOnce(
  app,
  `                searchMatches={searchMatches}\n                canEdit={canEdit}`,
  `                searchMatches={searchMatches}\n                searchResultMode={searchResultMode}\n                canEdit={canEdit}`,
  'modo passado à tabela',
);
fs.writeFileSync(appPath, app, 'utf8');

const cssPath = 'src/index.css';
let css = fs.readFileSync(cssPath, 'utf8');
const styles = `\n\n/* Resultados próximos da busca avançada */\n.approximate-results-card { border-color: #c7d2fe; }\n.approximate-search-notice { display: flex; align-items: flex-start; gap: 12px; padding: 16px 18px; border-bottom: 1px solid #c7d2fe; background: #eef2ff; color: #312e81; }\n.approximate-search-notice > i { margin-top: 2px; font-size: 1.05rem; }\n.approximate-search-notice > div { display: flex; flex-direction: column; gap: 4px; }\n.approximate-search-notice span { color: #4338ca; font-size: 0.84rem; }\n.approximate-match-details { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 7px; }\n.approximate-match-ratio { display: inline-flex; align-items: center; min-height: 24px; padding: 3px 8px; border-radius: 999px; background: #e0e7ff; color: #3730a3; font-size: 0.75rem; font-weight: 700; }\n.approximate-missing-terms { color: #6b21a8; font-size: 0.78rem; }\n@media (max-width: 720px) {\n  .approximate-search-notice { padding: 14px; }\n  .approximate-match-details { align-items: flex-start; flex-direction: column; gap: 5px; }\n}\n`;
if (!css.includes('/* Resultados próximos da busca avançada */')) css += styles;
fs.writeFileSync(cssPath, css, 'utf8');
