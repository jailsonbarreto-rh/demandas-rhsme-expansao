# Responsáveis Oficiais Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vincular responsáveis a perfis oficiais, migrar 378 demandas históricas e impedir novas identificações textuais livres.

**Architecture:** O formulário passa a trabalhar com UUID opcional de perfil. O banco continua armazenando `responsavel` como fotografia textual, mas deriva esse valor do perfil e o protege por RPC e gatilho. Uma migração idempotente realiza os vínculos históricos e preserva `Vanessa Migrado` sem UUID.

**Tech Stack:** React 19, TypeScript 5.9, React Hook Form, Zod 4, Vitest, Supabase/PostgreSQL, GitHub Actions, Vercel.

## Global Constraints

- Não alterar papéis, status, permissões, políticas RLS ou regras de negócio não descritas na especificação.
- Todos os perfis cadastrados podem aparecer na seleção, independentemente de papel ou status.
- Responsável continua opcional; quando informado, precisa ser um perfil cadastrado.
- Preservar `Vanessa Migrado` com UUID nulo.
- Preservar o texto anterior das migrações no histórico.
- Não escrever diretamente em `auth.users`.
- Não publicar em produção antes de testes e revisão da diferença da branch.

---

### Task 1: Testes de formulário para seleção oficial

**Files:**
- Create: `src/components/ResponsibleSelection.test.tsx`
- Modify: `src/components/ProfessionalUx.test.tsx`
- Modify: `src/components/ModalDateValidation.test.tsx`

**Interfaces:**
- Consumes: `PerfilMinimo`, `ModalNovo`, `ModalEditar`.
- Produces: contrato dos modais com prop `responsaveis: PerfilMinimo[]` e valor `responsavelId`.

- [ ] **Step 1: Escrever testes falhos**

Cobrir:

```tsx
const responsaveis = [
  { id: '11111111-1111-4111-8111-111111111111', nome: 'ERICA VALIM DE ALMEIDA HOLANDA', setor: '' },
  { id: '22222222-2222-4222-8222-222222222222', nome: 'Wilson Peixoto', setor: 'SME' },
];

it('permite escolher somente perfis cadastrados na nova demanda', async () => {
  const onSalvar = vi.fn();
  render(<ModalNovo responsaveis={responsaveis} onClose={vi.fn()} onSalvar={onSalvar} />);
  expect(screen.queryByRole('textbox', { name: 'Responsável' })).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Responsável' })).toHaveTextContent('ERICA VALIM DE ALMEIDA HOLANDA');
});

it('mantém responsável legado apenas como informação e permite reatribuição oficial', () => {
  const legacy = createDemandFixture({ responsavel: 'Vanessa Migrado', responsavelId: null });
  render(<ModalEditar demanda={legacy} responsaveis={responsaveis} onClose={vi.fn()} onSalvar={vi.fn()} />);
  expect(screen.getByText(/responsável legado: vanessa migrado/i)).toBeVisible();
  expect(screen.getByRole('combobox', { name: 'Responsável' })).toHaveValue('');
});
```

- [ ] **Step 2: Confirmar RED no CI**

Run: `npm test -- src/components/ResponsibleSelection.test.tsx`
Expected: FAIL por ausência da prop `responsaveis` e do campo `responsavelId`.

- [ ] **Step 3: Ajustar testes existentes**

Passar `responsaveis={[]}` nos testes que renderizam os modais diretamente. Nos testes que submetem cadastro válido, selecionar um UUID oficial ou manter a opção vazia conforme o comportamento testado.

- [ ] **Step 4: Commit de testes falhos**

```bash
git add src/components/ResponsibleSelection.test.tsx src/components/ProfessionalUx.test.tsx src/components/ModalDateValidation.test.tsx
git commit -m "test: exigir seleção oficial de responsável"
```

---

### Task 2: Modelo de formulário e componentes

**Files:**
- Modify: `src/validation/demandaSchemas.ts`
- Modify: `src/components/ModalNovo.tsx`
- Modify: `src/components/ModalEditar.tsx`

**Interfaces:**
- Produces: `DemandaFormValues.responsavelId: string`, `EditarDemandaValues.responsavelId: string`.
- Consumes: `PerfilMinimo[]`.

- [ ] **Step 1: Alterar schema minimamente**

Substituir `responsavel` por:

```ts
const optionalProfileId = z.string().trim().refine(
  value => value === '' || z.uuid().safeParse(value).success,
  'Selecione um responsável cadastrado.',
);

responsavelId: optionalProfileId,
```

- [ ] **Step 2: Alterar `ModalNovo`**

Adicionar prop `responsaveis`. Default do formulário: `responsavelId: ''`. Renderizar `<select>` com opção vazia e perfis ordenados pelo nome. Não renderizar input textual.

- [ ] **Step 3: Alterar `ModalEditar`**

Adicionar prop `responsaveis`. Default: `demanda.responsavelId ?? ''`. Para demanda sem UUID e com texto, mostrar `Responsável legado: <texto>` em bloco somente leitura. Renderizar a mesma seleção oficial.

- [ ] **Step 4: Confirmar GREEN dos testes de componente**

Run: `npm test -- src/components/ResponsibleSelection.test.tsx src/components/ProfessionalUx.test.tsx src/components/ModalDateValidation.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/validation/demandaSchemas.ts src/components/ModalNovo.tsx src/components/ModalEditar.tsx
git commit -m "feat: selecionar responsáveis cadastrados nos formulários"
```

---

### Task 3: Carregamento e tradução de UUID no App

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/services/createAppServices.ts`
- Modify: `src/App.supabase.test.tsx`
- Modify: `src/App.local.test.tsx` se necessário.

**Interfaces:**
- Consumes: `ProfilesService.listMinimal()`.
- Produces: `responsaveisDisponiveis: PerfilMinimo[]` para ambos os modais.

- [ ] **Step 1: Escrever teste falho no App Supabase**

Configurar `listMinimal` para retornar perfil conhecido, selecionar esse perfil e exigir:

```ts
expect(create).toHaveBeenCalledWith(expect.objectContaining({
  responsavelId: profile.id,
  responsavel: profile.nome,
}));
```

- [ ] **Step 2: Confirmar RED**

Run: `npm test -- src/App.supabase.test.tsx`
Expected: FAIL porque o App ainda envia `responsavelId: null`.

- [ ] **Step 3: Implementar carregamento**

Carregar `listMinimal()` para qualquer usuário autenticado. Limpar a lista no logout. Em modo local, fornecer perfis mínimos determinísticos para os nomes da base de demonstração.

- [ ] **Step 4: Implementar tradução**

Na criação:

```ts
const selected = responsaveisDisponiveis.find(item => item.id === values.responsavelId);
responsavelId: selected?.id ?? null,
responsavel: selected?.nome ?? '',
```

Na edição:

```ts
const selected = responsaveisDisponiveis.find(item => item.id === values.responsavelId);
const preserveLegacy = !current.responsavelId && !values.responsavelId;
responsavelId: selected?.id ?? null,
responsavel: selected?.nome ?? (preserveLegacy ? current.responsavel : ''),
```

Atualizar também o estado do drawer com UUID e nome resolvidos.

- [ ] **Step 5: Passar perfis aos modais**

```tsx
<ModalNovo responsaveis={responsaveisDisponiveis} ... />
<ModalEditar responsaveis={responsaveisDisponiveis} ... />
```

- [ ] **Step 6: Confirmar GREEN**

Run: `npm test -- src/App.supabase.test.tsx src/App.local.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/services/createAppServices.ts src/App.supabase.test.tsx src/App.local.test.tsx
git commit -m "feat: carregar e gravar identidade oficial do responsável"
```

---

### Task 4: Contrato de banco e migração histórica

**Files:**
- Create: `supabase/migrations/20260723_r3_responsaveis_oficiais.sql`
- Create: `supabase/migrations/r3ResponsaveisMigration.test.ts`
- Create: `supabase/tests/r3_responsaveis_invariants.sql`

**Interfaces:**
- Mantém assinaturas públicas de `criar_sme_demanda_v2` e `editar_sme_demanda` para evitar quebra de cliente.
- `listar_perfis_minimos()` continua retornando `id`, `nome`, `setor`, mas inclui todos os perfis cadastrados.

- [ ] **Step 1: Escrever teste estático falho**

Exigir que a migration contenha:

- gatilho `sme_demandas_responsavel_oficial_trigger`;
- validação de `p_responsavel_id` em `perfis_usuarios`;
- derivação do nome no servidor;
- bloqueio da RPC textual legada;
- mapeamentos autorizados;
- preservação explícita de `Vanessa Migrado`;
- inserção de histórico `reatribuicao`.

- [ ] **Step 2: Confirmar RED**

Run: `npm test -- supabase/migrations/r3ResponsaveisMigration.test.ts`
Expected: FAIL porque a migration ainda não existe.

- [ ] **Step 3: Criar helper e trigger**

Criar função privada que:

```sql
if new.responsavel_id is not null then
  select p.nome into v_nome
  from public.perfis_usuarios p
  where p.id = new.responsavel_id;
  if v_nome is null or btrim(v_nome) = '' then
    raise exception 'Responsável inválido: selecione um usuário cadastrado.';
  end if;
  new.responsavel := btrim(v_nome);
elsif new.origem = 'sistema' and btrim(coalesce(new.responsavel, '')) <> '' then
  raise exception 'Responsável inválido: selecione um usuário cadastrado.';
elsif tg_op = 'UPDATE' and old.responsavel_id is not null then
  new.responsavel := '';
end if;
```

- [ ] **Step 4: Atualizar RPCs**

`criar_sme_demanda_v2` e `editar_sme_demanda` devem consultar o perfil quando há UUID e nunca confiar em `p_responsavel`. UUID vazio mantém demanda sem responsável. Na edição de registro legado sem UUID, permitir preservar exatamente o texto existente quando nenhum novo responsável for indicado.

- [ ] **Step 5: Bloquear criação textual legada**

Manter a função para compatibilidade de assinatura, mas fazê-la lançar exceção orientando o uso da criação oficial. Não alterar as permissões de papéis fora dessa função.

- [ ] **Step 6: Migrar dados de forma idempotente**

Usar mapa por e-mail oficial e atualizar apenas linhas com `responsavel_id is null` e texto autorizado. Inserir histórico antes/depois sem duplicar evento em reexecução. Atualizar o texto para o nome oficial. Não tocar em `Vanessa Migrado`.

- [ ] **Step 7: Criar invariantes SQL**

Validar:

```sql
-- 378 vinculadas
select count(*) = 378 from public.sme_demandas where responsavel_id is not null;
-- única exceção
select count(*) = 1 from public.sme_demandas where responsavel_id is null and responsavel = 'Vanessa Migrado';
-- zero divergências entre fotografia e perfil
select count(*) = 0
from public.sme_demandas d
join public.perfis_usuarios p on p.id = d.responsavel_id
where d.responsavel <> p.nome;
```

- [ ] **Step 8: Confirmar GREEN do teste estático**

Run: `npm test -- supabase/migrations/r3ResponsaveisMigration.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add supabase/migrations/20260723_r3_responsaveis_oficiais.sql supabase/migrations/r3ResponsaveisMigration.test.ts supabase/tests/r3_responsaveis_invariants.sql
git commit -m "feat: vincular responsáveis históricos a perfis oficiais"
```

---

### Task 5: Validação completa e implantação

**Files:**
- Modify: `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`
- Modify: `docs/HANDOFF.md`

- [ ] **Step 1: Executar verificação completa na branch**

Run: `npm run lint`
Expected: exit 0.

Run: `npm run test:coverage`
Expected: exit 0, nenhuma falha.

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 2: Revisar diferença da branch**

Confirmar que não há mudanças em permissões, papéis, status, filtros, dashboards ou outras regras.

- [ ] **Step 3: Aplicar migration no Supabase de produção**

Aplicar exatamente `20260723_r3_responsaveis_oficiais.sql` com `apply_migration`.

- [ ] **Step 4: Executar auditoria remota somente leitura**

Confirmar 379 demandas, 378 vinculadas, uma exceção Vanessa, zero divergências, 13 perfis preservados e níveis/status inalterados.

- [ ] **Step 5: Publicar código por PR e Vercel**

Abrir PR, aguardar CI verde, revisar, mesclar e realizar publicação controlada. Restaurar `deploymentEnabled: false` após a publicação, conforme padrão do projeto.

- [ ] **Step 6: Smoke test de produção**

Testar login, carregamento da lista de responsáveis, criação sem responsável, criação com responsável oficial e edição sem texto livre. Remover demandas de teste criadas no smoke test por fluxo auditável.

- [ ] **Step 7: Atualizar documentação e encerrar**

Registrar a decisão e o estado final, incluindo a exceção `Vanessa Migrado`.
