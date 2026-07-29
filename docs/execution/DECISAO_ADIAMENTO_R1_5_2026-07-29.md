# Decisão de adiamento do R1-5 — concorrência otimista

**Data:** 29 de julho de 2026  
**Situação:** vigente  
**Decisão do responsável pelo produto:** adiar a implementação do R1-5 e retirar essa funcionalidade do caminho crítico do desenvolvimento atual.

## 1. Decisão

A proteção contra sobrescrita concorrente continua reconhecida como funcionalidade útil para o SITE CTRH, mas não deve bloquear o prosseguimento das demais evoluções do produto.

O R1-5 fica adiado para retomada futura. A decisão de produto registrada em `OP-D01` permanece como referência conceitual, porém a autorização de implementação do R1-5 fica suspensa até nova decisão expressa.

A sequência vigente passa diretamente da fundação já concluída do A1-Core para o debate itemizado do R4. Nenhuma função do R4 fica automaticamente autorizada por este registro.

## 2. Estado do PR #101

O PR #101 contém uma proposta de banco aditiva para o primeiro release do R1-5, mas não recebeu validação executável completa.

Os dois workflows associados ao commit encerraram antes da primeira etapa, sem logs de execução. Portanto, não há evidência de falha funcional da proposta, mas também não há evidência suficiente para integrá-la com segurança.

Por decisão do responsável pelo produto:

- o PR #101 será encerrado sem merge;
- sua branch e seu histórico permanecem preservados como referência técnica;
- o código não deve ser aplicado posteriormente sem rebase, revisão e nova validação contra a `main` vigente;
- nenhuma migration do PR #101 foi aplicada ao Supabase;
- nenhum deployment relacionado ao PR #101 foi publicado na Vercel;
- nenhum dado operacional foi alterado.

## 3. Condições para retomada futura

A retomada do R1-5 exigirá novo pacote autorizado e deverá confirmar, no mínimo:

1. execução normal dos gates automatizados, com etapas e logs disponíveis;
2. replay integral das migrations em ambiente efêmero;
3. invariantes de conflito sem atualização da demanda e sem criação de histórico;
4. revisão das permissões e dos contratos vigentes naquele momento;
5. tratamento visual do conflito no frontend, preservando o conteúdo digitado;
6. validação em duas sessões concorrentes;
7. atualização sincronizada da documentação então vigente.

A branch atual não constitui solução pronta para merge futuro. Ela é apenas um ponto de partida técnico que poderá ser reaproveitado após reavaliação.

## 4. Próxima atividade

A próxima atividade do Trilho A é o debate itemizado do R4, começando pelo R4-1 — controle completo de prazo e incorporação da ordem canônica dos prazos.

Conforme a governança vigente, o debate deve explicar cada decisão em termos de funcionamento atual, mudança prática, usuários afetados, cenário real, alternativas, recomendação, impactos, dependências e reversibilidade. A implementação somente poderá começar após aprovação expressa das decisões correspondentes.
