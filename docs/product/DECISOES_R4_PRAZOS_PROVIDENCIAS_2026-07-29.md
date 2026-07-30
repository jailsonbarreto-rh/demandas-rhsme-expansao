# Decisões aprovadas — R4 Prazos e Próxima Providência

**Data da decisão:** 29 de julho de 2026  
**Situação:** APROVADAS PARA IMPLEMENTAÇÃO  
**Pacote:** R4 — prazos, próxima providência e adequação progressiva do legado

Este documento registra as decisões expressamente aprovadas para o R4. Ele deve ser incorporado ao Registro de Decisões de Produto e aos documentos canônicos antes do merge. Recomendações anteriores incompatíveis ficam superadas por estas decisões.

## R4-D01 — Princípio de transição entre legado e operação nova

A base atualmente carregada é integralmente originada do sistema legado e antecede as regras do sistema novo. Lacunas e incompatibilidades históricas não são erro do novo produto, não podem ser corrigidas por inferência e não devem bloquear a consulta ou uma edição cadastral não relacionada.

As novas regras passam a valer integralmente para novos cadastros e novas operações. A adequação do legado ocorrerá progressivamente quando cada demanda voltar a ser utilizada, apenas nos campos que o usuário puder informar legitimamente naquele momento.

## R4-D02 — Prazo interno em nova demanda

Toda nova demanda exige prazo interno definido por data. `Não informado` e `Não se aplica` não são opções de cadastro corrente. O salvamento sem data é bloqueado e a interface apresenta diálogo explicando a obrigatoriedade.

## R4-D03 — Prazo final em nova demanda

Toda nova demanda exige escolha explícita entre:

- prazo final definido por data; ou
- `Não se aplica`.

`Não informado` não é opção de cadastro corrente. A escolha `Não se aplica` não exige justificativa inicial.

## R4-D04 — Preservação e primeira adequação dos prazos legados

Uma demanda legada pode continuar sem prazo interno ou final e pode receber edições cadastrais não relacionadas sem que o usuário invente datas.

O primeiro preenchimento de um prazo anteriormente `Não informado` é adequação do legado, não alteração de prazo, e não exige justificativa. O histórico registra o valor anterior e o novo valor.

## R4-D05 — Alteração posterior de prazo

Qualquer modificação de prazo já registrado exige justificativa escrita, independentemente de a nova data ser anterior, posterior, vencida ou futura.

A regra inclui:

- alteração de data do prazo interno;
- alteração de data do prazo final;
- prazo final definido por data para `Não se aplica`;
- prazo final `Não se aplica` para data definida.

O histórico registra campo, valor anterior, novo valor, justificativa, usuário e data/hora. Um prazo registrado não retorna silenciosamente a `Não informado`.

## R4-D06 — Coerência entre prazos

Quando prazo interno e prazo final possuírem datas, o prazo interno não pode ser posterior ao prazo final.

Ausência legada não gera erro de ordem nem é classificada como atraso.

## R4-D07 — Próxima providência e demandas legadas

A ausência de próxima providência em demanda legada não bloqueia consulta nem edição cadastral.

Quando o usuário realizar operação que represente movimentação da demanda — como registrar andamento ou alterar para status não encerrado — deverá informar:

- descrição objetiva da próxima providência;
- data de acompanhamento.

A exigência é possível porque registra uma decisão operacional presente; não obriga o usuário a inventar informação histórica.

Ao encerrar, o sistema limpa próxima providência e data do estado atual e preserva os registros anteriores no histórico.

## R4-D08 — Data de próxima providência já vencida

Uma data de próxima providência anterior ao dia operacional pode ser registrada somente com justificativa obrigatória. O salvamento sem justificativa é bloqueado.

A data não é corrigida automaticamente. A justificativa integra o evento histórico da operação.

O dia operacional do sistema é calculado em `America/Sao_Paulo`.

## R4-D09 — Apresentação dos cartões de prazo final

Os cartões existentes preservam posição e cálculo baseados exclusivamente no prazo final, com rótulos inequívocos:

- `Prazo final hoje`;
- `Prazo final vencido`.

Não será criada contagem única misturando prazo interno, prazo final e próxima providência.

## R4-D10 — Filtros operacionais

A carteira preserva os cartões superiores e amplia o painel de filtros com:

- prazo interno hoje;
- prazo interno vencido;
- próxima providência hoje;
- próxima providência vencida;
- período pela data da próxima providência.

Filtros de alerta selecionados simultaneamente funcionam como união (`OU`). Status, responsável, setor, classificação e demais filtros refinam o resultado (`E`).

Lacunas massivas do legado não são apresentadas como urgência. Sua futura localização pertence à superfície de qualidade de dados.

## R4-D11 — Próxima providência na carteira e no detalhe

A tabela preserva todas as colunas existentes e recebe coluna consolidada `Próxima providência`, posicionada após prazo final e antes de status.

A coluna apresenta:

- descrição resumida;
- data;
- estado temporal;
- `Não informada` para lacuna legada;
- `Não exigida` para demanda encerrada.

No detalhe, a próxima providência aparece em bloco destacado antes dos prazos.

## R4-D12 — Faixa temporal comum

A semântica visual usa sete dias corridos:

- vencida;
- hoje;
- próximos 7 dias;
- futura;
- não informada;
- não se aplica ou não exigida, quando pertinente.

A faixa `Próximos 7 dias` é informação temporal e não transforma automaticamente a demanda em urgente.

## R4-D13 — Preservação do bloco Atenção agora

O componente atual `Atenção agora` é preservado no R4. Somente correções técnicas, acessíveis ou de estilo são permitidas neste pacote.

O R4 não cria motor automático que combine prazo interno, prazo final, próxima providência e status. A reformulação do componente é item obrigatório de debate no R6, quando existirem dados operacionais com cobertura suficiente.

## R4-A01 — Autorização consolidada

Está autorizada a implementação integral das decisões R4-D01 a R4-D13 em todas as camadas necessárias:

- domínio e validações TypeScript;
- formulários e mensagens;
- tabela, detalhe, filtros e responsividade;
- contratos e repositórios local/Supabase;
- migration aditiva e RPCs auditáveis;
- histórico estruturado;
- Excel e documentação;
- testes unitários, de integração, banco e navegador.

A autorização não inclui merge, aplicação da migration remota ou publicação em Production antes da validação integral do candidato.
