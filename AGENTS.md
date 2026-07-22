# Instruções de execução — Central de Demandas CTRH

Estas regras valem para todo trabalho neste repositório. O plano mestre é o contrato de execução e prevalece sobre atalhos técnicos.

## Leitura obrigatória

Antes de interpretar ou alterar qualquer ciclo, leia integralmente, nesta ordem:

1. `docs/PRODUCT_CONTEXT.md`;
2. `docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md`;
3. os ADRs de `docs/adr/` aplicáveis ao ciclo;
4. `docs/HANDOFF.md` e a documentação específica dos arquivos afetados.

## Disciplina de entrega

- Trabalhe sempre em branch própria; nunca desenvolva diretamente na `main`.
- Execute um único ciclo publicável por branch e PR. Só inicie o seguinte após merge ou autorização explícita para uma cadeia de branches.
- Confirme `main`, SHA remoto e worktree limpo antes de criar a branch.
- Registre antes de implementar: pessoa afetada, dor concreta, cenário real, resultado esperado e comportamento protegido.
- Para mudanças de comportamento, escreva ou atualize testes primeiro e registre a falha RED esperada.
- Implemente a menor solução completa, valide o fluxo real, revise o diff, atualize a documentação, crie commit atômico, publique a branch, abra PR e homologue o Preview no mesmo SHA.
- Não misture ciclos, refatorações oportunistas ou mudanças externas não exigidas pelo ciclo.
- Nesta execução do plano, todo o trabalho deve ser realizado pelo agente principal, sem subagentes.

## Validação obrigatória

Na raiz do repositório, execute:

```bash
npm ci
npm audit --audit-level=high
npm audit signatures
npm run lint
npm run test:coverage
npm run build
npm run check:bundle
npm run test:e2e
```

`npm run check:full` consolida o gate atual. Execute também gates específicos do ciclo, como `check:public-bundle`, quando existirem. Nenhum teste pode ser removido, omitido ou ignorado para obter aprovação.

## Regras de produto e dados

- Supabase é a fonte de verdade em produção. O modo local existe apenas para desenvolvimento e testes com dados totalmente sintéticos.
- Nunca coloque dados reais, segredos, senhas, chaves administrativas ou conteúdo operacional em código cliente, fixtures públicas, logs, screenshots, PRs ou artefatos de teste.
- Preserve busca avançada, exportação Excel, acessibilidade, responsividade, perfis, RLS, Realtime, rotas e contexto de navegação, salvo mudança expressamente ordenada pelo plano.
- Não trate `Tramitado` como `Encerrado`; ausência de prazo não é atraso; “Minhas demandas” usa UUID, nunca aproximação de nomes.
- Não crie status, bibliotecas de busca ou gráficos, estado global, notificações, infraestrutura paralela ou rankings de produtividade fora do contrato.
- Não substitua ExcelJS, Supabase, React Router, TanStack Table, React Hook Form ou Zod sem autorização.
- Não aplique a migration de contrato antes do frontend compatível homologado. Não apague dados, histórico ou deployments sem inventário e autorização destrutiva específica.

## Gate de consciência do produto

Antes da implementação, responda concretamente:

1. Quem usa a entrega?
2. Que dificuldade enfrenta hoje?
3. Como a entrega reduz tempo, ambiguidade, risco ou retrabalho?
4. Qual comportamento existente não pode regredir?
5. Como o ganho será comprovado além dos testes?

Depois da implementação, confirme se o fluxo ficou mais curto ou claro, se a próxima ação é compreensível, se o contexto foi preservado, se os dados e limitações estão explícitos e se a solução evita controle paralelo.

## Paradas e relato

Respeite integralmente as condições de parada da seção 16 do plano. Ao concluir cada ciclo, use o formato da seção 17 com branch, commit, PR, Preview, entregas, testes, dados/migrations, critérios de aceite, riscos e próximo ciclo autorizado.
