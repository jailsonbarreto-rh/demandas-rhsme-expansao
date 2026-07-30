# Encerramento do R5-1 — Lixeira Administrativa e Auditoria

**Data:** 30 de julho de 2026  
**Estado:** concluído em Production  
**Próxima atividade:** debate pré-implementação do R5-2

## Entrega

O R5-1 foi concluído com as seguintes capacidades:

- exclusão lógica restrita a administrador ativo;
- motivo obrigatório e evento histórico;
- preservação integral dos dados e do histórico;
- lixeira somente leitura na área `/admin`;
- pesquisa e detalhe auditável;
- ausência de exclusão física e de restauração no produto;
- função técnica de restauração preservada sem grants para papéis da API.

## Identificadores

| Item | Identificador |
|---|---|
| PR funcional | #106 |
| Merge funcional | `6af4110738ca3bcd0b4088a82231790354f97b55` |
| PR de release | #107 |
| Merge de release | `f222d5f3fcccf56a1ebb2cd553f39de4119c5d02` |
| Deployment Production | `dpl_HfJTmbcrVdiNeHKChrfuq5otxBGK` |
| SHA publicado | `f222d5f3fcccf56a1ebb2cd553f39de4119c5d02` |
| Migration Supabase | `20260730180713_r5_1_disable_product_restore` |

## Validação

- 69 arquivos e 317 testes unitários e de integração aprovados;
- cobertura global de linhas de 81,46%;
- 22 de 22 cenários Playwright aprovados;
- lint, TypeScript, build, bundle e documentação aprovados;
- domínio, `/demandas` e `/admin` responderam HTTP 200;
- nenhum erro de runtime identificado após a publicação;
- Supabase com 379 demandas, zero excluídas, 764 históricos e 13 perfis;
- restauração sem `EXECUTE` para `public`, `anon`, `authenticated` e `service_role`.

## Continuidade

O R5-1 não autoriza implementação posterior. O próximo passo é discutir o R5-2 em pequenos blocos, confrontando cada opção com as regras, o layout, as permissões e o tratamento do legado já vigentes.
