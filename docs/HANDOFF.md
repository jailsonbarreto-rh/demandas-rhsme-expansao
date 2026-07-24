# Handoff Operacional — Central de Demandas CTRH

Atualizado em: **24 de julho de 2026 — carteira pessoal do R3 em Production**

## Estado atual

| Item | Estado |
|---|---|
| Repositório | `WilsonMPeixoto-2/demandas-rhsme-expansao` |
| Production | `https://demandas-rhsme-expansao.vercel.app/` |
| Supabase | `CTRH PROCESSOS`, ref `kdhekkzwcokfrpcrsllr` |
| Código funcional publicado | `1316cc764f974a539a4002a627036acd5334eb47` — PR #48 |
| Registro de decisões | `docs/product/REGISTRO_DECISOES_PRODUTO_CTRH.md` |
| Linha de base funcional | Ciclos originais 0 a 4 concluídos; responsáveis oficiais e carteira pessoal do R3 implementados |
| Atividade atual | **Homologação visual e funcional do R3 pelo responsável do produto** |
| Próximo ciclo | Não autorizado até a homologação e nova decisão expressa |

## Implementação R3 concluída

- `responsavel_id` é a identidade oficial do responsável.
- Novas demandas e edições usam seleção de usuários cadastrados; texto livre não é aceito.
- RPCs e gatilho impedem divergência entre UUID e nome.
- 378 demandas históricas foram vinculadas aos perfis oficiais.
- `Vanessa Migrado` permanece preservada como única informação histórica sem UUID.
- As permissões, papéis, status e demais regras de negócio foram preservados.

## Carteira pessoal publicada

- A primeira tela exibe um bloco central destacado imediatamente abaixo de `Atenção agora`.
- Conteúdo exato: `Minhas demandas`, `Acompanhe sua carteira de processos.` e `Acessar minha carteira`.
- O bloco não possui contadores, listas prévias ou textos adicionais.
- A ação abre `/demandas?escopo=meu`.
- A filtragem usa exclusivamente o UUID do usuário autenticado.
- Demandas de outros usuários e registros sem UUID não aparecem na carteira pessoal.
- A listagem indica `Minhas demandas` e oferece `Ver carteira da equipe`.
- Os demais filtros permanecem disponíveis para refinamento.
- Não houve alteração no Supabase nesta entrega de interface.

## Fotografia reconciliada de Production

| Indicador | Resultado |
|---|---:|
| Demandas | 379 |
| Demandas vinculadas a perfil oficial | 378 |
| `Vanessa Migrado` com UUID nulo | 1 |
| Históricos | 764 |
| Perfis | 13 |
| Divergências UUID–nome | 0 |

## Validação realizada

- análise estática aprovada;
- testes unitários, integração e cobertura aprovados;
- build e orçamento do bundle aprovados;
- testes Playwright aprovados em desktop e mobile, incluindo o fluxo da carteira pessoal;
- Preview Vercel validado em estado `READY`;
- Production validada no domínio oficial;
- nenhuma migration ou arquivo Supabase alterado pela entrega `Minhas demandas`.

## Publicação e segurança operacional

- PR de responsáveis oficiais: `#46`.
- PR da carteira pessoal: `#48`.
- Deployment de Production da carteira pessoal: `dpl_8LkvK6yJufmyQErbvkb9tamFTFt8`, estado `READY`.
- O deploy automático foi habilitado somente durante a publicação controlada e restaurado para bloqueado no encerramento.

## Regra de continuidade

A próxima ação é a homologação visual e funcional em Production pelo responsável do produto. Nenhum novo ciclo ou ampliação funcional está autorizado automaticamente.
