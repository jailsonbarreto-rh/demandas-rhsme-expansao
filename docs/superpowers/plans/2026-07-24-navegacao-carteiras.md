# Navegação entre Carteiras Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar `Demandas` e `Minhas demandas` em áreas de navegação distintas, com rota, aba, alternador e acesso visual permanente, sem tratar a carteira pessoal como filtro comum.

**Architecture:** `App.tsx` será a fonte de verdade da carteira ativa por rota (`/demandas` ou `/minhas-demandas`). O mesmo motor de filtros e tabela será reutilizado, recebendo `scope` derivado da rota. Um novo `CarteiraContextHeader` fará a alternância simétrica e o `Header` receberá um cartão compacto permanente para abrir a carteira pessoal.

**Tech Stack:** React 19, TypeScript 5.9, React Router, Vitest, Testing Library, Playwright, CSS editorial CTRH, GitHub Actions e Vercel.

## Global Constraints

- `/demandas` representa a carteira geral.
- `/minhas-demandas` representa a carteira pessoal.
- `/demandas?escopo=meu` redireciona para `/minhas-demandas`, preservando os demais parâmetros.
- A rota, e não um controle de filtro, define a carteira ativa.
- `Limpar filtros` nunca muda de rota ou carteira.
- A carteira pessoal usa exclusivamente o UUID do usuário autenticado.
- Demandas sem `responsavel_id`, inclusive `Vanessa Migrado`, não aparecem na carteira pessoal.
- O cartão `Minhas demandas` permanece na grade de indicadores e não exibe contagem.
- Nenhuma alteração no Supabase, schema, migrations, permissões ou regras de negócio adjacentes.
- Reutilizar o sistema editorial CTRH: paleta, tipografia, raios, sombras, densidade e foco acessível.

---

### Task 1: Modelar rotas de carteira e compatibilidade legada

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/filters/filterUrl.ts`
- Modify: `src/filters/filterUrl.test.ts`
- Modify: `tests/e2e/routing.spec.ts`

**Interfaces:**
- Produces: `ActiveTab = 'visao-geral' | 'demandas' | 'minhas-demandas' | 'admin'`.
- Produces: `navigateToWorkspace(scope: 'equipe' | 'meu'): void`.
- Produces: `serializeDemandFilters()` sem parâmetro `escopo`.
- Consumes: `parseDemandFilters()` para reconhecer URL legada.

- [ ] **Step 1: Escrever testes falhos de serialização e compatibilidade**

Em `src/filters/filterUrl.test.ts`, adicionar:

```ts
it('não serializa escopo porque a rota define a carteira', () => {
  const params = serializeDemandFilters({ ...DEFAULT_DEMAND_FILTERS, scope: 'meu' });
  expect(params.has('escopo')).toBe(false);
});

it('ainda reconhece escopo legado durante a leitura', () => {
  const filters = parseDemandFilters(new URLSearchParams('escopo=meu&status=todos'));
  expect(filters.scope).toBe('meu');
  expect(filters.status).toBe('todos');
});
```

Em `tests/e2e/routing.spec.ts`, adicionar um cenário que abre `/demandas?escopo=meu&status=todos` e espera `/minhas-demandas?status=todos`.

- [ ] **Step 2: Confirmar RED**

Run: `npm test -- src/filters/filterUrl.test.ts`
Expected: FAIL porque `serializeDemandFilters` ainda grava `escopo`.

- [ ] **Step 3: Remover `escopo` da serialização**

Em `src/filters/filterUrl.ts`, remover:

```ts
if (filters.scope !== 'equipe') params.set('escopo', filters.scope);
```

Preservar a leitura de `escopo` em `parseDemandFilters` exclusivamente para migração de URLs antigas.

- [ ] **Step 4: Implementar a rota própria em `App.tsx`**

Definir:

```ts
type ActiveTab = 'visao-geral' | 'demandas' | 'minhas-demandas' | 'admin';

const activeTab: ActiveTab = location.pathname.startsWith('/admin')
  ? 'admin'
  : location.pathname.startsWith('/minhas-demandas')
    ? 'minhas-demandas'
    : location.pathname.startsWith('/demandas')
      ? 'demandas'
      : 'visao-geral';

const isDemandWorkspace = activeTab === 'demandas' || activeTab === 'minhas-demandas';
const routeScope: DemandFilters['scope'] = activeTab === 'minhas-demandas' ? 'meu' : 'equipe';
```

Criar:

```ts
const navigateToWorkspace = (scope: DemandFilters['scope']) => {
  const nextFilters = { ...filtros, scope, responsibleId: 'todos' as const };
  setFiltros(nextFilters);
  navigate({
    pathname: scope === 'meu' ? '/minhas-demandas' : '/demandas',
    search: serializeDemandFilters(nextFilters).toString(),
  });
};
```

Adicionar efeito de compatibilidade:

```ts
useEffect(() => {
  if (location.pathname !== '/demandas' || searchParams.get('escopo') !== 'meu') return;
  const legacyParams = new URLSearchParams(searchParams);
  legacyParams.delete('escopo');
  navigate({ pathname: '/minhas-demandas', search: legacyParams.toString() }, { replace: true });
}, [location.pathname, navigate, searchParams]);
```

Adicionar efeito que reconcilia `filtros.scope` com `routeScope` quando `isDemandWorkspace`.

- [ ] **Step 5: Confirmar GREEN unitário**

Run: `npm test -- src/filters/filterUrl.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/filters/filterUrl.ts src/filters/filterUrl.test.ts tests/e2e/routing.spec.ts
git commit -m "feat: separar rotas das carteiras geral e pessoal"
```

---

### Task 2: Criar alternador explícito e aba permanente

**Files:**
- Create: `src/components/CarteiraContextHeader.tsx`
- Create: `src/components/CarteiraContextHeader.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/minhas-demandas.css`
- Modify: `src/responsive-modernization.css`

**Interfaces:**
- Produces: `CarteiraContextHeader({ mode, onSwitch })`.
- `mode`: `'geral' | 'pessoal'`.
- `onSwitch`: `() => void`.
- Consumes: `navigateToWorkspace()` da Task 1.

- [ ] **Step 1: Escrever teste falho do alternador**

Criar `src/components/CarteiraContextHeader.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CarteiraContextHeader } from './CarteiraContextHeader';

describe('CarteiraContextHeader', () => {
  it('apresenta a carteira geral e oferece a pessoal', async () => {
    const onSwitch = vi.fn();
    const user = userEvent.setup();
    render(<CarteiraContextHeader mode="geral" onSwitch={onSwitch} />);

    expect(screen.getByRole('heading', { name: 'Todas as demandas' })).toBeVisible();
    expect(screen.getByText('Consulte a carteira completa da equipe.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Ver minhas demandas' }));
    expect(onSwitch).toHaveBeenCalledOnce();
  });

  it('apresenta a carteira pessoal e oferece a geral', () => {
    render(<CarteiraContextHeader mode="pessoal" onSwitch={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Minhas demandas' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ver todas as demandas' })).toBeVisible();
  });
});
```

- [ ] **Step 2: Confirmar RED**

Run: `npm test -- src/components/CarteiraContextHeader.test.tsx`
Expected: FAIL porque o componente não existe.

- [ ] **Step 3: Implementar o componente**

Criar um `<section className="carteira-context-header">` com ícone, título, descrição e botão. Usar textos exatos da especificação.

- [ ] **Step 4: Adicionar a aba `Minhas demandas`**

Em `App.tsx`, inserir entre `Demandas` e `Administração`:

```tsx
<button
  type="button"
  className={`nav-tab-link ${activeTab === 'minhas-demandas' ? 'active' : ''}`}
  aria-current={activeTab === 'minhas-demandas' ? 'page' : undefined}
  onClick={() => navigateToWorkspace('meu')}
  title="Ver somente as demandas atribuídas a você"
>
  <i className="fa-solid fa-folder-user" aria-hidden="true" />
  <span>Minhas demandas</span>
</button>
```

Caso `fa-folder-user` não exista na versão instalada, usar `fa-folder-open`.

- [ ] **Step 5: Renderizar o mesmo workspace nas duas rotas**

Substituir a condição exclusiva `activeTab === 'demandas'` por `isDemandWorkspace`. Antes de `AtencaoImediata`, renderizar:

```tsx
<CarteiraContextHeader
  mode={activeTab === 'minhas-demandas' ? 'pessoal' : 'geral'}
  onSwitch={() => navigateToWorkspace(activeTab === 'minhas-demandas' ? 'equipe' : 'meu')}
/>
```

- [ ] **Step 6: Estilizar o cabeçalho de contexto**

Em `src/minhas-demandas.css`, criar estilos com fundo branco, friso azul, ícone discreto, ação primária e empilhamento mobile. Não usar gradiente.

- [ ] **Step 7: Confirmar GREEN**

Run: `npm test -- src/components/CarteiraContextHeader.test.tsx src/App.supabase.test.tsx`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/CarteiraContextHeader.tsx src/components/CarteiraContextHeader.test.tsx src/App.tsx src/minhas-demandas.css src/responsive-modernization.css
git commit -m "feat: adicionar navegação explícita entre carteiras"
```

---

### Task 3: Substituir o callout grande pelo cartão compacto permanente

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/InteractiveActions.test.tsx`
- Modify: `src/components/VisaoGeral.tsx`
- Delete: `src/components/MinhasDemandasCallout.tsx`
- Delete: `src/components/MinhasDemandasCallout.test.tsx`
- Modify: `src/minhas-demandas.css`

**Interfaces:**
- Extends `HeaderProps` com:
  - `personalWorkspaceActive: boolean`;
  - `onOpenMinhasDemandas: () => void`.
- Removes `VisaoGeralProps.onOpenMinhasDemandas`.

- [ ] **Step 1: Escrever teste falho do cartão no Header**

Em `src/components/InteractiveActions.test.tsx`, exigir:

```tsx
const onOpenMinhasDemandas = vi.fn();
// render Header com novas props
expect(screen.getByRole('button', { name: /minhas demandas.*acompanhe sua carteira/i })).toBeVisible();
await user.click(screen.getByRole('button', { name: /minhas demandas.*acompanhe sua carteira/i }));
expect(onOpenMinhasDemandas).toHaveBeenCalledOnce();
```

Adicionar teste de `aria-pressed="true"` ou classe `active` quando `personalWorkspaceActive` for verdadeiro.

- [ ] **Step 2: Confirmar RED**

Run: `npm test -- src/components/InteractiveActions.test.tsx`
Expected: FAIL porque `Header` ainda não possui o cartão.

- [ ] **Step 3: Implementar o quinto cartão**

Adicionar ao final de `.stats-grid`:

```tsx
<button
  type="button"
  className={`stat-card personal-workspace-card ${personalWorkspaceActive ? 'active' : ''}`}
  onClick={onOpenMinhasDemandas}
  aria-pressed={personalWorkspaceActive}
  aria-label="Minhas demandas. Acompanhe sua carteira de processos."
>
  <div className="personal-workspace-card-icon"><i className="fa-solid fa-folder-open" /></div>
  <div className="personal-workspace-card-copy">
    <h3>Minhas demandas</h3>
    <p>Acompanhe sua carteira de processos.</p>
  </div>
  <i className="fa-solid fa-arrow-right personal-workspace-card-arrow" aria-hidden="true" />
</button>
```

- [ ] **Step 4: Remover o callout grande**

Em `VisaoGeral.tsx`, remover import, prop e renderização de `MinhasDemandasCallout`. Excluir os dois arquivos do componente antigo.

- [ ] **Step 5: Aplicar design editorial compacto**

Em `src/minhas-demandas.css`:

- manter altura coerente com `.stat-card`;
- usar `background: rgba(47, 111, 165, 0.08)`;
- borda azul informacional;
- layout em linha com ícone, texto e seta;
- título sem caixa alta obrigatória;
- descrição em até duas linhas;
- estado ativo com fundo e borda mais fortes;
- em mobile, preservar área de toque mínima de 44 px.

- [ ] **Step 6: Confirmar GREEN**

Run: `npm test -- src/components/InteractiveActions.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/Header.tsx src/components/InteractiveActions.test.tsx src/components/VisaoGeral.tsx src/minhas-demandas.css
git rm src/components/MinhasDemandasCallout.tsx src/components/MinhasDemandasCallout.test.tsx
git commit -m "feat: integrar Minhas demandas à grade de indicadores"
```

---

### Task 4: Retirar o escopo da experiência de filtros

**Files:**
- Modify: `src/components/FilterPanel.tsx`
- Modify: `src/components/FilterPanel.scope.test.tsx`
- Modify: `src/App.supabase.test.tsx`
- Modify: `src/minhas-demandas.css`

**Interfaces:**
- `FilterPanel` deixa de renderizar `personal-scope-banner`.
- `handleLimparFiltros()` preserva o `scope` recebido da rota.

- [ ] **Step 1: Reescrever o teste do FilterPanel**

Substituir o teste existente por:

```tsx
it('limpa filtros sem alterar a carteira definida externamente', async () => {
  // iniciar com scope='meu' e query preenchida
  // clicar em Limpar filtros
  expect(screen.getByLabelText(/busca por texto/i)).toHaveValue('');
  expect(screen.queryByText('Minhas demandas')).not.toBeInTheDocument();
  expect(latestFilters.scope).toBe('meu');
});
```

Usar callback/harness para capturar o estado final.

- [ ] **Step 2: Confirmar RED**

Run: `npm test -- src/components/FilterPanel.scope.test.tsx`
Expected: FAIL porque o painel ainda mostra banner e redefine os defaults com `scope=equipe`.

- [ ] **Step 3: Ajustar `handleLimparFiltros`**

Implementar:

```ts
setFiltros((current) => ({ ...DEFAULT_DEMAND_FILTERS, scope: current.scope }));
```

Remover o banner e remover `scope` da contagem de filtros ativos.

- [ ] **Step 4: Atualizar integração do App**

Em `src/App.supabase.test.tsx`, cobrir:

1. `/minhas-demandas` mostra somente demanda do usuário;
2. `Ver todas as demandas` muda para `/demandas` e mostra as demais;
3. `Limpar filtros` dentro de `/minhas-demandas` mantém a rota pessoal;
4. `Vanessa Migrado` continua ausente da carteira pessoal.

- [ ] **Step 5: Remover CSS obsoleto**

Excluir `.personal-scope-banner`, `.personal-scope-label` e `.personal-scope-reset` de `src/minhas-demandas.css`.

- [ ] **Step 6: Confirmar GREEN**

Run: `npm test -- src/components/FilterPanel.scope.test.tsx src/App.supabase.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/FilterPanel.tsx src/components/FilterPanel.scope.test.tsx src/App.supabase.test.tsx src/minhas-demandas.css
git commit -m "fix: separar filtros do contexto de carteira"
```

---

### Task 5: Browser QA, documentação e publicação controlada

**Files:**
- Modify: `tests/e2e/personal-scope.spec.ts`
- Modify: `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`
- Modify: `docs/HANDOFF.md`
- Temporarily modify and restore: `vercel.json`

**Interfaces:**
- Verifies: desktop e mobile.
- Publishes: Preview e Production.

- [ ] **Step 1: Atualizar o teste Playwright**

O fluxo deve:

1. autenticar;
2. clicar no cartão do cabeçalho;
3. confirmar `/minhas-demandas`;
4. confirmar a aba ativa;
5. clicar `Ver todas as demandas`;
6. confirmar `/demandas`;
7. clicar na aba `Minhas demandas` novamente;
8. aplicar um filtro, limpar e confirmar que continua em `/minhas-demandas`;
9. executar no viewport desktop e mobile vigente do CI.

- [ ] **Step 2: Executar validação integral**

Run: `npm run lint`
Expected: exit 0.

Run: `npm run test:coverage`
Expected: todos os testes aprovados e gate de cobertura preservado.

Run: `npm run build`
Expected: exit 0.

Run: `npm run test:e2e`
Expected: todos os testes Playwright aprovados.

- [ ] **Step 3: Revisar escopo da diferença**

Run: `git diff --check main...HEAD`
Expected: nenhum erro.

Run: `git diff --name-only main...HEAD`
Expected: somente frontend, testes e documentação; nenhum arquivo `supabase/`.

- [ ] **Step 4: Atualizar governança**

Registrar que `Minhas demandas` deixou de ser uma visualização de filtro e passou a ser rota/aba própria, mantendo o vínculo UUID já implantado.

- [ ] **Step 5: Abrir PR e validar Preview**

PR title: `R3: separar navegação das carteiras geral e pessoal`.

Validar visualmente:

- quinto cartão na grade;
- contraste e estado ativo;
- quatro abas;
- cabeçalho de contexto;
- retorno simétrico;
- mobile sem compressão ou sobreposição.

- [ ] **Step 6: Publicar Production**

Habilitar `deploymentEnabled` somente na janela controlada, mesclar após CI verde, aguardar deployment `READY`, testar domínio oficial e restaurar `deploymentEnabled: false` em PR operacional separado.

- [ ] **Step 7: Solicitar homologação**

Parar após a publicação. Não iniciar outro ciclo automaticamente.
