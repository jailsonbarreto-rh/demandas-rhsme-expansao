import { readFile, writeFile } from 'node:fs/promises';

async function replaceAllChecked(path, replacements) {
  let source = await readFile(path, 'utf8');
  for (const [before, after] of replacements) {
    if (!source.includes(before)) {
      throw new Error(`Trecho esperado não encontrado em ${path}: ${before}`);
    }
    source = source.replaceAll(before, after);
  }
  await writeFile(path, source);
}

await replaceAllChecked('src/App.supabase.test.tsx', [
  [
    "    await user.selectOptions(screen.getByLabelText('Responsável'), officialResponsible.id);\n    await user.selectOptions(screen.getByLabelText('Status'), 'Aguardando Andamento');",
    "    await user.selectOptions(screen.getByLabelText('Responsável'), officialResponsible.id);\n    await user.type(screen.getByLabelText('Data de prazo interno'), '15082026');\n    await user.click(screen.getByRole('radio', { name: 'Não se aplica' }));\n    await user.selectOptions(screen.getByLabelText('Status'), 'Aguardando Andamento');",
  ],
  ["screen.getByLabelText('Próxima ação')", "screen.getByLabelText('Próxima providência')"],
  ["screen.getByLabelText('Data de acompanhamento')", "screen.getByLabelText('Data da próxima providência')"],
  ["'Filtrar por demandas com prazo hoje'", "'Filtrar por demandas cujo prazo final vence hoje'"],
  ["'Filtrar por demandas vencidas'", "'Filtrar por demandas com prazo final vencido'"],
  [
    "    expect(window.location.pathname).toBe('/minhas-demandas');\n    expect(screen.getByRole('heading', { name: 'Minhas demandas' })).toBeVisible();\n    expect(await screen.findByText('Demanda do usuário conectado')).toBeVisible();\n    expect(screen.queryByText('Demanda de outro usuário')).not.toBeInTheDocument();",
    "    await waitFor(() => {\n      expect(window.location.pathname).toBe('/minhas-demandas');\n      expect(screen.getByRole('heading', { name: 'Minhas demandas' })).toBeVisible();\n      expect(screen.getByText('Demanda do usuário conectado')).toBeVisible();\n      expect(screen.queryByText('Demanda de outro usuário')).not.toBeInTheDocument();\n    });",
  ],
]);

await replaceAllChecked('src/App.tsx', [
  [
    "import { Header } from './components/Header';\nimport { CarteiraContextHeader } from './components/CarteiraContextHeader';\nimport { FilterPanel } from './components/FilterPanel';\nimport { AtencaoImediata } from './components/AtencaoImediata';\nimport { VisaoGeral } from './components/VisaoGeral';\n",
    '',
  ],
  [
    "const AuthPanel = lazy(() => import('./components/AuthPanel').then((module) => ({ default: module.AuthPanel })));",
    "const AuthPanel = lazy(() => import('./components/AuthPanel').then((module) => ({ default: module.AuthPanel })));\nconst Header = lazy(() => import('./components/Header').then((module) => ({ default: module.Header })));\nconst CarteiraContextHeader = lazy(() => import('./components/CarteiraContextHeader').then((module) => ({ default: module.CarteiraContextHeader })));\nconst FilterPanel = lazy(() => import('./components/FilterPanel').then((module) => ({ default: module.FilterPanel })));\nconst AtencaoImediata = lazy(() => import('./components/AtencaoImediata').then((module) => ({ default: module.AtencaoImediata })));\nconst VisaoGeral = lazy(() => import('./components/VisaoGeral').then((module) => ({ default: module.VisaoGeral })));",
  ],
]);
