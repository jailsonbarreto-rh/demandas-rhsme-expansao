# Minhas Demandas no Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um acesso visual destacado na primeira tela para abrir a carteira pessoal do usuário autenticado e tornar o escopo pessoal claramente reversível na listagem existente.

**Architecture:** Um componente apresentacional isolado será inserido na `VisaoGeral` logo depois de `Atenção agora`. O `App` continuará sendo a autoridade de navegação e filtros: ao receber a ação do componente, aplica `scope: 'meu'`, limpa eventual filtro nominal conflitante e navega para `/demandas` com estado serializado na URL. O `FilterPanel` exibirá uma faixa compacta apenas quando o escopo pessoal estiver ativo, permitindo retornar à carteira da equipe.

**Tech Stack:** React 19, TypeScript 5.9, React Router, Vitest, Testing Library, CSS editorial existente, GitHub Actions e Vercel.

## Global Constraints

- Textos exatos: `Minhas demandas`, `Acompanhe sua carteira de processos.` e `Acessar minha carteira`.
- O bloco fica imediatamente abaixo de `Atenção agora` e antes dos indicadores gerais.
- Não exibir contadores, listas, indicadores, explicações adicionais ou uma segunda tela.
- A filtragem pessoal usa exclusivamente o UUID do usuário autenticado e `DemandFilters.scope = 'meu'`.
- Demandas sem `responsavel_id`, incluindo `Vanessa Migrado`, não pertencem à carteira pessoal de ninguém.
- Preservar permissões, papéis, status, regras de criação/edição/exclusão, prazos, alertas, classificações e demais dashboards.
- Aplicar o referencial editorial: conteúdo antes da forma, função antes da repetição, densidade controlada, economia visual, hierarquia explícita, contraste acessível e coerência interna.
- Reutilizar paleta, tipografia, raios, sombras e transições já definidos no design system CTRH; não criar linguagem gráfica paralela.
- O botão precisa ser semântico, acessível por teclado e com foco visível.
- Não alterar Supabase, schema, migrations ou dados nesta entrega.

---

### Task 1: Componente visual isolado e integração na Visão geral

**Files:**
- Create: `src/components/MinhasDemandasCallout.tsx`
- Create: `src/components/MinhasDemandasCallout.test.tsx`
- Modify: `src/components/VisaoGeral.tsx`
- Modify: `src/index.css`
- Modify: `src/responsive-modernization.css`

**Interfaces:**
- Produces: `MinhasDemandasCallout({ onOpen }: { onOpen: () => void })`.
- Extends: `VisaoGeralProps.onOpenMinhasDemandas: () => void`.
- Consumes: CSS variables canônicas de `src/index.css`.

- [ ] **Step 1: Escrever o teste falho do componente**

Criar `src/components/MinhasDemandasCallout.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MinhasDemandasCallout } from './MinhasDemandasCallout';

describe('MinhasDemandasCallout', () => {
  it('apresenta somente a mensagem aprovada e executa a ação principal', async () => {
    const onOpen = vi.fn();
    render(<MinhasDemandasCallout onOpen={onOpen} />);

    expect(screen.getByRole('heading', { name: 'Minhas demandas' })).toBeVisible();
    expect(screen.getByText('Acompanhe sua carteira de processos.')).toBeVisible();
    expect(screen.queryByText(/atribuídas|vencidas|para hoje|assinatura/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Acessar minha carteira' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Confirmar RED**

Run: `npm test -- src/components/MinhasDemandasCallout.test.tsx`
Expected: FAIL porque `MinhasDemandasCallout.tsx` ainda não existe.

- [ ] **Step 3: Implementar o componente mínimo**

Criar `src/components/MinhasDemandasCallout.tsx`:

```tsx
import React from 'react';

interface MinhasDemandasCalloutProps {
  onOpen: () => void;
}

export const MinhasDemandasCallout: React.FC<MinhasDemandasCalloutProps> = ({ onOpen }) => (
  <section className="minhas-demandas-callout" aria-labelledby="minhas-demandas-title">
    <div className="minhas-demandas-callout-icon" aria-hidden="true">
      <i className="fa-solid fa-folder-open" />
    </div>
    <div className="minhas-demandas-callout-copy">
      <h2 id="minhas-demandas-title">Minhas demandas</h2>
      <p>Acompanhe sua carteira de processos.</p>
    </div>
    <button type="button" className="btn btn-primary minhas-demandas-callout-action" onClick={onOpen}>
      <span>Acessar minha carteira</span>
      <i className="fa-solid fa-arrow-right" aria-hidden="true" />
    </button>
  </section>
);
```

- [ ] **Step 4: Integrar na posição aprovada**

Em `src/components/VisaoGeral.tsx`, importar o componente, adicionar `onOpenMinhasDemandas` às props e renderizar:

```tsx
{renderAtencaoImediata()}
<MinhasDemandasCallout onOpen={onOpenMinhasDemandas} />
<div className="dashboard-row">
```

- [ ] **Step 5: Aplicar o sistema editorial no CSS**

Adicionar a `src/index.css` uma composição sem gradiente, sem brilho e sem informação decorativa redundante:

```css
.minhas-demandas-callout {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 28px 30px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--accent-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.minhas-demandas-callout-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: rgba(47, 111, 165, 0.1);
  color: var(--accent-color);
  font-size: 1.25rem;
}

.minhas-demandas-callout-copy h2 {
  font-size: 1.25rem;
  line-height: 1.2;
}

.minhas-demandas-callout-copy p {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.minhas-demandas-callout-action {
  min-height: 44px;
  padding-inline: 20px;
  white-space: nowrap;
}
```

Adicionar a `src/responsive-modernization.css` dentro de `@media (max-width: 640px)`:

```css
.minhas-demandas-callout {
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  padding: 22px 18px;
}

.minhas-demandas-callout-action {
  grid-column: 1 / -1;
  width: 100%;
}
```

- [ ] **Step 6: Confirmar GREEN do componente**

Run: `npm test -- src/components/MinhasDemandasCallout.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/MinhasDemandasCallout.tsx src/components/MinhasDemandasCallout.test.tsx src/components/VisaoGeral.tsx src/index.css src/responsive-modernization.css
git commit -m "feat: destacar acesso às minhas demandas no dashboard"
```

---

### Task 2: Navegação para a carteira pessoal e estado visível do escopo

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/FilterPanel.tsx`
- Create: `src/components/FilterPanel.scope.test.tsx`
- Modify: `src/App.supabase.test.tsx`
- Modify: `src/index.css`
- Modify: `src/responsive-modernization.css`

**Interfaces:**
- Produces: `handleOpenMinhasDemandas(): void` em `App.tsx`.
- Uses: `serializeDemandFilters(nextFilters)` e rota `/demandas`.
- Extends: `FilterPanel` sem novas props; usa `filtros.scope` e `setFiltros` existentes.

- [ ] **Step 1: Escrever teste falho do escopo no FilterPanel**

Criar `src/components/FilterPanel.scope.test.tsx` com um wrapper de estado:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DEFAULT_DEMAND_FILTERS, DEFAULT_QUICK_FILTERS } from '../filters/filterTypes';
import { FilterPanel } from './FilterPanel';

function ScopeHarness() {
  const [filtros, setFiltros] = React.useState({ ...DEFAULT_DEMAND_FILTERS, scope: 'meu' as const });
  const [quickFilters, setQuickFilters] = React.useState({ ...DEFAULT_QUICK_FILTERS });
  return (
    <FilterPanel
      filtros={filtros}
      setFiltros={setFiltros}
      quickFilters={quickFilters}
      setQuickFilters={setQuickFilters}
      setoresDisponiveis={[]}
      totalExibidos={2}
      totalGeral={10}
    />
  );
}

describe('FilterPanel no escopo pessoal', () => {
  it('indica Minhas demandas e permite voltar para a equipe', async () => {
    render(<ScopeHarness />);
    expect(screen.getByText('Minhas demandas')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Ver carteira da equipe' }));
    expect(screen.queryByText('Minhas demandas')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Escrever teste falho de integração no App**

Em `src/App.supabase.test.tsx`, permitir que `createServices` receba demandas de fixture e adicionar um caso com:

- demanda de `activeUser.id`;
- demanda de outro UUID;
- demanda sem UUID.

O teste deve autenticar, clicar em `Acessar minha carteira`, exigir URL contendo `escopo=meu`, exigir a demanda própria e rejeitar as outras duas.

```tsx
expect(window.location.pathname).toBe('/demandas');
expect(window.location.search).toContain('escopo=meu');
expect(await screen.findByText('Demanda do usuário conectado')).toBeVisible();
expect(screen.queryByText('Demanda de outro usuário')).not.toBeInTheDocument();
expect(screen.queryByText('Demanda sem responsável oficial')).not.toBeInTheDocument();
```

- [ ] **Step 3: Confirmar RED**

Run: `npm test -- src/components/FilterPanel.scope.test.tsx src/App.supabase.test.tsx`
Expected: FAIL porque o dashboard ainda não navega para o escopo e o painel não indica o estado pessoal.

- [ ] **Step 4: Implementar a navegação em App.tsx**

Adicionar:

```tsx
const handleOpenMinhasDemandas = () => {
  const nextFilters: DemandFilters = {
    ...filtros,
    scope: 'meu',
    responsibleId: 'todos',
  };
  setFiltros(nextFilters);
  navigate({ pathname: '/demandas', search: serializeDemandFilters(nextFilters).toString() });
};
```

Passar para `VisaoGeral`:

```tsx
onOpenMinhasDemandas={handleOpenMinhasDemandas}
```

A limpeza de `responsibleId` evita interseção impossível entre “meu UUID” e um responsável nominal previamente selecionado, sem limpar busca, status, período ou filtros rápidos existentes.

- [ ] **Step 5: Implementar a faixa de contexto no FilterPanel**

Antes de `filters-header`, renderizar somente quando `filtros.scope === 'meu'`:

```tsx
<div className="personal-scope-banner" role="status">
  <div className="personal-scope-label">
    <i className="fa-solid fa-user-check" aria-hidden="true" />
    <strong>Minhas demandas</strong>
  </div>
  <button
    type="button"
    className="personal-scope-reset"
    onClick={() => setFiltros((current) => ({ ...current, scope: 'equipe' }))}
  >
    Ver carteira da equipe
  </button>
</div>
```

Incluir `filtros.scope === 'meu'` na contagem de filtros ativos. `Limpar filtros` continua retornando aos defaults, portanto também volta para a equipe.

- [ ] **Step 6: Estilizar a faixa sem competir com o callout**

Adicionar a `src/index.css`:

```css
.personal-scope-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: -4px -4px 18px;
  padding: 12px 14px;
  border: 1px solid rgba(47, 111, 165, 0.24);
  border-radius: var(--radius-md);
  background: rgba(47, 111, 165, 0.06);
}

.personal-scope-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
}

.personal-scope-label i {
  color: var(--accent-color);
}

.personal-scope-reset {
  border: 0;
  background: transparent;
  color: var(--accent-hover);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
```

Adicionar a `src/responsive-modernization.css`:

```css
.personal-scope-banner {
  align-items: flex-start;
  flex-direction: column;
}
```

- [ ] **Step 7: Confirmar GREEN**

Run: `npm test -- src/components/FilterPanel.scope.test.tsx src/App.supabase.test.tsx src/components/MinhasDemandasCallout.test.tsx`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/App.supabase.test.tsx src/components/FilterPanel.tsx src/components/FilterPanel.scope.test.tsx src/index.css src/responsive-modernization.css
git commit -m "feat: abrir e identificar a carteira pessoal"
```

---

### Task 3: Regressão, acessibilidade e publicação controlada

**Files:**
- Modify: `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`
- Modify: `docs/HANDOFF.md`
- Temporarily modify and restore: `vercel.json`

**Interfaces:**
- Verifies: nenhuma mudança em banco, migrations, permissões ou regras adjacentes.
- Publishes: frontend validado em Preview e Production após merge.

- [ ] **Step 1: Executar validação completa**

Run: `npm run lint`
Expected: exit 0.

Run: `npm run test:coverage`
Expected: todos os testes aprovados e cobertura dentro do gate vigente.

Run: `npm run build`
Expected: exit 0.

Run: `npm run test:e2e`
Expected: smoke tests desktop e mobile aprovados.

- [ ] **Step 2: Revisar a diferença contra main**

Run: `git diff --check main...HEAD`
Expected: nenhum erro de whitespace.

Run: `git diff --stat main...HEAD`
Expected: somente componente, integração, testes, CSS e documentação do escopo aprovado; zero migrations e zero arquivos Supabase.

- [ ] **Step 3: Atualizar governança e handoff**

Registrar que a continuação funcional do R3 foi implementada e aguarda homologação manual, com os textos exatos, a rota `/demandas?escopo=meu` e a ausência de mudanças no banco.

- [ ] **Step 4: Abrir PR e aguardar CI verde**

PR title: `R3: destacar Minhas demandas no dashboard`

O corpo deve registrar:

- alternativa B aprovada;
- aplicação do sistema editorial;
- filtragem por UUID autenticado;
- indicação e reversão do escopo pessoal;
- ausência de alterações no Supabase;
- resultados de lint, testes, build e browser QA.

- [ ] **Step 5: Validar Preview**

Conferir em desktop e mobile:

1. posição após `Atenção agora`;
2. somente os três textos aprovados;
3. hierarquia e contraste;
4. foco do botão;
5. navegação e URL;
6. estado vazio sem quebra;
7. retorno à equipe.

- [ ] **Step 6: Mesclar e publicar Production**

Habilitar `deploymentEnabled` somente no commit controlado necessário, confirmar o deployment Production `READY`, testar o domínio oficial e restaurar `deploymentEnabled: false` em PR operacional separado.

- [ ] **Step 7: Homologação do produto**

Parar após a publicação e solicitar ao responsável pelo produto a homologação visual e funcional. Não iniciar outro ciclo automaticamente.
