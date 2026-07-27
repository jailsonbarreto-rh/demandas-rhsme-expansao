# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **27 de julho de 2026 — Correção do histórico publicada e bloqueio restaurado (PRs #69–#71)**

<!-- IMPLEMENTATION_AUTHORIZATION: none -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` — HTTP 200 |
| Deployment efetivo | `dpl_F2pATpQ3oFKW6K58NZVVqWqSwfyw` — `READY` |
| SHA efetivo de Production | `2e53369342989a352371e4de030969596934465f` — PR #70 |
| Correção funcional publicada | PR #69, merge `3a197b65fa26ebc89176fb537592d75545084b38` |
| Bloqueio automático de deploy | restaurado pelo PR #71 |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1` |
| Última migration remota | `20260724011303_r3_responsaveis_oficiais` |
| Estratégia geral | `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md` |
| Roteiro do Trilho A | `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md` |
| Implementação autorizada após este pacote | nenhuma |
| Próxima atividade funcional | continuação do E3 após homologação da correção publicada |

## Pacotes concluídos

- **E0:** cadeia documental v3.1/v1.2 consolidada e gate documental instituído no PR #58.
- **E1:** Production alinhada ao estado funcional da `main`, incluindo o PR #53, pelo PR #59; o bloqueio de deploy foi restaurado pelo PR #60.
- **E1A:** os dois fatos históricos temporários de `pg_net` foram representados no Git por arquivos homônimos e statements idênticos aos registrados remotamente no PR #61.
- **Correção do histórico técnico:** implementada no PR #69, publicada em Production pelo PR #70 e seguida da restauração do bloqueio automático no PR #71.

Nenhum SQL do E1A foi executado novamente no Supabase.

## Correção do histórico técnico — PR #69

Problema identificado em uso real:

- comentários de auditoria técnica eram exibidos literalmente na timeline cotidiana;
- referências internas como `R3`, `lote saneado` e hash de lote apareciam para usuários sem significado operacional;
- eventos de importação e migração eram misturados às movimentações humanas na Visão Geral.

Decisão e implementação:

- os registros brutos permanecem integralmente preservados no Supabase;
- `Demanda importada do lote saneado <hash>.` e `Demanda importada da planilha inicial.` são exibidos como `Demanda importada do sistema legado.`;
- `Responsável vinculado a perfil oficial na migração R3.` é exibido como `Responsável vinculado ao perfil oficial.`;
- o título passa a ser `Histórico da demanda`;
- cada evento recebe categoria legível;
- eventos técnicos permanecem no histórico individual, mas não aparecem como movimentação operacional global;
- comentários operacionais escritos por usuários permanecem inalterados.

Superfícies corrigidas:

- `DemandDetailDrawer`;
- `ModalHistorico`;
- `VisaoGeral`.

A comparação com o snapshot anterior ao R3 confirmou zero comentários históricos apagados ou alterados. O R3 acrescentou eventos auditáveis sem substituir registros anteriores.

## Validação da entrega

- auditoria de dependências: aprovada;
- assinaturas e proveniência: aprovadas;
- lint: aprovado;
- testes unitários, integração e cobertura: aprovados;
- build e orçamento de bundle: aprovados;
- Playwright: aprovado;
- Preview: `READY`;
- Production: `READY`;
- domínio oficial: HTTP 200;
- nenhum dado, comentário, migration ou estrutura do Supabase foi alterado.

## Decisão sobre dados reais e segurança final

O responsável pelo produto determinou que a retirada de dados reais dos repositórios, a contenção do repositório predecessor, a revisão de deployments antigos e eventual reescrita de histórico Git sejam adiadas para um pacote consolidado de segurança ao final das implementações funcionais e antes da entrega do produto para uso.

Até esse momento:

- nenhum arquivo real será apagado;
- nenhum histórico será reescrito;
- nenhuma ação de contenção será tratada como bloqueio das próximas implementações funcionais;
- os dados serão preservados para evitar perda potencial durante o desenvolvimento e a conferência do legado.

## Estado funcional preservado

- `responsavel_id` continua sendo a identidade oficial do responsável.
- `/demandas` continua sendo a carteira da equipe.
- `/minhas-demandas` continua sendo a carteira pessoal por UUID.
- Indicadores e filtros continuam contextuais à carteira aberta.
- A paginação padrão de 50 registros e a opção de 100 permanecem.
- Nenhum dado operacional foi modificado pelo PR #69.
- Nenhum comentário ou evento foi apagado ou reescrito no Supabase.

## Pendências posteriores do plano

- **E3:** concluir as demais correções semânticas objetivas já previstas.
- **E4:** RLS da lixeira e autoria administrativa.
- **R1:** integridade, contratos e concorrência.
- **R2:** consultas escaláveis e histórico sob demanda.
- **R4:** prazos e próxima providência.
- **R5:** andamento, prontuário e recuperação administrativa.
- **Segurança final:** executar ao fim das implementações funcionais o antigo escopo E2 ampliado, conforme decisão expressa do responsável pelo produto.

Nenhuma dessas etapas está autorizada automaticamente pela conclusão do PR #69.

## Regra de continuidade

1. nenhuma decisão `OP-Dxx` pode ser inferida dos planos;
2. o responsável pelo produto autoriza expressamente o próximo pacote;
3. cada pacote permanece isolado em branch e PR próprios;
4. alterações de banco futuras exigem preflight da cadeia de migrations antes da aplicação;
5. toda etapa concluída atualiza os documentos vigentes afetados no mesmo trabalho;
6. divergência documental decorrente da própria conclusão de uma tarefa é atualização rotineira de status, não um novo ciclo de planejamento.
