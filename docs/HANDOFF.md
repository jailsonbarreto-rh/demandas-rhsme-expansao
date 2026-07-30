# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **30 de julho de 2026 — R5-1 homologado, aguardando integração e publicação**

<!-- IMPLEMENTATION_AUTHORIZATION: NONE -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| R4 | concluído e publicado |
| Production vigente antes do R5-1 | `dpl_BU1fjhmwwcp9gjLu2v2Kw9oapau3` — `READY` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1`, `ACTIVE_HEALTHY` |
| Migration R5-1 | `20260730180713_r5_1_disable_product_restore` aplicada e verificada |
| Dados após a migration R5-1 | 379 demandas, zero excluídas, 764 históricos, 13 perfis |
| Pacote homologado | **R5-1 — Lixeira administrativa e auditoria** |
| Implementação funcional autorizada | **Nenhuma nova implementação funcional autorizada** |
| Estado do pacote | aplicação e banco homologados; PR #106 aguarda integração e release controlado |
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
- a função técnica do banco permanece definida, mas não possui `EXECUTE` para `public`, `anon`, `authenticated` ou `service_role`;
- recuperação excepcional somente poderá ocorrer fora da aplicação, por procedimento controlado do proprietário do banco.

O tipo histórico `restauracao` permanece reconhecido apenas para leitura de eventual evento anterior.

## Implementação na branch

Branch funcional: `feat/r5-1-admin-trash-audit`.  
Pull request: **#106 — R5-1: lixeira administrativa e auditoria**.

Principais mudanças:

- `AdminTrashPanel` e `AdminTrashDetailDialog`;
- estilos responsivos próprios da lixeira;
- integração com a área administrativa vigente;
- carregamento da lixeira somente no contexto administrativo Supabase;
- retirada de `RestoreDemandaInput`, `restoreMutationSchema` e `restore()` do contrato do produto;
- migration versionada `20260730170000_r5_1_disable_product_restore.sql`;
- testes de contrato, migration, repositórios, tabela, painel e detalhe;
- documentação canônica atualizada.

## TDD e validação da aplicação

### RED

- contrato falhou enquanto `restore` permanecia exposto nos repositórios;
- teste de migration falhou enquanto a revogação não existia;
- teste da interface falhou enquanto a lixeira administrativa não existia.

### GREEN e gate canônico final

Deployment de validação: `dpl_CHWakBVPusk3xKwrvWiZSpq7wENf` — `READY`.

- auditoria de dependências: zero vulnerabilidades;
- assinaturas: 560 pacotes verificados;
- atestações: 147 pacotes;
- compatibilidade transitiva: 3/3;
- gate documental: 9/9;
- lint: aprovado;
- arquivos de teste: 69 aprovados;
- testes unitários e de integração: 317 aprovados;
- cobertura global de linhas: 81,46%;
- TypeScript e build Vite: aprovados;
- bundle inicial: 194.114 bytes, 60,16% abaixo da linha de base;
- inspeção pública: aprovada.

### Navegador

Deployment E2E: `dpl_GGKDV2Ek7MKhjMMXXJN2zmJbaD6t`.

- 22 de 22 cenários Playwright aprovados;
- desktop Chromium;
- mobile de 320 px;
- acessibilidade, navegação, filtros, modais, exportação, console e ausência de overflow horizontal.

Relatório detalhado: `docs/execution/RELATORIO_VALIDACAO_R5_1_2026-07-30.md`.

## Supabase remoto

Migration aplicada pelo fluxo gratuito normal:

- versão remota: `20260730180713`;
- nome: `r5_1_disable_product_restore`.

A função `restaurar_sme_demanda(bigint, text)` foi preservada e passou a ter:

| Papel | EXECUTE |
|---|---:|
| `public` | não |
| `anon` | não |
| `authenticated` | não |
| `service_role` | não |

`excluir_sme_demanda(bigint, text)` continua disponível para o papel `authenticated`, mas valida `private.is_admin()` internamente. Assim, editor e leitor não conseguem excluir mesmo por chamada direta.

Integridade confirmada após a migration:

- 379 demandas;
- zero demandas excluídas;
- 764 históricos;
- 13 perfis;
- nenhuma fixture ou resíduo;
- nenhuma atualização de linha, backfill ou exclusão física.

## Gates ainda obrigatórios

1. revisar o estado final do PR #106;
2. integrar o PR #106;
3. publicar Production por release controlado;
4. verificar domínio principal, `/demandas`, `/admin`, runtime e Supabase;
5. restaurar `deploymentEnabled: false`;
6. registrar os SHAs e o deployment final de Production.

## Próxima etapa após o R5-1

Somente depois da publicação e do encerramento documental do R5-1 será iniciado o debate do **R5-2 — Andamento, transições e reabertura**.

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
11. `docs/execution/RELATORIO_VALIDACAO_R5_1_2026-07-30.md`;
12. este Handoff.

## Regra de continuidade

O R5 segue em pequenos blocos: discutir, decidir, registrar, implementar, homologar e somente então abrir o próximo pacote. Nenhuma conclusão parcial autoriza etapa posterior por inferência.
