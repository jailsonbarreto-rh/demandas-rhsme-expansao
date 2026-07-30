# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **30 de julho de 2026 — R5-1 concluído em Production**

<!-- IMPLEMENTATION_AUTHORIZATION: NONE -->

## Estado material

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| R4 | concluído e publicado |
| R5-1 | concluído, homologado e publicado |
| Merge funcional | PR #106, merge `6af4110738ca3bcd0b4088a82231790354f97b55` |
| Release | PR #107, merge `f222d5f3fcccf56a1ebb2cd553f39de4119c5d02` |
| Production | `dpl_HfJTmbcrVdiNeHKChrfuq5otxBGK` — `READY` |
| SHA publicado | `f222d5f3fcccf56a1ebb2cd553f39de4119c5d02` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr`, região `sa-east-1`, `ACTIVE_HEALTHY` |
| Migration R5-1 | `20260730180713_r5_1_disable_product_restore` aplicada e verificada |
| Integridade | 379 demandas, zero excluídas, 764 históricos, 13 perfis |
| Deploy automático | restaurado para `deploymentEnabled: false` no PR de encerramento |
| Implementação funcional autorizada | **Nenhuma nova implementação funcional autorizada** |
| Próxima atividade | debate do R5-2 — Andamento, transições e reabertura |

## R5-1 — regra vigente

### Exclusão

- somente administrador ativo pode excluir demandas;
- editor e leitor não recebem a ação `Excluir`;
- exclusão é lógica e nunca física;
- motivo com pelo menos dez caracteres é obrigatório;
- banco registra ator, data, hora e evento histórico;
- dados e histórico permanecem preservados.

### Consulta administrativa

A área `/admin` contém a seção `Demandas excluídas`, somente para administradores, com:

- contagem dos registros excluídos;
- pesquisa por número, assunto, responsável, setor, status, motivo e autor comprovável;
- listagem dos dados principais;
- detalhe somente leitura;
- motivo, data e autoria da exclusão;
- dados preservados da demanda;
- histórico completo.

Quando a autoria não puder ser comprovada, a interface usa `Autor não identificado` e não inventa nome.

### Restauração

Não existe restauração no produto:

- não há botão ou fluxo visual;
- não há método público nos tipos, hooks ou repositórios;
- não há edição ou mudança de status na lixeira;
- a função técnica do banco permanece definida, mas não possui `EXECUTE` para `public`, `anon`, `authenticated` ou `service_role`;
- recuperação excepcional somente poderá ocorrer fora da aplicação, por procedimento controlado do proprietário do banco.

O tipo histórico `restauracao` permanece reconhecido apenas para leitura de eventual evento anterior.

## Validação da aplicação

### Gate canônico

Deployment de validação: `dpl_CHWakBVPusk3xKwrvWiZSpq7wENf` — `READY`.

- auditoria de dependências: zero vulnerabilidades;
- assinaturas: 560 pacotes verificados;
- atestações: 147 pacotes;
- compatibilidade transitiva: 3/3;
- gate documental: 9/9;
- lint: aprovado;
- 69 arquivos e 317 testes aprovados;
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

## Supabase remoto

A função `restaurar_sme_demanda(bigint, text)` permanece definida, sem permissão de execução para qualquer papel da API:

| Papel | EXECUTE |
|---|---:|
| `public` | não |
| `anon` | não |
| `authenticated` | não |
| `service_role` | não |

`excluir_sme_demanda(bigint, text)` continua disponível ao papel `authenticated`, com validação obrigatória de `private.is_admin()` no servidor.

A verificação pós-publicação confirmou:

- 379 demandas;
- zero demandas excluídas;
- 764 históricos;
- 13 perfis;
- nenhuma fixture ou resíduo;
- nenhuma atualização em massa, backfill ou exclusão física.

## Verificação de Production

- deployment `dpl_HfJTmbcrVdiNeHKChrfuq5otxBGK` em estado `READY`;
- target `production`;
- domínio principal: HTTP 200;
- `/demandas`: HTTP 200;
- `/admin`: HTTP 200;
- rewrites SPA preservados;
- nenhum erro de runtime encontrado após a publicação;
- Supabase permaneceu saudável e íntegro.

## Próxima etapa

A próxima atividade autorizada é exclusivamente o debate do **R5-2 — Andamento, transições e reabertura**.

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
12. `docs/execution/ENCERRAMENTO_R5_1_2026-07-30.md`;
13. este Handoff.

## Regra de continuidade

O R5 segue em pequenos blocos: discutir, decidir, registrar, implementar, homologar e somente então abrir o próximo pacote. Nenhuma conclusão autoriza etapa posterior por inferência.
