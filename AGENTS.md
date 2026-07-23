# Instruções de execução — Central de Demandas CTRH

Estas regras valem para todo trabalho neste repositório.

O `Plano_Remanescente_Execucao_CTRH_v2.0.md` permanece como referência organizada do trabalho possível. Ele **não autoriza automaticamente** a implementação de nenhum ciclo ou item.

Toda implementação dos Ciclos R1 a R12 depende de debate prévio e autorização expressa do responsável pelo produto, conforme o `ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.2.md`.

## Leitura obrigatória

Antes de interpretar ou alterar qualquer ciclo, leia integralmente, nesta ordem:

1. `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.2.md`;
2. `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.0.md`;
3. `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`;
4. `docs/PRODUCT_CONTEXT.md`;
5. `docs/execution/Plano_Remanescente_Execucao_CTRH_v2.0.md`, como referência;
6. os ADRs de `docs/adr/` aplicáveis ao ciclo;
7. `docs/HANDOFF.md` e a documentação específica dos arquivos afetados;
8. `docs/execution/Plano_Mestre_Execucao_CTRH_v1.0.md` somente para consultar a origem de uma decisão já consolidada.

O `ADENDO_SUSPENSAO_PLANO_CTRH_v2.0.1.md` é registro histórico e foi superado pela governança ciclo a ciclo.

## Autoridade e sequência

- Não reexecute os Ciclos 0 a 4 do Plano Mestre v1.0: eles estão encerrados.
- Não use a antiga numeração dos Ciclos 5 a 13 para decidir a próxima etapa.
- Nenhum Ciclo R1 a R12 possui autorização automática de implementação.
- O processo ocorre sequencialmente: debate, decisão, autorização, implementação e homologação do ciclo atual; depois começa o debate do seguinte.
- A próxima atividade autorizada deve ser confirmada em `docs/HANDOFF.md`.

## Fase obrigatória de debate pré-implementação

Antes de qualquer código, migration, banco, Preview ou publicação, decomponha o ciclo em decisões independentes.

Para cada decisão, apresente:

1. como o sistema funciona hoje;
2. o que mudaria concretamente na tela e na rotina;
3. quais usuários seriam afetados;
4. um cenário real de uso;
5. alternativas possíveis, inclusive manter o comportamento atual;
6. recomendação, claramente identificada apenas como recomendação;
7. impactos positivos e negativos;
8. dependências com decisões de outros ciclos;
9. dificuldade e custo de reverter depois;
10. decisão expressa do responsável: aprovar, rejeitar, alterar ou adiar.

Classifique cada item como:

- necessidade técnica;
- preservação do que já existe;
- decisão anteriormente confirmada;
- nova decisão proposta;
- melhoria opcional;
- questão ainda aberta.

Não basta obter aprovação do título ou do objetivo geral do ciclo. A aprovação deve alcançar os comportamentos concretos que serão implementados.

## Formação da autorização

Depois do debate:

1. consolide decisões aprovadas, alteradas, adiadas, rejeitadas e pendentes;
2. escreva a regra final de cada item aprovado;
3. apresente o escopo exato de implementação;
4. obtenha autorização expressa para implementar a consolidação;
5. registre as decisões em `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`;
6. somente então crie a branch funcional.

Silêncio, ausência de objeção, recomendação técnica, texto do plano ou autorização para continuar analisando não equivalem a autorização de implementação.

## Limite da autorização

Implemente somente o que foi discutido e registrado.

Não:

- complete lacunas por conta própria;
- escolha silenciosamente uma alternativa de produto;
- amplie o escopo por conveniência;
- antecipe decisões de outro ciclo;
- modifique permissões, obrigatoriedades, padrões, cálculos, telas ou tratamento de dados não debatidos.

Se surgir uma nova decisão durante a implementação, pare o item afetado, explique a questão e aguarde decisão expressa. O restante poderá prosseguir apenas se for independente e seguro.

## Disciplina de entrega funcional

- Trabalhe sempre em branch própria; nunca desenvolva diretamente na `main`.
- Execute um único ciclo publicável por branch e PR, salvo autorização expressa diferente.
- Confirme `main`, SHA remoto, migrations aplicadas e worktree limpo antes de criar a branch.
- Para mudanças de comportamento, escreva ou atualize testes primeiro e registre a falha RED esperada.
- Implemente a menor solução completa do escopo aprovado.
- Não misture ciclos, refatorações oportunistas ou mudanças não autorizadas.
- Publique Preview no mesmo SHA do PR e homologue o fluxo real.
- Ao concluir o ciclo, atualize `docs/HANDOFF.md` e o registro de decisões.

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

`npm run check:full` consolida o gate atual. Execute também gates específicos do ciclo. Nenhum teste pode ser removido, omitido ou ignorado para obter aprovação.

## Regras permanentes de produto e dados

- Supabase é a fonte de verdade em produção. O modo local existe apenas para desenvolvimento e testes com dados sintéticos.
- Nunca coloque dados reais, segredos, senhas, chaves administrativas ou conteúdo operacional em código cliente, fixtures públicas, logs, screenshots, PRs ou artefatos de teste.
- Preserve busca, Excel, acessibilidade, responsividade, perfis, RLS, Realtime, rotas e contexto de navegação, salvo mudança expressamente aprovada.
- Não trate `Tramitado` como `Encerrado`; ausência de prazo não é atraso.
- Não invente prazo, responsável, justificativa, autoria ou evento histórico.
- Não reintroduza `UPDATE` ou `DELETE` direto nas tabelas operacionais.
- Não recrie estruturas já implantadas sem necessidade aprovada.
- Não apague dados, histórico, backups ou deployments sem inventário e autorização destrutiva específica.

## Paradas e relato

Pare quando uma lacuna afetar comportamento, regra, permissão, tela, cálculo, dado ou experiência do usuário e ainda não houver decisão expressa.

Ao concluir cada ciclo, registre: decisões aprovadas, escopo implementado e excluído, branch, commits, PR, Preview e SHA, testes, migrations, impacto em dados, acessibilidade, homologação, rollback, riscos e próximo debate autorizado.
