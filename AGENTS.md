# Instruções de execução — Central de Demandas CTRH

Estas regras valem para todo trabalho neste repositório. O `Plano_Remanescente_Execucao_CTRH_v2.0.md` está vigente como inventário do trabalho remanescente, porém sua execução está **SUSPENSA**. Nenhum Ciclo R1 a R12 pode ser implementado até a conclusão e aprovação formal da Fase D0 — Auditoria e homologação das decisões de produto. O Plano Mestre v1.0 permanece preservado apenas como registro histórico e fonte das decisões funcionais já fixadas.

## Leitura obrigatória

Antes de interpretar ou alterar qualquer ciclo, leia integralmente, nesta ordem:

1. `docs/execution/ADENDO_SUSPENSAO_PLANO_CTRH_v2.0.1.md`;
2. `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.0.md`;
3. `docs/PRODUCT_CONTEXT.md`;
4. `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.0.md`, apenas como inventário ainda não homologado;
5. os ADRs de `docs/adr/` aplicáveis ao ciclo;
6. `docs/HANDOFF.md` e a documentação específica dos arquivos afetados;
7. `docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md` somente quando for necessário consultar a origem de uma decisão já consolidada.

## Autoridade e sequência

- Não reexecute os Ciclos 0 a 4 do Plano Mestre v1.0: eles estão encerrados.
- Não retome a numeração original dos Ciclos 5 a 13 como roteiro de execução.
- A sequência remanescente `R1 → ... → R12` está bloqueada para implementação.
- O Ciclo R0 foi concluído pelo rebaseline documental. A única atividade autorizada é a **Fase D0 — Auditoria e homologação das decisões de produto**, conforme `docs/HANDOFF.md`.
- Em conflito sobre autorização de execução, o Adendo de Suspensão v2.0.1 prevalece sobre o Plano v2.0 e sobre qualquer handoff anterior.

## Bloqueio de implementação

- Não altere código, migrations, Supabase, Vercel ou Production com base nos Ciclos R1 a R12.
- Não trate recomendações, exemplos ou critérios do plano como decisões aprovadas.
- Antes de implementar qualquer item, deve existir decisão expressa do responsável pelo produto registrada no caderno de decisões e incorporada a uma nova versão aprovada do plano.
- Caso uma solicitação mencione R1 a R12 sem revogação explícita deste bloqueio, pare e informe que o projeto está em homologação de produto.
- Durante D0, produza somente análises, alternativas, protótipos explicativos e documentação de decisão; não execute mudanças funcionais.

## Disciplina de entrega

- Trabalhe sempre em branch própria; nunca desenvolva diretamente na `main`.
- Execute um único ciclo publicável por branch e PR. Só inicie o seguinte após merge ou autorização explícita para uma cadeia de branches.
- Confirme `main`, SHA remoto, migrations aplicadas e worktree limpo antes de criar a branch.
- Registre antes de implementar: pessoa afetada, dor concreta, cenário real, resultado esperado e comportamento protegido.
- Para mudanças de comportamento, escreva ou atualize testes primeiro e registre a falha RED esperada.
- Implemente a menor solução completa, valide o fluxo real, revise o diff, atualize a documentação, crie commit atômico, publique a branch, abra PR e homologue o Preview no mesmo SHA.
- Não misture ciclos, refatorações oportunistas ou mudanças externas não exigidas pelo ciclo.
- Ao concluir cada ciclo, atualize `docs/HANDOFF.md` e declare expressamente o próximo ciclo autorizado.

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

`npm run check:full` consolida o gate atual. Execute também os gates específicos do ciclo, como `check:public-bundle`, E2E Supabase, replay de migrations, axe, inspeção de relatórios e testes de capacidade, quando aplicáveis. Nenhum teste pode ser removido, omitido ou ignorado para obter aprovação.

## Regras de produto e dados

- Supabase é a fonte de verdade em produção. O modo local existe apenas para desenvolvimento e testes com dados totalmente sintéticos.
- Nunca coloque dados reais, segredos, senhas, chaves administrativas ou conteúdo operacional em código cliente, fixtures públicas, logs, screenshots, PRs ou artefatos de teste.
- Preserve busca avançada, exportação Excel, acessibilidade, responsividade, perfis, RLS, Realtime, rotas e contexto de navegação, salvo mudança expressamente ordenada pelo Plano v2.0.
- Não trate `Tramitado` como `Encerrado`; ausência de prazo não é atraso; “Minhas demandas” usa UUID, nunca aproximação de nomes.
- Não invente prazo, responsável, justificativa, autoria ou evento histórico.
- Não reintroduza `UPDATE` ou `DELETE` direto nas tabelas operacionais.
- Não recrie o índice normalizado de número, a semântica centralizada, o schema expandido ou as RPCs v2 já implantadas; preserve-os e evolua-os apenas quando o ciclo exigir.
- Não revogue as RPCs legadas antes do Ciclo R12 e da homologação integral do frontend compatível.
- Não crie status, bibliotecas de busca, gráficos, estado global, notificações, infraestrutura paralela ou rankings de produtividade fora do contrato.
- Não substitua ExcelJS, Supabase, React Router, TanStack Table, React Hook Form ou Zod sem autorização formal.
- Não apague dados, histórico, backups ou deployments sem inventário e autorização destrutiva específica.

## Gate de consciência do produto

Antes da implementação, responda concretamente:

1. Quem usa a entrega?
2. Que dificuldade enfrenta hoje?
3. Como a entrega reduz tempo, ambiguidade, risco ou retrabalho?
4. Qual comportamento existente não pode regredir?
5. Como o ganho será comprovado além dos testes?

Depois da implementação, confirme se o fluxo ficou mais curto ou claro, se a próxima ação é compreensível, se o contexto foi preservado, se os dados e limitações estão explícitos e se a solução evita controle paralelo.

## Paradas e relato

Respeite integralmente as condições de parada da seção 11 do Plano v2.0. Ao concluir cada ciclo, use o formato da seção 12, registrando ciclo, branch, commits, PR, Preview e SHA, pessoa/dor/cenário, entregas, escopo excluído, arquivos e migrations, testes RED, gate técnico, E2E, acessibilidade, impacto em dados, homologação de produto, rollback, riscos, Production e próximo ciclo autorizado.
