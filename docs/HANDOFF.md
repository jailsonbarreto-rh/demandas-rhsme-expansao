# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **30 de julho de 2026 — R5-1 em homologação**

<!-- IMPLEMENTATION_AUTHORIZATION: NONE -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| R4 | concluído e publicado |
| Production vigente antes do R5-1 | `dpl_BU1fjhmwwcp9gjLu2v2Kw9oapau3` — `READY` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1`, `ACTIVE_HEALTHY` |
| Dados antes da migration R5-1 | 379 demandas, zero excluídas, 764 históricos, 13 perfis |
| Pacote funcional aprovado | **R5-1 — Lixeira administrativa e auditoria** |
| Estado do pacote | implementação concluída na branch; gates e publicação em andamento |
| Demais pacotes do R5 | não autorizados |

## Decisão vigente do R5-1

### Exclusão

- somente administrador ativo pode excluir demandas;
- editor e leitor não recebem a ação `Excluir`;
- exclusão é lógica e nunca física;
- motivo com pelo menos dez caracteres é obrigatório;
- banco registra ator, data, hora e evento histórico;
- dados e histórico permanecem preservados.

### Consulta administrativa

A área `/admin` recebe a seção `Demandas excluídas`, somente para administradores, com:

- contagem dos registros excluídos;
- pesquisa por número, assunto, responsável, setor, status, motivo e autor comprovável;
- listagem dos dados principais;
- detalhe somente leitura;
- motivo, data e autoria da exclusão;
- dados preservados da demanda;
- histórico completo.

Quando a autoria não puder ser comprovada pelo UUID e pelos perfis disponíveis, a interface usa `Autor não identificado` e não inventa nome.

### Restauração

Não existe restauração no produto:

- não há botão ou fluxo visual;
- não há método público nos tipos, hooks ou repositórios;
- não há edição ou mudança de status na lixeira;
- a função técnica do banco será preservada, mas perderá `EXECUTE` para `public`, `anon`, `authenticated` e `service_role`;
- recuperação excepcional somente poderá ocorrer fora da aplicação, por procedimento controlado do proprietário do banco.

O tipo histórico `restauracao` permanece reconhecido apenas para leitura de eventual evento anterior.

## Implementação na branch

Branch funcional: `feat/r5-1-admin-trash-audit`.

Principais mudanças:

- `AdminTrashPanel` e `AdminTrashDetailDialog`;
- estilos responsivos próprios da lixeira;
- integração com a área administrativa vigente;
- carregamento da lixeira somente no contexto administrativo Supabase;
- retirada de `RestoreDemandaInput`, `restoreMutationSchema` e `restore()` do contrato do produto;
- migration `20260730170000_r5_1_disable_product_restore.sql`;
- testes de contrato, migration, repositórios, tabela, painel e detalhe;
- documentação canônica atualizada.

## TDD e evidências já obtidas

### RED

- contrato falhou enquanto `restore` permanecia exposto nos repositórios;
- teste de migration falhou enquanto a revogação não existia;
- teste da interface falhou enquanto a lixeira administrativa não existia.

### GREEN focal

- contrato Supabase/local sem restauração: aprovado;
- migration aditiva de revogação: aprovada;
- painel da lixeira: 4 testes aprovados;
- integração focal: testes de painel, tabela, contratos e migration aprovados;
- editor sem ação de exclusão: comprovado por teste de componente.

### Gate canônico da aplicação

Um candidato intermediário aprovou:

- auditoria de dependências e assinaturas;
- compatibilidade transitiva;
- gate documental 9/9;
- lint;
- suíte unitária e de integração incluindo os testes R5-1;
- TypeScript, build, orçamento do bundle e inspeção pública.

A evidência final deverá ser repetida sobre o HEAD documental definitivo antes do merge.

## Supabase — pré-validação remota

Estado confirmado antes da migration:

- 379 demandas;
- zero demandas excluídas;
- 764 históricos;
- 13 perfis;
- RLS de `sme_demandas`: usuário ativo consulta registros não excluídos; excluídos exigem `private.is_admin()`;
- RLS de `sme_historico`: eventos de demanda excluída exigem `private.is_admin()`;
- `excluir_sme_demanda` possui grant para `authenticated`, mas valida `private.is_admin()` internamente;
- `restaurar_sme_demanda` ainda possui grant para `authenticated` e `service_role`, ponto que a migration R5-1 revogará.

Nenhuma alteração remota do R5-1 foi aplicada até este estado do Handoff.

## Gates ainda obrigatórios

1. repetir `npm run check` sobre o HEAD final da branch;
2. executar Playwright desktop e mobile;
3. revisar diff e PR;
4. aplicar a migration no Supabase pelo fluxo gratuito normal;
5. confirmar função preservada e grants de restauração totalmente revogados;
6. confirmar contagens inalteradas e ausência de resíduos;
7. integrar o PR;
8. publicar Production por release controlado;
9. verificar domínio, `/admin`, runtime e Supabase;
10. restaurar `deploymentEnabled: false`;
11. registrar PR, SHA e deployment finais.

## Próxima etapa após o R5-1

Somente depois da homologação e publicação do R5-1 será iniciado o debate do **R5-2 — Andamento, transições e reabertura**.

Nenhum código do R5-2, R5-3, R5-4 ou R5-5 está autorizado.

## Documentação vigente

1. `docs/execution/ADENDO_GOVERNANCA_POR_ETAPA_CTRH_v2.0.4.md`;
2. `docs/product/PROTOCOLO_HOMOLOGACAO_DECISOES_PRODUTO_CTRH_v1.3.md`;
3. `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md`;
4. `docs/product/POLITICA_SINCRONIZACAO_DOCUMENTAL_CTRH_v1.1.md`;
5. `docs/PRODUCT_CONTEXT.md`;
6. `docs/execution/Plano_Integrado_Reformulado_CTRH_v3.1.md`;
7. `docs/execution/Plano_Executivo_Operacao_Atual_CTRH_v1.2.md`;
8. `docs/execution/ATUALIZACAO_POS_R4_PRE_R5_2026-07-30.md`;
9. `docs/product/PAUTA_DECISOES_R5_2026-07-30.md`;
10. `docs/adr/ADR-003-historico-e-exclusao-logica.md`;
11. este Handoff.

## Regra de continuidade

O R5 segue em pequenos blocos: discutir, decidir, registrar, implementar, homologar e somente então abrir o próximo pacote. Nenhuma conclusão parcial autoriza etapa posterior por inferência.
