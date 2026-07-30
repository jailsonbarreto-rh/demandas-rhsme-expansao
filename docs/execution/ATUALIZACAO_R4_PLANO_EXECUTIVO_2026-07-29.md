# Atualização do Plano Executivo — R4 Prazos e Próxima Providência

**Data:** 29 de julho de 2026  
**Documento-base:** `Plano_Executivo_Operacao_Atual_CTRH_v1.2.md`  
**Situação:** atualização vinculante do recorte R4 na branch funcional  
**Efeito:** substitui, para este pacote, recomendações e decisões pendentes incompatíveis do plano-base

## 1. Escopo aprovado

O R4 foi autorizado como pacote funcional integrado, abrangendo domínio, frontend, Supabase, histórico, filtros, Excel, testes e documentação.

A implementação não reorganiza o banco de demandas, não cria campo genérico de urgência e não substitui a arquitetura atual da carteira.

## 2. Sequência executiva atualizada

A antiga decomposição de referência R4-1 a R4-4 é consumida da seguinte forma:

### R4-1 — Controle de prazo

Inclui:

- estados coerentes de prazo;
- prazo interno obrigatório em novas demandas;
- prazo final por data ou `Não se aplica`;
- ordem interno ≤ final;
- preservação de ausência legada;
- primeira adequação sem justificativa;
- alteração posterior com justificativa;
- migration de constraints compatível com as decisões finais.

### R4-2 — Separação entre edição e movimentação

Inclui:

- retirada da próxima providência da edição cadastral genérica;
- edição legada sem bloqueio por lacunas históricas;
- próxima providência obrigatória em andamento ou mudança para status não encerrado;
- data vencida mediante justificativa;
- encerramento limpando o estado atual.

A superfície específica `Registrar andamento` continua pertencendo ao R5-2. A RPC e o contrato já ficam preparados e testados, mas o R4 não antecipa uma nova tela não autorizada.

### R4-3 — Apresentação na carteira

Inclui:

- cartões de prazo final com rótulo explícito;
- filtros de prazo interno e próxima providência;
- período pela data da providência;
- coluna consolidada na tabela;
- bloco destacado no detalhe;
- estados temporais comuns de sete dias;
- responsividade e acessibilidade.

### R4-4 — Excel e qualidade

Inclui neste pacote:

- equivalência semântica do Excel;
- estados e justificativas dos prazos;
- próxima providência e sua situação;
- origem legado/sistema;
- testes de OOXML e formula injection.

A rota administrativa própria de qualidade permanece futura. Lacunas massivas do legado não são convertidas em alerta operacional cotidiano.

## 3. Decisões do plano-base superadas

Ficam superadas no recorte R4:

- `Não se aplica` exigir justificativa inicial;
- próxima providência vencida ser aceita apenas com aviso e confirmação;
- edição genérica ser proprietária da próxima ação;
- nova demanda admitir prazo interno ou final `Não informado`;
- interpretação de todas as lacunas como saneamento bloqueante na primeira edição;
- faixa visual de cinco dias;
- ausência de próxima providência na carteira.

As regras vigentes estão em `docs/product/DECISOES_R4_PRAZOS_PROVIDENCIAS_2026-07-29.md`.

## 4. Arquivos e interfaces produzidos

### Domínio

- `src/domain/deadlineRules.ts`;
- `src/domain/temporalSignals.ts`;
- testes associados.

### Componentes

- `DeadlineControl`;
- `DeadlineDisplay`;
- `PastFollowUpJustification`;
- `InfoDialog`;
- alterações em criação, edição, status, tabela, detalhe, cabeçalho e filtros.

### Persistência

- quatro RPCs R4 aditivas;
- duas migrations R4;
- tipagem suplementar das funções;
- repositórios local e Supabase alinhados.

### Relatório

- analytics com prazo final e providência separados;
- base detalhada A:V;
- indicadores adicionais;
- rastreabilidade dos novos filtros.

## 5. Gates de aceite

O pacote somente poderá avançar para Preview ou aplicação remota quando houver evidência de:

- lint sem erro;
- testes unitários e de integração aprovados;
- cobertura dentro do gate vigente;
- build aprovado;
- bundle e auditorias aprovados;
- E2E aprovado;
- replay integral de migrations;
- invariantes SQL R4 aprovados;
- workbook Excel reaberto sem reparo;
- validação desktop/mobile;
- documentação sincronizada.

## 6. Estado atual

A implementação está no PR draft `#103`. Os workflows GitHub disparados até o momento encerraram antes de qualquer etapa ou log, de modo que o candidato permanece não validado.

Nenhuma migration remota, Preview homologado, Production ou merge está autorizado enquanto esse impedimento de verificação permanecer.

## 7. Continuidade posterior

Depois da homologação do R4:

1. iniciar debate do R5-2 para expor `Registrar andamento` e corrigir transições deliberadas;
2. preservar a lista `docs/product/REAVALIACOES_FUTURAS_R4.md`;
3. reavaliar `Atenção agora` obrigatoriamente no R6;
4. incorporar indicadores de providência ao Radar somente após cobertura suficiente.
