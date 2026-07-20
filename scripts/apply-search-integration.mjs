import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, content) {
  fs.writeFileSync(path, content, 'utf8');
}

function replaceOnce(content, search, replacement, label) {
  const first = content.indexOf(search);
  if (first < 0) throw new Error(`Trecho não encontrado: ${label}`);
  if (content.indexOf(search, first + search.length) >= 0) {
    throw new Error(`Trecho duplicado: ${label}`);
  }
  return content.slice(0, first) + replacement + content.slice(first + search.length);
}

function replaceRange(content, startMarker, endMarker, replacement, label) {
  const start = content.indexOf(startMarker);
  const endStart = content.indexOf(endMarker, start);
  if (start < 0 || endStart < 0) throw new Error(`Intervalo não encontrado: ${label}`);
  const end = endStart + endMarker.length;
  return content.slice(0, start) + replacement + content.slice(end);
}

const appPath = 'src/App.tsx';
let app = read(appPath);

if (!app.includes("from './search/demandSearch'")) {
  app = replaceOnce(
    app,
    "import React, { lazy, Suspense, useEffect, useState } from 'react';",
    "import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';",
    'imports React',
  );

  app = replaceOnce(
    app,
    "import { getTodayString, isBeforeToday } from './utils/date';",
    `import { getTodayString, isBeforeToday } from './utils/date';
import { matchDemandSearch } from './search/demandSearch';
import { getPeriodValidationError, matchesPeriod, type PeriodField } from './search/periodFilter';
import { clearRecentSearches, loadRecentSearches, saveRecentSearch } from './search/recentSearches';
import type { DemandSearchMatch } from './search/searchTypes';`,
    'imports da busca',
  );

  app = replaceOnce(
    app,
    `    status: searchParams.get('status') ?? 'Somente ativos (padrão)',
    setor: searchParams.get('setor') ?? 'Todos',
  }));`,
    `    status: searchParams.get('status') ?? 'Somente ativos (padrão)',
    setor: searchParams.get('setor') ?? 'Todos',
    periodoCampo: (searchParams.get('periodoCampo') as PeriodField | null) ?? 'limite2',
    periodoInicio: searchParams.get('periodoInicio') ?? '',
    periodoFim: searchParams.get('periodoFim') ?? '',
  }));`,
    'estado inicial dos filtros',
  );

  app = replaceOnce(
    app,
    `  const setDrawerAberto = (open: boolean) => {
    if (!open) navigate({ pathname: '/demandas', search: searchParams.toString() });
  };
`,
    `  const setDrawerAberto = (open: boolean) => {
    if (!open) navigate({ pathname: '/demandas', search: searchParams.toString() });
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState(() => loadRecentSearches());

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      navigate({ pathname: '/demandas', search: searchParams.toString() });
      window.setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 0);
    };

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [navigate, searchParams]);
`,
    'atalho global da busca',
  );

  app = replaceOnce(
    app,
    `    if (filtros.setor !== 'Todos') next.set('setor', filtros.setor);
    if (quickFilters.assinatura) next.set('assinatura', '1');`,
    `    if (filtros.setor !== 'Todos') next.set('setor', filtros.setor);
    if (filtros.periodoCampo !== 'limite2') next.set('periodoCampo', filtros.periodoCampo);
    if (filtros.periodoInicio) next.set('periodoInicio', filtros.periodoInicio);
    if (filtros.periodoFim) next.set('periodoFim', filtros.periodoFim);
    if (quickFilters.assinatura) next.set('assinatura', '1');`,
    'parâmetros de período na URL',
  );

  app = replaceOnce(
    app,
    `      status: 'Somente ativos (padrão)',
      setor: 'Todos'
    });`,
    `      status: 'Somente ativos (padrão)',
      setor: 'Todos',
      periodoCampo: 'limite2',
      periodoInicio: '',
      periodoFim: '',
    });`,
    'limpeza dos filtros no logout',
  );

  const filterBlock = `  // --- Utilitários de Filtros ---

  const handleCommitSearch = (query: string) => {
    setRecentSearches(saveRecentSearch(query));
  };

  const handleClearRecentSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const periodError = getPeriodValidationError({
    field: filtros.periodoCampo,
    start: filtros.periodoInicio,
    end: filtros.periodoFim,
  });

  const searchState = useMemo(() => {
    const todayStr = getTodayString();
    const matches = new Map<number, DemandSearchMatch>();
    const filtered = demandas.filter((demanda) => {
      const algumQuickAtivo = quickFilters.assinatura || quickFilters.hoje || quickFilters.vencido;
      if (algumQuickAtivo) {
        const matchQuick = (
          (quickFilters.assinatura && demanda.status === 'Para Assinatura')
          || (quickFilters.hoje && demanda.status !== 'Encerrado' && demanda.limite2 === todayStr)
          || (quickFilters.vencido && demanda.status !== 'Encerrado' && Boolean(demanda.limite2) && isBeforeToday(demanda.limite2))
        );
        if (!matchQuick) return false;
      }

      const searchMatch = matchDemandSearch(demanda, historico, filtros.busca);
      if (!searchMatch.matches) return false;

      if (!matchesPeriod(demanda, historico, {
        field: filtros.periodoCampo,
        start: filtros.periodoInicio,
        end: filtros.periodoFim,
      })) return false;

      if (filtros.tipo !== 'Todos' && demanda.tipo !== filtros.tipo) return false;
      if (filtros.classificacao !== 'Todas' && demanda.classificacao !== filtros.classificacao) return false;
      if (filtros.status === 'Somente ativos (padrão)') {
        if (demanda.status === 'Encerrado') return false;
      } else if (filtros.status !== 'Todos (exibir tudo)' && demanda.status !== filtros.status) {
        return false;
      }
      if (filtros.setor !== 'Todos' && demanda.setor !== filtros.setor) return false;

      matches.set(demanda.id, searchMatch);
      return true;
    });

    return { demandas: filtered, matches };
  }, [demandas, filtros, historico, quickFilters]);

  const demandasFiltradas = searchState.demandas;
  const searchMatches = searchState.matches;`;

  app = replaceRange(
    app,
    '  // --- Utilitários de Filtros ---',
    '  const demandasFiltradas = getDemandasFiltradas();',
    filterBlock,
    'bloco principal de filtragem',
  );

  app = replaceOnce(
    app,
    `                totalExibidos={demandasFiltradas.length}
                totalGeral={demandas.length}
              />`,
    `                totalExibidos={demandasFiltradas.length}
                totalGeral={demandas.length}
                searchInputRef={searchInputRef}
                recentSearches={recentSearches}
                onCommitSearch={handleCommitSearch}
                onClearRecentSearches={handleClearRecentSearches}
                periodError={periodError}
              />`,
    'propriedades do painel de filtros',
  );

  app = replaceOnce(
    app,
    `                demandas={demandasFiltradas}
                canEdit={canEdit}`, 
    `                demandas={demandasFiltradas}
                searchQuery={filtros.busca}
                searchMatches={searchMatches}
                canEdit={canEdit}`,
    'propriedades da tabela',
  );

  write(appPath, app);
}

const analyticsPath = 'src/export/excelAnalytics.ts';
let analytics = read(analyticsPath);
if (!analytics.includes('periodoInicio?: string;')) {
  analytics = replaceOnce(
    analytics,
    `  setor: string;
  quickFilters: {`,
    `  setor: string;
  periodoCampo?: 'limite1' | 'limite2' | 'historico';
  periodoInicio?: string;
  periodoFim?: string;
  quickFilters: {`,
    'tipo de filtros do Excel',
  );

  analytics = replaceOnce(
    analytics,
    `  if (filters.setor !== 'Todos') result.push(['Setor', filters.setor]);

  const quickFilters: string[] = [];`,
    `  if (filters.setor !== 'Todos') result.push(['Setor', filters.setor]);
  if (filters.periodoInicio || filters.periodoFim) {
    const fieldLabels = {
      limite1: 'Prazo interno',
      limite2: 'Prazo final',
      historico: 'Movimentação do histórico',
    } as const;
    const displayDate = (value?: string) => value ? value.split('-').reverse().join('/') : 'sem limite';
    const field = filters.periodoCampo ?? 'limite2';
    result.push([
      'Período',
      \`${'${fieldLabels[field]}'}: ${'${displayDate(filters.periodoInicio)'} } a ${'${displayDate(filters.periodoFim)'} }\`.replace(/\s+}/g, '}'),
    ]);
  }

  const quickFilters: string[] = [];`,
    'descrição do período no Excel',
  );

  // Corrige a construção textual acima sem depender de template aninhado no transformador.
  analytics = analytics.replace(
    "`${fieldLabels[field]}: ${displayDate(filters.periodoInicio) } a ${displayDate(filters.periodoFim) }`.replace(/\\s+}/g, '}')",
    "`${fieldLabels[field]}: ${displayDate(filters.periodoInicio)} a ${displayDate(filters.periodoFim)}`",
  );
  write(analyticsPath, analytics);
}

const cssPath = 'src/index.css';
let css = read(cssPath);
if (!css.includes('.recent-searches-panel')) {
  css = css.replace('max-height: 250px; /* Suficiente para uma linha de filtros */', 'max-height: 520px;');
  css += `

/* Busca avançada e encontrabilidade */
.advanced-search-wrapper { position: relative; }
.search-label-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.search-shortcut { border: 1px solid var(--border-color); border-bottom-width: 2px; border-radius: 5px; background: #f8fafc; color: var(--text-muted); font: inherit; font-size: 0.65rem; font-weight: 650; padding: 2px 7px; }
.search-help-text { display: block; margin-top: 6px; color: var(--text-muted); font-size: 0.719rem; line-height: 1.35; }
.recent-searches-panel { position: absolute; z-index: 900; top: calc(100% - 3px); left: 0; right: 0; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: #fff; box-shadow: var(--shadow-lg); padding: 10px; }
.recent-searches-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 4px 6px 8px; color: var(--primary-color); font-size: 0.75rem; }
.recent-searches-clear { border: 0; background: transparent; color: var(--text-muted); cursor: pointer; font: inherit; font-size: 0.688rem; font-weight: 600; }
.recent-searches-clear:hover, .recent-searches-clear:focus-visible { color: var(--primary-color); text-decoration: underline; }
.recent-searches-list { display: flex; flex-direction: column; gap: 3px; }
.recent-search-item { display: flex; align-items: center; gap: 9px; width: 100%; border: 0; border-radius: 6px; background: transparent; color: var(--text-main); cursor: pointer; font: inherit; font-size: 0.813rem; padding: 9px 10px; text-align: left; }
.recent-search-item:hover, .recent-search-item:focus-visible { background: var(--border-light); outline: 2px solid transparent; }
.recent-search-item i { color: var(--text-muted); font-size: 0.75rem; }
.period-filter-error { margin-top: 10px; border-left: 3px solid #b91c1c; background: #fef2f2; color: #991b1b; border-radius: 4px; padding: 9px 12px; font-size: 0.75rem; font-weight: 600; }
.search-highlight { border-radius: 3px; background: #fff1a8; color: inherit; box-shadow: inset 0 -1px 0 rgba(146, 64, 14, 0.25); padding: 0 1px; }
.assunto-search-cell { display: flex; flex-direction: column; gap: 8px; }
.search-match-context { display: flex; flex-direction: column; gap: 6px; padding-top: 7px; border-top: 1px dashed var(--border-light); }
.search-match-summary { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.search-match-label { color: var(--text-muted); font-size: 0.688rem; font-weight: 600; }
.search-match-fields { display: inline-flex; flex-wrap: wrap; gap: 4px; }
.search-match-chip { border: 1px solid #cbd5e1; border-radius: 999px; background: #f8fafc; color: var(--primary-color); font-size: 0.625rem; font-weight: 650; padding: 1px 6px; }
.search-match-chip.history-match { border-color: rgba(47, 111, 165, 0.35); background: rgba(47, 111, 165, 0.07); color: var(--accent-hover); }
.search-history-snippet { display: flex; align-items: flex-start; gap: 6px; color: var(--text-muted); font-size: 0.719rem; line-height: 1.4; }
.search-history-snippet i { margin-top: 2px; color: var(--accent-color); }

@media (max-width: 640px) {
  .search-shortcut { display: none; }
  .recent-searches-panel { position: static; margin-top: 6px; }
  .more-filters-panel.open { max-height: 760px; }
}
`;
  write(cssPath, css);
}

const reportPath = 'docs/RELATORIO_ESTADO_ATUAL.md';
let report = read(reportPath);
if (!report.includes('## Busca avançada e encontrabilidade')) {
  report += `

## Busca avançada e encontrabilidade

A área Demandas possui busca multi-termo sobre número, tipo, assunto, responsável, setor, classificação, status e histórico. A comparação é tolerante a acentos, caixa e pontuação de números. Resultados indicam os campos correspondentes, mostram contexto do histórico e destacam os termos visíveis. O sistema mantém até cinco buscas recentes por navegador, oferece o atalho Ctrl/Command+K e filtra prazo interno, prazo final ou movimentações por período preservado na URL.
`;
  write(reportPath, report);
}

console.log('Integração da busca avançada aplicada com sucesso.');
