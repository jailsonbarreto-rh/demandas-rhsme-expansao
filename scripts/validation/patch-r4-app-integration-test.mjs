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
  ["import { resolveAppConfig } from './config/appConfig';\n", ''],
  [
    "import { createAppServices, type AppServices } from './services/createAppServices';",
    "import type { AppServices } from './services/createAppServices';",
  ],
  [
    "import { Header } from './components/Header';\nimport { CarteiraContextHeader } from './components/CarteiraContextHeader';\nimport { FilterPanel } from './components/FilterPanel';\nimport { AtencaoImediata } from './components/AtencaoImediata';\nimport { VisaoGeral } from './components/VisaoGeral';\n",
    '',
  ],
  [
    "const AuthPanel = lazy(() => import('./components/AuthPanel').then((module) => ({ default: module.AuthPanel })));",
    "const AuthPanel = lazy(() => import('./components/AuthPanel').then((module) => ({ default: module.AuthPanel })));\nconst Header = lazy(() => import('./components/Header').then((module) => ({ default: module.Header })));\nconst CarteiraContextHeader = lazy(() => import('./components/CarteiraContextHeader').then((module) => ({ default: module.CarteiraContextHeader })));\nconst FilterPanel = lazy(() => import('./components/FilterPanel').then((module) => ({ default: module.FilterPanel })));\nconst AtencaoImediata = lazy(() => import('./components/AtencaoImediata').then((module) => ({ default: module.AtencaoImediata })));\nconst VisaoGeral = lazy(() => import('./components/VisaoGeral').then((module) => ({ default: module.VisaoGeral })));",
  ],
  [
    "const AppContent: React.FC<AppProps> = ({ services }) => {",
    "const AppContent: React.FC<{ services: AppServices }> = ({ services }) => {",
  ],
  [
    "  const [appServices] = useState(() => services ?? createAppServices(resolveAppConfig(import.meta.env)));",
    "  const appServices = services;",
  ],
  [
    "export const App: React.FC<AppProps> = (props) => {\n  const inRouter = useInRouterContext();\n  const app = inRouter ? <AppContent {...props} /> : <BrowserRouter><AppContent {...props} /></BrowserRouter>;\n  return (\n    <>\n      {app}\n      <Toaster richColors position=\"top-right\" closeButton duration={4200} />\n    </>\n  );\n};",
    "export const App: React.FC<AppProps> = ({ services }) => {\n  const inRouter = useInRouterContext();\n  const [resolvedServices, setResolvedServices] = useState<AppServices | null>(() => services ?? null);\n  const [bootstrapError, setBootstrapError] = useState('');\n\n  useEffect(() => {\n    if (services) {\n      setResolvedServices(services);\n      setBootstrapError('');\n      return;\n    }\n\n    let active = true;\n    void Promise.all([\n      import('./config/appConfig'),\n      import('./services/createAppServices'),\n    ]).then(([configModule, servicesModule]) => {\n      if (!active) return;\n      const config = configModule.resolveAppConfig(import.meta.env);\n      setResolvedServices(servicesModule.createAppServices(config));\n    }).catch((reason: unknown) => {\n      if (!active) return;\n      setBootstrapError(reason instanceof Error ? reason.message : 'Não foi possível iniciar os serviços do sistema.');\n    });\n\n    return () => { active = false; };\n  }, [services]);\n\n  let content: React.ReactNode;\n  if (bootstrapError) {\n    content = (\n      <main className=\"app-container\">\n        <div className=\"alert-error-banner\" role=\"alert\">\n          <strong>Configuração indisponível:</strong> {bootstrapError}\n        </div>\n      </main>\n    );\n  } else if (!resolvedServices) {\n    content = <AuthSkeleton />;\n  } else {\n    content = <AppContent services={resolvedServices} />;\n  }\n\n  const app = inRouter ? content : <BrowserRouter>{content}</BrowserRouter>;\n  return (\n    <>\n      {app}\n      <Toaster richColors position=\"top-right\" closeButton duration={4200} />\n    </>\n  );\n};",
  ],
]);
